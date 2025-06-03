import { useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

import ModuleCards from './components/ModuleCards';
import ModulePage from './components/ModulePage';

function ModulePageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Module ID not found</div>;
  return <ModulePage id={id} />;
}

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Routes>
        <Route path="/" element={<ModuleCards />} />
        <Route path="/modules/:id" element={<ModulePageWrapper />} />
      </Routes>
      <EndpointTesting />
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
