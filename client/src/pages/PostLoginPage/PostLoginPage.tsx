import axios from 'axios';
import { useEffect } from 'react';
import { authUrl } from '../../API/config';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const PostLoginPage = () => {
  const { getAccessTokenSilently, isLoading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePostLogin = async () => {
      try {
        const token = await getAccessTokenSilently();
        await axios.post(`${authUrl}/post-login`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        navigate('/boards');
      } catch (error) {
        // [TODO - change to logout and ErrorPage redirect]
        console.log('Login failed');
        console.log(error);
      }
    };

    if (!isLoading) handlePostLogin();
  }, [isLoading, isAuthenticated, getAccessTokenSilently, navigate]);

  return <div>Processing login...</div>;
};

export default PostLoginPage;
