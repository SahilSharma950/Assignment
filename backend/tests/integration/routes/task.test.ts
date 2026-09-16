import request from 'supertest';
import { app } from '../../../src/app.js';
import { taskRepository } from '../../../src/repositories/task.repository.js';
import { listService } from '../../../src/services/list.service.js';
import { boardService } from '../../../src/services/board.service.js';
import { workspaceService } from '../../../src/services/workspace.service.js';
import { verifyAccessToken } from '../../../src/utils/jwt.js';
import { userRepository } from '../../../src/repositories/user.repository.js';
import mongoose from 'mongoose';

jest.mock('../../../src/repositories/task.repository.js');
jest.mock('../../../src/services/list.service.js');
jest.mock('../../../src/services/board.service.js');
jest.mock('../../../src/services/workspace.service.js');
jest.mock('../../../src/repositories/user.repository.js');
jest.mock('../../../src/utils/jwt.js');

const mockTaskRepository = jest.mocked(taskRepository);
const mockListService = jest.mocked(listService);
const mockBoardService = jest.mocked(boardService);
const mockWorkspaceService = jest.mocked(workspaceService);
const mockUserRepository = jest.mocked(userRepository);
const mockVerifyAccessToken = jest.mocked(verifyAccessToken);

describe('Task Routes (Integration)', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockListId = new mongoose.Types.ObjectId().toString();
  const mockBoardId = new mongoose.Types.ObjectId().toString();
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

    // Setup typical successful cascade mocks
    mockListService.getListById.mockResolvedValue({
      id: mockListId,
      board: mockBoardId,
    } as any);

    mockBoardService.getBoardById.mockResolvedValue({
      id: mockBoardId,
      workspace: mockWorkspaceId,
    } as any);

    mockWorkspaceService.getWorkspaceById.mockResolvedValue({
      id: mockWorkspaceId,
      owner: { _id: mockUserId }, // Setup user as owner for general success
      members: [mockUserId],
    } as any);
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a task if the user has list access', async () => {
      mockTaskRepository.getMaxOrder.mockResolvedValue(1);

      mockTaskRepository.create.mockResolvedValue({
        id: new mongoose.Types.ObjectId().toString(),
        title: 'Do laundry',
        list: mockListId,
        order: 2,
        createdBy: mockUserId,
      } as any);

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', 'Bearer dummy')
        .send({ title: 'Do laundry', listId: mockListId });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Do laundry');
    });
  });

  describe('POST /api/v1/tasks/:id/assignees', () => {
    it('should allow assigning a user if they are a member of the workspace', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const assigneeId = mockUserId; // Setup is already a member

      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        list: mockListId,
      } as any);

      mockTaskRepository.addAssignee.mockResolvedValue({
        id: taskId,
        assignees: [assigneeId],
      } as any);

      const response = await request(app)
        .post(`/api/v1/tasks/${taskId}/assignees`)
        .set('Authorization', 'Bearer dummy')
        .send({ assigneeId });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User assigned successfully');
    });

    it('should return 403 if the assignee is NOT a member of the workspace', async () => {
      const taskId = new mongoose.Types.ObjectId().toString();
      const randomAssigneeId = new mongoose.Types.ObjectId().toString();

      mockTaskRepository.findById.mockResolvedValue({
        id: taskId,
        list: mockListId,
      } as any);

      const response = await request(app)
        .post(`/api/v1/tasks/${taskId}/assignees`)
        .set('Authorization', 'Bearer dummy')
        .send({ assigneeId: randomAssigneeId });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Assignee must be a member of the workspace');
    });
  });
});
