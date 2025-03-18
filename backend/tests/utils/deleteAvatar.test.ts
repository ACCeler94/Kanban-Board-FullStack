import fs from 'fs/promises';
import { afterEach, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { deleteAvatar } from '../../utils/deleteAvatar';
import { PathLike } from 'fs';

describe('deleteAvatar', () => {
  let fsUnlinkSpy: MockInstance<[path: PathLike], Promise<void>>;

  beforeEach(() => {
    fsUnlinkSpy = vi.spyOn(fs, 'unlink');
  });

  afterEach(() => {
    fsUnlinkSpy.mockRestore();
  });

  it('should call unlink with the correct file path', async () => {
    const filePath = '/path/to/file';
    fsUnlinkSpy.mockResolvedValueOnce(undefined); // Simulate a successful file deletion

    await deleteAvatar(filePath);

    expect(fsUnlinkSpy).toHaveBeenCalledWith(filePath);
  });

  it('should log a warning when file deletion fails in non-production environments', async () => {
    const filePath = '/path/to/file';
    const error = new Error('File not found');
    fsUnlinkSpy.mockRejectedValueOnce(error);
    console.warn = vi.fn();
    process.env.NODE_ENV = 'development';

    await deleteAvatar(filePath);

    expect(console.warn).toHaveBeenCalledWith(`Failed to delete file: ${filePath}`);
  });

  it('should not log a warning in production environment when file deletion fails', async () => {
    const filePath = '/path/to/file';
    const error = new Error('File not found');
    fsUnlinkSpy.mockRejectedValueOnce(error);
    console.warn = vi.fn();
    process.env.NODE_ENV = 'production';

    await deleteAvatar(filePath);

    expect(console.warn).not.toHaveBeenCalled();
  });
});
