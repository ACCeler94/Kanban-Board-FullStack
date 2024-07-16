import { useQuery } from '@tanstack/react-query';
import { apiUrl } from './config';
import axios from 'axios';

// actions
const fetchUserById = async (userId: string) => {
  const { data } = await axios.get(`${apiUrl}/users/${userId}`);

  return data;
};

const fetchUserByIdExtended = async (userId: string) => {
  const { data } = await axios.get(`${apiUrl}/users/${userId}/extended`);

  return data;
};

// hooks
const useUserById = (userId: string) => {
  const {
    data: user,
    error,
    isPending,
  } = useQuery({ queryKey: ['user', userId, 'basic'], queryFn: () => fetchUserById(userId) });

  return { user, error, isPending };
};

const useUserByIdExtended = (userId: string) => {
  const {
    data: user,
    error,
    isPending,
  } = useQuery({
    queryKey: ['user', userId, 'extended'],
    queryFn: () => fetchUserByIdExtended(userId),
  });

  return { user, error, isPending };
};

export { useUserById, useUserByIdExtended };
