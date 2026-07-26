// ==UserScript==
// @name         Chat Translator & Anti-Toxicity
// @description  Translate chat messages to UwU or auto-censor insults into polite phrases with /translator commands.
// @version      1.0
// @author       Antigravity
// ==/UserScript==

(function () {
    'use strict';

    // Persist mode using localStorage
    let currentMode = localStorage.getItem('chat-translator-mode') || 'off';

    const INSULTS_MAP = {
        "fdp": "aimable partenaire",
        "fils de pute": "fils d'une charmante dame",
        "ntm": "gros bisous à ta maman",
        "nique ta mere": "respecte ta maman",
        "nique ta maman": "respecte ta maman",
        "nique": "câline",
        "connard": "gentil compagnon",
        "connards": "gentils compagnons",
        "connasse": "personne fort sympathique",
        "con": "champion",
        "cons": "champions",
        "conne": "championne",
        "merde": "purée",
        "chier": "embêter",
        "noob": "joueur en plein apprentissage",
        "noobs": "joueurs en plein apprentissage",
        "trash": "futur talent",
        "useless": "plein de potentiel caché",
        "cancer": "petit rayon de soleil",
        "kys": "passe une excellente journée remplie de bonheur",
        "kms": "je t'adore",
        "diff": "très beau match équilibré",
        "ez": "bien joué, c'était un match très serré et agréable !",
        "easy": "très belle partie de votre part !",
        "tg": "s'il te plaît, écoute-moi attentivement",
        "ta gueule": "silence apaisant s'il vous plaît",
        "debile": "génie incompris",
        "idiot": "poète",
        "mongol": "personne extraordinaire",
        "pute": "gentille dame",
        "salope": "personne adorable",
        "worse": "meilleur",
        "worst": "assez original",
        "retard": "personne un peu distraite",
        "boosted": "très motivé",
        "tocard": "champion",
        "salop": "gentil garçon",
        "encule": "bisous à toi",
        "enculé": "bisous à toi",
        "pd": "mon cher ami",
        "gros porc": "gentil panda",
        "imbecile": "penseur créatif"
    };

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function replaceWord(text, searchWord, replacement) {
        const pattern = new RegExp('(?<=^|[^a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ])' + escapeRegExp(searchWord) + '(?=$|[^a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ])', 'gi');
        return text.replace(pattern, replacement);
    }

    function cleanMessage(text) {
        let result = text;
        const keys = Object.keys(INSULTS_MAP).sort((a, b) => b.length - a.length);
        for (const insult of keys) {
            result = replaceWord(result, insult, INSULTS_MAP[insult]);
        }
        return result;
    }

    function uwuMessage(text) {
        let uwuified = text
            .replace(/[rl]/g, 'w')
            .replace(/[RL]/g, 'W');
        
        uwuified = uwuified.split(' ').map(word => {
            if (word.length >= 3 && /^[a-zA-Z]/.test(word) && Math.random() < 0.15) {
                return `${word[0]}-${word}`;
            }
            return word;
        }).join(' ');

        uwuified = uwuified
            .replace(/!+/g, ' >w<!')
            .replace(/\?+/g, ' owo?');

        const suffixes = [" uwu", " owo", " nya~", " :3", " >w<", " ^-^", " rawr~"];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        uwuified += suffix;

        return uwuified;
    }

    function translateText(text) {
        if (currentMode === 'clean') {
            return cleanMessage(text);
        } else if (currentMode === 'uwu') {
            return uwuMessage(cleanMessage(text));
        }
        return text;
    }

    function sendToast(title, message) {
        fetch('/lol-notifications/v1/notifications', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                backgroundUrl: '',
                created: '',
                critical: false,
                data: {},
                detailKey: message,
                dismissible: true,
                expires: '',
                iconUrl: '/lol-game-data/assets/v1/profile-icons/29.jpg',
                id: Math.floor(Math.random() * 1000000),
                source: 'ChatTranslator',
                state: 'Toast',
                titleKey: title,
                type: 'toast'
            })
        }).catch(err => console.error('[ChatTranslator] Toast error:', err));
    }

    // Intercept Fetch requests
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
        let url = typeof input === 'string' ? input : input.url;
        if (url && url.includes('/lol-chat/v1/conversations/') && url.includes('/messages') && init && init.body) {
            try {
                const data = JSON.parse(init.body);
                if (data.body) {
                    const trimmed = data.body.trim();
                    if (trimmed.startsWith('/translator ')) {
                        const mode = trimmed.replace('/translator ', '').trim().toLowerCase();
                        handleCommand(mode);
                        return new Response(JSON.stringify({ id: "command", body: "Mode changed" }), { status: 200 });
                    }
                    
                    const newText = translateText(data.body);
                    if (newText !== data.body) {
                        data.body = newText;
                        init.body = JSON.stringify(data);
                    }
                }
            } catch (e) {
                console.error('[ChatTranslator] Fetch intercept error:', e);
            }
        }
        return originalFetch.apply(this, arguments);
    };

    // Intercept XMLHttpRequest requests
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
        if (body && typeof body === 'string') {
            const url = this._url || '';
            if (url.includes('/lol-chat/v1/conversations/') && url.includes('/messages')) {
                try {
                    const data = JSON.parse(body);
                    if (data.body) {
                        const trimmed = data.body.trim();
                        if (trimmed.startsWith('/translator ')) {
                            const mode = trimmed.replace('/translator ', '').trim().toLowerCase();
                            handleCommand(mode);
                            
                            Object.defineProperty(this, 'readyState', { writable: true, value: 4 });
                            Object.defineProperty(this, 'status', { writable: true, value: 200 });
                            Object.defineProperty(this, 'responseText', { writable: true, value: JSON.stringify({ id: "command", body: "Mode changed" }) });
                            if (this.onreadystatechange) this.onreadystatechange();
                            if (this.onload) this.onload();
                            return;
                        }
                        
                        const newText = translateText(data.body);
                        if (newText !== data.body) {
                            data.body = newText;
                            body = JSON.stringify(data);
                        }
                    }
                } catch (e) {
                    console.error('[ChatTranslator] XHR intercept error:', e);
                }
            }
        }
        return originalSend.call(this, body);
    };

    console.log('[ChatTranslator] Script loaded. Current mode: ' + currentMode);
})();
