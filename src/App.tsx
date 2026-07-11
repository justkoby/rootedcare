// @ts-nocheck
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WellnessDetails from './pages/WellnessDetails';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/wellness/:slug" element={<WellnessDetails />} />
      </Routes>
    </Router>
  );
}
