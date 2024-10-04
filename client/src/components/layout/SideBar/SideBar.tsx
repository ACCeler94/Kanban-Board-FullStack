import { useAuth0 } from '@auth0/auth0-react';
import Button from '@mui/material/Button';
import axios from 'axios';
import { useState } from 'react';
import { FaEyeSlash } from 'react-icons/fa';
import { authUrl } from '../../../API/config';
import { useUserBoardData } from '../../../API/users';
import Error from '../../common/Error/Error';
import BoardsList from '../../features/BoardsList/BoardsList';
import styles from './SideBar.module.css';

interface SideBarProps {
  isHidden: boolean;
  toggleIsHidden: () => void;
}

const SideBar = ({ isHidden, toggleIsHidden }: SideBarProps) => {
  const { isPending, error, data: userBoardData } = useUserBoardData();
  const { logout, getAccessTokenSilently } = useAuth0();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    let token: string | undefined;
    try {
      token = await getAccessTokenSilently();
    } catch (error) {
      console.log(error);
      setLogoutError('Logout failed. Please try again.');
      return;
    }

    try {
      await axios.get(`${authUrl}/logout`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
        // [TODO - add withCredentials:true in production, in development cors blocks the request]
        // withCredentials: true,
      });
      logout();
      setLogoutError('');
    } catch (error) {
      console.log(error);
      setLogoutError('Logout failed. Please try again.');
    }
  };

  if (isPending) {
    return (
      <div>
        <aside className={isHidden ? `${styles.sideBar} ${styles.hidden}` : styles.sideBar}>
          <div>Loading...</div>
        </aside>
      </div>
    );
  }

  if (error || logoutError)
    return (
      <div
        className={isHidden ? `${styles.sideBarWrapper} ${styles.hidden}` : styles.sideBarWrapper}
      >
        <aside className={isHidden ? `${styles.sideBar} ${styles.hidden}` : styles.sideBar}>
          <Error message={error ? error.message : logoutError} />
          <div className={styles.actionButtons}>
            <button id={styles.hideButton} onClick={toggleIsHidden}>
              <FaEyeSlash />
              Hide Sidebar
            </button>
            <Button
              color='error'
              variant='contained'
              className='button-small'
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </aside>
      </div>
    );

  if (userBoardData && !isPending && !error)
    return (
      <div
        className={isHidden ? `${styles.sideBarWrapper} ${styles.hidden}` : styles.sideBarWrapper}
      >
        <aside className={isHidden ? `${styles.sideBar} ${styles.hidden}` : styles.sideBar}>
          <BoardsList boards={userBoardData.boards} />
          <div className={styles.actionButtons}>
            <button id={styles.hideButton} onClick={toggleIsHidden}>
              <FaEyeSlash />
              Hide Sidebar
            </button>
            <Button
              color='error'
              variant='contained'
              className='button-small'
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </aside>
      </div>
    );
};

export default SideBar;
