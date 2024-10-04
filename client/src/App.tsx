import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, Routes } from 'react-router-dom';
import AddTaskModal from './components/features/AddTaskModal/AddTaskModal';
import Board from './components/features/Board/Board';
import EditTaskModal from './components/features/EditTaskModal/EditTaskModal';
import TaskModal from './components/features/TaskModal/TaskModal';
import BoardsPage from './pages/BoardsPage/BoardsPage';
import PostLoginPage from './pages/PostLoginPage/PostLoginPage';

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
