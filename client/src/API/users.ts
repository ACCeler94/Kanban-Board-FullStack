import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from './config';

// actions
const fetchUserById = async (userId: string) => {
  const { data } = await axios.get(`${apiUrl}/users/${userId}`);

  return data;
};

const fetchUserData = async (token: string) => {
  try {
    const { data } = await axios.get(`${apiUrl}/users/profile`, {
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
  } = useQuery({ queryKey: ['user', userId], queryFn: () => fetchUserById(userId) });

  return { user, error, isPending };
};

const useUserData = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const {
    data: userData,
    error,
    isPending,
  } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      return fetchUserData(token);
    },
    retry: false,
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
  });

  return { userData, error, isPending };
};

export { useUserById, useUserData };
