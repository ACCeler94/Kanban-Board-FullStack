import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, Routes } from 'react-router-dom';
import BoardPage from './pages/BoardPage/BoardPage';
import PostLoginPage from './pages/PostLoginPage/PostLoginPage';

const App = () => {
  return (
    <>
      <Routes>
        <Route path='/boards' element={<BoardPage />} />
        <Route path='/post-login' element={<PostLoginPage />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default App;
