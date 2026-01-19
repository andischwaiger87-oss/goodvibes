import React from 'react';
import VotingCard from '../components/VotingCard';
import { motion } from 'framer-motion';

// Mock Data (Translated)
const MOCK_PROJECTS = [
    {
        id: 1,
        title: "EcoSwap Avatar",
        category: "Environment",
        description: "Eine Plattform zum lokalen Tausch ungenutzter Kleidung. Komplett non-profit und von der Community getrieben.",
        benefit: "Reduziert Müll und hilft Menschen, Geld für Kleidung zu sparen.",
        username: "GreenFox",
        avatarSeed: 1,
        votes: 124
    },
    {
        id: 2,
        title: "Senior Connect",
        category: "Community",
        description: "Einfache Video-Chat-App, speziell entwickelt für ältere Menschen, um ohne technische Hürden mit der Familie in Kontakt zu bleiben.",
        benefit: "Verringert Einsamkeit im Alter und verbindet Generationen.",
        username: "SilverSurfer",
        avatarSeed: 2,
        votes: 89
    },
    {
        id: 3,
        title: "StudyBuddy Open",
        category: "Education",
        description: "Kostenlose Nachhilfe-Vermittlung für benachteiligte Schüler. Keine Gebühren, reiner Wissensaustausch.",
        benefit: "Chancengleichheit in der Bildung, unabhängig vom Einkommen.",
        username: "BookWorm",
        avatarSeed: 3,
        votes: 256
    },
    {
        id: 4,
        title: "FoodRescue Map",
        category: "Health",
        description: "Echtzeit-Karte zeigt lokale Geschäfte mit überschüssigen Lebensmitteln, die an Tafeln gespendet werden können.",
        benefit: "Bekämpft Hunger und Lebensmittelverschwendung gleichzeitig.",
        username: "ChefCook",
        avatarSeed: 4,
        votes: 180
    },
    {
        id: 5,
        title: "Barrierefreie Stadt",
        category: "Community",
        description: "Crowdsourced-Karte für rollstuhlgerechte Wege und Orte in unserer Stadt.",
        benefit: "Verbessert Mobilität und Unabhängigkeit für Menschen mit Behinderungen.",
        username: "RollingStone",
        avatarSeed: 5,
        votes: 92
    }
];

export default function Voting() {
    const handleVote = (id) => {
        console.log("Voted for project:", id);
    };

    return (
        <div className="py-16">
            <div className="text-center mb-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6"
                >
                    Community Voting
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-slate-500 max-w-2xl mx-auto"
                >
                    Unterstütze die Projekte, die dir am wichtigsten sind.
                    <br className="hidden sm:block" />
                    <span className="inline-flex items-center mt-4 px-3 py-1 rounded bg-gray-100 text-xs font-bold uppercase tracking-widest text-slate-500">
                        Blind Voting Aktiv
                    </span>
                    <span className="block text-sm text-slate-400 mt-2">
                        Ergebnisse sind erst nach der Stimmabgabe sichtbar.
                    </span>
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_PROJECTS.map((project) => (
                    <VotingCard key={project.id} project={project} onVote={handleVote} />
                ))}
            </div>
        </div>
    );
}
