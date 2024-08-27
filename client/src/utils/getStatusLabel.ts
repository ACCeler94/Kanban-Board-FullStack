import { TaskStatus } from '../types/types';

export function getTaskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.DONE:
      return 'Completed';
    case TaskStatus.TO_DO:
      return 'Pending';
    default:
      return 'Unknown'; // Handle unexpected cases
  }
}
