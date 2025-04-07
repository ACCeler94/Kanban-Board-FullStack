/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, afterEach, expect, it, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { Session, SessionData } from 'express-session';
import fetchAuth0UserInfo from '../../middleware/fetchAuth0UserInfo';
import Auth0User from '../../types/Auth0User';

vi.mock('axios');

describe('fetchAuth0UserInfo', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      session: {} as Session & Partial<SessionData>,
      headers: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn() as unknown as NextFunction;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should return status 401 and Authorization token missing message if the access token is missing from headers', async () => {
    await fetchAuth0UserInfo(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authorization token missing' });
  });

  it('should call Auth0 userinfo endpoint with the correct token', async () => {
    const accessToken = 'testAccessToken';
    req.headers!.authorization = `Bearer ${accessToken}`;
    vi.mocked(axios, true).get.mockResolvedValueOnce({}); // Simulate success

    await fetchAuth0UserInfo(req as Request, res as Response, next);

    expect(axios.get).toHaveBeenCalledWith('https://acceler945.eu.auth0.com/userinfo', {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
  });

  it('should save user info to session if the request is successful and sub exists', async () => {
    const accessToken = 'testAccessToken';
    const userData: Auth0User = {
      sub: 'auth0|123',
      name: 'Test User',
      email: 'test@example.com',
    };
    req.headers!.authorization = `Bearer ${accessToken}`;
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: userData });

    await fetchAuth0UserInfo(req as Request, res as Response, next);

    expect(req.session?.auth0User).toEqual(userData);
  });

  it('should not save user info if userData is empty', async () => {
    const accessToken = 'testAccessToken';
    const userData = {};
    req.headers!.authorization = `Bearer ${accessToken}`;
    vi.mocked(axios, true).get.mockResolvedValueOnce({ data: userData });

    await fetchAuth0UserInfo(req as Request, res as Response, next);

    expect(req.session?.auth0User).toBeUndefined();
  });

  it('should call next if unexpected error occurs', async () => {
    const error = new Error();
    const accessToken = 'testAccessToken';
    req.headers!.authorization = `Bearer ${accessToken}`;
    vi.mocked(axios, true).get.mockRejectedValueOnce(error); // Simulate error

    await fetchAuth0UserInfo(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
