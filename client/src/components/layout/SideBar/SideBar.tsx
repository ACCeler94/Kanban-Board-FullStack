import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useState } from 'react';
import { authUrl } from '../../../API/config';
import { useUserData } from '../../../API/users';
import BoardsList from '../../features/BoardsList/BoardsList';
import styles from './SideBar.module.css';
import Button from '@mui/material/Button';

const SideBar = () => {
  const { isPending, error, userData } = useUserData();
  const { logout, getAccessTokenSilently } = useAuth0();
  const [isHidden, setIsHidden] = useState(false);

  const handleLogout = async () => {
    const token = await getAccessTokenSilently();
    try {
      await axios.get(`${authUrl}/logout`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
        // [TODO - add withCredentials:true in production, in development cors blocks the request]
        // withCredentials: true,
      });
      logout();
    } catch (error) {
      console.log(error);
    }
  };

  if (isPending) {
    return (
      <aside className={isHidden ? `${styles.sideBar} ${styles.hidden}` : styles.sideBar}>
        <div>Loading...</div>
      </aside>
    );
  }

  if (error)
    return (
      <aside className={isHidden ? `${styles.sideBar} ${styles.hidden}` : styles.sideBar}>
        <div>{error.message}</div>
        <div className={styles.actionButtons}>
          <Button color='error' variant='contained' className='button-small' onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>
    );

  if (!isPending && !error)
    return (
      <aside className={isHidden ? `${styles.sideBar} ${styles.hidden}` : styles.sideBar}>
        <BoardsList boards={userData.boards} />
        <div className={styles.actionButtons}>
          <Button color='error' variant='contained' className='button-small' onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>
    );
};

export default SideBar;
