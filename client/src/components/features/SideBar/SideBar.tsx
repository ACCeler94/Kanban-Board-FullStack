import { useAuth0 } from '@auth0/auth0-react';

const SideBar = () => {
  const { user } = useAuth0();
  return <div>SideBar</div>;
};

export default SideBar;
