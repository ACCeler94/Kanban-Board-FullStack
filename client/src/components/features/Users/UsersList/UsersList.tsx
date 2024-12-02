import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { FaPlusCircle, FaTrash } from 'react-icons/fa';
import { User } from '../../../../types/types';
import styles from './UsersList.module.css';

interface UsersListProps {
  users: User[];
  isEditable: boolean;
  addUser: (email: string) => void;
  setIsNestedOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUserIdToDelete: React.Dispatch<React.SetStateAction<string>>;
}

const UsersList = ({
  users,
  isEditable,
  addUser,
  setIsNestedOpen,
  setUserIdToDelete,
}: UsersListProps) => {
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
      {users.length === 0 && <div>No assigned users...</div>}
      {users.map((user) => {
        return (
          <ListItem key={user.id} className={styles.usersListItem}>
            <div className={styles.userCard}>
              <img
                className={styles.avatar}
                src={
                  user.picture
                    ? `${import.meta.env.VITE_SERVER_URL}/images/userAvatars/${user.picture}`
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
                aria-label='Delete User'
                onClick={() => {
                  setIsNestedOpen(true);
                  setUserIdToDelete(user.id);
                }}
              >
                <FaTrash />
              </button>
            )}
          </ListItem>
        );
      })}

      {isEditable && (
        <ListItem className={styles.addUserInputWrapper}>
          <TextField
            id='add-input'
            aria-label='Add User'
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
                handleAddUser();
              }
            }}
          />
          <button
            className={styles.addButton}
            type='button'
            aria-label='Add User'
            onClick={handleAddUser}
          >
            <FaPlusCircle />
          </button>
        </ListItem>
      )}
    </List>
  );
};

export default UsersList;
