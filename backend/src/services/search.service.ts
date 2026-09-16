import { searchRepository } from '../repositories/search.repository.js';
import { BadRequestError } from '../utils/AppError.js';

export type SearchType = 'all' | 'user' | 'board' | 'task';

export interface SearchResults {
  users?: any[];
  boards?: any[];
  tasks?: any[];
}

class SearchService {
  /**
   * Executes a search across specified entity types.
   */
  async search(query: string, type: SearchType, userId: string): Promise<SearchResults> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters long');
    }

    const results: SearchResults = {};

    const searchUsers = type === 'all' || type === 'user';
    const searchBoards = type === 'all' || type === 'board';
    const searchTasks = type === 'all' || type === 'task';

    const promises = [];

    if (searchUsers) {
      promises.push(
        searchRepository.searchUsers(query).then((users) => {
          results.users = users;
        })
      );
    }

    if (searchBoards) {
      promises.push(
        searchRepository.searchBoards(query, userId).then((boards) => {
          results.boards = boards;
        })
      );
    }

    if (searchTasks) {
      promises.push(
        searchRepository.searchTasks(query, userId).then((tasks) => {
          results.tasks = tasks;
        })
      );
    }

    await Promise.all(promises);

    return results;
  }
}

export const searchService = new SearchService();
