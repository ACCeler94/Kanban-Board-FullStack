import { useQuery } from '@tanstack/react-query';
import { apiUrl } from './config';
import axios from 'axios';

// actions
const fetchUserById = async (userId: string) => {
  const { data } = await axios.get(`${apiUrl}/users/${userId}`);

  return data;
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

export { useUserById };
