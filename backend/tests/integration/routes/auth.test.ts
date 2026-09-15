import request from 'supertest';
import { app } from '../../../src/app.js';
import { userRepository } from '../../../src/repositories/user.repository.js';
import mongoose from 'mongoose';

// Since we are not actually connecting to the real DB in these tests (or if we do, we need in-memory DB),
// we will mock the userRepository methods.
jest.mock('../../../src/repositories/user.repository.js');
const mockUserRepository = jest.mocked(userRepository);

describe('Auth Routes (Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a user and return tokens', async () => {
      // Setup mock
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: new mongoose.Types.ObjectId().toString(),
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        comparePassword: jest.fn(),
      } as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 409 if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({} as any);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login and return tokens', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue({
        id: new mongoose.Types.ObjectId().toString(),
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        password: 'hashedpassword',
        comparePassword: jest.fn().mockResolvedValue(true),
      } as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 on invalid credentials', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue({
        id: new mongoose.Types.ObjectId().toString(),
        comparePassword: jest.fn().mockResolvedValue(false), // wrong password
      } as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the refresh token cookie', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // set-cookie header should exist to clear the cookie
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 401 if no refresh token cookie is provided', async () => {
      const response = await request(app).post('/api/auth/refresh');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No refresh token provided');
    });
  });
});
