import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { NewSubtaskData, Subtask, TaskStatus } from '../../../types/types';
import { MenuItem } from '@mui/material';
import styles from './TaskForm.module.css';
import SubtasksInputs from '../SubtasksInputs/SubtasksInputs';

interface TaskFormProps {
  taskTitle?: string;
  taskDesc?: string;
  taskStatus?: TaskStatus;
  taskSubtasks?: Subtask[];
  buttonText: string;
  submitHandler: () => void;
}

const TaskForm = ({ taskTitle, taskDesc, taskStatus, taskSubtasks }: TaskFormProps) => {
  const [title, setTitle] = useState(taskTitle || '');
  const [desc, setDesc] = useState(taskDesc || '');
  const [status, setStatus] = useState(taskStatus || TaskStatus.TO_DO);
  const [subtasks, setSubtasks] = useState<(Subtask | NewSubtaskData)[]>(taskSubtasks || []);
  const selectOptions = [
    {
      value: TaskStatus.TO_DO,
      label: 'To Do',
    },
    {
      value: TaskStatus.IN_PROGRESS,
      label: 'In Progress',
    },
    { value: TaskStatus.DONE, label: 'Done' },
  ];

  return (
    <form autoComplete='off'>
      <div className={styles.inputWrapper}>
        <label htmlFor='title'>Title</label>
        <TextField
          id='title'
          variant='outlined'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          sx={{ marginTop: '5px' }}
          placeholder='Title should be short and allow to easily identify the task.'
        />
      </div>

      <div className={styles.inputWrapper}>
        <label htmlFor='description'>Description</label>
        <TextField
          id='description'
          variant='outlined'
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder='Describe the task in more detail. Include any relevant information, deadlines, or specific requirements.'
          fullWidth
          multiline
          minRows={4}
          sx={{ marginTop: '5px' }}
        />
      </div>

      <SubtasksInputs subtasks={subtasks} setSubtasks={setSubtasks} />

      <div className={styles.inputWrapper}>
        <label htmlFor='status'>Status</label>
        <TextField
          id='status'
          select
          defaultValue={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          fullWidth
          sx={{ marginTop: '5px' }}
        >
          {selectOptions.map((option) => {
            return (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            );
          })}
        </TextField>
      </div>
    </form>
  );
};

export default TaskForm;
