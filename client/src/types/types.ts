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

interface User {
  id: string;
  name: string;
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

interface UserDataPreview {
  id: string;
  email: string;
  name: string;
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

export type { TaskType, BoardType, BoardPreview, UserData, UserDataPreview }; // + TaskStatus exported as a value
