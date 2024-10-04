import { CircularProgress, Dialog } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import modalStyles from '../../../styles/modal.module.css';
import TaskForm from '../../common/TaskForm/TaskForm';
import { useEditTask, useTaskData } from '../../../API/tasks';
import { EditTaskData } from '../../../types/types';
import useStore from '../../../store/useStore';
import { removeUnchangedData } from '../../../utils/removeUnchangedData';

const EditTaskModal = () => {
  const { id, taskId } = useParams();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const subtasksToRemove = useStore((state) => state.subtasksToRemove);

  const {
    // Fetch task data to populate edit form
    data: taskData,
    error: taskDataError,
    isPending: isTaskDataPending,
  } = useTaskData(taskId!);

  const {
    error: editError,
    isPending: isEditPending,
    mutate,
    isSuccess: isEditSuccess,
  } = useEditTask(taskId!); // TaskId required for the component to mount

  const handleClose = useCallback(() => {
    setIsOpen(false);

    navigate(`/boards/${id}/tasks/${taskId}`);
  }, [id, navigate, taskId]);

  // Close the modal on success after 1.5 second
  useEffect(() => {
    if (isEditSuccess) {
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  }, [handleClose, isEditSuccess]);

  const submitHandler = (formData: EditTaskData) => {
    const optimizedData = removeUnchangedData(formData, taskData!); // TaskData is present or the error/pending will be rendered
    mutate({ editData: optimizedData, subtasksToRemove });
  };

  if (editError || taskDataError) {
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
        <div className={modalStyles.modalContent}>
          Error: {editError ? editError.message : taskDataError?.message}
        </div>
      </Dialog>
    );
  }

  if (isEditPending || isTaskDataPending) {
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

  if (isEditSuccess) {
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
        <div className={modalStyles.modalContent}>Changes saved successfully!</div>
      </Dialog>
    );
  }

  if (taskData) {
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
          <h3 className={modalStyles.modalTitle}>Edit Task</h3>
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
          <TaskForm
            buttonText='Save changes'
            submitHandler={submitHandler}
            taskTitle={taskData.title}
            taskDesc={taskData.desc}
            taskStatus={taskData.status}
            taskSubtasks={taskData.subtasks}
          />
        </div>
      </Dialog>
    );
  }
};

export default EditTaskModal;
