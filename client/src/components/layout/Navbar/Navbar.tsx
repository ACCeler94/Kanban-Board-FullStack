import { Button } from '@mui/material';
import Icon from '../../../assets/icon.svg?react';
import Container from '../../common/Container/Container';
import styles from './Navbar.module.css';
import { FaPlus } from 'react-icons/fa';
import useStore from '../../../store/useStore';

const Navbar = () => {
  const activeBoard = useStore((state) => state.activeBoard);

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
            <Button color='primary' variant='contained' className='button-small' disabled>
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
