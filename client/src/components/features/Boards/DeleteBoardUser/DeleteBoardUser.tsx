import { Dialog } from '@mui/material';
import ConfirmDeletionModalContent from '../../../common/ConfirmDeleteModalContent/ConfirmDeleteModalContent';

interface DeleteBoardUserModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleDelete: () => void;
}

const DeleteBoardUserModal = ({ isOpen, handleClose, handleDelete }: DeleteBoardUserModalProps) => {
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
        handleDelete={handleDelete}
        deletionSubject='User and remove it from assigned tasks'
      />
    </Dialog>
  );
};

export default DeleteBoardUserModal;
