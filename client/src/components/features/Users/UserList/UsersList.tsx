import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { IoAddCircle } from 'react-icons/io5';
import { MdOutlineDeleteForever } from 'react-icons/md';
import { User } from '../../../../types/types';
import styles from './UsersList.module.css';

interface UsersListProps {
  users: User[];
  isEditable: boolean;
  addUser: (email: string) => void;
  deleteUser: (userId: string) => void;
}

const UsersList = ({ users, isEditable, addUser, deleteUser }: UsersListProps) => {
  const [userEmail, setUserEmail] = useState('');

  const handleAddUser = () => {
    const input = document.getElementById('add-input') as HTMLInputElement;

    if (input && input.reportValidity()) {
      addUser(userEmail);
      setUserEmail('');
    }
  };

  return (
    <List sx={{ padding: 0, overflow: 'auto' }} className={styles.usersList}>
      {users.map((user) => {
        return (
          <ListItem key={user.id} className={styles.usersListItem}>
            <div className={styles.userCard}>
              <img
                className={styles.avatar}
                src={
                  user.picture
                    ? user.picture
                    : `${import.meta.env.VITE_SERVER_URL}/images/default-avatar.png`
                }
              />
              <div className={styles.userData}>
                <p className={styles.userName}>{user.name}</p>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
            </div>
            {isEditable && (
              <button
                className={styles.deleteButton}
                type='button'
                aria-label='Delete User from Board'
                onClick={() => deleteUser(user.id)}
              >
                <MdOutlineDeleteForever />
              </button>
            )}
          </ListItem>
        );
      })}

      {isEditable && (
        <ListItem className={styles.addUserInputWrapper}>
          <TextField
            id='add-input'
            aria-label='Add User to Board'
            fullWidth
            placeholder='Enter e-mail address...'
            sx={{ marginRight: '10px' }}
            value={userEmail}
            required
            type='email'
            inputProps={{ minLength: 5, maxLength: 64 }}
            onChange={(e) => setUserEmail(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
          <button
            className={styles.addButton}
            type='button'
            aria-label='Add Subtask'
            onClick={handleAddUser}
          >
            <IoAddCircle />
          </button>
        </ListItem>
      )}
    </List>
  );
};

export default UsersList;
