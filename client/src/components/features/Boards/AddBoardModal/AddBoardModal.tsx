import Dialog from '@mui/material/Dialog';
import { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useCreateBoard } from '../../../../API/boards';
import modalStyles from '../../../../styles/modal.module.css';
import BoardForm from '../../../common/BoardForm/BoardForm';
import ErrorModalContent from '../../../common/ErrorModalContent/ErrorModalContent';
import LoadingModalContent from '../../../common/LoadingModalContent/LoadingModalContent';
import SuccessModalContent from '../../../common/SuccessModalContent/SuccessModalContent';

const AddBoardModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { data: boardData, mutate, error, isPending, isSuccess } = useCreateBoard();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/boards');
    setIsOpen(false);
  };

  const submitHandler = (title: string) => {
    const newBoardData = { title };
    mutate(newBoardData);
  };

  // Redirect to the new board on success after 1.5 second
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isSuccess && boardData) {
      setTimeout(() => {
        navigate(`/boards/${boardData.id}`);
      }, 1500);
    }
    return () => clearTimeout(timeout);
  }, [boardData, isSuccess, navigate]);

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
        <ErrorModalContent
          handleClose={handleClose}
          error={'There was a problem creating the board. Please try again...'}
        />
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
        <LoadingModalContent handleClose={handleClose} />
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
        <SuccessModalContent handleClose={handleClose} successMessage='Board added successfully!' />
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
        <h3 className={modalStyles.modalTitle}>Add New Board</h3>
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
        <BoardForm buttonText='Add New Board' submitHandler={submitHandler} />
      </div>
    </Dialog>
  );
};

export default AddBoardModal;
