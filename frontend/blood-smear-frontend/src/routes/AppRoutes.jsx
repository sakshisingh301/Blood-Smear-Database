import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../App';
import RegistrationPage from './RegistrationPage';
import SignInPage from './SignInPage';
import AdminUploadPage from './AdminUploadPage';
import ContributePage from './ContributePage';
import JobStatusPage from './JobStatusPage';
import RecentUploadsPage from './RecentUploadsPage';
import UploadedContentPage from './UploadedContentPage';
import UploadedDataPage from './UploadedDataPage';
import SpeciesListPage from './SpeciesListPage';
import SpeciesDetailPage from './SpeciesDetailPage';
import AboutUsPage from './AboutUsPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/admin/upload" element={<AdminUploadPage />} />
        <Route path="/contribute" element={<ContributePage />} />
        <Route path="/job-status" element={<JobStatusPage />} />
        <Route path="/recent-uploads" element={<RecentUploadsPage />} />
        <Route path="/uploaded-content" element={<UploadedContentPage />} />
        <Route path="/uploaded-data" element={<UploadedDataPage />} />
        <Route path="/species" element={<SpeciesListPage />} />
        <Route path="/species/browse" element={<SpeciesListPage />} />
        <Route path="/species/:scientificName" element={<SpeciesDetailPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
