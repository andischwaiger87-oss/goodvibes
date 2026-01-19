import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Submission from './pages/Submission.jsx';
import Voting from './pages/Voting.jsx';
import IntroWizard from './components/IntroWizard';

function App() {
    return (
        <Router>
            <Layout>
                <IntroWizard />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/submission" element={<Submission />} />
                    <Route path="/voting" element={<Voting />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
