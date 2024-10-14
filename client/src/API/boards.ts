import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { validate as uuidValidate } from 'uuid';
import { BoardQuery, BoardType, NewBoardData, UserBoardData } from '../types/types';
import boardTitleValidator from '../validators/boards/boardTitleValidator';
import { apiUrl } from './config';

// Actions
const fetchBoardById = async (
  id: string | undefined,
  token: string
): Promise<BoardQuery | undefined> => {
  if (!id) {
    // Check if id exists and is valid uuid
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

const createBoard = async (title: string, token: string) => {
  try {
    const { data } = await axios.post(
      `${apiUrl}/boards`,
      {
        title,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to create board: ${error.response?.status} ${error.response?.statusText}`
      );
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

const editBoard = async (title: string, boardId: string, token: string) => {
  try {
    const { data } = await axios.put(
      `${apiUrl}/boards/${boardId}`,
      {
        title,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to edit board: ${error.response?.status} ${error.response?.statusText}`
      );
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

const deleteBoardById = async (boardId: string, token: string) => {
  if (!boardId) throw new Error('Invalid Task ID.');
  try {
    const { data } = await axios.delete(`${apiUrl}/boards/${boardId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch task data: ${error.response?.status} ${error.response?.statusText}`
      );
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

// Hooks
const useBoardById = (id: string | undefined) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const { data, error, isPending, refetch } = useQuery({
    queryKey: ['board', id],
    queryFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        return fetchBoardById(id, token);
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }
    },
    enabled: !!id && uuidValidate(id) && isAuthenticated, // Check for the existence of the id and if it's valid uuid to prevent unnecessary calls to fetchBoardById
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });

  return { data, error, isPending, refetch };
};

const useCreateBoard = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending, isSuccess } = useMutation({
    mutationFn: async (newBoardData: { title: string }) => {
      const validationResult = boardTitleValidator.safeParse(newBoardData);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map((issue) => issue.message);
        throw new Error(`Invalid data: ${errorMessages.join(', ')}`);
      }

      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }

      try {
        return createBoard(validationResult.data.title, token);
      } catch (error) {
        throw new Error('Failed to create a board. Please try again.');
      }
    },
    onSuccess: (createdBoard: NewBoardData) => {
      queryClient.setQueryData(['userBoardData'], (userData: UserBoardData) => {
        if (!userData) return;

        return { ...userData, boards: [...userData.boards, { board: createdBoard }] }; // Optimistic update
      });
    },
  });
  return { mutate, data, error, isPending, isSuccess };
};

const useEditBoard = (id: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending, isSuccess } = useMutation({
    mutationFn: async (editedBoardData: { title: string }) => {
      const validationResult = boardTitleValidator.safeParse(editedBoardData);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map((issue) => issue.message);
        throw new Error(`Invalid data: ${errorMessages.join(', ')}`);
      }

      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }

      try {
        return editBoard(validationResult.data.title, id, token);
      } catch (error) {
        throw new Error('Failed to save changes. Please try again.');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(['board', id], (oldData: BoardType) => {
        if (!oldData) return;

        return {
          ...oldData,
          title: variables.title,
        }; // Optimistic update
      });
      queryClient.invalidateQueries({ queryKey: ['userBoardData'] });
    },
  });
  return { mutate, data, error, isPending, isSuccess };
};

const useDeleteBoard = (boardId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending, isSuccess } = useMutation({
    mutationFn: async () => {
      if (!boardId || !uuidValidate(boardId)) throw new Error('Invalid board ID.');

      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }

      try {
        return deleteBoardById(boardId, token);
      } catch (error) {
        throw new Error('Failed to delete the board. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBoardData'] });
      queryClient.removeQueries({ queryKey: ['board', boardId] }); // Remove deleted board from cache
    },
  });

  return { mutate, data, error, isPending, isSuccess };
};

export { useBoardById, useCreateBoard, useEditBoard, useDeleteBoard };
