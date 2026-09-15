import request from 'supertest';
import { app } from '../../../src/app.js';

/**
 * Integration tests for GET /api/health
 *
 * These tests hit the actual Express app (no mocking of routes)
 * using Supertest. No real DB/Redis connection is required.
 */
describe('GET /api/health', () => {
  it('should return 200 with a healthy status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return the correct response envelope', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body).toMatchObject({
      success: true,
      timestamp: expect.any(String),
    });
  });

  it('should include health data in the response', async () => {
    const res = await request(app).get('/api/health');

    const { data } = res.body as {
      data: {
        status: string;
        version: string;
        environment: string;
        uptime: { seconds: number; human: string };
        memory: {
          heapUsedMb: number;
          heapTotalMb: number;
          rssMb: number;
          externalMb: number;
        };
        system: {
          platform: string;
          arch: string;
          nodeVersion: string;
          cpuCount: number;
          loadAvg: number[];
        };
        services: {
          database: string;
          redis: string;
        };
      };
    };

    expect(data.status).toBe('healthy');
    expect(data.environment).toBe('test');
    expect(typeof data.version).toBe('string');

    // Uptime
    expect(data.uptime.seconds).toBeGreaterThanOrEqual(0);
    expect(typeof data.uptime.human).toBe('string');

    // Memory
    expect(data.memory.heapUsedMb).toBeGreaterThan(0);
    expect(data.memory.heapTotalMb).toBeGreaterThan(0);
    expect(data.memory.rssMb).toBeGreaterThan(0);

    // System
    expect(typeof data.system.platform).toBe('string');
    expect(typeof data.system.nodeVersion).toBe('string');
    expect(data.system.cpuCount).toBeGreaterThan(0);
    expect(Array.isArray(data.system.loadAvg)).toBe(true);

    // Services (disconnected until DB/Redis tasks are done)
    expect(['connected', 'disconnected', 'degraded']).toContain(data.services.database);
    expect(['connected', 'disconnected', 'degraded']).toContain(data.services.redis);
  });

  it('should include X-Request-ID in response headers', async () => {
    const res = await request(app).get('/api/health');

    expect(res.headers['x-request-id']).toBeDefined();
    // Should be a valid UUID v4 format
    expect(res.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should respect a provided X-Request-ID header', async () => {
    const customId = 'custom-request-id-12345';
    const res = await request(app).get('/api/health').set('X-Request-ID', customId);

    expect(res.headers['x-request-id']).toBe(customId);
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-route-xyz');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not found');
  });

  it('should return correct Content-Type header', async () => {
    const res = await request(app).get('/api/health');

    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('should be accessible without any authentication headers', async () => {
    // Health endpoint must be public — no auth headers sent
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
  });

  it('should return a valid ISO 8601 timestamp', async () => {
    const res = await request(app).get('/api/health');

    const ts = new Date(res.body.timestamp as string);
    expect(ts).toBeInstanceOf(Date);
    expect(isNaN(ts.getTime())).toBe(false);
  });
});
