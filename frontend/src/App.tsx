import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { MatterDetail } from './pages/MatterDetail';
import { Templates } from './pages/Templates';
import { TemplateForm } from './components/templates/TemplateForm';
import { DraftEditor } from './pages/DraftEditor';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
            <Route
              path="/matters/:matterId"
              element={
                <ProtectedRoute>
                  <MatterDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <Templates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/new"
              element={
                <ProtectedRoute>
                  <TemplateForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/:templateId/edit"
              element={
                <ProtectedRoute>
                  <TemplateForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/drafts/:draftId"
              element={
                <ProtectedRoute>
                  <DraftEditor />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
