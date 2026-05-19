require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

// Local fallback directory
const UPLOAD_DIR = path.join(__dirname, 'static', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'pins' })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const metadataSchema = new mongoose.Schema({
  _id: String,
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  board: { type: String, default: 'Design Inspiration' },
  altText: { type: String, default: '' },
  date: String,
  time: String,
  status: { type: String, default: 'draft' },
  image_url: { type: String, default: '' },
}, { versionKey: false });

const Metadata = mongoose.model(process.env.MONGODB_COLLECTION_NAME || 'metadata', metadataSchema, process.env.MONGODB_COLLECTION_NAME || 'metadata');

// S3 Client configuration
let s3Client = null;
if (
  process.env.CF_R2_ACCESS_KEY_ID && 
  process.env.CF_R2_SECRET_ACCESS_KEY && 
  !process.env.CF_R2_ACCESS_KEY_ID.toLowerCase().includes('placeholder')
) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CF_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CF_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY,
    },
  });
}

const saveAndUploadFile = async (fileBuffer, originalName, mimeType, uniqueFilename) => {
  // Save local fallback
  fs.writeFileSync(path.join(UPLOAD_DIR, uniqueFilename), fileBuffer);
  
  if (s3Client) {
    try {
      const key = `pin-images/${uniqueFilename}`;
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.CF_R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType || 'image/jpeg',
      }));
      console.log(`Successfully uploaded ${key} to Cloudflare R2.`);
      return `${process.env.CF_R2_PUBLIC_URL}/${key}`;
    } catch (error) {
      console.error('R2 Upload failed:', error.message);
    }
  }
  return `http://localhost:8000/static/uploads/${uniqueFilename}`;
};

const deleteStoredFile = async (imageUrl) => {
  if (!imageUrl) return;
  const urlParts = imageUrl.split('/');
  const uniqueFilename = urlParts[urlParts.length - 1];
  
  // Delete local fallback
  const localPath = path.join(UPLOAD_DIR, uniqueFilename);
  if (fs.existsSync(localPath)) {
    try { fs.unlinkSync(localPath); } catch(e) { console.error('Local delete failed:', e.message); }
  }
  
  // Delete from R2
  if (s3Client && imageUrl.includes(process.env.CF_R2_PUBLIC_URL)) {
    try {
      const key = imageUrl.replace(process.env.CF_R2_PUBLIC_URL + '/', '');
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.CF_R2_BUCKET_NAME,
        Key: key,
      }));
      console.log(`Deleted ${key} from R2.`);
    } catch(e) {
      console.error('Error deleting from R2:', e.message);
    }
  }
};

app.get('/', (req, res) => {
  res.json({ status: 'running', provider: 'PinAuto Backend Server (Node.js)' });
});

// GET all pins
app.get('/api/pins', async (req, res) => {
  try {
    const pins = await Metadata.find({}).lean();
    const formattedPins = pins.map(pin => ({ ...pin, id: pin._id }));
    res.json(formattedPins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload new pin draft images
app.post('/api/pins/upload', upload.array('files'), async (req, res) => {
  try {
    const createdPins = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().slice(0, 5); // HH:MM
    
    for (const file of req.files) {
      const unique_id = uuidv4();
      const ext = path.extname(file.originalname) || '.jpg';
      const uniqueFilename = `${unique_id}${ext}`;
      
      const imageUrl = await saveAndUploadFile(file.buffer, file.originalname, file.mimetype, uniqueFilename);
      
      // Kept title empty by default as requested
      const doc = new Metadata({
        _id: unique_id,
        title: '',
        description: '',
        link: '',
        board: 'Design Inspiration',
        altText: '',
        date: todayStr,
        time: nowTimeStr,
        image_url: imageUrl,
        status: 'draft'
      });
      
      await doc.save();
      const savedDoc = doc.toObject();
      savedDoc.id = savedDoc._id;
      createdPins.push(savedDoc);
    }
    res.json(createdPins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update pin details metadata
app.put('/api/pins/:pin_id', async (req, res) => {
  try {
    const { pin_id } = req.params;
    const updateFields = { ...req.body };
    delete updateFields.id;
    delete updateFields._id;
    
    const updated = await Metadata.findByIdAndUpdate(pin_id, { $set: updateFields }, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ detail: 'Pin not found' });
    }
    res.json({ status: 'success', data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST change image for a specific pin
app.post('/api/pins/:pin_id/change-image', upload.single('file'), async (req, res) => {
  try {
    const { pin_id } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ detail: 'No file provided' });
    }
    
    const existing = await Metadata.findById(pin_id);
    if (!existing) {
      return res.status(404).json({ detail: 'Pin not found' });
    }
    
    // Delete old file
    if (existing.image_url) {
      await deleteStoredFile(existing.image_url);
    }
    
    const ext = path.extname(file.originalname) || '.jpg';
    const newFilename = `${pin_id}_${uuidv4().substring(0,6)}${ext}`;
    
    const newImageUrl = await saveAndUploadFile(file.buffer, file.originalname, file.mimetype, newFilename);
    
    await Metadata.findByIdAndUpdate(pin_id, { $set: { image_url: newImageUrl } });
    res.json({ status: 'success', image_url: newImageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE pin and corresponding image
app.delete('/api/pins/:pin_id', async (req, res) => {
  try {
    const { pin_id } = req.params;
    const existing = await Metadata.findById(pin_id);
    if (!existing) {
      return res.status(404).json({ detail: 'Pin not found' });
    }
    
    if (existing.image_url) {
      await deleteStoredFile(existing.image_url);
    }
    
    await Metadata.findByIdAndDelete(pin_id);
    res.json({ status: 'success', message: 'Pin deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Node.js server listening on port ${PORT}`);
});
