import { Route, Routes, useParams } from 'react-router-dom';

import ModuleCards from './components/ModuleCards';
import ModulePage from './components/ModulePage';

function ModulePageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Module ID not found</div>;
  return <ModulePage id={id} />;
}

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<ModuleCards />} />
        <Route path="/modules/:id" element={<ModulePageWrapper />} />
      </Routes>
    </>
  );
}

export default App;
