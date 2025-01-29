import { CircularProgress } from '@mui/material';
import { IoMdClose } from 'react-icons/io';
import modalStyles from '../../../styles/modal.module.css';

interface LoadingModalProps {
  handleClose: () => void;
}

// The Dialog component must be provided by the parent - otherwise the modal will be flashing when mounting and unmounting
const LoadingModalContent = ({ handleClose }: LoadingModalProps) => {
  return (
    <>
      <div className={modalStyles.modalHeaderWrapper}>
        <h3 className={modalStyles.modalTitle}>Loading...</h3>
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
        <div className={modalStyles.spinnerWrapper}>
          <CircularProgress aria-label='Loading spinner' />
        </div>
      </div>
    </>
  );
};

export default LoadingModalContent;
