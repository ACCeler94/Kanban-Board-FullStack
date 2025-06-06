import { Button } from '@mui/material';
import styles from './LoginErrorPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { authUrl } from '../../API/config';

const LoginErrorPage = () => {
  const navigate = useNavigate();
  const { loginWithRedirect, logout, getAccessTokenSilently, isAuthenticated } = useAuth0();

  const handleRetry = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: import.meta.env.VITE_ROOT_URL + '/post-login',
      },
    });
  };

  const handleReturnToHomepage = async () => {
    // For safety reasons if isAuthenticated is true but some error still happened - logout the user, clear cookies
    if (isAuthenticated) {
      try {
        const token = await getAccessTokenSilently();
        await axios.get(`${authUrl}/logout`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
          withCredentials: process.env.NODE_ENV === 'production', // In development cors blocks the request withCredentials true so enable only in production
        });

        await logout({ logoutParams: { returnTo: import.meta.env.VITE_ROOT_URL } });
      } catch (error) {
        console.error(error);
      }
    }

    navigate('/');
  };

  return (
    <div className={styles.errorWrapper}>
      <h1>Ooops...</h1>
      <h2>There was a problem with your login. Please try again.</h2>
      <div className={styles.buttonWrapper}>
        <Button
          color='info'
          variant='contained'
          className='button-small'
          onClick={handleReturnToHomepage}
          aria-label='Homepage'
        >
          Homepage
        </Button>
        <Button
          color='primary'
          variant='contained'
          className='button-small'
          onClick={handleRetry}
          aria-label='Retry'
        >
          Retry
        </Button>
      </div>
    </div>
  );
};

export default LoginErrorPage;
