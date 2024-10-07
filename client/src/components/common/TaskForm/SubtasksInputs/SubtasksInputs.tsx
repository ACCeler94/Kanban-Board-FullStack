import { List, ListItem, TextField } from '@mui/material';
import { useState } from 'react';
import { IoAddCircle } from 'react-icons/io5';
import { MdOutlineDeleteForever } from 'react-icons/md';
import { v4 as uuid } from 'uuid';
import useStore from '../../../../store/useStore';
import { NewSubtaskData, Subtask } from '../../../../types/types';
import styles from './SubtasksInputs.module.css';

interface SubtasksInputsProps {
  subtasks: (Subtask | NewSubtaskData)[];
  originalSubtasks: Subtask[] | [];
  setSubtasks: React.Dispatch<React.SetStateAction<(Subtask | NewSubtaskData)[]>>;
}

const SubtasksInputs = ({ subtasks, setSubtasks, originalSubtasks }: SubtasksInputsProps) => {
  const [newSubtask, setNewSubtask] = useState<NewSubtaskData>({
    id: '',
    desc: '',
    finished: false,
  });
  const subtasksToRemove = useStore((state) => state.subtasksToRemove);
  const setSubtasksToRemove = useStore((state) => state.setSubtasksToRemove);

  const handleSubtaskChange =
    (id: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const updatedSubtasks = subtasks.map((subtask) =>
        subtask.id === id ? { ...subtask, desc: event.target.value } : subtask
      );
      setSubtasks(updatedSubtasks);
    };

  const addSubtask = () => {
    if (newSubtask.desc.length === 0) return; // Prevent adding empty subtasks
    const subtaskToAdd = { ...newSubtask, id: uuid() }; // Add unique id

    setSubtasks([...subtasks, subtaskToAdd]);
    setNewSubtask({ id: '', desc: '', finished: false });
  };

  const handleSubtaskDelete = (id: string) => {
    const updatedSubtasks = subtasks.filter((subtask) => id !== subtask.id);

    // Check if deleted subtask was in the original subtask data, if not it is new and doesn't need to be removed from the db
    if (originalSubtasks.length !== 0 && subtasks.some((subtask) => subtask.id === id)) {
      setSubtasksToRemove([...subtasksToRemove, id]);
    }
    setSubtasks(updatedSubtasks);
  };

  return (
    <div className={styles.subtasksWrapper}>
      <span className={styles.inputsLabel}>Subtasks</span>
      <List>
        {subtasks.map((subtask) => (
          <ListItem className={styles.inputWrapper} sx={{ padding: 0 }} key={subtask.id}>
            <TextField
              aria-label={`Edit Subtask ${subtask.id}`}
              value={subtask.desc}
              onChange={handleSubtaskChange(subtask.id)}
              sx={{ marginRight: '10px' }}
              fullWidth
              required
              inputProps={{ maxLength: 200 }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                e.key === 'Enter' && e.preventDefault();
              }}
            />
            <button
              className={styles.deleteButton}
              type='button'
              aria-label='Delete Subtask'
              onClick={() => handleSubtaskDelete(subtask.id)}
            >
              <MdOutlineDeleteForever />
            </button>
          </ListItem>
        ))}
        <ListItem className={styles.inputWrapper} sx={{ padding: 0 }} key='new-subtask'>
          <TextField
            aria-label='New Subtask'
            fullWidth
            placeholder='Break down this task into smaller steps...'
            sx={{ marginRight: '10px' }}
            value={newSubtask.desc}
            onChange={(event) => setNewSubtask({ ...newSubtask, desc: event.target.value })}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask();
              }
            }}
          />
          <button
            className={styles.addButton}
            type='button'
            aria-label='Add Subtask'
            onClick={addSubtask}
          >
            <IoAddCircle />
          </button>
        </ListItem>
      </List>
    </div>
  );
};

export default SubtasksInputs;
