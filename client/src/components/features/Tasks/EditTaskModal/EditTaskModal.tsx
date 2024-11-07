import { Dialog } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditTask, useTaskData } from '../../../../API/tasks';
import useStore from '../../../../store/useStore';
import modalStyles from '../../../../styles/modal.module.css';
import { EditTaskData } from '../../../../types/types';
import { removeUnchangedData } from '../../../../utils/removeUnchangedData';
import ErrorModalContent from '../../../common/ErrorModalContent/ErrorModalContent';
import LoadingModalContent from '../../../common/LoadingModalContent/LoadingModalContent';
import SuccessModalContent from '../../../common/SuccessModalContent/SuccessModalContent';
import TaskForm from '../../../common/TaskForm/TaskForm';

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
  } = useEditTask(); // TaskId required for the component to mount

  const handleClose = useCallback(() => {
    setIsOpen(false);

    navigate(`/boards/${id}/tasks/${taskId}`);
  }, [id, navigate, taskId]);

  // Close the modal on success after 1.5 second
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isEditSuccess) {
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
    return () => clearTimeout(timeout);
  }, [handleClose, isEditSuccess]);

  const submitHandler = (formData: EditTaskData) => {
    const optimizedData = removeUnchangedData(formData, taskData!); // TaskData is present or the error/pending will be rendered
    mutate({ taskId: taskId!, editData: optimizedData, subtasksToRemove });
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
        <ErrorModalContent
          handleClose={handleClose}
          error={editError ? editError : taskDataError!}
        />
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
        <LoadingModalContent handleClose={handleClose} />
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
        <SuccessModalContent
          handleClose={handleClose}
          successMessage='Changes saved successfully!'
        />
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
