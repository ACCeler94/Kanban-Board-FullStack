import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import Auth0User from '../types/Auth0User';

// Fetch auth0 user object and save it in session
const fetchAuth0UserInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const response = await axios.get('https://acceler945.eu.auth0.com/userinfo', {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = response.data as Auth0User;
    // Basic check to make sure sub is provided
    if (userData && typeof userData.sub === 'string') req.session.auth0User = userData; // Save user info to session

    next();
  } catch (error) {
    next(error);
  }
};

export default fetchAuth0UserInfo;
