import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/prisma';
import UserIdSchema from '../validators/validateUserId';

const checkBoardAssignment = async (req: Request, res: Response, next: NextFunction) => {
  let requestAuthor;

  try {
    requestAuthor = UserIdSchema.parse(req.body);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid user data' });
  }

  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) return res.status(404).json({ error: 'Task not found...' });

    const board = await prisma.board.findUnique({
      where: { id: task.boardId },
      include: { users: true },
    });
    if (!board) return res.status(404).json({ error: 'Board not found...' });

    const isUserAssigned = board.users.some(
      (userOnBoard) => userOnBoard.userId === requestAuthor.userId
    );
    if (!isUserAssigned)
      return res
        .status(403)
        .json({ error: 'Access forbidden. User is not assigned to the board.' });

    next();
  } catch (error) {
    next(error);
  }
};

export default checkBoardAssignment;
