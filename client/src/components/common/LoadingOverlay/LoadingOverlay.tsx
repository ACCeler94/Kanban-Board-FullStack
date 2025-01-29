import { CircularProgress } from '@mui/material';
import styles from './LoadingOverlay.module.css';

const LoadingOverlay = () => {
  return (
    <div className={styles.overlay}>
      <CircularProgress aria-label='Loading spinner' />
    </div>
  );
};

export default LoadingOverlay;
