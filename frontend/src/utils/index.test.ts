import { truncate, toTitleCase, getInitials, formatRelativeTime, cn, formatCount, formatFileSize, sleep } from './index';

describe('Frontend Utilities', () => {
  describe('truncate', () => {
    it('should return original string if shorter than max length', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate string and append ellipsis if longer', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });
  });

  describe('toTitleCase', () => {
    it('should convert strings to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
    });
  });

  describe('getInitials', () => {
    it('should return initials of a full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should handle single names', () => {
      expect(getInitials('Alice')).toBe('A');
    });
  });

  describe('cn', () => {
    it('should merge valid classes and drop falsy values', () => {
      expect(cn('btn', true && 'btn-primary', false && 'btn-secondary', null, undefined)).toBe('btn btn-primary');
    });
  });

  describe('formatCount', () => {
    it('should format thousands with K', () => {
      expect(formatCount(1500)).toBe('1.5K');
    });

    it('should format millions with M', () => {
      expect(formatCount(1500000)).toBe('1.5M');
    });

    it('should return raw count if under 1000', () => {
      expect(formatCount(500)).toBe('500');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return just now for recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });
  });

  describe('sleep', () => {
    it('should resolve after timeout', async () => {
      jest.useFakeTimers();
      const promise = sleep(1000);
      jest.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
      jest.useRealTimers();
    });
  });
});
