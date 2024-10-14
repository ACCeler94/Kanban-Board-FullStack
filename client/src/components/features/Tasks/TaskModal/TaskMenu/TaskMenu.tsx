import { Divider } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';
import { HiDotsVertical } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import styles from './TaskMenu.module.css';

const TaskMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <button
        type='button'
        id='task-menu-button'
        aria-controls={open ? 'task-menu-button' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className={styles.menuButton}
      >
        <HiDotsVertical />
      </button>
      <Menu
        id='task-menu'
        aria-labelledby='task-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem component={Link} to='edit' onClick={handleClose}>
          Edit
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem component={Link} to='delete' sx={{ color: 'var(--red)', fontWeight: '700' }}>
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
};

export default TaskMenu;
