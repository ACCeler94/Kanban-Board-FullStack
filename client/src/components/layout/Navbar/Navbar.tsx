import { Button } from '@mui/material';
import Icon from '../../../assets/icon.svg?react';
import Container from '../../common/Container/Container';
import styles from './Navbar.module.css';
import { FaPlus } from 'react-icons/fa';
import useStore from '../../../store/useStore';
import { useParams } from 'react-router-dom';
import { useBoardById } from '../../../API/boards';
import { useUserData } from '../../../API/users';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const activeBoard = useStore((state) => state.activeBoard);
  const [isAuthor, setIsAuthor] = useState(false);
  const { id } = useParams();
  const { data: boardData, isPending: isPendingBoardData, error: boardError } = useBoardById(id);
  const { data: userData, isPending: isPendingUserData, error: userDataError } = useUserData();

  // check if the user is the author of the chosen board to show related buttons as active
  useEffect(() => {
    if (!isPendingBoardData && !isPendingUserData && !userDataError && !boardError) {
      if (userData?.id === boardData?.authorId) {
        setIsAuthor(true);
      } else {
        setIsAuthor(false);
      }
    }
  }, [
    boardData?.authorId,
    boardError,
    isPendingBoardData,
    isPendingUserData,
    userData?.id,
    userDataError,
  ]);

  return (
    <nav className={styles.navbar}>
      <Container>
        <div className={styles.wrapper}>
          <div className={styles.titleContainer}>
            <Icon />
            <h1 className={styles.title}>kanban</h1>
          </div>
          <div className={styles.utilityBar}>
            <h2>{activeBoard?.title || 'Select a board...'}</h2>
            <Button
              color='primary'
              variant='contained'
              className='button-small'
              disabled={!isAuthor}
            >
              <FaPlus />
              <span>Add New Task</span>
            </Button>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
