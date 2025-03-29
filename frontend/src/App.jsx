import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import AdmissionForm from './components/AdmissionForm';
import AcademicQualificationForm from './components/AcademicQualificationForm';
import PrintApplication from './components/PrintApplication';
import NavigationBar from './components/NavigationBar';
import FormNavigation from './components/FormNavigation';
import Header from './components/Header';

function App() {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {isAuthenticated && (
          <>
            <NavigationBar />
            <FormNavigation />
          </>
        )}
        <main className="py-6">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/admission-form" />} 
            />
            <Route 
              path="/signup" 
              element={!isAuthenticated ? <Signup /> : <Navigate to="/admission-form" />} 
            />

            {/* Protected Routes */}
            <Route 
              path="/admission-form" 
              element={isAuthenticated ? <AdmissionForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/academic-details" 
              element={isAuthenticated ? <AcademicQualificationForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/print-application" 
              element={isAuthenticated ? <PrintApplication /> : <Navigate to="/login" />} 
            />

            {/* Default Route */}
            <Route 
              path="/" 
              element={<Navigate to={isAuthenticated ? "/admission-form" : "/login"} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 