import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '../../prisma/__mocks__/prisma';
import { TaskStatus } from '@prisma/client';
import checkBoardAssignment from '../../middleware/checkBoardAssignment';
import { Session, SessionData } from 'express-session';

vi.mock('../../prisma/prisma.ts');

describe('checkBoardAssignment', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const userId = '83d9930a-bdbe-4d70-9bb3-540910cb7ff4';

  const mockTask = {
    id: 'f96ba9c1-34df-4365-9cc8-95c1e46e5d3d',
    createdAt: new Date('2023-12-01T10:30:00Z'),
    updatedAt: new Date('2023-12-02T14:15:00Z'),
    title: 'test title',
    desc: 'test desc',
    boardId: '84f1a2b9-eecc-44e1-88e3-d59f349708fc',
    authorId: userId,
    status: TaskStatus.IN_PROGRESS,
  };

  const mockBoard = {
    id: '84f1a2b9-eecc-44e1-88e3-d59f349708fc',
    createdAt: new Date('2023-12-01T10:30:00Z'),
    title: 'Test title',
    authorId: userId,
  };

  const mockUserOnBoard = {
    userId,
    boardId: mockBoard.id,
  };

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      session: { userId } as Session & Partial<SessionData>,
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn() as unknown as NextFunction;
  });

  it('should call next function if the user is assigned', async () => {
    req.session!.userId = userId;
    req.params = { taskId: mockTask.id };

    prisma.task.findUnique.mockResolvedValue(mockTask);
    prisma.board.findUnique.mockResolvedValue(mockBoard);
    prisma.userOnBoard.findUnique.mockResolvedValue(mockUserOnBoard);

    await checkBoardAssignment(req as Request, res as Response, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prisma.task.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockTask.id },
      })
    );
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 status and invalid user data error if userId is missing', async () => {
    req.body = {};
    req.params = { taskId: mockTask.id };
    req.session!.userId = '';

    prisma.task.findUnique.mockResolvedValue(mockTask);
    prisma.board.findUnique.mockResolvedValue(mockBoard);
    prisma.userOnBoard.findUnique.mockResolvedValue(mockUserOnBoard);

    await checkBoardAssignment(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user data.' });
  });

  it('should return 404 status and not found error if task was not found', async () => {
    req.body = { userId };
    req.params = { taskId: '1234' };

    prisma.task.findUnique.mockResolvedValue(null);
    prisma.board.findUnique.mockResolvedValue(mockBoard);
    prisma.userOnBoard.findUnique.mockResolvedValue(mockUserOnBoard);

    await checkBoardAssignment(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Task not found...' });
  });

  it('should return 404 status and not found error if board was not found', async () => {
    req.body = { userId };
    req.params = { taskId: mockTask.id };

    prisma.task.findUnique.mockResolvedValue(mockTask);
    prisma.board.findUnique.mockResolvedValue(null);
    prisma.userOnBoard.findUnique.mockResolvedValue(mockUserOnBoard);

    await checkBoardAssignment(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Board not found...' });
  });

  it('should return 403 status and not authorized error if user is not assigned to the board', async () => {
    req.body = { userId };
    req.params = { taskId: mockTask.id };

    prisma.task.findUnique.mockResolvedValue(mockTask);
    prisma.board.findUnique.mockResolvedValue(mockBoard);
    prisma.userOnBoard.findUnique.mockResolvedValue(null);

    await checkBoardAssignment(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Access forbidden. User is not assigned to the board.',
    });
  });
});
