export enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  TO_DO = 'TO_DO',
}

interface Subtask {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  desc: string;
  finished: boolean;
}

interface TaskType {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  desc: string;
  boardId: string;
  authorId: string;
  status: TaskStatus;
  subtasks: Subtask[];
}

interface TaskTypePartial {
  id: string;
  title: string;
  boardId: string;
  status: TaskStatus;
  subtasks: {
    id: string;
    desc: string;
    finished: boolean;
  }[];
}

interface NewSubtaskData {
  id: string;
  desc: string;
  finished: boolean;
}

interface EditTaskData {
  taskData?: {
    title?: string;
    desc?: string;
    status?: 'IN_PROGRESS' | 'DONE' | 'TO_DO';
  };
  subtaskData?: {
    id?: string;
    desc?: string;
    finished?: boolean;
  }[];
}

interface NewTaskData {
  taskData: {
    title: string;
    desc?: string;
    status: 'IN_PROGRESS' | 'DONE' | 'TO_DO';
    boardId: string;
  };
  subtaskData?: {
    desc: string;
    finished: boolean;
  }[];
}

interface NewTaskFormData extends Omit<NewTaskData, 'taskData'> {
  taskData: Omit<NewTaskData['taskData'], 'boardId'>;
}

interface User {
  id: string;
  name: string;
}

interface BoardQuery {
  id: string;
  createdAt: Date;
  title: string;
  authorId: string;
  author: {
    id: string;
    name: string;
  };
  users: {
    user: {
      id: string;
      name: string;
    };
  }[];
  tasks: {
    id: string;
    title: string;
    boardId: string;
    status: TaskStatus;
    subtasks: {
      id: string;
      desc: string;
      finished: boolean;
    }[];
  }[];
}

interface BoardType {
  id: string;
  createdAt: Date;
  title: string;
  authorId: string;
  author: {
    id: string;
    name: string;
  };
  users: User[];
  tasks: TaskType[];
}

interface BoardPreview {
  board: {
    title: string;
    id: string;
  };
}

interface AuthoredBoardPreview extends BoardPreview {
  createdAt: Date;
  authorId: string;
}

interface BoardPreviewWithCreatedAt extends BoardPreview {
  createdAt: Date;
}

interface UserDataPreview {
  id: string;
  email: string;
  name: string;
}

interface UserBoardData {
  id: string;
  email: string;
  name: string;
  auth0Sub: string;
  assignedTasks: {
    taskId: string;
    userId: string;
  }[];
  boards: BoardPreviewWithCreatedAt[];
}

interface UserData {
  id: string;
  email: string;
  name: string;
  auth0Sub: string;
  assignedTasks: TaskType[];
  boards: BoardPreview[];
  authoredBoards: AuthoredBoardPreview;
  authoredTasks: TaskType[];
}

export type {
  TaskType,
  TaskTypePartial,
  Subtask,
  BoardType,
  BoardQuery,
  BoardPreview,
  UserData,
  UserBoardData,
  UserDataPreview,
  EditTaskData,
  NewSubtaskData,
  NewTaskData,
  NewTaskFormData,
}; // + TaskStatus exported as a value
