import React from 'react';
import VotingCard from '../components/VotingCard';
import { motion } from 'framer-motion';

// Mock Data (Adjusted Wording)
const MOCK_PROJECTS = [
    {
        id: 1,
        title: "Kleidertausch Treff",
        category: "Umwelt",
        description: "Eine einfache Webseite, um in der Nachbarschaft Kleidung zu tauschen, die man nicht mehr trägt.",
        benefit: "Weniger Müll und man spart Geld.",
        username: "GreenFox",
        avatarSeed: 1,
        votes: 124
    },
    {
        id: 2,
        title: "Video-Chat für Senioren",
        category: "Zusammenleben",
        description: "Ganz einfache Video-Ecke im Browser. Nur ein Knopf zum Starten. Perfekt für Oma und Opa.",
        benefit: "Hilft gegen Einsamkeit und verbindet Familien.",
        username: "SilverSurfer",
        avatarSeed: 2,
        votes: 89
    },
    {
        id: 3,
        title: "Nachhilfe für Alle",
        category: "Bildung",
        description: "Wer gut in Mathe ist, hilft anderen. Kostenlos und online. Für alle, die sich keine Nachhilfe leisten können.",
        benefit: "Gleiche Chancen in der Schule für alle Kinder.",
        username: "BookWorm",
        avatarSeed: 3,
        votes: 256
    },
    {
        id: 4,
        title: "Essen Retten Karte",
        category: "Gesundheit",
        description: "Eine Karte die zeigt, wo es gerade Lebensmittel gibt, die sonst weggeworfen würden.",
        benefit: "Weniger Lebensmittelverschwendung und Hilfe für Bedürftige.",
        username: "ChefCook",
        avatarSeed: 4,
        votes: 180
    },
    {
        id: 5,
        title: "Rollstuhl-Wegweiser",
        category: "Zusammenleben",
        description: "Wir markieren gemeinsam auf einer Karte, welche Wege gut mit dem Rollstuhl befahrbar sind.",
        benefit: "Mehr Freiheit für Menschen im Rollstuhl.",
        username: "RollingStone",
        avatarSeed: 5,
        votes: 92
    }
];

export default function Voting() {
    const handleVote = (id) => {
        console.log("Stimme abgegeben für:", id);
    };

    return (
        <div className="py-16 px-4">
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6"
                >
                    Deine Stimme zählt
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
                >
                    Welches Projekt findest du am besten? <br />
                    Entscheide mit, was wir als nächstes bauen.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg text-slate-600 text-sm"
                >
                    <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
                    Hinweis: Du siehst das Ergebnis erst, nachdem du abgestimmt hast. So bleibt es fair.
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {MOCK_PROJECTS.map((project) => (
                    <VotingCard key={project.id} project={project} onVote={handleVote} />
                ))}
            </div>
        </div>
    );
}
