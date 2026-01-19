import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_VOTES = 'gv_votes_local';
const STORAGE_KEY_DEVICE_ID = 'gv_device_uuid';

/**
 * Holt oder erstellt eine einzigartige, anonyme ID für diesen Browser.
 * Dies ersetzt das invasive Fingerprinting durch einen einfachen Cookie-ähnlichen Ansatz.
 * Vorteile: 100% datenschutzkonform, keine Berechtigungen nötig, "vergisst" nicht so leicht.
 */
export const getDeviceId = () => {
    let id = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (!id) {
        id = uuidv4();
        localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
    }
    return id;
};

/**
 * Prüft lokal (für schnelles Feedback), ob für eine ID schon gestimmt wurde.
 * Die "echte" Sicherheit kommt dann über die Datenbank (Unique constraint auf device_id + project_id).
 */
export const hasAlreadyVotedLocal = (projectId) => {
    const votes = JSON.parse(localStorage.getItem(STORAGE_KEY_VOTES) || '[]');
    return votes.includes(projectId);
};

/**
 * Speichert den Vote lokal.
 */
export const recordVoteLocal = (projectId) => {
    const votes = JSON.parse(localStorage.getItem(STORAGE_KEY_VOTES) || '[]');
    if (!votes.includes(projectId)) {
        votes.push(projectId);
        localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify(votes));
    }
};
