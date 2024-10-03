import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, Routes } from 'react-router-dom';
import BoardsPage from './pages/BoardsPage/BoardsPage';
import PostLoginPage from './pages/PostLoginPage/PostLoginPage';
import Board from './components/features/Board/Board';
import AddTaskModal from './components/features/AddTaskModal/AddTaskModal';
import TaskModal from './components/features/TaskModal/TaskModal';
import EditTaskModal from './components/features/EditTaskModal/EditTaskModal';

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/boards' element={<BoardsPage />}>
          <Route path=':id' element={<Board />}>
            <Route path='tasks/add-task' element={<AddTaskModal />} />
            <Route path='tasks/:taskId' element={<TaskModal />} />
            <Route path='tasks/:taskId/edit' element={<EditTaskModal />} />
          </Route>
        </Route>
        <Route path='/post-login' element={<PostLoginPage />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default App;
