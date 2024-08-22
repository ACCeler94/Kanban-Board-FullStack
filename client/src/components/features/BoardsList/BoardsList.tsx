import styles from './BoardsList.module.css';
import { FaPlus } from 'react-icons/fa';
import useStore from '../../../store/useStore';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

interface Board {
  board: {
    title: string;
    id: string;
  };
}

interface BoardsListProps {
  boards: Board[];
}

const BoardsList = ({ boards }: BoardsListProps) => {
  const activeBoard = useStore((state) => state.activeBoard);
  const setActiveBoard = useStore((state) => state.setActiveBoard);

  // reset activeBoard on mount
  useEffect(() => {
    setActiveBoard(null);
  }, [setActiveBoard]);

  return (
    <div>
      <h2 className={styles.boardsListHeader}>All Boards ({boards.length})</h2>
      <ul className={styles.boardsList}>
        {boards.map((boardObj, index) => {
          const isActive = activeBoard && boardObj.board.id === activeBoard.id;
          return (
            <li key={index} board-id={boardObj.board.id}>
              <Link
                to={boardObj.board.id}
                className={isActive ? `${styles.active} ${styles.boardItem}` : styles.boardItem}
                onClick={() =>
                  setActiveBoard({ id: boardObj.board.id, title: boardObj.board.title })
                }
              >
                {boardObj.board.title}
              </Link>
            </li>
          );
        })}
        <li>
          <Link to='add' className={styles.addBoardButton}>
            <FaPlus />
            <span>Create new board</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default BoardsList;
