import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import validateSubtaskIdParam from '../../middleware/validateSubtaskIdParam';

describe('validateSubtaskIdParam', () => {
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

  it('should call next if given valid SubtaskId', () => {
    req.params = {
      subtaskId: '9e65954d-f440-4dd9-8388-2a7a91005bf1',
    };

    validateSubtaskIdParam(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 400 status and invalid Subtask id error if the SubtaskId param does not exist', () => {
    req.params = {};

    validateSubtaskIdParam(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ['Subtask ID is required'],
    });
  });

  it('should return 400 status and invalid Subtask id error if the SubtaskId param is not valid UUID', () => {
    req.params = { subtaskId: 'abc' };

    validateSubtaskIdParam(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      errors: ['Subtask ID must be a valid UUID'],
    });
  });
});
