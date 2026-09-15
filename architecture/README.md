# System Architecture

## Overview

Mini SaaS Platform follows a **Clean Architecture** pattern with clear separation between layers:

```
Request → Controller → Service → Repository → Database
                ↓           ↓
           Middleware    Queue (BullMQ)
                ↓           ↓
            Socket.io    Redis Cache
```

## Architecture Layers

### 1. Controller Layer (`src/controllers/`)
- Handles HTTP request/response lifecycle
- Input validation (Zod schemas)
- Delegates to Service layer
- **Never** contains business logic

### 2. Service Layer (`src/services/`)
- All business logic lives here
- Orchestrates Repository calls
- Publishes events to BullMQ queues
- Emits Socket.io events

### 3. Repository Layer (`src/repositories/`)
- All database queries isolated here
- Returns domain objects (not Mongoose documents)
- Redis caching implemented at this layer
- MongoDB transactions coordinated here

### 4. Model Layer (`src/models/`)
- Mongoose schemas & models
- No business logic
- Only schema definition, indexes, and virtuals

## RBAC Model

```
Roles: owner > admin > member > viewer

owner  → full CRUD, delete workspace, manage billing
admin  → full CRUD, invite members, change roles (except owner)
member → create/edit content, cannot delete workspace/channels
viewer → read-only access
```

## Real-time Event Architecture

```
Client ──connect──→ Socket.io Server
Client ──emit────→ Server Handler → Service → DB
                         ↓
                   io.to(room).emit() → All clients in room
```

Rooms:
- `workspace:{id}` — workspace-level events
- `board:{id}` — board card updates
- `channel:{id}` — chat messages
- `document:{id}` — collaborative document edits

## Queue Architecture (BullMQ)

| Queue | Purpose |
|---|---|
| `email` | Transactional emails (invites, notifications) |
| `notification` | Push/in-app notification delivery |
| `file-processing` | Image resize, document indexing |
| `audit-log` | Async audit log writes |

## Caching Strategy (Redis)

| Key Pattern | TTL | Purpose |
|---|---|---|
| `user:{id}` | 5min | User profile cache |
| `workspace:{id}` | 5min | Workspace metadata |
| `board:{id}` | 2min | Board with cards |
| `session:{userId}` | 7d | Refresh token store |
| `rate:{ip}` | 15min | Rate limiting counter |
