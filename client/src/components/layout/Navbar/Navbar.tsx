import { Button } from '@mui/material';
import Icon from '../../../assets/icon.svg?react';
import Container from '../../common/Container/Container';
import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <Container>
        <div className={styles.wrapper}>
          <Link to='/boards' className={styles.titleContainer}>
            <Icon />
            <h1 className={styles.title}>kanban</h1>
          </Link>
          <div className={styles.utilityBar}>
            <h2>Select Board...</h2>
            <Button color='primary' variant='contained' className='button-small' disabled>
              Add New Task
            </Button>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
