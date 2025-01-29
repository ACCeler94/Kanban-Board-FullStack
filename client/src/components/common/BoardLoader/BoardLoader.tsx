import { Skeleton } from '@mui/material';
import styles from './BoardLoader.module.css';

const BoardLoader = () => {
  const columns = [1, 2, 3]; // Three columns
  const skeletonCount = 4; // Four skeletons per column

  return (
    <div className={styles.skeletonContainer}>
      {columns.map((column) => (
        <div key={column} className={styles.columnWrapper}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Skeleton
              key={index}
              variant='rounded'
              aria-label='Loading skeleton'
              sx={{ height: '20%', margin: '15px 0' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardLoader;
