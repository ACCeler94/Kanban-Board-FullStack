import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { authUrl } from '../../../API/config';
import { useUserData } from '../../../API/users';
import BoardsList from '../../features/BoardsList/BoardsList';
import styles from './SideBar.module.css';
import Button from '@mui/material/Button';
import { FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';

interface SideBarProps {
  isHidden: boolean;
  toggleIsHidden: () => void;
}

const SideBar = ({ isHidden, toggleIsHidden }: SideBarProps) => {
  const { isPending, error, data: userData } = useUserData();
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
          <div>{error ? error.message : logoutError}</div>
          <div className={styles.actionButtons}>
            <div className={styles.hideButton} onClick={toggleIsHidden}>
              <FaEyeSlash />
              Hide Sidebar
            </div>
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

  if (userData && !isPending && !error)
    return (
      <div
        className={isHidden ? `${styles.sideBarWrapper} ${styles.hidden}` : styles.sideBarWrapper}
      >
        <aside className={isHidden ? `${styles.sideBar} ${styles.hidden}` : styles.sideBar}>
          <BoardsList boards={userData.boards} />
          <div className={styles.actionButtons}>
            <div className={styles.hideButton} onClick={toggleIsHidden}>
              <FaEyeSlash />
              Hide Sidebar
            </div>
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
