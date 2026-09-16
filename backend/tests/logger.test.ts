import { logger } from '../src/utils/logger.js';

describe('Logger Utility', () => {
  it('should have standard log levels defined', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.http).toBeDefined();
  });
});
