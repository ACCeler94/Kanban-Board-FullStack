import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import { CircularProgress } from '@mui/material';
import styles from './BoardsPage.module.css';

const BoardsPage = () => {
  const { isLoading: authLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkAuth0Session = async () => {
      try {
        await getAccessTokenSilently();
        setHasSession(true);
      } catch (err) {
        loginWithRedirect({
          authorizationParams: {
            redirect_uri: import.meta.env.VITE_ROOT_URL + '/post-login',
          },
        });
      } finally {
        setSessionLoading(false);
      }
    };

    if (!authLoading) {
      checkAuth0Session();
    }
  }, [authLoading, getAccessTokenSilently, loginWithRedirect]);

  if (authLoading || sessionLoading) {
    return (
      <div className={styles.spinnerWrapper}>
        <CircularProgress aria-label='Loading spinner' />
      </div>
    );
  }

  if (hasSession) {
    return (
      <div>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </div>
    );
  }

  return null;
};

export default BoardsPage;
