import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UserBoardData } from '../types/types';
import { apiUrl } from './config';

// Actions
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
      const errorMessage = error.response?.data?.error || 'An unexpected error occurred';
      throw new Error(`Failed to fetch user data: ${errorMessage}`);
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

// Hooks
const useUserBoardData = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const { data, error, isPending, refetch } = useQuery({
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Since the BoardsList component is very rarely re-mounted it needs to refetch in intervals (2 minutes) to ensure the data is updated
  });

  return { data, error, isPending, refetch };
};

export { useUserBoardData };
