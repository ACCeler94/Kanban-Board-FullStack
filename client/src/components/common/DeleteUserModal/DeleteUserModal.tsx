import { Dialog } from '@mui/material';
import ConfirmDeletionModalContent from '../ConfirmDeleteModalContent/ConfirmDeleteModalContent';

interface DeleteUserModalProps {
  isOpen: boolean;
  handleClose: () => void;
  handleDelete: () => void;
  deletionSubject: string;
}

const DeleteUserModal = ({
  isOpen,
  handleClose,
  handleDelete,
  deletionSubject,
}: DeleteUserModalProps) => {
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
        deletionSubject={deletionSubject}
      />
    </Dialog>
  );
};

export default DeleteUserModal;
