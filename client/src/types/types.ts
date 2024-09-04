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

type BoardPreview = {
  board: {
    title: string;
    id: string;
  };
};

type AuthoredBoardPreview = BoardPreview & { createdAt: Date; authorId: string };

type BoardPreviewWithCreatedAt = BoardPreview & { createdAt: Date };

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
}; // + TaskStatus exported as a value
