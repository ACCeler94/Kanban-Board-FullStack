import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';
import SideBar from '../SideBar/SideBar';
import styles from './MainLayout.module.css';

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
          <button className={styles.showButton} onClick={() => setIsSidebarHidden(false)}>
            <FaEye />
          </button>
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
