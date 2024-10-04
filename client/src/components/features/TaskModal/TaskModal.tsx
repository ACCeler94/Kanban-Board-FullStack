import { Button, CircularProgress } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditTask, useTaskData } from '../../../API/tasks';
import modalStyles from '../../../styles/modal.module.css';
import { Subtask } from '../../../types/types';
import DeleteTaskModal from '../DeleteTaskModal/DeleteTaskModal';
import SubtasksList from '../SubtasksList/SubtasksList';
import TaskMenu from '../TaskMenu/TaskMenu';
import taskModalStyles from './TaskModal.module.css';

const TaskModal = () => {
  const { id, taskId } = useParams();
  const [isOpen, setIsOpen] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
  const [subtaskData, setSubtaskData] = useState<Subtask[] | undefined>(undefined);
  const { data: taskData, error: taskFetchingError, isPending, refetch } = useTaskData(taskId!);
  const {
    error: editError,
    isPending: isEditPending,
    mutate: saveEditedTask,
  } = useEditTask(taskId!); // TaskId is always present, if not this component will not render
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
    navigate(`/boards/${id}`);
  };

  const handleCloseNested = () => {
    setIsNestedModalOpen(false);
  };

  const handleSaveChanges = () => {
    if (isModified && subtaskData)
      saveEditedTask({ editData: { subtaskData }, subtasksToRemove: [] }); // TaskModal allows only changes to subtaskData status so subtasksToRemove will always be empty
  };

  if (isPending || isEditPending)
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
          <h3 className={modalStyles.modalTitle}>Loading</h3>
          <div className={modalStyles.buttonsWrapper}>
            <button
              type='button'
              aria-label='Close Modal'
              className={modalStyles.closeButton}
              onClick={handleClose}
            >
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className={modalStyles.dialogContent}>
          <div className={modalStyles.spinnerWrapper}>
            <CircularProgress />
          </div>
        </div>
      </Dialog>
    );

  if (taskFetchingError || editError) {
    const errorMessage = taskFetchingError ? taskFetchingError.message : editError?.message; // Display one error message or the other
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
        <div className={modalStyles.dialogContent}>
          <h3>{errorMessage}</h3>
          {taskFetchingError ? (
            <Button
              color='primary'
              variant='contained'
              className='button-small'
              sx={{ margin: '25px 0' }}
              onClick={async () => await refetch()}
            >
              Retry
            </Button>
          ) : null}
        </div>
      </Dialog>
    );
  }

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
          <h3 className={modalStyles.modalTitle}>{taskData?.title}</h3>
          <div className={modalStyles.buttonsWrapper}>
            <TaskMenu setIsNestedModalOpen={setIsNestedModalOpen} />
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
          <p className={taskModalStyles.taskDescription}>{taskData.desc}</p>
          {taskData.subtasks.length !== 0 ? (
            <SubtasksList
              subtasks={taskData.subtasks}
              setIsModified={setIsModified}
              setSubtaskData={setSubtaskData}
            />
          ) : null}

          {isModified ? (
            <Button
              color='primary'
              variant='contained'
              className='button-small'
              sx={{ margin: '10px 0', marginBottom: '25px' }}
              onClick={handleSaveChanges}
            >
              Save changes
            </Button>
          ) : (
            ''
          )}
        </div>

        <DeleteTaskModal
          isOpen={isNestedModalOpen}
          handleClose={handleCloseNested}
          handleCloseParent={handleClose}
          taskId={taskData.id}
          taskTitle={taskData.title}
          boardId={taskData.boardId}
        />
      </Dialog>
    );
};

export default TaskModal;
