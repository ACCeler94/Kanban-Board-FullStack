import styles from './BoardsList.module.css';
import { FaPlus } from 'react-icons/fa';
import useStore from '../../../store/useStore';
import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { BoardPreview } from '../../../types/types';

interface BoardsListProps {
  boards: BoardPreview[];
}

const BoardsList = ({ boards }: BoardsListProps) => {
  const activeBoard = useStore((state) => state.activeBoard);
  const setActiveBoard = useStore((state) => state.setActiveBoard);
  const { id } = useParams();

  // set active board if the component re-mounted with proper id or set to null
  useEffect(() => {
    if (id) {
      const boardToSet = boards.find((elem) => elem.board.id === id);
      setActiveBoard(boardToSet?.board || null);
    } else setActiveBoard(null);
  }, [setActiveBoard, boards, id]);

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
