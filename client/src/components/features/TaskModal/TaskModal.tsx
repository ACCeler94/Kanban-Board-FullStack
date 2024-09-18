import Dialog from '@mui/material/Dialog';
import { useEditTask, useTaskData } from '../../../API/tasks';
import styles from './TaskModal.module.css';
import { IoMdClose } from 'react-icons/io';
import SubtasksList from '../SubtasksList/SubtasksList';
import { useState } from 'react';
import TaskMenu from '../TaskMenu/TaskMenu';
import { Button, CircularProgress } from '@mui/material';
import DeleteTaskModal from '../DeleteTaskModal/DeleteTaskModal';
import { Subtask } from '../../../types/types';

interface TaskModalProps {
  isOpen: boolean;
  handleClose: (event: object, reason: string) => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  taskId: string;
}

const TaskModal = ({ isOpen, handleClose, setIsOpen, taskId }: TaskModalProps) => {
  const { data: taskData, error: taskFetchingError, isPending, refetch } = useTaskData(taskId);
  const [isModified, setIsModified] = useState(false);
  const [isNestedModalOpen, setIsNestedModalOpen] = useState(false);
  const [subtaskData, setSubtaskData] = useState<Subtask[] | undefined>(undefined);
  const {
    error: editError,
    isPending: isEditPending,
    mutate: saveEditedTask,
  } = useEditTask(taskId, { subtaskData });

  const handleSaveChanges = () => {
    if (isModified && subtaskData) saveEditedTask();
  };

  const handleCloseNested = () => {
    setIsNestedModalOpen(false);
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
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
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
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
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
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
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
