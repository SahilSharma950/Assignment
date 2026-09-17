import { User, IUser } from '../models/user.model.js';

/**
 * User repository for interacting with the MongoDB User collection.
 */
class UserRepository {
  /**
   * Find a user by email.
   * Includes the password field which is normally excluded by `select: false`.
   */
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password');
  }

  /**
   * Find a user by email (without password).
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  /**
   * Find a user by ID.
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  /**
   * Create a new user.
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  /**
   * Lists users other than the given one, for people-picker style UI
   * (e.g. inviting a workspace member). Not paginated — fine at this scale.
   */
  async findAllExcept(excludeUserId: string, limit: number = 100): Promise<IUser[]> {
    return User.find({ _id: { $ne: excludeUserId } })
      .select('name email avatar')
      .sort({ name: 1 })
      .limit(limit);
  }
}

export const userRepository = new UserRepository();
