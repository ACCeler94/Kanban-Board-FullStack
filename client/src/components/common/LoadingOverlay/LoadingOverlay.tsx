import { CircularProgress } from '@mui/material';
import styles from './LoadingOverlay.module.css';

const LoadingOverlay = () => {
  return (
    <div className={styles.overlay}>
      <CircularProgress />
    </div>
  );
};

export default LoadingOverlay;
