import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import styles from './BoardForm.module.css';

interface BoardFormProps {
  boardTitle?: string;
  submitHandler: (title: string) => void;
  buttonText: string;
}

const BoardForm = ({ boardTitle, submitHandler, buttonText }: BoardFormProps) => {
  const [title, setTitle] = useState(boardTitle || '');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitHandler(title);
  };

  return (
    <form autoComplete='off' onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <label htmlFor='title'>Board Title</label>
        <TextField
          id='board-title'
          variant='outlined'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          sx={{ marginTop: '5px' }}
          placeholder='Title should be short and allow to easily identify the board.'
          required
          inputProps={{ maxLength: 100 }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            e.key === 'Enter' && e.preventDefault();
          }}
        />
      </div>

      <Button type='submit' color='primary' variant='contained' className='button-small'>
        {buttonText}
      </Button>
    </form>
  );
};

export default BoardForm;
