import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseProvider } from './context/FirebaseContext';
import { PTMProvider } from './context/PTMContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';
import TeacherPage from './pages/TeacherPage';

function App() {
  return (
    <FirebaseProvider>
      <PTMProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="booking/:year" element={<BookingPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="teacher" element={<TeacherPage />} />
            </Route>
          </Routes>
        </Router>
      </PTMProvider>
    </FirebaseProvider>
  );
}

export default App;
