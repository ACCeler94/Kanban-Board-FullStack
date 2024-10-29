import { Alert, Dialog } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useAddUserToBoard,
  useBoardById,
  useBoardUsers,
  useDeleteUserFromBoard,
} from '../../../../API/boards';
import { useUserBoardData } from '../../../../API/users';
import modalStyles from '../../../../styles/modal.module.css';
import ErrorModalContent from '../../../common/ErrorModalContent/ErrorModalContent';
import LoadingModalContent from '../../../common/LoadingModalContent/LoadingModalContent';
import UsersList from '../../Users/UserList/UsersList';
import DeleteBoardUserModal from '../DeleteBoardUser/DeleteBoardUser';

const BoardUsersModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isNestedOpen, setIsNestedOpen] = useState(false);
  const [showAddError, setShowAddError] = useState(false); // separate error states for add and delete to allow both being visible at the same time
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');

  const { data: boardData, isPending, error } = useBoardById(id!);
  const {
    data: boardUsers,
    isPending: isBoardUsersPending,
    error: boardUsersError,
  } = useBoardUsers(id);
  const {
    data: userBoardData,
    isPending: isPendingUserData,
    error: userDataError,
  } = useUserBoardData(); // get current user to check if it is authorized to edit users - show or hide related buttons
  const { mutate: addUser, isPending: isPendingAdd, error: addError } = useAddUserToBoard(id!);
  const {
    mutate: deleteUser,
    isPending: isPendingDelete,
    error: deleteError,
  } = useDeleteUserFromBoard(id!);

  const flattenedUsersArr = useMemo(() => {
    return (
      boardUsers?.users.map((userObj) => ({
        id: userObj.user.id,
        name: userObj.user.name,
        email: userObj.user.email,
        picture: userObj.user.picture,
      })) || []
    ); // Default to empty array if boardData is not available
  }, [boardUsers]);

  const handleClose = () => {
    setIsOpen(false);
    navigate(`/boards/${id}`);
  };

  // delete user and close modal with confirmation prompt
  const handleDelete = () => {
    deleteUser(userIdToDelete);
    setIsNestedOpen(false);
  };

  // close nested modal with confirmation prompt
  const handleCloseNested = () => {
    setIsNestedOpen(false);
    setUserIdToDelete('');
  };

  // show add error alert for 5 seconds
  useEffect(() => {
    if (addError && !isPendingAdd) setShowAddError(true);
    const timeout = setTimeout(() => {
      setShowAddError(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [addError, isPendingAdd]);

  // show delete error alert for 5 seconds
  useEffect(() => {
    if (deleteError && !isPendingDelete) setShowDeleteError(true);
    const timeout = setTimeout(() => {
      setShowDeleteError(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [deleteError, isPendingDelete]);

  // set isEditable state to show or hide buttons in UsersList
  useEffect(() => {
    if (boardData?.authorId === userBoardData?.id) setIsEditable(true);
    else setIsEditable(false);
  }, [boardData?.authorId, userBoardData?.id]);

  if (error || userDataError || boardUsersError) {
    return (
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth={true}
        PaperProps={{
          sx: {
            borderRadius: '10px',
          },
        }}
      >
        <ErrorModalContent
          handleClose={handleClose}
          error={error || userDataError || boardUsersError!}
        />
      </Dialog>
    );
  }

  if (isPending || isPendingUserData || isBoardUsersPending)
    return (
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth={true}
        PaperProps={{
          sx: {
            borderRadius: '10px',
          },
        }}
      >
        <LoadingModalContent handleClose={handleClose} />
      </Dialog>
    );

  if (boardData)
    return (
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth={true}
        PaperProps={{
          sx: {
            borderRadius: '10px',
          },
        }}
      >
        <div className={modalStyles.modalHeaderWrapper}>
          <h3 className={modalStyles.modalTitle}>Users</h3>
          <div className={modalStyles.buttonsWrapper}>
            <button
              className={modalStyles.closeButton}
              type='button'
              aria-label='Close Modal'
              onClick={handleClose}
            >
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className={modalStyles.modalContent}>
          {isPendingDelete || isPendingAdd ? (
            <Alert severity='info' variant='filled'>
              Processing....
            </Alert>
          ) : (
            ''
          )}
          {showAddError && addError ? (
            <Alert
              severity='error'
              variant='filled'
              onClose={() => {
                setShowAddError(false);
              }}
            >
              {addError.message}
            </Alert>
          ) : (
            ''
          )}
          {showDeleteError && deleteError ? (
            <Alert
              severity='error'
              variant='filled'
              onClose={() => {
                setShowDeleteError(false);
              }}
            >
              {deleteError.message}
            </Alert>
          ) : (
            ''
          )}
          <UsersList
            users={flattenedUsersArr}
            addUser={addUser}
            setUserIdToDelete={setUserIdToDelete}
            isEditable={isEditable}
            setIsNestedOpen={setIsNestedOpen}
          />
          <DeleteBoardUserModal
            handleDelete={handleDelete}
            handleClose={handleCloseNested}
            isOpen={isNestedOpen}
          />
        </div>
      </Dialog>
    );
};

export default BoardUsersModal;
