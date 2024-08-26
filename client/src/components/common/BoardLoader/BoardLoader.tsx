import { Skeleton } from '@mui/material';
import styles from './BoardLoader.module.css';

const BoardLoader = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.columnWrapper}>
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
      </div>
      <div className={styles.columnWrapper}>
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
      </div>
      <div className={styles.columnWrapper}>
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
        <Skeleton variant='rounded' sx={{ height: '20%', margin: '15px 0' }} />
      </div>
    </div>
  );
};

export default BoardLoader;
