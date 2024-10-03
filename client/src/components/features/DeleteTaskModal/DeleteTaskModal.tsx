import { Button, CircularProgress, Dialog } from '@mui/material';
import { useDeleteTask } from '../../../API/tasks';
import { IoMdClose } from 'react-icons/io';
import modalStyles from '../../../styles/modal.module.css';
import deleteTaskModalStyles from './DeleteTaskModal.module.css';
import { useEffect } from 'react';

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
  const { mutate: deleteTask, isPending, error, data, isSuccess } = useDeleteTask(taskId, boardId);

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
        <div>
          <div className={modalStyles.modalHeaderWrapper}>
            <h3 className={modalStyles.modalHeader}>Error</h3>
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
          <p>Error: {error.message}</p>
        </div>
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
        <div className={modalStyles.modalHeaderWrapper}>
          <h3 className={modalStyles.modalHeader}>Loading...</h3>
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
          <div className={modalStyles.spinnerWrapper}>
            <CircularProgress />
          </div>
        </div>
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
        <div className={modalStyles.modalHeaderWrapper}>
          <h3 className={modalStyles.modalHeader}>Success</h3>
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
          <p>{data.message}</p>
        </div>
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
          Are you sure you want to delete {taskTitle} task and all related subtasks? This action
          cannot be reversed.
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
