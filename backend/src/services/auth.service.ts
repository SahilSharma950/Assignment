import { userRepository } from '../repositories/user.repository.js';
import { ConflictError, UnauthorizedError } from '../utils/AppError.js';
import { generateTokens, AuthTokens } from '../utils/jwt.js';
import { IUser } from '../models/user.model.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
}

export interface LoginDTO {
  email: string;
  password?: string;
}

export interface AuthResult {
  user: IUser;
  tokens: AuthTokens;
}

class AuthService {
  /**
   * Registers a new user.
   */
  async register(data: RegisterDTO): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const createData: Partial<IUser> = {
      name: data.name,
      email: data.email,
    };
    if (data.password) createData.password = data.password;
    if (data.avatar) createData.avatar = data.avatar;

    const user = await userRepository.create(createData);

    // Generate tokens
    const tokens = generateTokens(user.id);

    return { user, tokens };
  }

  /**
   * Authenticates a user.
   */
  async login(data: LoginDTO): Promise<AuthResult> {
    // Find user and explicitly select password
    const user = await userRepository.findByEmailWithPassword(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    if (!data.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    return { user, tokens };
  }
}

export const authService = new AuthService();
