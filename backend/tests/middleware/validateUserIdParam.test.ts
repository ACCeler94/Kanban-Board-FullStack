import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import validateUserIdParam from '../../middleware/validateUserIdParam';

describe('validateUserIdParam', () => {
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

  it('should call next if given valid UserId', () => {
    req.params = {
      userId: '9e65954d-f440-4dd9-8388-2a7a91005bf1',
    };

    validateUserIdParam(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 400 status and invalid User id error if the UserId param does not exist', () => {
    req.params = {};

    validateUserIdParam(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ['User ID is required'],
    });
  });

  it('should return 400 status and invalid User id error if the UserId param is not an UUID', () => {
    req.params = { userId: 'abc' };

    validateUserIdParam(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      errors: ['User ID must be a valid UUID'],
    });
  });
});
