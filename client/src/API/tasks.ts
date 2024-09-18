import axios from 'axios';
import { apiUrl } from './config';
import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { validate as uuidValidate } from 'uuid';
import { EditTaskData, TaskType } from '../types/types';

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
      throw new Error('An unexpected error occurred.');
    }
  }
};

const deleteTaskById = async (taskId: string, token: string) => {
  if (!taskId) throw new Error('Invalid Task ID.');
  try {
    const { data } = await axios.delete(`${apiUrl}/tasks/${taskId}`, {
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

const editTaskById = async (
  { taskData, subtaskData }: EditTaskData,
  taskId: string,
  token: string
) => {
  if (
    (!taskData || Object.keys(taskData).length === 0) &&
    (!subtaskData || subtaskData.length === 0)
  ) {
    throw new Error('No data to edit provided.');
  }
  try {
    const { data } = await axios.patch(
      `${apiUrl}/tasks/${taskId}`,
      { taskData, subtaskData }, // body obj containing optional task and subtask data
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
        `Failed to update task data: ${error.response?.status} ${error.response?.statusText}`
      );
    } else {
      throw new Error('An unexpected error occurred.');
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
      if (!taskId || !uuidValidate(taskId)) throw new Error('Invalid task ID.');

      try {
        const token = await getAccessTokenSilently();
        return deleteTaskById(taskId, token);
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }
    },
    onSuccess: () => {
      setTimeout(() => {
        // timeout to 1.5 second to allow the user to read success message
        queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        queryClient.removeQueries({ queryKey: ['task', taskId] }); // remove deleted task from cache
      }, 1500);
    },
  });

  return { mutate, data, error, isPending };
};

const useEditTask = (taskId: string, editData: EditTaskData) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending } = useMutation({
    mutationFn: async () => {
      if (!taskId || !uuidValidate(taskId)) throw new Error('Invalid task ID.');

      try {
        const token = await getAccessTokenSilently();
        return editTaskById(editData, taskId, token);
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }
    },
    onSuccess: (updatedTask: TaskType) => {
      queryClient.setQueryData(['task', taskId], updatedTask);
      queryClient.invalidateQueries({ queryKey: ['board', updatedTask.boardId] }); // board invalidation done to properly update subtask counter in the TaskCard
    },
  });

  return { mutate, data, error, isPending };
};

export { useTaskData, useDeleteTask, useEditTask };
