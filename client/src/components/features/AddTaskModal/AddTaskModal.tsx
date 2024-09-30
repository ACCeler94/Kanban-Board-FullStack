import { CircularProgress, Dialog } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import modalStyles from '../../../styles/modal.module.css';
import TaskForm from '../../common/TaskForm/TaskForm';
import { useCreateTask } from '../../../API/tasks';
import { NewTaskData, NewTaskFormData } from '../../../types/types';

const AddTaskModal = () => {
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { error, isPending, mutate, isSuccess } = useCreateTask();

  const handleClose = useCallback(() => {
    setIsOpen(false);
    navigate(`/boards/${id}`);
  }, [id, navigate]);

  // close the modal on success after 1.5 second
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  }, [handleClose, isSuccess]);

  const submitHandler = (formData: NewTaskFormData) => {
    const { taskData, subtaskData } = formData;

    const fullTaskData: NewTaskData = { taskData: { ...taskData, boardId: id! }, subtaskData }; // id is always present, if not this component will not render
    mutate(fullTaskData);
  };

  if (error) {
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
          <h3 className={modalStyles.modalTitle}>Error</h3>
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
        <div className={modalStyles.modalContent}>Error: {error.message}</div>
      </Dialog>
    );
  }

  if (isPending) {
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
          <h3 className={modalStyles.modalTitle}>Loading...</h3>
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
  }

  if (isSuccess) {
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
          <h3 className={modalStyles.modalTitle}>Success</h3>
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
        <div className={modalStyles.modalContent}>Task successfully created!</div>
      </Dialog>
    );
  }

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
        <h3 className={modalStyles.modalTitle}>Add New Task</h3>
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
        <TaskForm buttonText='Add New Task' submitHandler={submitHandler} />
      </div>
    </Dialog>
  );
};

export default AddTaskModal;
