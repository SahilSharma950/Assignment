# Documentation

## Index

| Document | Description |
|---|---|
| [Architecture](../architecture/README.md) | System design & architecture decisions |
| [API Reference](./api.md) | REST API endpoint reference |
| [Environment Setup](./setup.md) | Local development setup guide |

## API Base URL

- **Development**: `http://localhost:5000/api/v1`
- **Swagger UI**: `http://localhost:5000/api/docs`

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
X-Refresh-Token: <refresh_token>
```

## Response Format

All API responses follow this envelope:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
