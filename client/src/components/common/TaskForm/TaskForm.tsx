import { Button, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import useStore from '../../../store/useStore';
import {
  EditTaskData,
  NewSubtaskData,
  NewTaskFormData,
  Subtask,
  TaskStatus,
} from '../../../types/types';
import SubtasksInputs from './SubtasksInputs/SubtasksInputs';
import styles from './TaskForm.module.css';

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
  const [isChanged, setIsChanged] = useState(false);
  const setSubtasksToRemove = useStore((state) => state.setSubtasksToRemove);
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

  // Check for valid changes to enable submission
  useEffect(() => {
    const initialState = {
      title: taskTitle || '',
      desc: taskDesc || '',
      status: taskStatus || TaskStatus.TO_DO,
      subtasks: taskSubtasks || [],
    };
    const hasValidChanges = !_.isEqual({ title, desc, status, subtasks }, initialState);
    setIsChanged(hasValidChanges && title.trim().length > 0);
  }, [title, desc, status, subtasks, taskTitle, taskDesc, taskStatus, taskSubtasks]);

  // Reset subtasksToRemove global state when the task form unmounts (either on close or when submitted)
  useEffect(() => {
    return () => {
      setSubtasksToRemove([]);
    };
  }, [setSubtasksToRemove]);

  // Data validation and removal of unchanged properties is done within the query hook
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isChanged) return;
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
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            e.key === 'Enter' && e.preventDefault();
          }}
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

      <Button
        type='submit'
        color='primary'
        variant='contained'
        className='button-small'
        disabled={!isChanged}
      >
        {buttonText}
      </Button>
    </form>
  );
};

export default TaskForm;
