import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { GenerateBlog } from './pages/GenerateBlog';
import { GenerateStory } from './pages/GenerateStory';
import { CustomizeVideo } from './pages/CustomizeVideo';
import { RenderVideo } from './pages/RenderVideo';
import { CreateContent } from './pages/CreateContent';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Contact } from './pages/Contact';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/create" element={<CreateContent />} />
          <Route
            path="/generate/blog"
            element={
              <ProtectedRoute>
                <GenerateBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate/story"
            element={
              <ProtectedRoute>
                <GenerateStory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customize/video"
            element={
              <ProtectedRoute>
                <CustomizeVideo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/render/video"
            element={
              <ProtectedRoute>
                <RenderVideo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;