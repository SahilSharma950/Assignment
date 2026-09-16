import request from 'supertest';
import { app } from '../../../src/app.js';
import { boardRepository } from '../../../src/repositories/board.repository.js';
import { workspaceService } from '../../../src/services/workspace.service.js';
import { verifyAccessToken } from '../../../src/utils/jwt.js';
import { userRepository } from '../../../src/repositories/user.repository.js';
import mongoose from 'mongoose';

jest.mock('../../../src/repositories/board.repository.js');
jest.mock('../../../src/services/workspace.service.js');
jest.mock('../../../src/repositories/user.repository.js');
jest.mock('../../../src/utils/jwt.js');

const mockBoardRepository = jest.mocked(boardRepository);
const mockWorkspaceService = jest.mocked(workspaceService);
const mockUserRepository = jest.mocked(userRepository);
const mockVerifyAccessToken = jest.mocked(verifyAccessToken);

describe('Board Routes (Integration)', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockWorkspaceId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();

    mockVerifyAccessToken.mockReturnValue({ userId: mockUserId });
    mockUserRepository.findById.mockResolvedValue({
      id: mockUserId,
      name: 'Test User',
      email: 'test@test.com',
      role: 'member',
    } as any);
  });

  describe('POST /api/v1/boards', () => {
    it('should create a board if the user has workspace access', async () => {
      // Mock workspace service to allow access (does not throw)
      mockWorkspaceService.getWorkspaceById.mockResolvedValue({
        id: mockWorkspaceId,
        name: 'Workspace',
        owner: { _id: mockUserId },
        members: [mockUserId],
      } as any);

      mockBoardRepository.create.mockResolvedValue({
        id: new mongoose.Types.ObjectId().toString(),
        name: 'Test Board',
        workspace: mockWorkspaceId,
        createdBy: mockUserId,
      } as any);

      const response = await request(app)
        .post('/api/v1/boards')
        .set('Authorization', 'Bearer dummy')
        .send({ name: 'Test Board', workspaceId: mockWorkspaceId });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Test Board');
    });
  });

  describe('GET /api/v1/boards/workspace/:workspaceId', () => {
    it('should retrieve boards for the workspace', async () => {
      mockWorkspaceService.getWorkspaceById.mockResolvedValue({} as any);

      mockBoardRepository.findByWorkspace.mockResolvedValue([
        { id: new mongoose.Types.ObjectId().toString(), name: 'Board 1' },
      ] as any);

      const response = await request(app)
        .get(`/api/v1/boards/workspace/${mockWorkspaceId}`)
        .set('Authorization', 'Bearer dummy');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe('Board 1');
    });
  });

  describe('PUT /api/v1/boards/:id', () => {
    it('should return 403 if user is not the board creator or workspace owner', async () => {
      const boardId = new mongoose.Types.ObjectId().toString();

      // Target board was created by someone else
      mockBoardRepository.findById.mockResolvedValue({
        id: boardId,
        workspace: mockWorkspaceId,
        createdBy: { _id: new mongoose.Types.ObjectId().toString() }, // Different user
      } as any);

      // Workspace is owned by someone else
      mockWorkspaceService.getWorkspaceById.mockResolvedValue({
        owner: { _id: new mongoose.Types.ObjectId().toString() }, // Different user
      } as any);

      const response = await request(app)
        .put(`/api/v1/boards/${boardId}`)
        .set('Authorization', 'Bearer dummy')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Only the board creator or workspace owner can update this board');
    });
  });
});
