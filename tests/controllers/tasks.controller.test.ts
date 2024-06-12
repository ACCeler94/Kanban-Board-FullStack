import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '../../prisma/__mocks__/prisma';
import { RequestContext } from 'express-openid-connect';
import { TaskStatus } from '@prisma/client';
import TasksController from '../../controllers/tasks.controller';

vi.mock('../../prisma/prisma.ts');

describe('TasksController', () => {
  const mockTask = {
    id: '1',
    createdAt: new Date('2024-06-12 16:04:21.778'),
    updatedAt: new Date('2024-06-12 16:04:21.778'),
    title: 'Task one',
    desc: 'this is task one',
    boardId: '8e96a8d2-8b3d-4c3a-aa21-dada91dcda83',
    authorId: '3713d558-d107-4c4b-b651-a99676e4315e',
    status: TaskStatus.TO_DO,
  };

  describe('getById', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        params: {
          taskId: '1',
        },
      };

      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      next = vi.fn() as unknown as NextFunction;
    });

    it('should return the task and 200 status', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);

      await TasksController.getById(req as Request, res as Response, next);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(prisma.task.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: req.params!.taskId },
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });
  });
});
