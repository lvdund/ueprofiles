import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UEProfileList from '../components/UEProfiles/UEProfileList';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Routes>
        <Route path="/" element={<UEProfileList />} />
        {/* Maybe add some data to here */}
      </Routes>
    </div>
  );
}

export default Dashboard;