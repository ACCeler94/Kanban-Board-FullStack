import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, Routes } from 'react-router-dom';
import BoardsPage from './pages/BoardsPage/BoardsPage';
import PostLoginPage from './pages/PostLoginPage/PostLoginPage';
import Board from './components/features/Board/Board';

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/boards' element={<BoardsPage />}>
          <Route path=':id' element={<Board />} />
          {/* <Route path='edit' element={<EditBoardPage />} /> */}
        </Route>
        <Route path='/post-login' element={<PostLoginPage />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default App;
