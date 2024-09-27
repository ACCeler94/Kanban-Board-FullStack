import axios from 'axios';
import { apiUrl } from './config';
import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { validate as uuidValidate } from 'uuid';
import { BoardType, EditTaskData, NewTaskData, TaskType } from '../types/types';
import editTaskValidator from '../validators/tasks/editTaskValidator';
import addTaskValidator from '../validators/tasks/addTaskValidator';

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

const addNewTask = async ({ taskData, subtaskData }: NewTaskData, token: string) => {
  try {
    const { data } = await axios.post(
      `${apiUrl}/tasks`,
      { taskData, subtaskData },
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
        `Failed to create task: ${error.response?.status} ${error.response?.statusText}`
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
      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }

      try {
        return fetchTaskById(taskId, token);
      } catch (error) {
        throw new Error('Failed to fetch the task data. Please try again.');
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

  const { mutate, data, error, isPending, isSuccess } = useMutation({
    mutationFn: async () => {
      if (!taskId || !uuidValidate(taskId)) throw new Error('Invalid task ID.');

      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }

      try {
        return deleteTaskById(taskId, token);
      } catch (error) {
        throw new Error('Failed to delete the task. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      queryClient.removeQueries({ queryKey: ['task', taskId] }); // remove deleted task from cache
    },
  });

  return { mutate, data, error, isPending, isSuccess };
};

const useEditTask = (taskId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending, isSuccess } = useMutation({
    mutationFn: async (editData: EditTaskData) => {
      if (!taskId || !uuidValidate(taskId)) throw new Error('Invalid task ID.');

      const validationResult = editTaskValidator.safeParse(editData); // data validation with zod
      if (!validationResult.success)
        throw new Error('Invalid data: ' + validationResult.error.message);

      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }

      try {
        return editTaskById(editData, taskId, token);
      } catch (error) {
        throw new Error('Failed to edit the task. Please try again.');
      }
    },
    onSuccess: (updatedTask: TaskType) => {
      queryClient.setQueryData(['task', taskId], updatedTask);
      queryClient.invalidateQueries({ queryKey: ['board', updatedTask.boardId] }); // board invalidation done to properly update subtask counter in the TaskCard
    },
  });

  return { mutate, data, error, isPending, isSuccess };
};

const useCreateTask = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending, isSuccess } = useMutation({
    mutationFn: async (taskData: NewTaskData) => {
      const validationResult = addTaskValidator.safeParse(taskData);

      if (!validationResult.success)
        throw new Error('Invalid task data: ' + validationResult.error.message);

      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }

      try {
        return addNewTask(taskData, token);
      } catch (error) {
        throw new Error('Failed to create a task. Please try again.');
      }
    },
    onSuccess: (createdTask: TaskType) => {
      queryClient.setQueryData(['board', createdTask.boardId], (oldData: BoardType) => {
        if (!oldData) return; // if there is no old board data return

        return { ...oldData, tasks: [...oldData.tasks, createdTask] };
      });
    },
  });
  return { mutate, data, isPending, error, isSuccess };
};

export { useTaskData, useDeleteTask, useEditTask, useCreateTask };
