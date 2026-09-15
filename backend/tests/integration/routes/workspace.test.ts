import request from 'supertest';
import { app } from '../../../src/app.js';
import { workspaceRepository } from '../../../src/repositories/workspace.repository.js';
import { verifyAccessToken } from '../../../src/utils/jwt.js';
import { userRepository } from '../../../src/repositories/user.repository.js';
import mongoose from 'mongoose';

jest.mock('../../../src/repositories/workspace.repository.js');
jest.mock('../../../src/repositories/user.repository.js');
jest.mock('../../../src/utils/jwt.js');

const mockWorkspaceRepository = jest.mocked(workspaceRepository);
const mockUserRepository = jest.mocked(userRepository);
const mockVerifyAccessToken = jest.mocked(verifyAccessToken);

describe('Workspace Routes (Integration)', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authentication
    mockVerifyAccessToken.mockReturnValue({ userId: mockUserId });
    mockUserRepository.findById.mockResolvedValue({
      id: mockUserId,
      name: 'Test User',
      email: 'test@test.com',
      role: 'member',
    } as any);
  });

  describe('POST /api/v1/workspaces', () => {
    it('should create a workspace', async () => {
      mockWorkspaceRepository.create.mockResolvedValue({
        id: new mongoose.Types.ObjectId().toString(),
        name: 'Test Workspace',
        description: 'Test description',
        owner: mockUserId,
        members: [mockUserId],
      } as any);

      const response = await request(app)
        .post('/api/v1/workspaces')
        .set('Authorization', 'Bearer dummy_token')
        .send({
          name: 'Test Workspace',
          description: 'Test description',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Workspace');
    });
  });

  describe('GET /api/v1/workspaces/:id', () => {
    it('should return a workspace if the user is the owner', async () => {
      const workspaceId = new mongoose.Types.ObjectId().toString();

      mockWorkspaceRepository.findById.mockResolvedValue({
        id: workspaceId,
        name: 'Test Workspace',
        owner: { _id: mockUserId },
        members: [],
      } as any);

      const response = await request(app)
        .get(`/api/v1/workspaces/${workspaceId}`)
        .set('Authorization', 'Bearer dummy_token');

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Test Workspace');
    });

    it('should return 403 if the user is not the owner or a member', async () => {
      const workspaceId = new mongoose.Types.ObjectId().toString();

      mockWorkspaceRepository.findById.mockResolvedValue({
        id: workspaceId,
        name: 'Test Workspace',
        owner: { _id: new mongoose.Types.ObjectId().toString() }, // Different owner
        members: [], // User is not a member
      } as any);

      const response = await request(app)
        .get(`/api/v1/workspaces/${workspaceId}`)
        .set('Authorization', 'Bearer dummy_token');

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/v1/workspaces/:id', () => {
    it('should return 403 if the user is not the owner', async () => {
      const workspaceId = new mongoose.Types.ObjectId().toString();

      mockWorkspaceRepository.findById.mockResolvedValue({
        id: workspaceId,
        name: 'Test Workspace',
        owner: { _id: new mongoose.Types.ObjectId().toString() }, // Different owner
        members: [mockUserId], // User is a member, but NOT owner
      } as any);

      const response = await request(app)
        .put(`/api/v1/workspaces/${workspaceId}`)
        .set('Authorization', 'Bearer dummy_token')
        .send({ name: 'Updated Workspace' });

      expect(response.status).toBe(403);
    });
  });
});
