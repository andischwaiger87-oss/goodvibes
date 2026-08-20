import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// -------------------------------------------------------------
// LOCALSTORAGE MOCK DATABASE FOR OFFLINE / LOCAL DEVELOPMENT
// -------------------------------------------------------------
const initMockDatabase = () => {
    // 1. Initial Projects (from screenshots)
    if (!localStorage.getItem('gv_mock_projects')) {
        const initialProjects = [
            {
                id: '11111111-1111-1111-1111-111111111111',
                title: 'MeinPlan',
                category: 'other',
                description: 'Im Alltag kann es für Menschen schwierig sein, den Überblick über den Tagesablauf zu behalten. Besonders für Menschen mit intellektuellen Beeinträchtigungen oder Autismus-Spektrum-Störungen ist eine klare Strukturierung essenziell.',
                benefit: 'Zielgruppe für alle Menschen, die von klarer Strukturierung im Alltag profitieren.',
                username: 'Alltagsheld',
                avatar_seed: 'fun-emoji:Alltagsheld',
                status: 'implementation',
                owner_id: 'mock-owner-device-id',
                votes: 139,
                created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                title: 'Berufskompass Saalachtal',
                category: 'education',
                description: 'Titel der Idee: Ein digitaler Berufskompass für die Region. Das Problem: Viele heimische Betriebe kämpfen mit dem Fachkräftemangel. Gleichzeitig wissen junge Menschen oft nicht, welche Lehrberufe vor der Haustür angeboten werden.',
                benefit: 'Die App verbindet Jugendliche auf digitalem Weg mit regionalen Betrieben.',
                username: 'ZukunftsKompass',
                avatar_seed: 'bottts:ZukunftsKompass',
                status: 'active',
                owner_id: 'device-id-2',
                votes: 17,
                created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '33333333-3333-3333-3333-333333333333',
                title: 'Inserat-Helfer',
                category: 'environment',
                description: 'Viele von uns haben noch gute Sachen im Keller oder Schrank, die zu schade zum Wegwerfen sind. Aber das Verkaufen im Internet ist oft mühsam: Fotos machen, Beschreibung texten, Preis verhandeln. Diese App soll helfen.',
                benefit: 'Allen Menschen, die funktionstüchtige Dinge unkompliziert weitergeben möchten.',
                username: 'ReUse',
                avatar_seed: 'shapes:ReUse',
                status: 'active',
                owner_id: 'device-id-3',
                votes: 15,
                created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '44444444-4444-4444-4444-444444444444',
                title: 'Gemeinsam rocken wir alles',
                category: 'community',
                description: 'Man gibt die Situation ein, wo man ein Problem hat in der WG und die App hilft Lösungsvorschläge zu finden, so dass ein miteinander positiv gewährleistet wird.',
                benefit: 'WGs, Familien und alle Gemeinschaften.',
                username: 'Sonnenblume',
                avatar_seed: 'bottts:Sonnenblume',
                status: 'active',
                owner_id: 'device-id-4',
                votes: 7,
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '55555555-5555-5555-5555-555555555555',
                title: 'Kommunikationshilfe für Schlaganfall-Patienten mit Dialekt-Unterstützung',
                category: 'community',
                description: 'Viele Menschen haben nach einem Schlaganfall Schwierigkeiten beim Sprechen, Hören oder können Gesprochenes leichter verstehen als selbst zu formulieren. Eine App mit Bildkarten und einfacher Sprachausgabe, die Dialekt-unterstützt ist.',
                benefit: 'Betroffene Personen und Angehörige.',
                username: 'Lyria',
                avatar_seed: 'shapes:Lyria',
                status: 'active',
                owner_id: 'device-id-5',
                votes: 4,
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '66666666-6666-6666-6666-666666666666',
                title: 'Spaziergang-Paten für Senioren',
                category: 'health',
                description: 'Eine App, die Senioren in der Nachbarschaft vernetzt, um Gehpartner für tägliche Spaziergänge zu finden. Beugt Einsamkeit vor und fördert die Gesundheit im Alter.',
                benefit: 'Alleinlebende Senioren und deren Angehörige.',
                username: 'Wanderlust',
                avatar_seed: 'shapes:Wanderlust',
                status: 'completed',
                owner_id: 'device-id-6',
                votes: 92,
                live_url: 'https://spaziergang.goodvibes.org',
                features: '• Einfache Profilerstellung ohne E-Mail-Zwang\n• Intuitiver Umkreisfilter für Spaziergänge\n• Barrierefreie Benutzeroberfläche mit großer Schrift\n• Integrierter Notfall-Knopf für zusätzliche Sicherheit',
                created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('gv_mock_projects', JSON.stringify(initialProjects));
    }

    // 2. Initial App Settings (Current Phase: Implementation)
    if (!localStorage.getItem('gv_mock_app_settings')) {
        const initialSettings = {
            current_phase: 'submission',
            active_project_id: '11111111-1111-1111-1111-111111111111'
        };
        localStorage.setItem('gv_mock_app_settings', JSON.stringify(initialSettings));
    }

    // 3. Initial Project Updates / Timeline for active project (MeinPlan)
    if (!localStorage.getItem('gv_mock_project_updates')) {
        const initialUpdates = [
            {
                id: 'update-1',
                project_id: '11111111-1111-1111-1111-111111111111',
                progress_percent: 15,
                update_title: 'Konzept & Design abgeschlossen',
                update_text: 'Das grundlegende UI-Design und die Informationsarchitektur wurden gemeinsam mit Vertretern der Zielgruppe ausgearbeitet. Die Layouts sind barrierefrei und einfach scannbar.',
                created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'update-2',
                project_id: '11111111-1111-1111-1111-111111111111',
                progress_percent: 45,
                update_title: 'Datenbank-Struktur & Grundgerüst stehen',
                update_text: 'Das React-Grundgerüst wurde aufgesetzt. Die Anbindung an die Datenbank ist erfolgt. Die ersten Kern-Ansichten zur Tagesplanung funktionieren bereits offline.',
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'update-3',
                project_id: '11111111-1111-1111-1111-111111111111',
                progress_percent: 65,
                update_title: 'Testphase gestartet – jetzt bist du dran!',
                update_text: 'MeinPlan hat den Stand zum Testen erreicht und ist ab sofort als BETA verfügbar. Mit dabei: überarbeitete Erinnerungen (Bild, Text und Stimme), verschiebbare Einträge und eine einfache Einrichtung beim ersten Start. Probier die App im Alltag aus und gib uns Feedback im App-Bereich – jede Rückmeldung hilft!',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('gv_mock_project_updates', JSON.stringify(initialUpdates));
    }

    // 4. Initial Bug Reports (Empty by default)
    if (!localStorage.getItem('gv_mock_bug_reports')) {
        localStorage.setItem('gv_mock_bug_reports', JSON.stringify([]));
    }

    // 5. Initial Bug Report Votes
    if (!localStorage.getItem('gv_mock_bug_report_votes')) {
        localStorage.setItem('gv_mock_bug_report_votes', JSON.stringify([]));
    }

    // -------------------------------------------------------------
    // COMMUNITY / APP-STORE MODULE (neu)
    // -------------------------------------------------------------

    // 6. App-Katalog (Play-Store-artig, beliebig erweiterbar)
    if (!localStorage.getItem('gv_mock_apps')) {
        const initialApps = [
            {
                id: 'app-meinplan', slug: 'meinplan', name: 'MeinPlan',
                tagline: 'Dein Tag – klar strukturiert und zum Abhaken.',
                description: 'MeinPlan hilft dir, deinen Alltag klar zu strukturieren. Du legst für jeden Wochentag einen eigenen Ablauf an, siehst deinen Plan in Tages-, Wochen- und Monatsansicht und hakst erledigte Schritte einfach ab. Ein ruhiger Modus mit weniger Animationen und eine Einführung zum Anhören machen die Bedienung angenehm – besonders für Menschen, die von klarer Struktur profitieren, etwa im Autismus-Spektrum.',
                category: 'community', icon_emoji: '🗓️', accent: 'blue',
                version: '1.0.0', is_beta: false, status: 'live',
                live_url: 'https://tagesplaner-aut.pages.dev/',
                scope: 'Kostenlos • Läuft im Browser (Handy & Computer) • Ohne Anmeldung • Ohne Werbung',
                features: 'Eigener Ablauf für jeden Wochentag (Werktag & Wochenende getrennt)\nErinnerungen melden sich mit Bild, Text und Stimme\nKalender in Tages-, Wochen- und Monatsansicht\nEinträge per Fingertipp verschieben – Uhrzeiten passen sich an\nSchritte abhaken und Tagesfortschritt auf einen Blick\n„Jetzt"-Ansicht zeigt die aktuelle Aufgabe\nRuhiger Modus mit weniger Animationen (reizarm)\nEinfache Einrichtung beim ersten Start\nFür Vorlese-Programme (Screenreader) optimiert',
                whats_new: 'Die Testphase ist abgeschlossen. MeinPlan ist ab sofort frei nutzbar – dauerhaft kostenlos, ohne Anmeldung und ohne Werbung. Dein Feedback ist weiterhin willkommen und fließt in künftige Verbesserungen ein.',
                screenshots: [], rating_sum: 13, rating_count: 3, sort_order: 1,
                created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'app-spaziergang', slug: 'spaziergang-paten', name: 'Spaziergang-Paten',
                tagline: 'Gemeinsam gehen – gegen Einsamkeit.',
                description: 'Die App verbindet Menschen in der Nachbarschaft, die gerne gemeinsam spazieren gehen. Ein paar Klicks genügen, um eine Begleitung für den nächsten Spaziergang zu finden. Gut für die Gesundheit und gegen Einsamkeit.',
                category: 'health', icon_emoji: '🚶', accent: 'green',
                version: '1.2.0', is_beta: false, status: 'live',
                live_url: 'https://goodvibes-akz.pages.dev/',
                scope: 'Kostenlos • Ohne Anmeldung • Ohne Werbung • Mit Notfall-Knopf',
                features: 'Einfache Profilerstellung ohne E-Mail-Zwang\nUmkreisfilter für Spaziergänge in der Nähe\nBarrierefreie Oberfläche mit großer Schrift\nIntegrierter Notfall-Knopf für zusätzliche Sicherheit',
                whats_new: 'Stabile Version. Kleinere Verbesserungen bei der Lesbarkeit.',
                screenshots: [], rating_sum: 19, rating_count: 4, sort_order: 2,
                created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('gv_mock_apps', JSON.stringify(initialApps));
    }

    // 7. Community-Beiträge (Bewertungen, Wünsche, Fehler, Fragen)
    if (!localStorage.getItem('gv_mock_app_posts')) {
        const initialPosts = [
            {
                id: 'post-1', app_id: 'app-meinplan', type: 'review', rating: 5,
                title: 'Endlich einfach!',
                body: 'Ich finde die großen Symbole richtig gut. Meine Mutter kommt damit super zurecht, obwohl sie sonst mit Handys hadert. Weiter so!',
                author_name: 'Sonnige Libelle', avatar_seed: 'fun-emoji:SonnigeLibelle',
                device_id: 'seed-device-1', status: 'published', votes: 8, pinned: false,
                screenshot_url: null, code_snippet: null, admin_reply: null,
                created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'post-2', app_id: 'app-meinplan', type: 'feature', rating: null,
                title: 'Erinnerung per Ton',
                body: 'Könnte es einen sanften Ton geben, wenn eine Aufgabe ansteht? Ein leises Signal würde mir helfen, nichts zu vergessen.',
                author_name: 'Muntere Biene', avatar_seed: 'bottts:MuntereBiene',
                device_id: 'seed-device-2', status: 'published', votes: 21, pinned: false,
                screenshot_url: null, code_snippet: null,
                admin_reply: 'Danke für die Idee! Wir sammeln gerade Stimmen dafür – wenn genug Menschen das wichtig finden, bauen wir es ein.',
                created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'post-3', app_id: 'app-meinplan', type: 'bug', rating: null,
                title: 'Datum verrutscht am kleinen Handy',
                body: 'Auf meinem älteren Handy rutscht die Datumsanzeige manchmal aus dem Bild. Sonst läuft alles rund.',
                author_name: 'Kluge Feder', avatar_seed: 'shapes:KlugeFeder',
                device_id: 'seed-device-3', status: 'published', votes: 5, pinned: false,
                screenshot_url: null, code_snippet: null, admin_reply: null,
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'post-4', app_id: 'app-meinplan', type: 'question', rating: null,
                title: 'Funktioniert das auch ohne Internet?',
                body: 'Ich habe unterwegs oft kein Netz. Kann ich meinen Plan trotzdem sehen?',
                author_name: 'Ruhige Welle', avatar_seed: 'thumbs:RuhigeWelle',
                device_id: 'seed-device-4', status: 'published', votes: 2, pinned: false,
                screenshot_url: null, code_snippet: null,
                admin_reply: 'Ja! Dein Plan wird auf deinem Gerät gespeichert und ist auch ohne Internet sichtbar.',
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'post-5', app_id: 'app-spaziergang', type: 'review', rating: 5,
                title: 'Hat mir sehr geholfen',
                body: 'Ich habe eine nette Begleitung für meine Morgenrunde gefunden. Das tut gut.',
                author_name: 'Warme Brise', avatar_seed: 'fun-emoji:WarmeBrise',
                device_id: 'seed-device-5', status: 'published', votes: 6, pinned: false,
                screenshot_url: null, code_snippet: null, admin_reply: null,
                created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('gv_mock_app_posts', JSON.stringify(initialPosts));
    }

    // 8. Likes auf Community-Beiträge
    if (!localStorage.getItem('gv_mock_app_post_votes')) {
        localStorage.setItem('gv_mock_app_post_votes', JSON.stringify([]));
    }

    // 9. Antworten (Forum-Kommentare) auf Beiträge
    if (!localStorage.getItem('gv_mock_app_post_replies')) {
        const initialReplies = [
            {
                id: 'reply-1', post_id: 'post-2',
                body: 'Das würde ich auch nutzen! Bitte einbauen.',
                author_name: 'Flinke Amsel', avatar_seed: 'bottts:FlinkeAmsel',
                device_id: 'seed-device-9', status: 'published',
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('gv_mock_app_post_replies', JSON.stringify(initialReplies));
    }

    // 10. Blockierte Geräte (Moderation)
    if (!localStorage.getItem('gv_mock_blocked_devices')) {
        localStorage.setItem('gv_mock_blocked_devices', JSON.stringify([]));
    }
};

const createMockSupabase = () => {
    initMockDatabase();

    let authListeners = [];

    const triggerAuthChange = (event, session) => {
        authListeners.forEach(listener => listener(event, session));
    };

    return {
        auth: {
            async getSession() {
                const sessionStr = localStorage.getItem('gv_mock_admin_session');
                const session = sessionStr ? JSON.parse(sessionStr) : null;
                return { data: { session }, error: null };
            },
            onAuthStateChange(callback) {
                authListeners.push(callback);
                const sessionStr = localStorage.getItem('gv_mock_admin_session');
                const session = sessionStr ? JSON.parse(sessionStr) : null;
                callback('SIGNED_IN', session);

                return {
                    data: {
                        subscription: {
                            unsubscribe() {
                                authListeners = authListeners.filter(l => l !== callback);
                            }
                        }
                    }
                };
            },
            async signInWithPassword({ email, password }) {
                if (email === 'admin@goodvibes.org') {
                    const mockSession = {
                        user: { email, id: 'mock-admin-id' },
                        access_token: 'mock-token'
                    };
                    localStorage.setItem('gv_mock_admin_session', JSON.stringify(mockSession));
                    triggerAuthChange('SIGNED_IN', mockSession);
                    return { data: { session: mockSession }, error: null };
                }
                return { data: { session: null }, error: { message: 'Falsche E-Mail-Adresse oder Passwort.' } };
            },
            async signOut() {
                localStorage.removeItem('gv_mock_admin_session');
                triggerAuthChange('SIGNED_OUT', null);
                return { error: null };
            }
        },
        from(table) {
            const getStorageKey = (t) => {
                if (t === 'projects') return 'gv_mock_projects';
                if (t === 'project_updates') return 'gv_mock_project_updates';
                if (t === 'bug_reports') return 'gv_mock_bug_reports';
                if (t === 'bug_report_votes') return 'gv_mock_bug_report_votes';
                return `gv_mock_${t}`;
            };

            const getItems = () => {
                if (table === 'app_settings') {
                    const settings = JSON.parse(localStorage.getItem('gv_mock_app_settings') || '{}');
                    return Object.entries(settings).map(([key, value]) => ({ key, value }));
                }
                const key = getStorageKey(table);
                return JSON.parse(localStorage.getItem(key) || '[]');
            };

            const setItems = (items) => {
                if (table === 'app_settings') {
                    const settings = {};
                    items.forEach(item => {
                        settings[item.key] = item.value;
                    });
                    localStorage.setItem('gv_mock_app_settings', JSON.stringify(settings));
                    return;
                }
                const key = getStorageKey(table);
                localStorage.setItem(key, JSON.stringify(items));
            };

            let items = getItems();

            const queryBuilder = {
                select(fields = '*') {
                    return this;
                },
                eq(field, value) {
                    items = items.filter(item => item[field] === value);
                    return this;
                },
                in(field, valuesArray) {
                    items = items.filter(item => valuesArray.includes(item[field]));
                    return this;
                },
                order(field, { ascending = true } = {}) {
                    items.sort((a, b) => {
                        let valA = a[field];
                        let valB = b[field];
                        if (typeof valA === 'string') {
                            return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
                        }
                        return ascending ? valA - valB : valB - valA;
                    });
                    return this;
                },
                then(onfulfilled) {
                    onfulfilled({ data: items, error: null });
                    return Promise.resolve({ data: items, error: null });
                },
                async insert(data) {
                    const currentItems = getItems();
                    const newItems = Array.isArray(data) ? data : [data];
                    const processed = newItems.map(item => ({
                        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
                        created_at: new Date().toISOString(),
                        ...item
                    }));
                    setItems([...currentItems, ...processed]);
                    return { data: processed, error: null };
                },
                async update(data) {
                    const currentItems = getItems();
                    let updatedCount = 0;
                    const nextItems = currentItems.map(item => {
                        const isMatch = items.some(filteredItem => filteredItem.id === item.id || (filteredItem.key && filteredItem.key === item.key));
                        if (isMatch) {
                            updatedCount++;
                            return { ...item, ...data };
                        }
                        return item;
                    });
                    setItems(nextItems);
                    return { data: data, error: null, count: updatedCount };
                },
                async delete() {
                    const currentItems = getItems();
                    const nextItems = currentItems.filter(item => {
                        const isMatch = items.some(filteredItem => filteredItem.id === item.id || (filteredItem.device_id && filteredItem.device_id === item.device_id));
                        return !isMatch;
                    });
                    setItems(nextItems);
                    return { error: null };
                }
            };

            return queryBuilder;
        },
        async rpc(fn, args) {
            if (fn === 'increment_vote') {
                const projects = JSON.parse(localStorage.getItem('gv_mock_projects') || '[]');
                const nextProjects = projects.map(p => {
                    if (p.id === args.project_id) {
                        return { ...p, votes: (p.votes || 0) + 1 };
                    }
                    return p;
                });
                localStorage.setItem('gv_mock_projects', JSON.stringify(nextProjects));
                return { error: null };
            }
            return { error: { message: `Function ${fn} not implemented in mock.` } };
        }
    };
};

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockSupabase();

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);
