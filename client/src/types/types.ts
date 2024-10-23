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
    title: string;
    desc: string;
    status: TaskStatus;
  };
  subtaskData?: {
    id: string;
    desc: string;
    finished: boolean;
  }[];
}

interface NewTaskData {
  taskData: {
    title: string;
    desc?: string;
    status: TaskStatus;
    boardId: string;
  };
  subtaskData?: {
    id: string;
    desc: string;
    finished: boolean;
  }[];
}

interface NewTaskFormData extends Omit<NewTaskData, 'taskData'> {
  taskData: Omit<NewTaskData['taskData'], 'boardId'>;
}

interface DiffTaskData {
  taskData: {
    title?: string;
    desc?: string;
    status?: TaskStatus;
  };
  subtaskData: {
    id: string;
    desc: string;
    finished: boolean;
  }[];
}

interface User {
  id: string;
  name: string;
  picture: string;
  email: string;
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
  tasks: {
    id: string;
    title: string;
    status: TaskStatus;
    assignedUsers: {
      userId: string;
    }[];
    subtasks: {
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
  users: {
    user: User;
  }[];
  tasks: TaskType[];
}

interface BoardPreview {
  board: {
    title: string;
    id: string;
  };
}

interface BoardPreviewWithCreatedAt extends BoardPreview {
  board: BoardPreview['board'] & {
    createdAt: Date;
  };
}

interface AuthoredBoardPreview extends BoardPreviewWithCreatedAt {
  authorId: string;
}

interface NewBoardData {
  id: string;
  createdAt: Date;
  title: string;
  authorId: string;
}

interface UserDataPreview {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface UserBoardData {
  id: string;
  email: string;
  name: string;
  auth0Sub: string;
  picture: string;
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
  picture: string;
  assignedTasks: TaskType[];
  boards: BoardPreview[];
  authoredBoards: AuthoredBoardPreview;
  authoredTasks: TaskType[];
}

interface JsonResponseType {
  message?: string; // Success message
  error?: string; // Error message if something goes wrong
}

export type {
  TaskType,
  TaskTypePartial,
  Subtask,
  BoardType,
  BoardQuery,
  BoardPreview,
  BoardPreviewWithCreatedAt,
  NewBoardData,
  User,
  UserData,
  UserBoardData,
  UserDataPreview,
  EditTaskData,
  NewSubtaskData,
  NewTaskData,
  NewTaskFormData,
  DiffTaskData,
  JsonResponseType,
}; // + TaskStatus exported as a value
