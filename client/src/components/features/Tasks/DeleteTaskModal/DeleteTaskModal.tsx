import { Button, Dialog } from '@mui/material';
import { useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useDeleteTask } from '../../../../API/tasks';
import modalStyles from '../../../../styles/modal.module.css';
import ErrorModalContent from '../../../common/ErrorModalContent/ErrorModalContent';
import LoadingModalContent from '../../../common/LoadingModalContent/LoadingModalContent';
import SuccessModalContent from '../../../common/SuccessModalContent/SuccessModalContent';
import deleteTaskModalStyles from './DeleteTaskModal.module.css';

interface ConfirmationModalProps {
  taskId: string;
  boardId: string;
  taskTitle: string;
  handleClose: () => void;
  handleCloseParent: () => void;
  isOpen: boolean;
}

const DeleteTaskModal = ({
  handleClose,
  handleCloseParent,
  isOpen,
  taskId,
  taskTitle,
  boardId,
}: ConfirmationModalProps) => {
  const { mutate: deleteTask, isPending, error, isSuccess } = useDeleteTask(taskId, boardId);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isSuccess) {
      timeout = setTimeout(() => {
        handleClose();
        handleCloseParent();
      }, 1500);
    }

    return () => {
      clearTimeout(timeout); // Clear timeout if the component unmounts before the time passes
    };
  }, [handleClose, handleCloseParent, isSuccess]);

  if (error)
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
        <ErrorModalContent handleClose={handleClose} error={error} />
      </Dialog>
    );

  if (isPending)
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

  if (isSuccess)
    return (
      <Dialog
        open={isOpen}
        onClose={() => {
          handleClose();
          handleCloseParent();
        }}
        maxWidth='sm'
        fullWidth={true}
        PaperProps={{
          sx: {
            borderRadius: '10px',
          },
        }}
      >
        <SuccessModalContent
          handleClose={handleClose}
          successMessage='Task removed successfully!'
        />
      </Dialog>
    );

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
        <h3 className={modalStyles.modalHeader}>Delete this task?</h3>
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
        <p className={deleteTaskModalStyles.deleteMessage}>
          Are you sure you want to <span className={deleteTaskModalStyles.bold}>delete </span>
          {taskTitle} task and all related subtasks?{' '}
          <span className={deleteTaskModalStyles.underline}>This action cannot be reversed.</span>
        </p>
        <div className={deleteTaskModalStyles.confirmationButtonsWrapper}>
          <Button
            color='error'
            variant='contained'
            className='button-small'
            sx={{ margin: '10px 0', marginBottom: '25px' }}
            onClick={() => deleteTask()}
          >
            Delete
          </Button>
          <Button
            color='info'
            variant='contained'
            className='button-small'
            sx={{ margin: '10px 0', marginBottom: '25px' }}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteTaskModal;
