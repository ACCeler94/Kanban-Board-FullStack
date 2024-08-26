import styles from './Error.module.css';

interface ErrorProps {
  message: string;
}

const Error = ({ message }: ErrorProps) => {
  return <div className={styles.errorWrapper}>{message}</div>;
};

export default Error;
