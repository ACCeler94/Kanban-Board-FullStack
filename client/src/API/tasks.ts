import axios from 'axios';
import { apiUrl } from './config';
import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { validate as uuidValidate } from 'uuid';
import { BoardQuery, DiffTaskData, EditTaskData, NewTaskData, TaskType } from '../types/types';
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
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(`Failed to fetch task data: ${error.response?.status} ${errorMessage}`);
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
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(`Failed to fetch task data: ${error.response?.status} ${errorMessage}`);
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

const editTaskById = async (
  { taskData, subtaskData }: DiffTaskData | EditTaskData,
  subtasksToRemove: string[] | [],
  taskId: string,
  token: string
) => {
  try {
    const { data } = await axios.patch(
      `${apiUrl}/tasks/${taskId}`,
      { taskData, subtaskData, subtasksToRemove }, // Body obj containing optional task and subtask data plus subtasksToRemove array
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
      throw new Error(`Failed to update task data: ${error.response?.status} ${errorMessage}`);
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
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(`Failed to create task: ${error.response?.status} ${errorMessage}`);
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
    enabled: !!taskId && uuidValidate(taskId) && isAuthenticated, // Check for the existence of the id and if it's valid uuid to prevent unnecessary calls to fetchTaskById
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
      queryClient.removeQueries({ queryKey: ['task', taskId] }); // Remove deleted task from cache
    },
  });

  return { mutate, data, error, isPending, isSuccess };
};

const useEditTask = (taskId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { mutate, data, error, isPending, isSuccess } = useMutation({
    mutationFn: async ({
      editData,
      subtasksToRemove,
    }: {
      editData: DiffTaskData | EditTaskData;
      subtasksToRemove: string[] | [];
    }) => {
      if (!taskId || !uuidValidate(taskId)) throw new Error('Invalid task ID.');

      const validationResult = editTaskValidator.safeParse({ ...editData, subtasksToRemove }); // Data validation with zod
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
        return editTaskById(editData, subtasksToRemove, taskId, token);
      } catch (error) {
        throw new Error('Failed to edit the task. Please try again.');
      }
    },
    onSuccess: (updatedTask: TaskType) => {
      queryClient.setQueryData(['task', taskId], updatedTask);
      queryClient.invalidateQueries({ queryKey: ['board', updatedTask.boardId] }); // Board invalidation done to properly update subtask counter in the TaskCard
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
        return addNewTask(taskData, token);
      } catch (error) {
        throw new Error('Failed to create a task. Please try again.');
      }
    },
    onSuccess: (createdTask: TaskType) => {
      queryClient.setQueryData(
        ['board', createdTask.boardId],
        (oldData: BoardQuery | undefined) => {
          if (!oldData) return; // If there is no old board data, return

          // Map the createdTask subtasks to match the BoardQuery subtasks structure
          const mappedSubtasks = createdTask.subtasks.map((subtask) => ({
            finished: subtask.finished,
          }));

          // Prepare the new task to match the BoardQuery's task structure
          const newTask = {
            id: createdTask.id,
            title: createdTask.title,
            status: createdTask.status,
            assignedUsers: [],
            subtasks: mappedSubtasks,
          };

          return {
            ...oldData,
            tasks: [...oldData.tasks, newTask],
          };
        }
      );
    },
  });
  return { mutate, data, isPending, error, isSuccess };
};

export { useTaskData, useDeleteTask, useEditTask, useCreateTask };
