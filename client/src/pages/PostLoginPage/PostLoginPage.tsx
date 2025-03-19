import axios from 'axios';
import { useEffect } from 'react';
import { authUrl } from '../../API/config';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const PostLoginPage = () => {
  const { getAccessTokenSilently, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePostLogin = async () => {
      try {
        const token = await getAccessTokenSilently();
        await axios.post(
          `${authUrl}/post-login`,
          {},
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        navigate('/boards');
      } catch (error) {
        navigate('/login-error');
      }
    };

    if (!isLoading) handlePostLogin();
  }, [isLoading, getAccessTokenSilently, navigate]);

  return <div>Processing login...</div>;
};

export default PostLoginPage;
