import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import validateBoardIdParam from '../../middleware/validateBoardIdParam';

describe('validateBoardIdParam', () => {
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

  it('should call next if given valid boardId', () => {
    req.params = {
      boardId: '9e65954d-f440-4dd9-8388-2a7a91005bf1',
    };

    validateBoardIdParam(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 400 status and invalid board id error if the boardId param does not exist', () => {
    req.params = {};

    validateBoardIdParam(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ['Board ID is required'],
    });
  });

  it('should return 400 status and invalid board id error if the boardId param is not valid UUID', () => {
    req.params = { boardId: 'abc' };

    validateBoardIdParam(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      errors: ['Board ID must be a valid UUID'],
    });
  });
});
