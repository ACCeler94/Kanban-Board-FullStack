import fs from 'fs/promises';

export const deleteAvatar = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Failed to delete file: ${filePath}`);
    }
  }
};
