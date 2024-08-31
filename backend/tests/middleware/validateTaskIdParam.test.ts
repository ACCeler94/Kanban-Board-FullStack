import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import validateTaskIdParam from '../../middleware/validateTaskIdParam';

describe('validateTaskIdParam', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn() as unknown as NextFunction;
  });

  it('should call next if given valid taskId', () => {
    req.params = {
      taskId: '9e65954d-f440-4dd9-8388-2a7a91005bf1',
    };

    validateTaskIdParam(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 400 status and invalid task id error if the taskId param does not exist', () => {
    req.params = {};

    validateTaskIdParam(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ['Task ID is required'],
    });
  });

  it('should return 400 status and invalid Task id error if the taskId param is not valid UUID', () => {
    req.params = { taskId: 'abc' };

    validateTaskIdParam(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      errors: ['Task ID must be a valid UUID'],
    });
  });
});
