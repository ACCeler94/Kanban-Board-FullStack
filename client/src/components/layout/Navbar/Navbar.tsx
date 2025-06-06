import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { useBoardById } from '../../../API/boards';
import { useUserBoardData } from '../../../API/users';
import Icon from '../../../assets/icon.svg?react';
import useStore from '../../../store/useStore';
import Container from '../../common/Container/Container';
import styles from './Navbar.module.css';
import BoardMenu from '../../features/Boards/BoardMenu/BoardMenu';

const Navbar = () => {
  const activeBoard = useStore((state) => state.activeBoard);
  const [isAuthor, setIsAuthor] = useState(false);
  const { id } = useParams();
  const { data: boardData, isPending: isPendingBoardData, error: boardError } = useBoardById(id);
  const {
    data: userBoardData,
    isPending: isPendingUserData,
    error: userDataError,
  } = useUserBoardData();

  // Check if the user is the author of the chosen board to show related buttons as active
  useEffect(() => {
    if (!isPendingBoardData && !isPendingUserData && !userDataError && !boardError) {
      if (userBoardData?.id === boardData?.authorId) {
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
    userBoardData?.id,
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
            <div className={styles.buttonsWrapper}>
              {!!boardError || !id ? null : <BoardMenu isAuthor={isAuthor} />}
              <Button
                aria-label='Add new task'
                color='primary'
                variant='contained'
                className='button-small'
                disabled={!id || !!boardError}
                component={Link}
                to={`${id}/tasks/add`}
              >
                <FaPlus />
                <span>Add New Task</span>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
