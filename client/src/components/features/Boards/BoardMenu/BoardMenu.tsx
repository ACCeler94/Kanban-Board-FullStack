import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as React from 'react';
import { HiDotsVertical } from 'react-icons/hi';
import { Link, useParams } from 'react-router-dom';
import styles from './BoardMenu.module.css';

const BoardMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { id } = useParams();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={styles.menuWrapper}>
      <button
        type='button'
        id='board-menu-button'
        aria-controls={open ? 'board-menu-button' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className={styles.menuButton}
      >
        <HiDotsVertical />
      </button>

      <Menu
        id='board-menu'
        aria-labelledby='board-menu'
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
        <MenuItem
          component={Link}
          to={`/boards/${id}/users`}
          onClick={handleClose}
          sx={{ minWidth: '150px' }}
        >
          Users
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          component={Link}
          to={`/boards/${id}/edit`}
          onClick={handleClose}
          sx={{ minWidth: '150px' }}
        >
          Edit
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          component={Link}
          to={`/boards/${id}/delete`}
          onClick={handleClose}
          sx={{ color: 'var(--red)', fontWeight: '700', minWidth: '150px' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
};

export default BoardMenu;
