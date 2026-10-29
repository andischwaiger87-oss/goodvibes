import { v4 as uuidv4 } from 'uuid';
import { getItem, setItem, getJSON, setJSON } from './storage';

const STORAGE_KEY_VOTES = 'gv_votes_local';
const STORAGE_KEY_DEVICE_ID = 'gv_device_uuid';

/**
 * Holt oder erstellt eine anonyme Kennung fuer diesen Browser.
 * Kein Fingerprinting, keine Berechtigungen noetig.
 */
export const getDeviceId = () => {
    let id = getItem(STORAGE_KEY_DEVICE_ID);
    if (!id) {
        id = uuidv4();
        setItem(STORAGE_KEY_DEVICE_ID, id);
    }
    return id;
};

/**
 * Prueft lokal (fuer schnelle Anzeige), ob hier schon abgestimmt wurde.
 * Die eigentliche Pruefung macht der Server (increment_vote).
 */
export const hasAlreadyVotedLocal = (projectId) => {
    const votes = getJSON(STORAGE_KEY_VOTES, []);
    return Array.isArray(votes) && votes.includes(projectId);
};

/** Merkt sich die Stimme lokal. */
export const recordVoteLocal = (projectId) => {
    const votes = getJSON(STORAGE_KEY_VOTES, []);
    const list = Array.isArray(votes) ? votes : [];
    if (!list.includes(projectId)) {
        list.push(projectId);
        setJSON(STORAGE_KEY_VOTES, list);
    }
};
