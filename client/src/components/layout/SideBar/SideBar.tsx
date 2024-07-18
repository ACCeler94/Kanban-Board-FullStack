import { useUserData } from '../../../API/users';
import BoardsList from '../../features/BoardsList/BoardsList';
import styles from './SideBar.module.css';

const SideBar = () => {
  const { user, isPending, error } = useUserData();

  return (
    <div className='styles.sideBar'>
      <BoardsList />
    </div>
  );
};

export default SideBar;
