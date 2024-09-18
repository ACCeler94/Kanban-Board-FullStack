import { useEffect, useMemo, useState } from 'react';
import { Subtask } from '../../../types/types';
import styles from './Subtasks.module.css';
import isEqual from 'lodash/isEqual';

interface SubtasksListProps {
  subtasks: Subtask[];
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
  setSubtaskData: React.Dispatch<React.SetStateAction<undefined | Subtask[]>>;
}

const SubtasksList = ({ subtasks, setIsModified, setSubtaskData }: SubtasksListProps) => {
  const [updatedSubtasks, setUpdatedSubtasks] = useState<Subtask[]>(subtasks);

  // check if any of the subtasks was modified so the parent can render save changes button
  const isChanged = useMemo(() => isEqual(updatedSubtasks, subtasks), [subtasks, updatedSubtasks]);
  useEffect(() => {
    setIsModified(!isChanged);
  }, [isChanged, setIsModified]);

  const handleCheckboxChange = (id: string) => {
    const newSubtasks = updatedSubtasks.map((subtask) =>
      subtask.id === id ? { ...subtask, finished: !subtask.finished } : subtask
    );
    setUpdatedSubtasks(newSubtasks);
    setSubtaskData(newSubtasks);
  };

  return (
    <>
      <h4>Subtasks:</h4>
      <ul className={styles.subtasksList}>
        {updatedSubtasks.map((subtask) => {
          return (
            <li
              key={subtask.id}
              className={`${styles.subtask} ${subtask.finished ? styles.finished : ''}`}
              onClick={() => handleCheckboxChange(subtask.id)}
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
