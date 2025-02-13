import { IoMdClose } from 'react-icons/io';
import modalStyles from '../../../styles/modal.module.css';
import deletionModalStyles from './ConfirmDeleteModalContent.module.css';
import Button from '@mui/material/Button';

interface ConfirmationModalProps {
  handleClose: () => void;
  handleDelete: () => void;
  deletionSubject: string;
}

// The Dialog component must be provided by the parent - otherwise the modal will be flashing when mounting and unmounting
const ConfirmDeletionModalContent = ({
  handleClose,
  handleDelete,
  deletionSubject,
}: ConfirmationModalProps) => {
  return (
    <>
      <div className={modalStyles.modalHeaderWrapper}>
        <h3 className={modalStyles.modalHeader}>Delete this {deletionSubject}?</h3>
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
        <p className={deletionModalStyles.deleteMessage}>
          Are you sure you want to <span className={deletionModalStyles.bold}>delete </span>
          this {deletionSubject}?
          <span className={deletionModalStyles.underline}> This action cannot be reversed.</span>
        </p>
        <div className={deletionModalStyles.confirmationButtonsWrapper}>
          <Button
            color='error'
            variant='contained'
            className='button-small'
            onClick={handleDelete}
            aria-label='Confirm'
          >
            Delete
          </Button>
          <Button
            color='info'
            variant='contained'
            className='button-small'
            onClick={handleClose}
            aria-label='Cancel'
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};

export default ConfirmDeletionModalContent;
