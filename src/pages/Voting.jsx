import React from 'react';
import VotingCard from '../components/VotingCard';

// Mock Data
const MOCK_PROJECTS = [
    {
        id: 1,
        title: "EcoSwap Avatar",
        category: "Environment",
        description: "A platform to swap unused clothes locally to reduce textile waste. Completely non-profit and community driven.",
        benefit: "Reduces landfill waste and helps people save money on clothing.",
        username: "GreenFox",
        avatarSeed: 1,
        votes: 124 // Hidden initially
    },
    {
        id: 2,
        title: "Senior Connect",
        category: "Community",
        description: "Simple video chat app designed specifically for elderly people to connect with family without technical barriers.",
        benefit: "Reduces loneliness among seniors and connects generations.",
        username: "SilverSurfer",
        avatarSeed: 2,
        votes: 89
    },
    {
        id: 3,
        title: "StudyBuddy Open",
        category: "Education",
        description: "Free peer-to-peer tutoring matching for underprivileged students. No fees, just knowledge exchange.",
        benefit: "Equal access to education support regardless of income.",
        username: "BookWorm",
        avatarSeed: 3,
        votes: 256
    },
    {
        id: 4,
        title: "FoodRescue Map",
        category: "Health",
        description: "Real-time map showing local businesses with surplus food available for donation to shelters.",
        benefit: "Fights hunger and food waste simultaneously.",
        username: "ChefCook",
        avatarSeed: 4,
        votes: 180
    },
    {
        id: 5,
        title: "Accessible City",
        category: "Community",
        description: "Crowdsourced map of wheelchair accessible routes and venues in our city.",
        benefit: "Improves mobility and independence for people with disabilities.",
        username: "RollingStone",
        avatarSeed: 5,
        votes: 92
    }
];

export default function Voting() {
    const handleVote = (id) => {
        console.log("Voted for project:", id);
        // Here we would implement the API call with security fingerprint
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-3xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-6">
                    Community Voting
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Support the projects that matter the most to you.
                    <br />
                    <span className="text-indigo-400 text-sm font-semibold uppercase tracking-wider">
                        Blind Voting Active
                    </span>
                    <span className="text-slate-500 text-sm ml-2">
                        — Results are hidden until you vote to ensure fairness.
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PROJECTS.map((project) => (
                    <VotingCard key={project.id} project={project} onVote={handleVote} />
                ))}
            </div>
        </div>
    );
}
