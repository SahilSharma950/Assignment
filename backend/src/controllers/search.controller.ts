import { Request, Response, NextFunction } from 'express';
import { searchService, SearchType } from '../services/search.service.js';

class SearchController {
  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      const type = (req.query.type as SearchType) || 'all';

      const results = await searchService.search(q, type, req.user!.id);

      res.status(200).json({
        status: 'success',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
