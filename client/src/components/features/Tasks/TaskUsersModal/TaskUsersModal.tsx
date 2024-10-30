import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import { useEffect, useMemo, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useAddUserToTask, useDeleteUserFromTask, useTaskData } from '../../../../API/tasks';
import modalStyles from '../../../../styles/modal.module.css';
import DeleteUserModal from '../../../common/DeleteUserModal/DeleteUserModal';
import ErrorModalContent from '../../../common/ErrorModalContent/ErrorModalContent';
import LoadingModalContent from '../../../common/LoadingModalContent/LoadingModalContent';
import UsersList from '../../Users/UsersList/UsersList';

const TaskUsersModal = () => {
  const { id, taskId } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isNestedOpen, setIsNestedOpen] = useState(false);
  const [showAddError, setShowAddError] = useState(false); // separate error states for add and delete to allow both being visible at the same time
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');

  const {
    data: taskData,
    isPending: isPendingTaskData,
    error: taskDataError,
  } = useTaskData(taskId!);
  const {
    mutate: addUser,
    isPending: isPendingAdd,
    error: addError,
  } = useAddUserToTask(id!, taskId!);
  const {
    mutate: deleteUser,
    isPending: isPendingDelete,
    error: deleteError,
  } = useDeleteUserFromTask(id!, taskId!);

  const flattenedUsersArr = useMemo(() => {
    return (
      taskData?.assignedUsers.map((userObj) => ({
        id: userObj.user.id,
        name: userObj.user.name,
        email: userObj.user.email,
        picture: userObj.user.picture,
      })) || []
    ); // Default to empty array if taskData is not available
  }, [taskData?.assignedUsers]);

  const handleClose = () => {
    setIsOpen(false);
    navigate(`/boards/${id}/tasks/${taskId}`);
  };

  const handleCloseNested = () => {
    setIsNestedOpen(false);
  };

  const handleDelete = () => {
    deleteUser(userIdToDelete);
    setIsNestedOpen(false);
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

  if (taskDataError) {
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
        <ErrorModalContent handleClose={handleClose} error={taskDataError} />
      </Dialog>
    );
  }

  if (isPendingTaskData)
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

  if (taskData)
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
            isEditable={true}
            setIsNestedOpen={setIsNestedOpen}
          />
          <DeleteUserModal
            handleDelete={handleDelete}
            handleClose={handleCloseNested}
            isOpen={isNestedOpen}
            deletionSubject='User from this task'
          />
        </div>
      </Dialog>
    );
};

export default TaskUsersModal;
