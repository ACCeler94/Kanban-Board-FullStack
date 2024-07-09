import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from './config';

// actions
const fetchBoardById = async (id: string) => {
  const { data } = await axios.get(`${apiUrl}/boards/${id}`);

  return data;
};

// hooks
const useBoardById = (id: string) => {
  const {
    data: board,
    error,
    isPending,
  } = useQuery({ queryKey: ['board', id], queryFn: () => fetchBoardById(id) });

  return { board, error, isPending };
};

export { useBoardById };
