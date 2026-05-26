import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Submission from './pages/Submission.jsx';
import Voting from './pages/Voting.jsx';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import IntroWizard from './components/IntroWizard';
import Imprint from './pages/Imprint';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import ScrollToTop from './components/ScrollToTop';
import Progress from './pages/Progress';
import CompletedProjects from './pages/CompletedProjects';
import ProjectDetail from './pages/ProjectDetail';

function App() {
    return (
        <Router>
            <ScrollToTop />
            
            {/* SOTA-Fix: Der Wizard schwebt jetzt auf globaler Root-Ebene über absolut allem (Navbar, Banner etc.) */}
            <IntroWizard />
            
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/submission" element={<Submission />} />
                    <Route path="/voting" element={<Voting />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/projects" element={<CompletedProjects />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
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
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;