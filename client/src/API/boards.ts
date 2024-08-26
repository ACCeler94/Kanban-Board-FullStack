import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from './config';
import { validate as uuidValidate } from 'uuid';
import { useAuth0 } from '@auth0/auth0-react';
import { BoardType } from '../types/types';

// actions
const fetchBoardById = async (id: string | undefined, token: string) => {
  if (!id) {
    // check if id exists and is valid uuid
    throw new Error('Invalid Board ID.');
  }

  try {
    const { data } = await axios.get(`${apiUrl}/boards/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch board data: ${error.response?.status} ${error.response?.statusText}`
      );
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

// hooks

interface UseBoardByIdReturnType {
  data: BoardType | undefined;
  error: Error | null;
  isPending: boolean;
}

const useBoardById = (id: string | undefined): UseBoardByIdReturnType => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const { data, error, isPending } = useQuery({
    queryKey: ['board', id],
    queryFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        return fetchBoardById(id, token);
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }
    },
    enabled: !!id && uuidValidate(id) && isAuthenticated, // check for the existence of the id and if it's valid uuid to prevent unnecessary calls to fetchBoardById
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return { data, error, isPending };
};

export { useBoardById };
