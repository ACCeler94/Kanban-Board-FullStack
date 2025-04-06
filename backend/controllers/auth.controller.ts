import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { saveAvatar } from '../utils/saveAvatar';
import { deleteAvatar } from '../utils/deleteAvatar';
import path from 'path';

const AuthController = {
  // Fetch user by auth0 sub and attach userId from the db to the session to authorize certain operations based on userId
  postLogin: async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.session.auth0User;

    // Check if user object is available in the request
    if (!authUser || !authUser.sub) {
      return res
        .status(400)
        .json({ error: 'User information is missing or incomplete. Try again.' });
    }

    try {
      let user;

      if (authUser.email) {
        user = await prisma.user.findUnique({
          where: { email: authUser.email },
          select: {
            id: true,
            picture: true, // Current avatar
          },
        });
      }

      // If the user already exists, update their avatar if it has changed
      if (authUser.picture) {
        const avatarName = authUser.picture.replace(/https?:\/\//, '').replace(/\W+/g, '_'); // Sanitize name

        if (user) {
          // Check if the user's picture has changed
          // Split used to remove file extension which is not present in avatarName
          if (!user.picture || user.picture.split('.')[0] !== avatarName) {
            // Save the new avatar locally
            const nameWithExtension = await saveAvatar(authUser.picture, avatarName);

            // Delete the old avatar if it exists
            if (user.picture) {
              const oldAvatarPath = path.join(
                __dirname,
                '../public/images/userAvatars',
                user.picture
              );
              await deleteAvatar(oldAvatarPath);
            }

            // Update the user's picture in the database
            await prisma.user.update({
              where: { id: user.id },
              data: { picture: nameWithExtension },
            });
          }
        } else {
          // If the user doesn't exist, create a new one with the avatar
          const nameWithExtension = await saveAvatar(authUser.picture, avatarName);

          user = await prisma.user.create({
            data: {
              email: authUser.email!,
              name: authUser.name!,
              auth0Sub: authUser.sub,
              picture: nameWithExtension,
            },
          });
        }
      } else {
        // If no picture is provided, create the user without an avatar
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: authUser.email!,
              name: authUser.name!,
              auth0Sub: authUser.sub,
            },
          });
        }
      }

      // Save the user's session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          return next(err);
        }
        res.status(200).json({ message: 'Session saved' });
      });
    } catch (error) {
      next(error);
    }
  },

  logout: (req: Request, res: Response) => {
    req.session.destroy((err: Error) => {
      if (err) {
        console.log('Error clearing session:', err);
      } else {
        res.clearCookie('connect.sid');
      }
      // Redirect to auth0 logout endpoint
      res.status(204).send();
    });
  },
};

export default AuthController;
