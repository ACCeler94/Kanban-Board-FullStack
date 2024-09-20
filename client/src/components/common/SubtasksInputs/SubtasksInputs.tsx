import { List, ListItem, TextField } from '@mui/material';
import { useState } from 'react';
import { IoAddCircle } from 'react-icons/io5';
import { NewSubtaskData, Subtask } from '../../../types/types';
import styles from './SubtasksInputs.module.css';
import { MdOutlineDeleteForever } from 'react-icons/md';

interface SubtasksInputsProps {
  subtasks: (Subtask | NewSubtaskData)[];
  setSubtasks: React.Dispatch<React.SetStateAction<(Subtask | NewSubtaskData)[]>>;
}

const SubtasksInputs = ({ subtasks, setSubtasks }: SubtasksInputsProps) => {
  const [newSubtask, setNewSubtask] = useState<NewSubtaskData>({ desc: '', finished: false });

  const handleSubtaskChange =
    (index: number) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const updatedSubtasks = subtasks.map((subtask, i) =>
        i === index ? { ...subtask, desc: event.target.value } : subtask
      );
      setSubtasks(updatedSubtasks);
    };

  const addSubtask = () => {
    if (newSubtask.desc.length === 0) return; // prevent adding empty subtasks
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtask({ desc: '', finished: false });
  };

  return (
    <div className={styles.subtasksWrapper}>
      <span className={styles.inputsLabel}>Subtasks</span>
      <List>
        {subtasks.map((subtask, index) => (
          <ListItem
            className={styles.inputWrapper}
            sx={{ padding: 0 }}
            key={`edit-${index}-${subtask.desc}`}
          >
            <TextField
              aria-label={`Edit Subtask ${index + 1}`}
              value={subtask.desc}
              onChange={handleSubtaskChange(index)}
              sx={{ marginRight: '10px' }}
              fullWidth
              required
            />
            <button className={styles.deleteButton} type='button' aria-label='Delete Subtask'>
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
            onChange={(event) => setNewSubtask({ desc: event.target.value, finished: false })}
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
