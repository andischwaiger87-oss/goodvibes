import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import IntroWizard from './components/IntroWizard';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import Seo from './components/Seo';
import Home from './pages/Home';

// Seiten werden erst geladen, wenn man sie besucht.
// So ist die Startseite schneller da – vor allem am Handy.
const Submission        = lazy(() => import('./pages/Submission.jsx'));
const Voting            = lazy(() => import('./pages/Voting.jsx'));
const Progress          = lazy(() => import('./pages/Progress'));
const CompletedProjects = lazy(() => import('./pages/CompletedProjects'));
const ProjectDetail     = lazy(() => import('./pages/ProjectDetail'));
const Apps              = lazy(() => import('./pages/Apps'));
const AppDetail         = lazy(() => import('./pages/AppDetail'));
const Login             = lazy(() => import('./pages/Login'));
const Admin             = lazy(() => import('./pages/Admin'));
const Imprint           = lazy(() => import('./pages/Imprint'));
const FAQ               = lazy(() => import('./pages/FAQ'));
const Privacy           = lazy(() => import('./pages/Privacy'));
const NotFound          = lazy(() => import('./pages/NotFound'));

function PageLoader() {
    return (
        <div className="flex justify-center items-center py-32" role="status" aria-label="Seite wird geladen">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-100 border-t-blue-600" />
        </div>
    );
}

function AppRoutes() {
    const { pathname } = useLocation();
    return (
        <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/submission" element={<Submission />} />
                    <Route path="/voting" element={<Voting />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/projects" element={<CompletedProjects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/apps" element={<Apps />} />
                    <Route path="/apps/:slug" element={<AppDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/imprint" element={<Imprint />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Seo />
            <IntroWizard />
            <Layout>
                <AppRoutes />
            </Layout>
        </Router>
    );
}

export default App;
