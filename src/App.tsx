import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { Survey } from './pages/Survey';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Home />} />
          <Route path="survey" element={<Survey />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
