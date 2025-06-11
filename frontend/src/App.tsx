import { Route, Routes, useParams } from 'react-router-dom';

import ModuleCards from './components/ModuleCards';
import ModulePage from './components/ModulePage';
import UnitPage from './components/UnitPage';

function ModulePageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Module ID not found</div>;
  return <ModulePage id={id} />;
}

function UnitPageWrapper() {
  const { id } = useParams();
  if (!id) return <div>Unit ID not found</div>;
  return <UnitPage id={id} />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ModuleCards />} />
        <Route path="/modules/:id" element={<ModulePageWrapper />} />
        <Route path="/unit/:id" element={<UnitPageWrapper />} />
      </Routes>
    </>
  );
}

export default App;
