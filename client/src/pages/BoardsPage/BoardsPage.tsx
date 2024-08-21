import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom'; // Needed for rendering nested routes
import MainLayout from '../../components/layout/MainLayout/MainLayout';

const BoardsPage = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  // login when the component mounts
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
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <MainLayout />
        <Outlet /> {/* This renders either <Board /> or nested routes like <EditBoardPage /> */}
      </div>
    );
  }

  return null;
};

export default BoardsPage;
