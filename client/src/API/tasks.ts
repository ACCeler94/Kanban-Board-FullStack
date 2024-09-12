import axios from 'axios';
import { apiUrl } from './config';
import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { validate as uuidValidate } from 'uuid';
import { TaskType } from '../types/types';

const fetchTaskById = async (taskId: string, token: string): Promise<TaskType | undefined> => {
  if (!taskId) throw new Error('Invalid Task ID.');

  try {
    const { data } = await axios.get(`${apiUrl}/tasks/${taskId}`, {
      headers: {
        authorization: `Bearer ${token}`,
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
      throw new Error('An unexpected error occurred');
    }
  }
};

const deleteTaskById = async (taskId: string, token: string) => {
  if (!taskId) throw new Error('Invalid Task ID.');
  try {
    const { data } = await axios.delete(`${apiUrl}/tasks/${taskId}`, {
      headers: {
        authorization: `Bearer ${token}`,
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
      throw new Error('An unexpected error occurred');
    }
  }
};

const useTaskData = (taskId: string) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const { data, error, isPending, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        return fetchTaskById(taskId, token);
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }
    },
    enabled: !!taskId && uuidValidate(taskId) && isAuthenticated, // check for the existence of the id and if it's valid uuid to prevent unnecessary calls to fetchTaskById
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return { data, error, isPending, refetch };
};

const useDeleteTask = (taskId: string, boardId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        return deleteTaskById(taskId, token);
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  return { mutate, data, error, isPending };
};

export { useTaskData, useDeleteTask };
