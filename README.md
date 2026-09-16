# Mini SaaS Platform

An enterprise-grade collaboration platform engineered with modern architectural patterns.

## 🚀 Architecture Diagram

```mermaid
flowchart TD
    %% Define external actors
    Client["Client (Browser/PWA)"]

    %% Frontend Subsystem
    subgraph Frontend [Frontend Infrastructure]
        Nginx["Nginx Reverse Proxy (Port 80)"]
        ReactApp["Vite + React SPA"]
    end

    %% Backend Subsystem
    subgraph Backend [Backend API Service]
        Express["Express.js Server (Port 5000)"]
        SocketIO["Socket.IO Server"]
        BullMQ["BullMQ Job Processor"]
    end

    %% Data Subsystem
    subgraph Data [Data Persistence]
        MongoDB[("MongoDB 7.0")]
        Redis[("Redis 7.2 Cache")]
    end

    %% Connections
    Client <-->|HTTP/HTTPS| Nginx
    Client <-->|WebSockets| SocketIO
    
    Nginx --> ReactApp
    ReactApp -->|REST API Calls| Express
    
    Express <--> MongoDB
    Express <--> Redis
    SocketIO <--> Redis
    BullMQ <--> Redis
```

## 🗄️ Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ WORKSPACE : "creates/owns"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ ATTACHMENT : "uploads"
    USER ||--o{ AUDIT_LOG : "triggers"
    USER ||--o{ NOTIFICATION : "receives"
    
    WORKSPACE ||--o{ BOARD : "contains"
    WORKSPACE ||--o{ USER : "has members"
    WORKSPACE ||--o{ CHAT_MESSAGE : "contains"
    
    BOARD ||--o{ LIST : "contains"
    BOARD ||--o{ USER : "has members"
    
    LIST ||--o{ TASK : "contains"
    
    TASK ||--o{ COMMENT : "has"
    TASK ||--o{ ATTACHMENT : "has"
    TASK ||--o{ AUDIT_LOG : "has"
    TASK ||--o{ USER : "assigned to"

    %% Entity Details
    USER {
        ObjectId _id PK
        String email
        String name
        String role
    }
    
    WORKSPACE {
        ObjectId _id PK
        String name
        ObjectId ownerId FK
    }

    BOARD {
        ObjectId _id PK
        String title
        ObjectId workspaceId FK
    }

    LIST {
        ObjectId _id PK
        String title
        ObjectId boardId FK
        Number position
    }

    TASK {
        ObjectId _id PK
        String title
        String description
        ObjectId listId FK
        ObjectId boardId FK
    }
```

## 🛠️ Quick Start

The entire stack is containerized. To spin up the production-ready infrastructure:

1. Clone the repository.
2. Ensure you have Docker and Docker Compose installed.
3. Run the following command:

```bash
docker-compose up --build -d
```

4. The frontend will be available at `http://localhost:3000`.
5. The API docs (Swagger) will be available at `http://localhost:5000/api/docs`.

## 🧪 Testing

The repository relies on `jest` for exhaustive test suites.
You can run the CI test matrix locally:

```bash
# Run backend tests
npm run test --workspace=backend

# Run frontend tests
npm run test --workspace=frontend
```
