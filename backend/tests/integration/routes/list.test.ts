import request from 'supertest';
import { app } from '../../../src/app.js';
import { listRepository } from '../../../src/repositories/list.repository.js';
import { boardService } from '../../../src/services/board.service.js';
import { verifyAccessToken } from '../../../src/utils/jwt.js';
import { userRepository } from '../../../src/repositories/user.repository.js';
import mongoose from 'mongoose';

jest.mock('../../../src/repositories/list.repository.js');
jest.mock('../../../src/services/board.service.js');
jest.mock('../../../src/repositories/user.repository.js');
jest.mock('../../../src/utils/jwt.js');

const mockListRepository = jest.mocked(listRepository);
const mockBoardService = jest.mocked(boardService);
const mockUserRepository = jest.mocked(userRepository);
const mockVerifyAccessToken = jest.mocked(verifyAccessToken);

describe('List Routes (Integration)', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockBoardId = new mongoose.Types.ObjectId().toString();

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

  describe('POST /api/v1/lists', () => {
    it('should create a list if the user has board access', async () => {
      // Mock board service to allow access
      mockBoardService.getBoardById.mockResolvedValue({
        id: mockBoardId,
        name: 'Board',
        workspace: new mongoose.Types.ObjectId().toString(),
      } as any);

      // Mock max order
      mockListRepository.getMaxOrder.mockResolvedValue(1);

      mockListRepository.create.mockResolvedValue({
        id: new mongoose.Types.ObjectId().toString(),
        name: 'To Do',
        board: mockBoardId,
        order: 2,
        createdBy: mockUserId,
      } as any);

      const response = await request(app)
        .post('/api/v1/lists')
        .set('Authorization', 'Bearer dummy')
        .send({ name: 'To Do', boardId: mockBoardId });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('To Do');
    });
  });

  describe('GET /api/v1/lists/board/:boardId', () => {
    it('should retrieve ordered lists for the board', async () => {
      mockBoardService.getBoardById.mockResolvedValue({} as any);

      mockListRepository.findByBoard.mockResolvedValue([
        { id: new mongoose.Types.ObjectId().toString(), name: 'To Do', order: 0 },
        { id: new mongoose.Types.ObjectId().toString(), name: 'Doing', order: 1 },
      ] as any);

      const response = await request(app)
        .get(`/api/v1/lists/board/${mockBoardId}`)
        .set('Authorization', 'Bearer dummy');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].name).toBe('To Do');
    });
  });

  describe('PUT /api/v1/lists/:id', () => {
    it('should allow a workspace member to update the list order', async () => {
      const listId = new mongoose.Types.ObjectId().toString();

      mockListRepository.findById.mockResolvedValue({
        id: listId,
        board: mockBoardId,
      } as any);

      mockBoardService.getBoardById.mockResolvedValue({} as any);

      mockListRepository.update.mockResolvedValue({
        id: listId,
        name: 'In Progress',
        order: 5,
      } as any);

      const response = await request(app)
        .put(`/api/v1/lists/${listId}`)
        .set('Authorization', 'Bearer dummy')
        .send({ name: 'In Progress', order: 5 });

      expect(response.status).toBe(200);
      expect(response.body.data.order).toBe(5);
    });
  });
});
