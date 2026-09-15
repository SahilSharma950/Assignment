import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

/**
 * Swagger / OpenAPI 3.0 configuration.
 *
 * - API spec auto-generated from JSDoc comments in route/controller files
 * - Served at GET /api/docs (Swagger UI)
 * - Served at GET /api/docs.json (raw OpenAPI spec — useful for codegen)
 */

const swaggerDefinition: swaggerJsdoc.OAS3Definition = {
  openapi: '3.0.0',
  info: {
    title: 'Mini SaaS Platform API',
    version: env.APP_VERSION,
    description: `
## Mini SaaS Platform REST API

A production-grade collaboration platform inspired by **Notion**, **Trello**, and **Slack**.

### Authentication
All protected endpoints require a **Bearer token** in the Authorization header:
\`\`\`
Authorization: Bearer <access_token>
\`\`\`

To refresh an expired access token, include the refresh token:
\`\`\`
X-Refresh-Token: <refresh_token>
\`\`\`

### Response Format
All responses follow the envelope pattern:
\`\`\`json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`
    `,
    contact: {
      name: 'Mini SaaS Platform',
      email: 'api@mini-saas.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api`,
      description: 'Local development server',
    },
    {
      url: 'https://api.mini-saas.com/api',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtained from POST /api/v1/auth/login',
      },
    },
    schemas: {
      // ─── Common ─────────────────────────────────────────────────────────
      ApiResponse: {
        type: 'object',
        required: ['success', 'timestamp'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string', example: 'Operation successful' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      ApiError: {
        type: 'object',
        required: ['success', 'message', 'statusCode', 'timestamp'],
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Resource not found' },
          statusCode: { type: 'integer', example: 404 },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
              },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      // ─── Health ─────────────────────────────────────────────────────────
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'degraded', 'unhealthy'],
            example: 'healthy',
          },
          version: { type: 'string', example: '1.0.0' },
          environment: {
            type: 'string',
            enum: ['development', 'production', 'test'],
            example: 'development',
          },
          uptime: {
            type: 'object',
            properties: {
              seconds: { type: 'integer', example: 3600 },
              human: { type: 'string', example: '1h 0m 0s' },
            },
          },
          memory: {
            type: 'object',
            properties: {
              heapUsedMb: { type: 'integer', example: 42 },
              heapTotalMb: { type: 'integer', example: 64 },
              rssMb: { type: 'integer', example: 80 },
              externalMb: { type: 'integer', example: 2 },
            },
          },
          system: {
            type: 'object',
            properties: {
              platform: { type: 'string', example: 'linux' },
              arch: { type: 'string', example: 'x64' },
              nodeVersion: { type: 'string', example: 'v20.11.0' },
              cpuCount: { type: 'integer', example: 4 },
              loadAvg: {
                type: 'array',
                items: { type: 'number' },
                example: [0.5, 0.7, 0.9],
              },
            },
          },
          services: {
            type: 'object',
            properties: {
              database: {
                type: 'string',
                enum: ['connected', 'disconnected', 'degraded'],
                example: 'connected',
              },
              redis: {
                type: 'string',
                enum: ['connected', 'disconnected', 'degraded'],
                example: 'connected',
              },
            },
          },
        },
      },
    },
  },
  security: [],
};

const swaggerOptions: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
