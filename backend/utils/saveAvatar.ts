import fs from 'fs/promises';
import path from 'path';
import axios, { AxiosResponse } from 'axios';

export const saveAvatar = async (avatarUrl: string, avatarName: string) => {
  const avatarPathBase = path.join(__dirname, '../public/images/userAvatars');

  try {
    // Fetch the avatar as binary data
    const response: AxiosResponse<ArrayBuffer> = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    });

    // Determine the file extension from the Content-Type header
    const contentType = response.headers['content-type'] as string;
    if (!contentType || !contentType.startsWith('image/')) {
      console.error('Invalid Content-Type header:', contentType);
      throw new Error('Invalid image type.');
    }
    const extension = contentType.split('/')[1];
    // Construct the full file name with extension
    const avatarFileName = `${avatarName}.${extension}`;
    const avatarPath = path.join(avatarPathBase, avatarFileName);

    // Save the file
    const buffer = Buffer.from(response.data);
    await fs.writeFile(avatarPath, buffer);

    return avatarFileName; // Return the name for further use
  } catch (error) {
    console.error('Error saving avatar:', error);
    throw error;
  }
};
