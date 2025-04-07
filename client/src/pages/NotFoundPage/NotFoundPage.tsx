import { Button } from '@mui/material';
import styles from './NotFoundPage.module.css';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className={styles.notFoundContent}>
      <h1>404 - Not found...</h1>
      <h2>The page you were looking for was not found.</h2>
      <Button
        color='primary'
        variant='contained'
        className='button-large'
        component={Link}
        to='/'
        aria-label='HomePage'
      >
        Home
      </Button>
    </div>
  );
};

export default NotFoundPage;
