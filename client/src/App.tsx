import { Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar/Navbar';

function App() {
  return (
    <>
      <Routes>
        <Route path='/boards' element={<Navbar />} />
      </Routes>
    </>
  );
}

export default App;
