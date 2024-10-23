import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { validate as uuidValidate } from 'uuid';
import { BoardQuery, JsonResponseType, NewBoardData, User, UserBoardData } from '../types/types';
import boardTitleValidator from '../validators/boards/boardTitleValidator';
import userEmailValidator from '../validators/users/userEmailValidator';
import { apiUrl } from './config';

// Actions
const fetchBoardById = async (
  id: string | undefined,
  token: string
): Promise<BoardQuery | undefined> => {
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
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(`Failed to fetch board data: ${error.response?.status} ${errorMessage}`);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

const createBoard = async (title: string, token: string): Promise<NewBoardData> => {
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
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(`Failed to create board: ${error.response?.status} ${errorMessage}`);
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

const editBoard = async (
  title: string,
  boardId: string,
  token: string
): Promise<JsonResponseType> => {
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
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(`Failed to edit board: ${error.response?.status} ${errorMessage}`);
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

const deleteBoardById = async (boardId: string, token: string): Promise<JsonResponseType> => {
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
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(`Failed to fetch board data: ${error.response?.status} ${errorMessage}`);
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

const addUserToBoard = async (boardId: string, email: string, token: string): Promise<User> => {
  if (!boardId) throw new Error('Invalid Board ID.');

  try {
    const { data } = await axios.post(
      `${apiUrl}/boards/${boardId}/users/add`,
      {
        email,
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
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(`Failed to add user to the board: ${error.response?.status} ${errorMessage}`);
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

const deleteUserFromBoard = async (
  boardId: string,
  userId: string,
  token: string
): Promise<string[]> => {
  try {
    const { data } = await axios.delete(`${apiUrl}/boards/${boardId}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(
        `Failed to delete user from the board: ${error.response?.status} ${errorMessage}`
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
      if (!id || !uuidValidate(id)) throw new Error('Invalid board ID.');

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
      if (!id || !uuidValidate(id)) throw new Error('Invalid board ID.');

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
      queryClient.setQueryData(['board', id], (oldData: BoardQuery) => {
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

const useAddUserToBoard = (boardId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending, isSuccess } = useMutation({
    mutationFn: async (email: string) => {
      if (!boardId || !uuidValidate(boardId)) throw new Error('Invalid board ID.');

      const validationResult = userEmailValidator.safeParse({ email });

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
        return addUserToBoard(boardId, validationResult.data.email, token);
      } catch (error) {
        throw new Error('Failed to delete the board. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  return { mutate, data, error, isPending, isSuccess };
};

const useDeleteUserFromBoard = (boardId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending, isSuccess } = useMutation({
    mutationFn: async (userId: string) => {
      if (!boardId || !uuidValidate(boardId)) throw new Error('Invalid board ID.');
      if (!userId || !uuidValidate(userId)) throw new Error('Invalid user ID.');

      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }

      try {
        return deleteUserFromBoard(boardId, userId, token);
      } catch (error) {
        throw new Error('Failed to delete the user from the board. Please try again.');
      }
    },
    onSuccess: (taskIds) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] }); // Invalidate board the user was assigned to
      if (taskIds.length !== 0) {
        // Invalidate tasks the user was assigned to
        queryClient.invalidateQueries({
          queryKey: ['task'],
          predicate: (query) => taskIds.includes(query.queryKey[1] as string),
        });
      }
    },
  });

  return { mutate, data, error, isPending, isSuccess };
};

export {
  useAddUserToBoard,
  useBoardById,
  useCreateBoard,
  useDeleteBoard,
  useDeleteUserFromBoard,
  useEditBoard,
};
