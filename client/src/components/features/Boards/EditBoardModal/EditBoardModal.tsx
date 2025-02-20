import Dialog from '@mui/material/Dialog';
import { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate, useParams } from 'react-router-dom';
import { useBoardById, useEditBoard } from '../../../../API/boards';
import modalStyles from '../../../../styles/modal.module.css';
import BoardForm from '../../../common/BoardForm/BoardForm';
import ErrorModalContent from '../../../common/ErrorModalContent/ErrorModalContent';
import LoadingModalContent from '../../../common/LoadingModalContent/LoadingModalContent';
import SuccessModalContent from '../../../common/SuccessModalContent/SuccessModalContent';

const EditBoardModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { id } = useParams();
  const {
    data: boardData,
    error: boardDataError,
    isPending: isBoardDataPending,
  } = useBoardById(id);
  const { mutate, isPending: isEditPending, error: editError, isSuccess } = useEditBoard(id!); // id must be present otherwise component will not be rendered
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/boards/${id}`);
    setIsOpen(false);
  };

  const submitHandler = (title: string) => {
    const editedBoardData = { title };
    mutate(editedBoardData);
  };

  // Redirect to the edited board on success after 1.5 second
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isSuccess) {
      timeout = setTimeout(() => {
        navigate(`/boards/${id}`);
      }, 1500);
    }
    return () => clearTimeout(timeout);
  }, [id, isSuccess, navigate]);

  if (boardDataError || editError) {
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
          error={boardDataError ? boardDataError : editError!}
        />
      </Dialog>
    );
  }

  if (isEditPending || isBoardDataPending) {
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
        <SuccessModalContent
          handleClose={handleClose}
          successMessage='Board edited successfully!'
        />
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
        <h3 className={modalStyles.modalTitle}>Edit Board</h3>
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
        <BoardForm
          buttonText='Save changes'
          submitHandler={submitHandler}
          boardTitle={boardData?.title}
        />
      </div>
    </Dialog>
  );
};

export default EditBoardModal;
