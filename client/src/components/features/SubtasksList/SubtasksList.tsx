import { useEffect, useState } from 'react';
import { Subtask } from '../../../types/types';
import styles from './Subtasks.module.css';
import isEqual from 'lodash/isEqual';

interface SubtasksListProps {
  subtasks: Subtask[];
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubtasksList = ({ subtasks, setIsModified }: SubtasksListProps) => {
  const [updatedSubtasks, setUpdatedSubtasks] = useState<Subtask[]>(subtasks);

  // check if any of the subtasks was modified so the parent can render save changes button
  useEffect(() => {
    const isChanged = isEqual(updatedSubtasks, subtasks);
    setIsModified(!isChanged);
  }, [setIsModified, subtasks, updatedSubtasks]);

  const handleCheckboxChange = (index: number) => {
    setUpdatedSubtasks((prevSubtasks) =>
      prevSubtasks.map((subtask, i) =>
        i === index ? { ...subtask, finished: !subtask.finished } : subtask
      )
    );
  };

  return (
    <>
      <h4>Subtasks:</h4>
      <ul className={styles.subtasksList}>
        {updatedSubtasks.map((subtask, index) => {
          return (
            <li
              key={subtask.id}
              className={`${styles.subtask} ${subtask.finished ? styles.finished : ''}`}
              onClick={() => handleCheckboxChange(index)}
            >
              <input
                type='checkbox'
                checked={subtask.finished}
                aria-label={subtask.finished ? 'Finished subtask' : 'Unfinished subtask'}
                onChange={() => {}} // empty handler to silence the warning - actual change is handled by the parent component -> li element
              />
              <span>{subtask.desc}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default SubtasksList;
