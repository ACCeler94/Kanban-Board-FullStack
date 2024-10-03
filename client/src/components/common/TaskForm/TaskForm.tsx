import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import {
  EditTaskData,
  NewSubtaskData,
  NewTaskFormData,
  Subtask,
  TaskStatus,
} from '../../../types/types';
import { Button, MenuItem } from '@mui/material';
import styles from './TaskForm.module.css';
import SubtasksInputs from '../SubtasksInputs/SubtasksInputs';
import useStore from '../../../store/useStore';

interface TaskFormProps<T extends NewTaskFormData | EditTaskData> {
  submitHandler: (formData: T) => void;
  taskTitle?: string;
  taskDesc?: string;
  taskStatus?: TaskStatus;
  taskSubtasks?: Subtask[];
  buttonText: string;
}

const TaskForm = <T extends NewTaskFormData | EditTaskData>({
  submitHandler,
  taskTitle,
  taskDesc,
  taskStatus,
  taskSubtasks,
  buttonText,
}: TaskFormProps<T>) => {
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
  const setSubtasksToRemove = useStore((state) => state.setSubtasksToRemove);

  // Reset subtasksToRemove global state when the task form unmounts (either on close or when submitted)
  useEffect(() => {
    return () => {
      setSubtasksToRemove([]);
    };
  }, [setSubtasksToRemove]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitHandler({ taskData: { title, desc, status }, subtaskData: subtasks } as T);
  };

  return (
    <form autoComplete='off' onSubmit={handleSubmit}>
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
          required
          inputProps={{ maxLength: 100 }}
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
          inputProps={{ maxLength: 500 }}
        />
      </div>

      <SubtasksInputs
        subtasks={subtasks}
        setSubtasks={setSubtasks}
        originalSubtasks={taskSubtasks || []}
      />

      <div className={styles.inputWrapper}>
        <label htmlFor='status'>Status</label>
        <TextField
          id='status'
          select
          value={status}
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

      <Button type='submit' color='primary' variant='contained' className='button-small'>
        {buttonText}
      </Button>
    </form>
  );
};

export default TaskForm;
