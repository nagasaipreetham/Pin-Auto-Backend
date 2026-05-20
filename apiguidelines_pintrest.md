# API Guidelines

## Create Pin
**POST** `/pins`

Create a Pin on a board or board section owned by the `operation user_account`.

> **Note:** If the current `operation user_account` (defined by the access token) has access to another user's Ad Accounts via Pinterest Business Access, you can modify your request to make use of the current `operation_user_account` permissions to those Ad Accounts by including the `ad_account_id` in the path parameters for the request.

Example:

```http
...?ad_account_id=12345&...
```

### Additional Notes
- This function is intended solely for publishing new content created by the user.
- If you are interested in saving content created by others to your Pinterest boards, sometimes called curated content, use the Save button instead.
- Review the Content App Solutions Guide for tips on creating fresh content for Pinterest.
- Learn more about video Pin creation.
- Learn more about image Pin creation.

### Rate Limit Category
`org_write`

### Sandbox Support
`enabled`

---

## Authorizations

### Pinterest OAuth 2.0
Scopes:
- `boards:read`
- `boards:write`
- `pins:read`
- `pins:write`

### Client Credentials
Scopes:
- `boards:read`
- `boards:write`
- `pins:read`
- `pins:write`

---

# Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `ad_account_id` | string | Unique identifier of an ad account. |

### Constraints
- Maximum length: `18 characters`
- Pattern: `^\d+$`

---

# Request Body
Schema: `application/json`

| Field | Type | Description |
|---|---|---|
| `alt_text` | string | Nullable, max 500 characters |
| `description` | string | Nullable, max 800 characters |
| `title` | string | Nullable, max 100 characters |
| `link` | string | Nullable, max 2048 characters |
| `board_id` | string | The board to which this Pin belongs |
| `board_section_id` | string | Nullable |
| `dominant_color` | string | Nullable. Hex number such as `#6E7874` |
| `media_source` | object | Object containing Base64 format image media source |
| `parent_pin_id` | string | Nullable. Source pin ID if this pin was saved from another pin |
| `sponsor_id` | string | Nullable. Sponsor account ID to request paid partnership from |

### Field Constraints
- `board_id` pattern: `^\d+$`
- `board_section_id` pattern: `^\d+$`
- `parent_pin_id` pattern: `^\d+$`
- `sponsor_id` pattern: `^\d+$`

---

# Responses

## 200 - Success
The request has succeeded.

### Response Schema

| Field | Type | Description |
|---|---|---|
| `alt_text` | string | Nullable, max 500 characters |
| `description` | string | Nullable, max 800 characters |
| `title` | string | Nullable, max 100 characters |
| `link` | string | Nullable, max 2048 characters |
| `board_id` | string | The board to which this Pin belongs |
| `board_owner` | object | Board owner containing the username |
| `board_section_id` | string | Nullable |
| `created_at` | string | Date-time |
| `creative_type` | string | Creative type enum used for ads |
| `dominant_color` | string | Nullable |
| `has_been_promoted` | boolean | Whether the Pin has been promoted |
| `id` | string | Required |
| `is_owner` | boolean | Whether the operation user account is the Pin owner |
| `is_product` | boolean | Whether the Pin is a product Pin |
| `is_standard` | boolean | Whether the Pin is standard |
| `media` | object | Object containing image definitions |
| `parent_pin_id` | string | Nullable |
| `pin_metrics` | object | Nullable |

### Creative Type Enum
- `REGULAR`
- `VIDEO`
- `SHOPPING`
- `CAROUSEL`
- `MAX_VIDEO`
- `SHOP_THE_PIN`
- `COLLECTION`
- `IDEA`
- `SHOWCASE`
- `QUIZ`

> Note: `SHOPTHEPIN` has been deprecated. Use `COLLECTION` instead.

---

## 201 - Resource Created
Resource create operation completed successfully.

Response schema is the same as the 200 response.

---

## Error Responses

### 400
The request could not be understood by the server due to unexpected data.

### 401
Authentication is required and has either failed or not been provided.

### 403
The request was valid, but the server is refusing action.

### 404
The requested resource could not be found.

### 429
Too many requests. Rate limited.

### Default
Unexpected error response.

### Error Schema

```json
{
  "code": 2,
  "message": "AdAccount not found."
}
```

---

# Request Sample

```json
{
  "alt_text": "string",
  "description": "string",
  "title": "string",
  "link": "string",
  "board_id": "string",
  "board_section_id": "string",
  "dominant_color": "string",
  "media_source": {
    "source_type": "image_base64",
    "is_standard": false,
    "content_type": "image/jpeg",
    "data": "string"
  },
  "parent_pin_id": "string",
  "sponsor_id": "string"
}
```

---

# Response Sample

```json
{
  "alt_text": "string",
  "description": "string",
  "title": "string",
  "link": "string",
  "board_id": "string",
  "board_owner": {
    "username": "string"
  },
  "board_section_id": "string",
  "created_at": "string",
  "creative_type": "REGULAR",
  "dominant_color": "string",
  "has_been_promoted": false,
  "id": "string",
  "is_owner": false,
  "is_product": false,
  "is_standard": false,
  "media": {
    "media_type": "image",
    "images": {
      "150x150": {
        "width": 150,
        "height": 150,
        "url": "https://i.pinimg.com/150x150/0d/f6/f1/0df6f1f0bfe7aaca849c1bbc3607a34b.jpg"
      },
      "400x300": {
        "width": 400,
        "height": 300,
        "url": "https://i.pinimg.com/400x300/0d/f6/f1/0df6f1f0bfe7aaca849c1bbc3607a34b.jpg"
      },
      "600x": {
        "width": 600,
        "height": 600,
        "url": "https://i.pinimg.com/600x/0d/f6/f1/0df6f1f0bfe7aaca849c1bbc3607a34b.jpg"
      },
      "1200x": {
        "width": 1200,
        "height": 1200,
        "url": "https://i.pinimg.com/1200x/0d/f6/f1/0df6f1f0bfe7aaca849c1bbc3607a34b.jpg"
      }
    }
  },
  "parent_pin_id": "string",
  "pin_metrics": {
    "90d": {
      "pin_click": 7,
      "impression": 2,
      "clickthrough": 3
    },
    "lifetime_metrics": {
      "pin_click": 7,
      "impression": 2,
      "clickthrough": 3,
      "reaction": 10,
      "comment": 2
    }
  }
}
```

---

# List Pins
**GET** `/pins`

Get a list of the Pins owned by the `operation user_account`.

## Notes
- By default, the `operation user_account` is the token user account.
- All Pins owned by the operation user account are included regardless of who owns the board.
- You can specify `ad_account_id` to use the owner of that ad account as the operation user account.
- There are known performance issues when filtering by `creative_type` while including protected pins.
- If requests timeout in that scenario, use `GET List Pins on Board`.

### Rate Limit Category
`org_read`

### Sandbox Support
`enabled`

---

# Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `pin_filter` | string | Filter to apply to pins |
| `pin_metrics` | boolean | Include 90d and lifetime metrics |
| `include_protected_pins` | boolean | Include protected pins |
| `pin_type` | string | Type of pins to return |
| `creative_types` | array[string] | Creative type filter |
| `ad_account_id` | string | Ad account identifier |
| `domain` | string | Exact matching domain |
| `domains` | array[string] | Multiple matching domains |
| `include_product_tag_obj` | boolean | Include product tag objects |
| `bookmark` | string | Cursor for pagination |
| `page_size` | integer | Maximum items per page |

### pin_filter Enum
- `exclude_native`
- `exclude_repins`
- `has_been_promoted`

### pin_type Enum
- `PRIVATE`

### page_size Constraints
- Minimum: `1`
- Maximum: `250`
- Default: `25`

---

# Response

## 200 - Success

```json
{
  "bookmark": "string",
  "items": []
}
```

### Error Responses
- `400`
- `401`
- `403`
- `404`
- `429`
- `default`

Error schema remains the same:

```json
{
  "code": 2,
  "message": "AdAccount not found."
}
```

---

# Request Sample

```javascript
(async() => {
    const result = await fetch('https://api.pinterest.com/v5/pins', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer <access_token>',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    console.log(await result.json());
})();
```

---

# Update Pin
**PATCH** `/pins/{pin_id}`

Update a pin owned by the `operation user_account`.

## Notes
- By default, the operation user account is the token user account.
- Business Access roles are required when using `ad_account_id`.
- Endpoint is currently in beta.

### Required Roles
For public or protected boards:
- Owner
- Admin
- Analyst
- Campaign Manager

For secret boards:
- Owner
- Admin

### Rate Limit Category
`org_write`

### Sandbox Support
`enabled`

---

# Path Parameters

| Parameter | Type | Description |
|---|---|---|
| `pin_id` | string | Required Pin ID |

Pattern:
```regex
^\d+$
```

---

# Request Body

```json
{
  "alt_text": "string",
  "description": "string",
  "title": "string",
  "link": "string",
  "board_id": "string",
  "board_section_id": "string",
  "carousel_slots": [
    {
      "title": "string",
      "description": "string",
      "link": "string"
    }
  ]
}
```

---

# Delete Pin
**DELETE** `/pins/{pin_id}`

Delete a Pin owned by the `operation user_account` or on a shared group board.

## Notes
- By default, the operation user account is the token user account.
- Business Access roles apply.

### Rate Limit Category
`org_write`

### Sandbox Support
`enabled`

---

# Responses

## 204
Resource deleted successfully.

### Error Responses
- `400`
- `401`
- `403`
- `404`
- `429`
- `default`

---

# Get Pin
**GET** `/pins/{pin_id}`

Get a Pin owned by the `operation user_account` or on a shared group board.

### Rate Limit Category
`org_read`

### Sandbox Support
`enabled`

---

# Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `ad_account_id` | string | Ad account identifier |
| `pin_metrics` | boolean | Include pin metrics |

---

# Request Sample

```javascript
(async() => {
    const result = await fetch('https://api.pinterest.com/v5/pins/{pin_id}?pin_id={pin_id}', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer <access_token>',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    console.log(await result.json());
})();
```

---

# Get Multiple Pin Analytics
**GET** `/pins/analytics`

Get analytics for multiple pins owned by the `operation user_account`.

## Notes
- Maximum 100 pins per request.
- Endpoint currently in beta.
- Lifetime metrics availability depends on creation date.

### Rate Limit Category
`org_analytics`

---

# Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `pin_ids` | array[string] | Required. List of Pin IDs |
| `start_date` | string | Required. Format YYYY-MM-DD |
| `end_date` | string | Required. Format YYYY-MM-DD |
| `app_types` | string | Device/app filter |
| `metric_types` | array[string] | Required metric types |
| `ad_account_id` | string | Ad account identifier |

### app_types Enum
- `ALL`
- `MOBILE`
- `TABLET`
- `WEB`

---

# Request Sample

```javascript
(async() => {
    const result = await fetch('https://api.pinterest.com/v5/pins/analytics?pin_ids={pin_ids}&start_date={start_date}&end_date={end_date}&metric_types={metric_types}', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer <access_token>',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    console.log(await result.json());
})();
```

---

# Get Pin Analytics
**GET** `/pins/{pin_id}/analytics`

Get analytics for a Pin owned by the `operation user_account`.

### Rate Limit Category
`org_analytics`

---

# Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `start_date` | string | Required |
| `end_date` | string | Required |
| `app_types` | string | Device/app filter |
| `metric_types` | array[object] | Required metrics |
| `split_field` | string | Data split grouping |
| `ad_account_id` | string | Ad account identifier |

### split_field Enum
- `NO_SPLIT`
- `APP_TYPE`

---

# Request Sample

```javascript
(async() => {
    const result = await fetch('https://api.pinterest.com/v5/pins/{pin_id}/analytics?pin_id={pin_id}&start_date={start_date}&end_date={end_date}&metric_types={metric_types}', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer <access_token>',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    console.log(await result.json());
})();
```

---

# Save Pin
**POST** `/pins/{pin_id}/save`

Save a Pin on a board or board section owned by the `operation user_account`.

## Notes
- Any public Pin can be saved.
- Supports image Pins, video Pins, Idea Pins, product Pins, etc.
- Business Access permissions apply.

### Rate Limit Category
`org_write`

### Sandbox Support
`enabled`

---

# Request Body

```json
{
  "board_id": "string",
  "board_section_id": "string"
}
```

---

# Response Sample

```json
{
  "alt_text": "string",
  "description": "string",
  "title": "string",
  "link": "string",
  "board_id": "string",
  "board_owner": {
    "username": "string"
  },
  "board_section_id": "string",
  "created_at": "string",
  "creative_type": "string",
  "dominant_color": "string",
  "has_been_promoted": "false",
  "id": "string",
  "is_owner": "false",
  "is_product": "false",
  "is_standard": "false",
  "media": {
    "media_type": "string",
    "images": {
      "150x150": {
        "width": 150,
        "height": 150,
        "url": "https://i.pinimg.com/150x150/0d/f6/f1/0df6f1f0bfe7aaca849c1bbc3607a34b.jpg"
      },
      "400x300": {
        "width": 400,
        "height": 300,
        "url": "https://i.pinimg.com/400x300/0d/f6/f1/0df6f1f0bfe7aaca849c1bbc3607a34b.jpg"
      },
      "600x": {
        "width": 600,
        "height": 600,
        "url": "https://i.pinimg.com/600x/0d/f6/f1/0df6f1f0bfe7aaca849c1bbc3607a34b.jpg"
      },
      "1200x": {
        "width": 1200,
        "height": 1200,
        "url": "https://i.pinimg.com/1200x/0d/f6/f1/0df6f1f0bfe7aaca849c1bbc3607a34b.jpg"
      }
    }
  },
  "parent_pin_id": "string",
  "pin_metrics": {
    "90d": {
      "pin_click": 7,
      "impression": 2,
      "clickthrough": 3
    },
    "lifetime_metrics": {
      "pin_click": 7,
      "impression": 2,
      "clickthrough": 3,
      "reaction": 10,
      "comment": 2
    }
  }
}
```

---

# Common Error Response

```json
{
  "code": 2,
  "message": "AdAccount not found."
}
```

