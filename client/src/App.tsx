import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, Routes } from 'react-router-dom';
import AddBoardModal from './components/features/Boards/AddBoardModal/AddBoardModal';
import Board from './components/features/Boards/Board/Board';
import AddTaskModal from './components/features/Tasks/AddTaskModal/AddTaskModal';
import EditTaskModal from './components/features/Tasks/EditTaskModal/EditTaskModal';
import TaskModal from './components/features/Tasks/TaskModal/TaskModal';
import BoardsPage from './pages/BoardsPage/BoardsPage';
import PostLoginPage from './pages/PostLoginPage/PostLoginPage';
import EditBoardModal from './components/features/Boards/EditBoardModal/EditBoardModal';
import DeleteTaskModal from './components/features/Tasks/DeleteTaskModal/DeleteTaskModal';
import DeleteBoardModal from './components/features/Boards/DeleteBoardModal/DeleteBoardModal';
import BoardUsersModal from './components/features/Boards/BoardUsersModal/BoardUsersModal';

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/boards' element={<BoardsPage />}>
          <Route path='add' element={<AddBoardModal />} />
          <Route path=':id' element={<Board />}>
            <Route path='edit' element={<EditBoardModal />} />
            <Route path='delete' element={<DeleteBoardModal />} />
            <Route path='tasks/add' element={<AddTaskModal />} />
            <Route path='tasks/:taskId' element={<TaskModal />} />
            <Route path='tasks/:taskId/edit' element={<EditTaskModal />} />
            <Route path='tasks/:taskId/delete' element={<DeleteTaskModal />} />
            <Route path='users' element={<BoardUsersModal />} />
          </Route>
        </Route>
        <Route path='/post-login' element={<PostLoginPage />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default App;
