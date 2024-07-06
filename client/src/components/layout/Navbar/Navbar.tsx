import Icon from '../../../assets/icon.svg?react';
import Container from '../../common/Container/Container';
import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <Container>
      <div className={styles.navbar}>
        <Link to='/boards'>
          <div className={styles.titleContainer}>
            <Icon />
            <h1 className={styles.title}>kanban</h1>
          </div>
        </Link>
      </div>
    </Container>
  );
};

export default Navbar;
