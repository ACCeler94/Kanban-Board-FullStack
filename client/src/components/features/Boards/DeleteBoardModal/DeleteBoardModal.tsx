import { Dialog } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorModalContent from '../../../common/ErrorModalContent/ErrorModalContent';
import LoadingModalContent from '../../../common/LoadingModalContent/LoadingModalContent';
import SuccessModalContent from '../../../common/SuccessModalContent/SuccessModalContent';
import ConfirmDeletionModalContent from '../../../common/ConfirmDeleteModalContent/ConfirmDeleteModalContent';
import { useDeleteBoard } from '../../../../API/boards';

const DeleteBoardModal = () => {
  const { id } = useParams();
  const { mutate: deleteBoard, isPending, error, isSuccess } = useDeleteBoard(id!);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setIsOpen(false);

    if (isSuccess) navigate('/boards');
    else navigate(`/boards/${id}`);
  }, [id, isSuccess, navigate]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isSuccess) {
      timeout = setTimeout(() => {
        handleClose();
      }, 1500);
    }
    return () => {
      clearTimeout(timeout); // Clear timeout if the component unmounts before the time passes
    };
  }, [handleClose, isSuccess]);

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
        <ErrorModalContent handleClose={handleClose} error={error} />
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
        <LoadingModalContent handleClose={handleClose} />
      </Dialog>
    );

  if (isSuccess)
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
          successMessage='Board removed successfully!'
        />
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
      <ConfirmDeletionModalContent
        handleClose={handleClose}
        handleDelete={deleteBoard}
        deletionSubject='board'
      />
    </Dialog>
  );
};

export default DeleteBoardModal;
