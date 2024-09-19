import { Button, CircularProgress } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditTask, useTaskData } from '../../../API/tasks';
import { Subtask } from '../../../types/types';
import DeleteTaskModal from '../DeleteTaskModal/DeleteTaskModal';
import SubtasksList from '../SubtasksList/SubtasksList';
import TaskMenu from '../TaskMenu/TaskMenu';
import styles from './TaskModal.module.css';

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
  } = useEditTask(taskId!, { subtaskData });
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
    navigate(`/boards/${id}`);
  };

  const handleCloseNested = () => {
    setIsNestedModalOpen(false);
  };

  const handleSaveChanges = () => {
    if (isModified && subtaskData) saveEditedTask();
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
        <div className={styles.taskHeaderWrapper}>
          <h3 className={styles.taskTitle}>Loading</h3>
          <div className={styles.buttonsWrapper}>
            <button className={styles.closeButton} onClick={handleClose}>
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className={styles.dialogContent}>
          <div className={styles.spinnerWrapper}>
            <CircularProgress />
          </div>
        </div>
      </Dialog>
    );

  if (taskFetchingError || editError) {
    const errorMessage = taskFetchingError ? taskFetchingError.message : editError?.message; // display one error message or the other
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
        <div className={styles.taskHeaderWrapper}>
          <h3 className={styles.taskTitle}>Error</h3>
          <div className={styles.buttonsWrapper}>
            <button className={styles.closeButton} onClick={handleClose}>
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className={styles.dialogContent}>
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
        <div className={styles.taskHeaderWrapper}>
          <h3 className={styles.taskTitle}>{taskData?.title}</h3>
          <div className={styles.buttonsWrapper}>
            <TaskMenu setIsNestedModalOpen={setIsNestedModalOpen} />
            <button className={styles.closeButton} onClick={handleClose}>
              <IoMdClose />
            </button>
          </div>
        </div>
        <div className={styles.dialogContent}>
          <p className={styles.taskDescription}>{taskData.desc}</p>
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
          taskId={taskData.id}
          taskTitle={taskData.title}
          boardId={taskData.boardId}
        />
      </Dialog>
    );
};

export default TaskModal;
