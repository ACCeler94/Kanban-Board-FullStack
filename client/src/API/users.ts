import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from './config';
import { UserBoardData, UserData, UserDataPreview } from '../types/types';

// actions
const fetchUserById = async (userId: string): Promise<UserDataPreview> => {
  if (typeof userId !== 'string' || !userId) {
    // check if id is not a string or is an empty string
    throw new Error('Invalid User ID.');
  }

  try {
    const { data } = await axios.get(`${apiUrl}/users/${userId}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch user data: ${error.response?.status} ${error.response?.statusText}`
      );
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

const fetchUserData = async (token: string): Promise<UserData | undefined> => {
  try {
    const { data } = await axios.get(`${apiUrl}/users/profile/`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch user data: ${error.response?.status} ${error.response?.statusText}`
      );
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

const fetchUserBoardData = async (token: string): Promise<UserBoardData | undefined> => {
  try {
    const { data } = await axios.get(`${apiUrl}/users/profile/boards`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch user data: ${error.response?.status} ${error.response?.statusText}`
      );
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

// hooks
const useUserById = (userId: string) => {
  const {
    data: user,
    error,
    isPending,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });

  return { user, error, isPending };
};

const useUserData = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const { data, error, isPending } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        return fetchUserData(token);
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }
    },
    retry: false,
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
  });

  return { data, error, isPending };
};

const useUserBoardData = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const { data, error, isPending } = useQuery({
    queryKey: ['userBoardData'],
    queryFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        return fetchUserBoardData(token);
      } catch (error) {
        throw new Error('Failed to authenticate. Please try logging in again.');
      }
    },
    retry: false,
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
  });

  return { data, error, isPending };
};

export { useUserById, useUserData, useUserBoardData };
