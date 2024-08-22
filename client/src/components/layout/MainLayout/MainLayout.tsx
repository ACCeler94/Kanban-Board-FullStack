import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import SideBar from '../SideBar/SideBar';
import styles from './MainLayout.module.css';
import { FaEye } from 'react-icons/fa';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  return (
    <div>
      <Navbar />
      <div className={styles.wrapper}>
        <SideBar
          isHidden={isSidebarHidden}
          toggleIsHidden={() => setIsSidebarHidden(!isSidebarHidden)}
        />
        {isSidebarHidden ? (
          <div className={styles.showButton} onClick={() => setIsSidebarHidden(false)}>
            <FaEye />
          </div>
        ) : (
          ''
        )}
        <div className={`${styles.contentWrapper} ${isSidebarHidden ? styles.sidebarHidden : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
