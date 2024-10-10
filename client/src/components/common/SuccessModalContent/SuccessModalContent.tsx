import { IoMdClose } from 'react-icons/io';
import modalStyles from '../../../styles/modal.module.css';

interface SuccessModalProps {
  handleClose: () => void;
  successMessage: string;
}

// The Dialog component must be provided by the parent - otherwise the modal will be flashing when mounting and unmounting
const SuccessModalContent = ({ handleClose, successMessage }: SuccessModalProps) => {
  return (
    <>
      <div className={modalStyles.modalHeaderWrapper}>
        <h3 className={modalStyles.modalTitle}>Success</h3>
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
      <div className={modalStyles.modalContent}>{successMessage}</div>
    </>
  );
};

export default SuccessModalContent;
