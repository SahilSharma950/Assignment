import type { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository.js';
import { sendSuccess } from '../utils/httpResponse.js';

export const list = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const users = await userRepository.findAllExcept(userId);
  sendSuccess(res, users, 'Users retrieved successfully');
};
