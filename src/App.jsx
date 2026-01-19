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

function App() {
    return (
        <Router>
            <Layout>
                <IntroWizard />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/submission" element={<Submission />} />
                    <Route path="/voting" element={<Voting />} />
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
