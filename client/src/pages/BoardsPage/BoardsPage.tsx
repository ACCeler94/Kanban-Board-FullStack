import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import { CircularProgress } from '@mui/material';
import styles from './BoardsPage.module.css';

const BoardsPage = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  // Login when the component mounts
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        authorizationParams: {
          redirect_uri: import.meta.env.VITE_ROOT_URL + '/post-login',
        },
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isLoading) {
    return (
      <div className={styles.spinnerWrapper}>
        <CircularProgress aria-label='Loading spinner' />
      </div>
    );
  }

  if (isAuthenticated) {
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
