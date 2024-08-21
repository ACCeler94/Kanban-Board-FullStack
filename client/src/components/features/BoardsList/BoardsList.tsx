import styles from './BoardsList.module.css';

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
  const activeBoard = { id: '1e5ca4e7-2f18-4901-a30e-696746693ed1', title: 'Board One' }; //  mock value [TODO - change to take from zustand store]

  return (
    <div>
      <h2 className={styles.boardsListHeader}>All Boards ({boards.length})</h2>
      <ul className={styles.boardsList}>
        {boards.map((boardObj, index) => {
          const isActive = activeBoard && boardObj.board.id === activeBoard.id;
          return (
            <li
              key={index}
              board-id={boardObj.board.id}
              className={
                isActive ? `${styles.active} ${styles.boardsListItem}` : styles.boardsListItem
              }
            >
              {boardObj.board.title}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BoardsList;
