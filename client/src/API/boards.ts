import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from './config';
import { validate as uuidValidate } from 'uuid';

// actions
const fetchBoardById = async (id: string | undefined) => {
  if (!id) {
    // check if id exists and is valid uuid
    throw new Error('Invalid Board ID.');
  }

  const { data } = await axios.get(`${apiUrl}/boards/${id}`);

  return data;
};

// hooks
const useBoardById = (id: string | undefined) => {
  const {
    data: boardData,
    error,
    isPending,
  } = useQuery({
    queryKey: ['board', id],
    queryFn: () => fetchBoardById(id),
    enabled: !!id && uuidValidate(id), // check for the existence of the id and if it's valid uuid to prevent unnecessary calls to fetchBoardById
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return { boardData, error, isPending };
};

export { useBoardById };
