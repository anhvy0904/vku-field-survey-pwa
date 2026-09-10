import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { NewSurvey } from './pages/NewSurvey';
import { SurveyHistory } from './pages/SurveyHistory';
import { SyncCenter } from './pages/SyncCenter';
import { Settings } from './pages/Settings';
import { SurveyProvider } from './context/SurveyContext';

const App: React.FC = () => {
  return (
    <SurveyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="survey/new" element={<NewSurvey />} />
            <Route path="surveys" element={<SurveyHistory />} />
            <Route path="sync" element={<SyncCenter />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SurveyProvider>
  );
};

export default App;
