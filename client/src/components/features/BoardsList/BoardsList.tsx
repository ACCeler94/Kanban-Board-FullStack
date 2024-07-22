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
  return (
    <>
      <div>Your Boards</div>
      <ul>
        {boards.map((boardObj, index) => (
          <li key={index} board-id={boardObj.board.id}>
            {boardObj.board.title}
          </li>
        ))}
      </ul>
    </>
  );
};

export default BoardsList;
