import { IoMdClose } from 'react-icons/io';
import modalStyles from '../../../styles/modal.module.css';

interface ErrorModalProps {
  error: Error;
  handleClose: () => void;
}

// The Dialog component must be provided by the parent - otherwise the modal will be flashing when mounting and unmounting
const ErrorModalContent = ({ handleClose, error }: ErrorModalProps) => {
  return (
    <>
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
      <div className={modalStyles.modalContent}>Error: {error.message}</div>
    </>
  );
};

export default ErrorModalContent;
