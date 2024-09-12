import { Button, CircularProgress, Dialog } from '@mui/material';
import { useDeleteTask } from '../../../API/tasks';
import { IoMdClose } from 'react-icons/io';
import styles from './DeleteTaskModal.module.css';

interface ConfirmationModalProps {
  taskId: string;
  boardId: string;
  taskTitle: string;
  handleClose: () => void;
  isOpen: boolean;
}

const DeleteTaskModal = ({
  handleClose,
  isOpen,
  taskId,
  taskTitle,
  boardId,
}: ConfirmationModalProps) => {
  const { mutate: deleteTask, isPending, error, data } = useDeleteTask(taskId, boardId);

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
          <div className={styles.modalHeaderWrapper}>
            <h3 className={styles.modalHeader}>Error</h3>
            <div className={styles.buttonsWrapper}>
              <button className={styles.closeButton} onClick={handleClose}>
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
        <div className={styles.modalHeaderWrapper}>
          <h3 className={styles.modalHeader}>Error</h3>
          <div className={styles.buttonsWrapper}>
            <button className={styles.closeButton} onClick={handleClose}>
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.spinnerWrapper}>
            <CircularProgress />
          </div>
        </div>
      </Dialog>
    );

  if (!error && !isPending && data)
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
        <div className={styles.modalHeaderWrapper}>
          <h3 className={styles.modalHeader}>Success</h3>
          <div className={styles.buttonsWrapper}>
            <button className={styles.closeButton} onClick={handleClose}>
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className={styles.modalContent}>
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
      <div className={styles.modalHeaderWrapper}>
        <h3 className={styles.modalHeader}>Delete this task?</h3>
        <div className={styles.buttonsWrapper}>
          <button className={styles.closeButton} onClick={handleClose}>
            <IoMdClose />
          </button>
        </div>
      </div>
      <div className={styles.modalContent}>
        <p>
          Are you sure you want to delete {taskTitle} task and all related subtasks? This action
          cannot be reversed.
        </p>
        <div className={styles.confirmationButtonsWrapper}>
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
