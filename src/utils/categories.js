// Category Translation Helper
export const categoryLabels = {
    environment: 'Umwelt & Natur',
    education: 'Bildung & Lernen',
    health: 'Gesundheit',
    community: 'Zusammenleben',
    other: 'Sonstiges'
};

export const getCategoryLabel = (key) => {
    return categoryLabels[key] || key;
};
