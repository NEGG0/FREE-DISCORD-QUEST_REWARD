(async () => {
    "use strict";

    /* ── Автоочистка старых экземпляров ── */
    if (window.orionLock) {
        document.getElementById('orion-stop')?.click();
        document.querySelectorAll('#orion-ui, #orion-styles').forEach(e => e.remove());
        window.orionLock = false;
        await new Promise(r => setTimeout(r, 600));
    }
    window.orionLock = true;

    /* ── Конфигурация ── */
    const CONFIG = {
        NAME: "negg0s orion",
        VERSION: "v6.5-BURST-STEALTH",
        THEME: "#5865F2",
        SUCCESS: "#23a559",
        WARN: "#faa61a",
        ERR: "#f04747",
        HIDE_ACTIVITY: false,
        MAX_LOG_ITEMS: 60
    };

    const SYS = Object.freeze({
        MAX_TIME: 25 * 60 * 1000,
        HEARTBEAT_GRACE: 90 * 1000,
        MAX_TASK_FAILURES: 6,
        MAX_RETRIES: 4,
        IS_DESKTOP: typeof window.DiscordNative !== 'undefined'
    });

    const RUNTIME = {
        running: true,
        cleanups: new Set(),
        autoEnroll: true,
        autoClaim: false,
        playSound: false,
        randomDelay: false
    };

    const CONST = Object.freeze({
        ID: "1412491570820812933",
        EVT: Object.freeze({
            HEARTBEAT: "QUESTS_SEND_HEARTBEAT_SUCCESS",
            GAME: "RUNNING_GAMES_CHANGE",
            RPC: "LOCAL_ACTIVITY_UPDATE"
        })
    });

    const ICONS = Object.freeze({
        OPT: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.56 1.1c-.46.05-.7.53-.64.98.18 1.16-.19 2.2-.98 2.53-.8.33-1.79-.15-2.49-1.1-.27-.36-.78-.52-1.14-.24-.77.59-1.45 1.27-2.04 2.04-.28.36-.12.87.24 1.14.96.7 1.43 1.7 1.1 2.49-.33.8-1.37 1.16-2.53.98-.45-.07-.93.18-.99.64a11.1 11.1 0 0 0 0 2.88c.06.46.54.7.99.64 1.16-.18 2.2.19 2.53.98.33.8-.14 1.79-1.1 2.49-.36.27-.52.78-.24 1.14.59.77 1.27 1.45 2.04 2.04.36.28.87.12 1.14-.24.7-.95 1.7-1.43 2.49-1.1.8.33 1.16 1.37.98 2.53-.07.45.18.93.64.99a11.1 11.1 0 0 0 2.88 0c.46-.06.7-.54.64-.99-.18-1.16.19-2.2.98-2.53.8-.33 1.79.14 2.49 1.1.27.36.78.52 1.14.24.77-.59 1.45-1.27 2.04-2.04.28-.36.12-.87-.24-1.14-.96-.7-1.43-1.7-1.1-2.49.33-.8 1.37-1.16 2.53-.98.45.07.93-.18.99-.64a11.1 11.1 0 0 0 0-2.88c-.06-.46-.54-.7-.99-.64-1.16.18-2.2-.19-2.53-.98-.33-.8.14-1.79 1.1-2.49.36-.27.52-.78.24-1.14a11.07 11.07 0 0 0-2.04-2.04c-.36-.28-.87-.12-1.14.24-.7.96-1.7 1.43-2.49 1.1-.8-.33-1.16-1.37-.98-2.53.07-.45-.18-.93-.64-.99a11.1 11.1 0 0 0-2.88 0ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>`,
        BOLT: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.29-.62L14.5 3h1l-1 7h3.5c.58 0 .57.32.29.62L11 21z"/></svg>`,
        VIDEO: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`,
        GAME: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
        STREAM: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`,
        ACTIVITY: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>`,
        CHECK: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
        CLOCK: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
        STOP: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>`
    });

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const notExpired = q => { const e = new Date(q.config?.expiresAt ?? 0).getTime(); return Number.isNaN(e) || e > Date.now(); };
    const sealedFor = questId => { try { return Mods.QuestStore?.getQuest?.(questId)?.trafficMetadataSealed ?? null; } catch (_) { return null; } };

    const enrollmentBlockedUntil = () => {
        try {
            const raw = Mods.QuestStore?.questEnrollmentBlockedUntil;
            if (!raw) return null;
            const when = raw instanceof Date ? raw : new Date(raw);
            return Number.isNaN(when.getTime()) || when.getTime() <= Date.now() ? null : when;
        } catch (_) { return null; }
    };

    const buildStreamKey = () => {
        try {
            const ownerId = Mods.UserStore?.getCurrentUser?.()?.id;
            if (!ownerId) return null;
            const dm = Mods.ChanStore?.getSortedPrivateChannels()?.[0]?.id;
            if (dm) return `call:${dm}:${ownerId}`;
            for (const g of Object.values(Mods.GuildChanStore?.getAllGuilds() ?? {})) {
                const vc = g?.VOCAL?.[0]?.channel;
                const guildId = vc?.guild_id ?? g?.id;
                if (vc?.id && guildId) return `guild:${guildId}:${vc.id}:${ownerId}`;
            }
            return null;
        } catch (e) { return null; }
    };

    const ErrorHandler = {
        RETRYABLE: new Set([429, 500, 502, 503, 504, 408]),
        CLIENT_ERRORS: new Set([400, 403, 404, 409, 410]),
        classify(error) {
            const status = error?.status ?? error?.statusCode;
            return {
                isRetryable: this.RETRYABLE.has(status),
                isClientError: this.CLIENT_ERRORS.has(status),
                status,
                message: error?.message ?? error?.body?.message ?? `HTTP ${status ?? 'UNKNOWN'}`
            };
        },
        isSkippableQuest(error) { return error?.status === 404 || error?.status === 403 || error?.status === 410; }
    };

    /* ── UI и рендер ── */
    const Logger = {
        root: null, tasks: new Map(), tickerId: null, _hotkey: null,

        init() {
            const style = document.createElement('style');
            style.id = 'orion-styles';
            style.innerHTML = `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@700&display=swap');
                @keyframes slideIn { from { transform: translateY(-20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                @keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); margin: 0; padding: 0; height: 0; border: none; } }

                #orion-ui {
                    position: fixed; top: 40px; right: 40px; width: 420px; max-height: 85vh;
                    background: rgba(15, 15, 20, 0.88); backdrop-filter: blur(24px) saturate(150%);
                    color: #fff; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
                    font-family: 'Inter', sans-serif; overflow: hidden; animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    display: flex; flex-direction: column; box-sizing: border-box; user-select: none; z-index: 999999;
                }

                #orion-head {
                    padding: 16px 20px; background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
                    flex: 0 0 auto; display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.05); cursor: grab;
                }
                #orion-head.dragging { cursor: grabbing; }
                #orion-title { font-weight: 800; font-size: 18px; color: #fff; display: flex; align-items: center; gap: 10px; text-shadow: 0 2px 10px rgba(88,101,242,0.5); }
                #orion-title svg { color: #5865F2; filter: drop-shadow(0 0 5px #5865F2); }
                .dev-credit { font-size: 11px; font-weight: 600; color: #5865F2; background: rgba(88,101,242,0.15); padding: 2px 8px; border-radius: 6px; }

                #orion-controls { display: flex; gap: 8px; align-items: center; }
                .ctrl-btn { cursor: pointer; transition: 0.2s; display: flex; align-items: center; padding: 6px 12px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); font-size: 12px; font-weight: 700; color: #fff; }
                .ctrl-hide, .ctrl-opts { color: rgba(255,255,255,0.7); }
                .ctrl-hide:hover, .ctrl-opts:hover { background: rgba(255,255,255,0.1); color: #fff; transform: translateY(-1px); }
                .ctrl-stop { color: #ff5252; border-color: rgba(255,82,82,0.3); background: rgba(255,82,82,0.1); }
                .ctrl-stop:hover { background: #ff5252; color: #fff; box-shadow: 0 4px 15px rgba(255,82,82,0.4); transform: translateY(-1px); }

                #orion-logs { padding: 12px 16px; background: rgba(0,0,0,0.3); flex: 0 0 auto; font-family: 'JetBrains Mono', monospace; font-size: 11px; height: 110px; overflow-y: auto; border-top: 1px solid rgba(255,255,255,0.05); scroll-behavior: smooth; color: #a1a1aa; }
                .log-item { margin-bottom: 4px; display: flex; gap: 8px; line-height: 1.5; }
                .log-ts { opacity: 0.4; min-width: 55px; }
                .c-info { color: #60a5fa; } .c-success { color: #4ade80; } .c-err { color: #f87171; } .c-warn { color: #facc15; } .c-debug { color: #71717a; }

                #orion-body { flex: 1 1 auto; padding: 16px; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
                #orion-picker-form { display: flex; flex-direction: column; min-height: 0; }

                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 6px; }

                .native-cb { appearance: none; width: 22px; height: 22px; margin: 0; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.2); border-radius: 6px; background: rgba(0,0,0,0.2); cursor: pointer; transition: 0.2s; display: grid; place-content: center; }
                .native-cb::before { content: ''; width: 12px; height: 12px; opacity: 0; transition: 0.2s; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E"); background-size: contain; background-repeat: no-repeat; background-position: center; }
                .native-cb:checked { background: #5865F2; border-color: #5865F2; box-shadow: 0 0 10px rgba(88,101,242,0.5); }
                .native-cb:checked::before { opacity: 1; }

                .native-toggle { appearance: none; width: 40px; height: 22px; margin: 0; flex-shrink: 0; background: rgba(255,255,255,0.1); border-radius: 12px; cursor: pointer; position: relative; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
                .native-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3); transition: 0.3s; }
                .native-toggle:checked { background: #5865F2; border-color: #5865F2; box-shadow: 0 0 10px rgba(88,101,242,0.4); }
                .native-toggle:checked::after { transform: translateX(18px); }

                .task-card {
                    --state-color: #5865F2; --icon-bg-opacity: 0.15; --icon-color: var(--state-color);
                    display: flex; gap: 16px; padding: 16px; align-items: center;
                    background: rgba(255,255,255,0.03); border-radius: 14px; border: 1px solid rgba(255,255,255,0.05);
                    border-left: 4px solid var(--state-color); box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1); flex-shrink: 0;
                }
                .task-card:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); border-color: rgba(255,255,255,0.1); }
                .task-card.removing { animation: fadeOut 0.4s forwards; }
                .task-card.done { --state-color: #23a559; --icon-bg-opacity: 1; --icon-color: #fff; background: rgba(35, 165, 89, 0.05); }
                .task-card.failed { --state-color: #da373c; }
                .task-card.pending { --state-color: #f1c40f; }

                .task-icon { position: relative; width: 50px; height: 50px; border-radius: 50%; flex: 0 0 auto; background-color: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); }
                .task-card.running .task-icon::before { content: ''; position: absolute; inset: -2px; border-radius: 50%; z-index: 1; background: conic-gradient(var(--state-color) var(--p, 0%), rgba(255,255,255,0.05) var(--p, 0%)); -webkit-mask-image: radial-gradient(circle at center, transparent 22px, black 23px); }
                .task-icon-inner { z-index: 2; color: var(--icon-color); display: flex; transition: 0.2s; filter: drop-shadow(0 0 5px var(--icon-color)); }
                .task-card.running:hover .task-icon-inner { filter: blur(2px); opacity: 0.1; }
                .task-icon-overlay { position: absolute; inset: 0; z-index: 3; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 800; color: #fff; opacity: 0; transition: opacity 0.2s; pointer-events: none; text-shadow: 0 0 10px var(--state-color); }
                .task-card.running:hover .task-icon-overlay { opacity: 1; }

                .task-info { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 4px; justify-content: center; }
                .task-status { font-size: 11px; font-weight: 800; color: var(--state-color); text-transform: uppercase; letter-spacing: 1px; }
                .task-name { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .task-meta { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); display: flex; justify-content: space-between; }
                .task-actions { flex: 0 0 auto; display: flex; align-items: center; margin-left: 8px; }

                .claim-btn, .goto-btn { padding: 8px 14px; border: none; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; }
                .claim-btn { background: #23a559; box-shadow: 0 4px 15px rgba(35, 165, 89, 0.3); }
                .claim-btn:hover:not(:disabled) { background: #1e8f4c; transform: translateY(-2px); }
                .claim-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .claim-btn.failed { background: rgba(255,255,255,0.1); color: #fff; }
                .goto-btn { background: #5865F2; }
                .goto-btn:hover:not(:disabled) { background: #4752c4; transform: translateY(-2px); }

                .picker-section-title { font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; margin-top: 5px; }
                .reward-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
                .reward-filter, .type-filter { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s; color: #fff; }
                .reward-filter:hover, .type-filter:hover { background: rgba(255,255,255,0.1); }
                .reward-filter.off, .type-filter.off { background: transparent; opacity: 0.3; }

                .picker-quest-list { display: flex; flex-direction: column; gap: 10px; flex: 1 1 auto; min-height: 50px; overflow-y: auto; padding-right: 4px; }
                .quest-pick { display: flex; gap: 16px; padding: 14px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); border-left-width: 4px; cursor: pointer; transition: 0.2s; align-items: center; }
                .quest-pick:hover { background: rgba(255,255,255,0.06); transform: translateX(2px); }
                .quest-pick.hidden { display: none !important; }

                .picker-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .orion-option { background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05); }
                .orion-option-label { font-size: 12px; font-weight: 600; color: #fff; }

                .picker-actions { display: flex; gap: 12px; padding-top: 16px; }
                .quest-pick-btn { flex: 1; padding: 14px; border: none; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; color: #fff; }
                .quest-pick-btn.start { background: #5865F2; box-shadow: 0 4px 15px rgba(88,101,242,0.3); }
                .quest-pick-btn.start:hover:not(:disabled) { background: #4752c4; transform: translateY(-2px); }
                .quest-pick-btn.deselect { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
                .quest-pick-btn.deselect:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
                .quest-pick-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `;
            document.head.appendChild(style);

            this.root = document.createElement('div');
            this.root.id = 'orion-ui';
            this.root.innerHTML = `
                <div id="orion-head">
                    <div id="orion-title">
                        <div class="orion-logo-box">${ICONS.BOLT}</div>
                        <div>
                            <div>${CONFIG.NAME}</div>
                            <div class="dev-credit">${CONFIG.VERSION}</div>
                        </div>
                    </div>
                    <div id="orion-controls">
                        <span class="ctrl-btn ctrl-hide" id="orion-close">HIDE</span>
                        <span class="ctrl-btn ctrl-opts" id="orion-opts">${ICONS.OPT}</span>
                        <span class="ctrl-btn ctrl-stop" id="orion-stop">${ICONS.STOP} STOP</span>
                    </div>
                </div>
                <div id="orion-body"><div style="text-align:center; padding:30px; color:rgba(255,255,255,0.5); font-weight:600;">Initializing System...</div></div>
                <div id="orion-logs"></div>
            `;
            document.body.appendChild(this.root);

            const head = document.getElementById('orion-head');
            let isDragging = false, startX, startY, initialLeft, initialTop;

            head.addEventListener('mousedown', e => {
                if (e.target.closest('.ctrl-btn')) return;
                isDragging = true;
                const rect = this.root.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
                startX = e.clientX;
                startY = e.clientY;
                this.root.style.transition = 'none';

                const onMouseMove = ev => {
                    if (!isDragging) return;
                    this.root.style.left = `${initialLeft + (ev.clientX - startX)}px`;
                    this.root.style.top = `${initialTop + (ev.clientY - startY)}px`;
                    this.root.style.right = 'auto';
                };

                const onMouseUp = () => {
                    isDragging = false;
                    this.root.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });

            document.getElementById('orion-body').addEventListener('click', async (e) => {
                if (e.target.classList.contains('goto-btn')) {
                    if (Mods.Router) Mods.Router.transitionTo('/quest-home');
                    return;
                }

                if (e.target.classList.contains('claim-btn')) {
                    const btn = e.target;
                    if (btn.disabled) return;

                    const questId = btn.getAttribute('data-id');
                    const taskData = this.tasks.get(questId);
                    if (!taskData) return;

                    btn.innerText = "WAITING...";
                    btn.disabled = true;
                    btn.style.opacity = "0.5";

                    this.updateTask(questId, { ...taskData, claimState: 'WAITING' });

                    try {
                        const claimRes = await Tasks.claimReward(questId);
                        if (claimRes?.body?.claimed_at) {
                            btn.innerText = "CLAIMED!";
                            this.log(`[Claim] Reward for "${taskData.name}" claimed successfully!`, 'success');
                            this.updateTask(questId, { ...taskData, status: "CLAIMED", claimable: false, claimState: null });
                            setTimeout(() => this.removeTask(questId), 2000);
                        } else {
                            this.log(`[Claim] Reward for "${taskData.name}" wasn't confirmed. Claim it from Discord UI.`, 'warn');
                            this.updateTask(questId, { ...taskData, claimState: 'FAILED' });
                        }
                    } catch (err) {
                        this.log(`[Claim] Captcha challenge detected for "${taskData.name}".`, 'warn');
                        this.updateTask(questId, { ...taskData, claimState: 'FAILED' });
                    }
                }
            });

            document.getElementById('orion-close').onclick = () => this.toggle();
            document.getElementById('orion-stop').onclick = () => this.shutdown();

            this._hotkey = e => (e.key === '>' || (e.shiftKey && e.key === '.')) && this.toggle();
            document.addEventListener('keydown', this._hotkey);

            document.getElementById('orion-opts').addEventListener('click', () => {
                const panel = document.getElementById('orion-options-panel');
                if (!panel) return;
                const open = panel.style.display === 'none';
                panel.style.display = open ? 'block' : 'none';
                const list = document.getElementById('orion-quest-list');
                if (list) list.style.display = open ? 'none' : 'flex';
                const actions = document.querySelector('#orion-picker-form .picker-actions');
                if (actions) actions.style.display = open ? 'none' : 'flex';
            });

            this.startTicker();
        },

        toggle() {
            if (!this.root?.parentElement) return;
            this.root.style.display = this.root.style.display === 'none' ? 'flex' : 'none';
        },

        shutdown() {
            if (!RUNTIME.running) return;
            RUNTIME.running = false;
            this.log("[System] Stopping script & cleaning up...", "warn");

            if (this.tickerId) clearInterval(this.tickerId);
            if (this._hotkey) { document.removeEventListener('keydown', this._hotkey); this._hotkey = null; }

            for (const cleanupFn of RUNTIME.cleanups) {
                try { cleanupFn(); } catch (e) {}
            }
            RUNTIME.cleanups.clear();
            Patcher.clean();
            window.orionLock = false;

            this.root.style.opacity = '0';
            this.root.style.transform = 'translateY(-20px) scale(0.98)';
            setTimeout(() => {
                document.getElementById('orion-styles')?.remove();
                this.root?.remove();
            }, 400);
        },

        _getPct(t) {
            if (t.done) return 100;
            if (t.pending || t.failed || !t.max) return 0;
            return Math.min(100, (t.cur / t.max) * 100);
        },

        SERVER_DRIVEN: ["GAME", "STREAM"],

        startTicker() {
            if (this.tickerId) clearInterval(this.tickerId);
            this.tickerId = setInterval(() => {
                if (!RUNTIME.running) return clearInterval(this.tickerId);
                for (const [id, task] of this.tasks.entries()) {
                    if (task.status !== "RUNNING" || task.type === "ACHIEVEMENT") continue;

                    let cur;
                    if (this.SERVER_DRIVEN.includes(task.type)) {
                        if (task.serverAt == null) continue;
                        cur = Math.min(task.serverCur + (Date.now() - task.serverAt) / 1000, task.max);
                    } else {
                        cur = Math.min(task.cur, task.max);
                    }

                    let etaStr = "";
                    if (task.startTime && cur > 0 && cur < task.max) {
                        const elapsed = (Date.now() - task.startTime) / 1000;
                        const rate = cur / elapsed;
                        const remaining = Math.max(0, (task.max - cur) / (rate || 1));
                        const m = Math.floor(remaining / 60);
                        const s = Math.floor(remaining % 60);
                        etaStr = `ETA: ${m}m ${s}s`;
                    }

                    this.updateTask(id, { cur, eta: etaStr });
                }
            }, 1000);
        },

        updateTask(id, data) {
            const oldData = this.tasks.get(id);
            const isPending = data.status === "PENDING" || data.status === "QUEUE";
            const isDone = data.status === "COMPLETED" || data.status === "CLAIMED";
            const isFailed = data.status === "FAILED";

            const newData = { ...oldData, ...data, done: isDone, pending: isPending, failed: isFailed };

            if (newData.status === "RUNNING" && (!oldData || !oldData.startTime)) {
                newData.startTime = Date.now();
            }

            this.tasks.set(id, newData);

            if (oldData && oldData.status === newData.status && oldData.removing === newData.removing &&
                oldData.claimable === newData.claimable && oldData.claimState === newData.claimState &&
                oldData.actionRequired === newData.actionRequired) {

                const card = document.getElementById(`orion-task-${esc(id)}`);
                if (card) {
                    const pct = this._getPct(newData);
                    const iconContainer = card.querySelector('.task-icon');
                    if (iconContainer) iconContainer.style.setProperty('--p', `${pct}%`);

                    const overlay = card.querySelector('.task-icon-overlay');
                    if (overlay) overlay.textContent = `${Math.floor(pct)}%`;

                    const progressText = card.querySelector('.progress-text');
                    if (progressText) {
                        const unit = newData.type === 'ACHIEVEMENT' ? '' : 's';
                        progressText.textContent = `${Math.min(Math.floor(newData.cur), newData.max)} / ${newData.max}${unit}`;
                    }

                    const etaText = card.querySelector('.task-eta');
                    if (etaText && newData.eta && !newData.done && !newData.failed) {
                        etaText.textContent = newData.eta;
                    }
                    return;
                }
            }
            this.render();
        },

        removeTask(id) {
            if (this.tasks.has(id)) {
                this.tasks.get(id).removing = true;
                this.render();
                setTimeout(() => { this.tasks.delete(id); this.render(); }, 500);
            }
        },

        log(msg, type = 'info') {
            const colors = { info: "#5865F2", success: "#3BA55C", warn: "#faa61a", err: "#f04747", debug: "#999" };
            console.log(`%c[ORION] %c${msg}`, `color: ${CONFIG.THEME}; font-weight: bold;`, `color: ${colors[type] || colors.info}`);
            try {
                const box = document.getElementById('orion-logs');
                if (box && type !== 'debug') {
                    const el = document.createElement('div'); el.className = `log-item c-${type}`;
                    el.innerHTML = `<span class="log-ts">[${new Date().toLocaleTimeString().split(' ')[0]}]</span> <span>${esc(msg)}</span>`;
                    box.appendChild(el); box.scrollTop = box.scrollHeight;
                    while (box.children.length > CONFIG.MAX_LOG_ITEMS) box.firstChild.remove();
                }
            } catch (e) { console.debug('[Logger] DOM error:', e.message); }
        },

        render() {
            if (document.getElementById('orion-picker-form')) return;
            const body = document.getElementById('orion-body');
            if (!body) return;
            if (!this.tasks.size) return body.innerHTML = `<div style="text-align:center; padding:30px; color:rgba(255,255,255,0.4); font-weight:600;">Waiting for tasks...</div>`;

            const sorted = [...this.tasks.entries()].sort((a, b) => {
                const ta = a[1], tb = b[1];
                if (ta.done !== tb.done) return ta.done ? 1 : -1;
                if (ta.failed !== tb.failed) return ta.failed ? 1 : -1;
                if (ta.pending !== tb.pending) return ta.pending ? 1 : -1;
                if (!ta.done && !ta.pending && !tb.done && !tb.pending) {
                    const pctA = ta.max ? ta.cur / ta.max : 0;
                    const pctB = tb.max ? tb.cur / tb.max : 0;
                    return pctB - pctA;
                }
                return 0;
            });

            body.innerHTML = sorted.map(([id, t]) => {
                const pct = t.pending || t.failed ? 0 : Math.min(100, (t.cur / t.max) * 100).toFixed(1);
                const icon =
                    t.done ? ICONS.CHECK :
                    t.failed ? ICONS.STOP :
                    t.pending ? ICONS.CLOCK :
                    t.type === 'VIDEO' ? ICONS.VIDEO :
                    t.type === 'ACHIEVEMENT' ? ICONS.ACTIVITY :
                    t.type?.includes('GAME') ? ICONS.GAME :
                    t.type?.includes('STREAM') ? ICONS.STREAM :
                    ICONS.BOLT;

                let statusText = t.status === 'CLAIMED' ? 'CLAIMED' : t.done ? 'COMPLETED' : t.status;
                let progressLabel = t.pending ? 'In Queue' : t.failed ? 'Aborted' : 'Progress';
                const unit = t.type === 'ACHIEVEMENT' ? '' : 's';
                let actionBtn = '';

                if (t.claimable) {
                    if (t.claimState === 'WAITING') actionBtn = `<button class="claim-btn" disabled>WAITING...</button>`;
                    else if (t.claimState === 'FAILED') actionBtn = `<button class="claim-btn failed" disabled>ACTION REQUIRED</button>`;
                    else actionBtn = `<button class="claim-btn" data-id="${esc(id)}">CLAIM REWARD NOW</button>`;
                } else if (t.actionRequired === 'ENROLL') {
                    statusText = 'ACTION REQUIRED'; progressLabel = 'Accept quest in Discord';
                    actionBtn = `<button class="goto-btn">GO TO QUESTS</button>`;
                } else if (t.type === 'ACHIEVEMENT' && t.status === 'RUNNING') {
                    statusText = 'ACTION REQUIRED'; progressLabel = 'Please, complete manually';
                    actionBtn = `<button class="goto-btn">GO TO QUESTS</button>`;
                }

                const stateClass = t.done ? 'done' : t.failed ? 'failed' : t.pending ? 'pending' : 'running';
                const removingClass = t.removing ? 'removing' : '';

                let taskMetaHtml = '';
                if (!t.done) {
                    taskMetaHtml = `
                    <div class="task-meta">
                        <span class="task-eta" style="color:#5865F2;">${t.eta && !t.pending && !t.failed ? t.eta : progressLabel}</span>
                        ${actionBtn ? '' : `<span class="progress-text">${Math.min(Math.floor(t.cur), t.max)} / ${t.max}${unit}</span>`}
                    </div>`;
                }

                return `
                <div id="orion-task-${esc(id)}" class="task-card ${stateClass} ${removingClass}">
                    <div class="task-icon" style="--p: ${pct}%">
                        <div class="task-icon-inner">${icon}</div>
                        ${stateClass === 'running' ? `<div class="task-icon-overlay">${Math.floor(pct)}%</div>` : ''}
                    </div>
                    <div class="task-info">
                        <div class="task-status">${statusText}</div>
                        <div class="task-name" title="${esc(t.name)}">${esc(t.name)}</div>
                        ${taskMetaHtml}
                    </div>
                    ${actionBtn ? `<div class="task-actions">${actionBtn}</div>` : ''}
                </div>`;
            }).join('');
        },

        showQuestPicker(quests) {
            return new Promise((resolve) => {
                const body = document.getElementById('orion-body');
                const logs = document.getElementById('orion-logs');

                const closePicker = (data) => {
                    if (logs) logs.style.display = 'block';
                    if (body) { body.classList.remove('picker-mode'); body.innerHTML = ''; }
                    resolve(data);
                };

                if (!body) return closePicker({ selectedQuests: new Set(), autoEnroll: false, autoClaim: false, playSound: false });
                if (logs) logs.style.display = 'none';

                const items = [];
                const rewardTypes = new Map();
                const questTypes = new Set();

                const REWARD_META = { 1: { label: "IN-GAME", color: "#e67e22" }, 3: { label: "AVATAR DECORATION", color: "#a358f2" }, 4: { label: "ORBS", color: "#5865F2" } };
                const REWARD_FALLBACK = { label: "OTHER", color: "#949ba4" };

                quests.forEach(q => {
                    const cfg = q.config?.taskConfig ?? q.config?.taskConfigV2;
                    if (!cfg?.tasks) return;

                    const typeData = Tasks.detectType(cfg, q.config?.application?.id);
                    if (!typeData) return;
                    if (!SYS.IS_DESKTOP && (typeData.type === 'GAME' || typeData.type === 'STREAM')) return;

                    const rw = q.config?.rewardsConfig?.rewards?.[0];
                    const rewardType = rw?.type ?? 0;
                    const rewardText = rw?.messages?.name ?? "Unknown Reward";

                    const meta = REWARD_META[rewardType] ?? REWARD_FALLBACK;
                    const displayType = typeData.type === 'WATCH_VIDEO' ? 'VIDEO' : typeData.type;
                    questTypes.add(displayType);

                    if (!rewardTypes.has(rewardType)) {
                        rewardTypes.set(rewardType, { label: meta.label, count: 0, type: rewardType, color: meta.color });
                    }
                    rewardTypes.get(rewardType).count++;

                    items.push({
                        id: q.id, name: q.config?.messages?.questName ?? "Unknown Quest",
                        type: displayType, rewardType, rewardText, color: meta.color
                    });
                });

                if (!items.length) return closePicker({ selectedQuests: new Set(), autoEnroll: false, autoClaim: false, playSound: false });

                const buildCard = (q) => `
                    <label class="quest-pick" data-rt="${q.rewardType}" data-qt="${q.type}" style="border-left-color: ${q.color};">
                        <input type="checkbox" name="quests" value="${q.id}" class="native-cb" checked>
                        <div class="task-info">
                            <div class="task-name" title="${esc(q.name)}">${esc(q.name)}</div>
                            <div class="task-meta" style="justify-content: flex-start; gap: 8px;">
                                <span style="text-transform: uppercase; color: rgba(255,255,255,0.4);">${esc(q.type)}</span>
                                <span style="color: ${q.color};">${esc(q.rewardText)}</span>
                            </div>
                        </div>
                    </label>`;

                const buildToggle = (name, label, isChecked) => `
                    <div class="orion-option">
                        <span class="orion-option-label">${label}</span>
                        <input type="checkbox" name="${name}" class="native-toggle" ${isChecked ? 'checked' : ''}>
                    </div>`;

                body.innerHTML = `
                    <form id="orion-picker-form">
                        <div id="orion-options-panel" style="display:none;">
                            ${rewardTypes.size > 1 ? `
                                <div class="picker-section-title">Filter By Reward</div>
                                <div class="reward-filters">
                                    ${[...rewardTypes.values()].map(rt => `<button type="button" class="reward-filter" data-rt="${rt.type}" style="color: ${rt.color}; border-color: ${rt.color};">${rt.label} (${rt.count})</button>`).join('')}
                                </div>
                            ` : ''}
                            ${questTypes.size > 1 ? `
                                <div class="picker-section-title">Filter By Type</div>
                                <div class="reward-filters">
                                    ${[...questTypes].map(t => `<button type="button" class="type-filter" data-qt="${t}">${t}</button>`).join('')}
                                </div>
                            ` : ''}
                            <div class="picker-section-title">Options</div>
                            <div class="picker-options">
                                ${buildToggle('autoEnroll', 'Auto-enroll in quests', RUNTIME.autoEnroll)}
                                ${buildToggle('autoClaim', 'Auto-claim rewards', RUNTIME.autoClaim)}
                                ${buildToggle('playSound', 'Sound on completion', RUNTIME.playSound)}
                                ${buildToggle('randomDelay', 'Random 1-30min delay', RUNTIME.randomDelay)}
                            </div>
                        </div>

                        <div id="orion-quest-list" class="picker-quest-list">${items.map(buildCard).join('')}
                            <div id="orion-no-quests" style="display: none; margin: auto; text-align: center; color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                                No quests available
                            </div>
                        </div>

                        <div class="picker-actions">
                            <button type="button" class="quest-pick-btn deselect" id="select-all-btn">DESELECT ALL</button>
                            <button type="submit" class="quest-pick-btn start" id="start-btn">${ICONS.BOLT} <span id="start-btn-text">START (${items.length})</span></button>
                        </div>
                    </form>`;

                const form = document.getElementById('orion-picker-form');
                const selectAllBtn = document.getElementById('select-all-btn');
                const startBtn = document.getElementById('start-btn');

                const getVisibleCheckboxes = () => Array.from(form.querySelectorAll('.quest-pick input[type="checkbox"]'))
                    .filter(cb => !cb.closest('.quest-pick').classList.contains('hidden'));

                const syncUI = () => {
                    const visibleCbs = getVisibleCheckboxes();
                    const totalChecked = visibleCbs.filter(cb => cb.checked).length;
                    const startBtnText = document.getElementById('start-btn-text');
                    if (startBtnText) startBtnText.textContent = `START (${totalChecked})`;
                    startBtn.disabled = totalChecked === 0;

                    if (visibleCbs.length === 0) {
                        selectAllBtn.disabled = true;
                        selectAllBtn.textContent = 'SELECT ALL';
                    } else {
                        selectAllBtn.disabled = false;
                        selectAllBtn.textContent = visibleCbs.every(cb => cb.checked) ? 'DESELECT ALL' : 'SELECT ALL';
                    }

                    const noQuestsMsg = document.getElementById('orion-no-quests');
                    if (noQuestsMsg) {
                        noQuestsMsg.style.display = visibleCbs.length === 0 ? 'block' : 'none';
                    }
                };

                form.addEventListener('change', (e) => { if (e.target.name === 'quests') syncUI(); });

                const activeRewards = new Set([...rewardTypes.keys()].map(String));
                const activeTypes = new Set([...questTypes]);

                const applyFilters = () => {
                    form.querySelectorAll('.quest-pick').forEach(el => {
                        const rt = el.getAttribute('data-rt');
                        const qt = el.getAttribute('data-qt');
                        el.classList.toggle('hidden', !(activeRewards.has(rt) && activeTypes.has(qt)));
                    });
                    syncUI();
                };

                const FILTER_KINDS = [
                    { cls: 'reward-filter', attr: 'data-rt', set: activeRewards },
                    { cls: 'type-filter', attr: 'data-qt', set: activeTypes }
                ];

                form.addEventListener('click', (e) => {
                    const kind = FILTER_KINDS.find(k => e.target.classList.contains(k.cls));
                    if (kind) {
                        e.preventDefault();
                        const value = e.target.getAttribute(kind.attr);
                        e.target.classList.toggle('off');
                        if (e.target.classList.contains('off')) kind.set.delete(value);
                        else kind.set.add(value);
                        applyFilters();
                        return;
                    }

                    if (e.target.id === 'select-all-btn') {
                        e.preventDefault();
                        const visibleCbs = getVisibleCheckboxes();
                        if (visibleCbs.length === 0) return;
                        const shouldCheck = !visibleCbs.every(cb => cb.checked);
                        visibleCbs.forEach(cb => { cb.checked = shouldCheck; });
                        syncUI();
                    }
                });

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const selected = getVisibleCheckboxes().filter(cb => cb.checked);
                    if (selected.length === 0) return;

                    const data = new FormData(form);
                    closePicker({
                        selectedQuests: new Set(selected.map(cb => cb.value)),
                        autoEnroll: data.has('autoEnroll'),
                        autoClaim: data.has('autoClaim'),
                        playSound: data.has('playSound'),
                        randomDelay: data.has('randomDelay')
                    });
                });

                body.classList.add('picker-mode');
                syncUI();
            });
        }
    };

    /* ── Сверхбыстрый Stealth-трафик (до 5 запросов/сек) ── */
    const Traffic = {
        queue: [], activeSlots: 0, MAX_BURST: 5,

        async enqueue(url, body) {
            if (!RUNTIME.running) return Promise.reject(new Error("Stopped"));
            return new Promise((resolve, reject) => {
                this.queue.push({ url, body, resolve, reject, attempts: 0 });
                this.process();
            });
        },

        async process() {
            if (this.queue.length === 0 || !RUNTIME.running) return;

            while (this.activeSlots < this.MAX_BURST && this.queue.length > 0 && RUNTIME.running) {
                this.activeSlots++;
                const req = this.queue.shift();

                (async () => {
                    try {
                        const res = await Mods.API.post({ url: req.url, body: req.body });
                        req.resolve(res);
                    } catch (e) {
                        const err = ErrorHandler.classify(e);
                        if (err.isRetryable && req.attempts < SYS.MAX_RETRIES) {
                            req.attempts++;
                            const delay = (e.body?.retry_after ?? Math.pow(1.5, req.attempts)) * 1000;
                            Logger.log(`[Stealth-Backoff] Ожидание ${(delay / 1000).toFixed(1)}с (HTTP ${err.status})`, 'warn');
                            setTimeout(() => {
                                if (RUNTIME.running) {
                                    this.queue.unshift(req);
                                    this.process();
                                } else req.reject(new Error('Shutdown'));
                            }, delay + rnd(100, 300));
                        } else {
                            req.reject(e);
                        }
                    } finally {
                        this.activeSlots--;
                        // Джиттер 150-250 мс для скрытия от Cloudflare
                        await sleep(rnd(150, 250));
                        this.process();
                    }
                })();
            }
        }
    };

    /* ── Мульти-инжект процессов ── */
    let Mods = {};
    const Patcher = {
        games: [], real: {}, active: false,
        savedShowCurrentGame: null, _unhide: null,

        PATCHED: ['getRunningGames', 'getGameForPID', 'getVisibleGame', 'getVisibleRunningGames',
                  'getRunningDiscordApplicationIds', 'getCandidateGames'],

        init(Store) {
            if (!Store) return;
            this.real = {};
            for (const name of this.PATCHED) {
                if (typeof Store[name] === 'function') this.real[name] = Store[name];
            }
        },

        toggle(on) {
            const S = Mods.RunStore;
            const real = this.real;

            if (on && !this.active) {
                S.getRunningGames = () => [...real.getRunningGames.call(S), ...this.games];
                S.getGameForPID = (pid) => this.games.find(g => g.pid === pid) || real.getGameForPID.call(S, pid);
                if (real.getVisibleGame) S.getVisibleGame = () => this.games[0] ?? real.getVisibleGame.call(S);
                if (real.getVisibleRunningGames) S.getVisibleRunningGames = () => [...real.getVisibleRunningGames.call(S), ...this.games];
                if (real.getCandidateGames) S.getCandidateGames = () => [...real.getCandidateGames.call(S), ...this.games];
                if (real.getRunningDiscordApplicationIds) {
                    S.getRunningDiscordApplicationIds = () => {
                        const ids = real.getRunningDiscordApplicationIds.call(S);
                        const ours = this.games.map(g => String(g.id));
                        return ids instanceof Set ? new Set([...ids, ...ours]) : [...(ids ?? []), ...ours];
                    };
                }
                this.active = true;
            } else if (!on && this.active) {
                for (const [name, fn] of Object.entries(real)) S[name] = fn;
                this.active = false;
            }
        },

        syncPresenceSuppression() {
            const setting = Mods.ShowCurrentGame;
            const shouldSuppress = CONFIG.HIDE_ACTIVITY && this.games.length > 0;
            if (!setting) return;

            if (shouldSuppress && this.savedShowCurrentGame === null) {
                try {
                    this.savedShowCurrentGame = setting.getSetting() !== false;
                    if (this.savedShowCurrentGame) {
                        Promise.resolve(setting.updateSetting(false)).catch(() => {});
                        this._unhide = () => { try { setting.updateSetting(true); } catch (_) { } };
                        window.addEventListener('pagehide', this._unhide);
                    }
                } catch (e) { this.savedShowCurrentGame = null; }
            } else if (!shouldSuppress && this.savedShowCurrentGame !== null) {
                const restore = this.savedShowCurrentGame;
                this.savedShowCurrentGame = null;
                if (this._unhide) { window.removeEventListener('pagehide', this._unhide); this._unhide = null; }
                if (restore) {
                    try { Promise.resolve(setting.updateSetting(true)).catch(() => {}); } catch (e) {}
                }
            }
        },

        add(g) {
            if (this.games.some(x => x.pid === g.pid)) return;
            this.games.push(g);
            this.toggle(true);
            this.syncPresenceSuppression();
            this.dispatch([g], []);
            this.rpc(g);
        },

        remove(g) {
            const before = this.games.length;
            this.games = this.games.filter(x => x.pid !== g.pid);
            if (this.games.length === before) return;

            this.dispatch([], [g]);
            this.syncPresenceSuppression();
            if (!this.games.length) {
                this.toggle(false);
                this.rpc(null);
            } else {
                this.rpc(this.games[0]);
            }
        },

        dispatch(added, removed) {
            Mods.Dispatcher?.dispatch({
                type: CONST.EVT.GAME,
                added,
                removed,
                games: Mods.RunStore.getRunningGames()
            });
        },

        rpc(g) {
            if (CONFIG.HIDE_ACTIVITY && g) return;
            try {
                Mods.Dispatcher?.dispatch({
                    type: CONST.EVT.RPC,
                    socketId: null,
                    pid: g ? g.pid : 9999,
                    activity: g ? {
                        application_id: g.id,
                        name: g.name,
                        type: 0,
                        details: null,
                        state: null,
                        timestamps: { start: g.start },
                        icon: g.icon,
                        assets: null
                    } : null
                });
            } catch (e) {}
        },

        clean() {
            this.games = [];
            this.toggle(false);
            this.syncPresenceSuppression();
            this.rpc(null);
        }
    };

    /* ── Обработчики задач ── */
    const Tasks = {
        skipped: new Set(),
        _streamReal: undefined,
        _streamSpoofs: 0,

        readProgress(userStatus, key) {
            const p = userStatus?.progress;
            const entry = p instanceof Map ? p.get(key) : p?.[key];
            return entry?.value ?? userStatus?.streamProgressSeconds ?? 0;
        },

        sanitize(name) { return name.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, " "); },

        appIdFor(cfg, keyName, legacyAppId) {
            return cfg?.tasks?.[keyName]?.applications?.[0]?.id ?? legacyAppId ?? null;
        },

        detectType(cfg, applicationId) {
            const taskKeys = Object.keys(cfg.tasks);
            const typeMap = [
                { match: k => k === "ACHIEVEMENT_IN_ACTIVITY", type: "ACHIEVEMENT" },
                { match: k => k === "PLAY_ACTIVITY", type: "ACTIVITY" },
                { match: k => k.startsWith("STREAM"), type: "STREAM" },
                { match: k => k.includes("VIDEO"), type: "WATCH_VIDEO" },
                { match: k => k.startsWith("PLAY"), type: "GAME" },
                { match: k => k.includes("ACTIVITY"), type: "ACTIVITY" }
            ];

            for (const { match, type } of typeMap) {
                const keyName = taskKeys.find(match);
                if (keyName) {
                    return {
                        type, keyName,
                        target: cfg.tasks[keyName]?.target ?? 0,
                        appId: this.appIdFor(cfg, keyName, applicationId)
                    };
                }
            }

            if (applicationId) {
                return {
                    type: "GAME", keyName: "PLAY_ON_DESKTOP",
                    target: cfg.tasks[taskKeys[0]]?.target ?? 0,
                    appId: applicationId
                };
            }
            return null;
        },

        async fetchGameData(appId, appName) {
            try {
                const res = await Mods.API.get({ url: `/applications/public?application_ids=${appId}` });
                const appData = res?.body?.[0];
                const exeEntry = appData?.executables?.find(x => x.os === "win32");
                const rawExe = exeEntry ? exeEntry.name.replace(">", "") : `${this.sanitize(appName)}.exe`;
                const cleanName = this.sanitize(appData?.name || appName);

                return {
                    name: appData?.name || appName,
                    icon: appData?.icon,
                    exeName: rawExe,
                    cmdLine: `C:\\Program Files\\${cleanName}\\${rawExe}`,
                    exePath: `c:/program files/${cleanName.toLowerCase()}/${rawExe}`,
                    id: appId
                };
            } catch (e) {
                const cleanName = this.sanitize(appName);
                const safeExe = `${cleanName.replace(/\s+/g, "")}.exe`;
                return {
                    name: appName, exeName: safeExe,
                    cmdLine: `C:\\Program Files\\${cleanName}\\${safeExe}`,
                    exePath: `c:/program files/${cleanName.toLowerCase()}/${safeExe}`,
                    id: appId
                };
            }
        },

        async claimReward(questId) {
            return await Mods.API.post({
                url: `/quests/${questId}/claim-reward`,
                body: { platform: 0, location: 11, is_targeted: false, metadata_sealed: null, traffic_metadata_sealed: sealedFor(questId) }
            });
        },

        failTask(q, t, reason) {
            const currentProgress = Logger.tasks.get(q.id)?.cur ?? 0;
            Logger.updateTask(q.id, { name: t.name, type: t.type, cur: currentProgress, max: t.target, status: "FAILED" });
            Logger.log(`[Task] Aborted "${t.name}": ${reason}`, 'err');
            Tasks.skipped.add(q.id);
            setTimeout(() => Logger.removeTask(q.id), 2000);
        },

        /* ── Быстрый прогресс видео ── */
        async VIDEO(q, t, s) {
            let cur = s?.progress?.[t.keyName]?.value ?? s?.progress?.[t.type]?.value ?? 0;
            let failCount = 0;

            Logger.updateTask(q.id, { name: t.name, type: "VIDEO", cur, max: t.target, status: "RUNNING" });

            const startTime = Date.now();
            let calls = 0;

            while (cur < t.target && RUNTIME.running) {
                const delayMs = rnd(1200, 1600);
                await sleep(delayMs);

                // Шаг 20–25 секунд за тик с джиттером
                const elapsedSec = (delayMs / 1000) + rnd(19, 24) + (Math.random() * 0.08 - 0.04);
                cur += elapsedSec;
                const payloadTs = Number(Math.min(t.target, cur).toFixed(6));

                try {
                    const r = await Traffic.enqueue(`/quests/${q.id}/video-progress`, { timestamp: payloadTs });
                    calls++;
                    const serverVal = r?.body?.progress?.[t.keyName]?.value ?? r?.body?.progress?.WATCH_VIDEO?.value;
                    if (serverVal > cur) cur = Math.min(t.target, serverVal);
                    if (r?.body?.completed_at) break;
                    failCount = 0;
                } catch (e) {
                    failCount++;
                    const err = ErrorHandler.classify(e);
                    if (err.isClientError) {
                        Logger.log(`[Task] Video quest unavailable (HTTP ${err.status}). Skipping.`, 'warn');
                        return Tasks.failTask(q, t, `Client Error ${err.status}`);
                    }
                    if (failCount >= SYS.MAX_TASK_FAILURES) {
                        return Tasks.failTask(q, t, 'Too many network failures');
                    }
                }

                Logger.updateTask(q.id, { name: t.name, type: "VIDEO", cur: Math.min(cur, t.target), max: t.target, status: "RUNNING" });

                if (Date.now() - startTime > SYS.MAX_TIME) {
                    return Tasks.failTask(q, t, 'Timeout exceeded');
                }
            }
            if (RUNTIME.running) {
                Logger.log(`[Task] VIDEO "${t.name}" completed in ${calls} bursts!`, 'success');
                Tasks.finish(q, t);
            }
        },

        GAME(q, t, s) { return Tasks.generic(q, t, "GAME", "PLAY_ON_DESKTOP", s); },
        STREAM(q, t, s) { return Tasks.generic(q, t, "STREAM", "STREAM_ON_DESKTOP", s); },

        async generic(q, t, type, fallbackKey, s) {
            if (!RUNTIME.running) return;
            const key = t.keyName || fallbackKey;
            const gameData = await this.fetchGameData(t.appId, t.name);

            if (!RUNTIME.running) return;

            return new Promise(resolve => {
                const pid = rnd(2500, 12500) * 4;
                const game = {
                    id: gameData.id, name: gameData.name, icon: gameData.icon,
                    pid, pidPath: [pid], processName: gameData.name, start: Date.now(),
                    exeName: gameData.exeName, exePath: gameData.exePath, cmdLine: gameData.cmdLine,
                    executables: [{ os: 'win32', name: gameData.exeName, is_launcher: false }],
                    windowHandle: 0, fullscreenType: 0, overlay: true, sandboxed: false,
                    hidden: false, isLauncher: false
                };

                let cleanupHook; let cleaned = false; let safetyTimer; let watchdogTimer; let beats = 0;

                if (type === "STREAM") {
                    if (Mods.StreamStore) {
                        if (Tasks._streamSpoofs === 0) Tasks._streamReal = Mods.StreamStore.getStreamerActiveStreamMetadata;
                        Tasks._streamSpoofs++;
                        Mods.StreamStore.getStreamerActiveStreamMetadata = () => ({ id: gameData.id, pid, sourceName: gameData.name });
                    }
                    cleanupHook = () => {
                        if (Mods.StreamStore && Tasks._streamSpoofs > 0 && --Tasks._streamSpoofs === 0) {
                            Mods.StreamStore.getStreamerActiveStreamMetadata = Tasks._streamReal;
                        }
                    };
                } else {
                    Patcher.add(game);
                    cleanupHook = () => Patcher.remove(game);
                }

                const seeded = Tasks.readProgress(s, key);
                Logger.updateTask(q.id, { name: t.name, type, cur: seeded, max: t.target, status: "RUNNING" });
                Logger.log(`[Task] Injected ${type}: ${gameData.name}`, 'info');

                const finish = () => {
                    if (cleaned) return;
                    cleaned = true;
                    clearTimeout(safetyTimer); clearTimeout(watchdogTimer);
                    try { cleanupHook(); } catch (e) {}
                    try { Mods.Dispatcher?.unsubscribe(CONST.EVT.HEARTBEAT, check); } catch (e) {}
                    RUNTIME.cleanups.delete(abort);
                };

                const abort = () => { finish(); resolve(); };

                safetyTimer = setTimeout(() => {
                    if (RUNTIME.running) Tasks.failTask(q, t, 'Timeout exceeded (25m)');
                    finish(); resolve();
                }, SYS.MAX_TIME);

                const armWatchdog = () => {
                    clearTimeout(watchdogTimer);
                    watchdogTimer = setTimeout(() => {
                        if (cleaned || !RUNTIME.running) return;
                        Tasks.failTask(q, t, 'No heartbeat from Discord');
                        finish(); resolve();
                    }, SYS.HEARTBEAT_GRACE);
                };
                armWatchdog();

                const check = (d) => {
                    if (!RUNTIME.running) { finish(); resolve(); return; }
                    if (d?.questId !== q.id) return;

                    beats++;
                    armWatchdog();
                    const prog = Tasks.readProgress(d.userStatus, key);
                    Logger.updateTask(q.id, {
                        name: t.name, type, cur: prog, max: t.target, status: "RUNNING",
                        serverCur: prog, serverAt: Date.now()
                    });

                    if (prog >= t.target) {
                        finish();
                        Tasks.finish(q, t);
                        resolve();
                    }
                };

                Mods.Dispatcher?.subscribe(CONST.EVT.HEARTBEAT, check);
                RUNTIME.cleanups.add(abort);
            });
        },

        _relayUrl: 'http://127.0.0.1:43210',
        _relayProbe: null,
        _relayProbeAt: 0,
        RELAY_PROBE_TTL: 60000,

        _probeRelay() {
            if (this._relayProbe && Date.now() - this._relayProbeAt < this.RELAY_PROBE_TTL) return this._relayProbe;
            this._relayProbeAt = Date.now();
            return this._relayProbe = (async () => {
                try {
                    const r = await Promise.race([
                        fetch(`${this._relayUrl}/health`, { method: 'GET', redirect: 'error' }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('probe timeout')), 800))
                    ]);
                    if (!RUNTIME.running) return false;
                    return r.ok;
                } catch (_) { return false; }
            })();
        },

        async _bypassPost(url, headers, jsonBody) {
            const relayAvailable = await this._probeRelay();
            if (!RUNTIME.running) throw new Error('Shutdown');
            if (relayAvailable) {
                let r;
                try {
                    r = await fetch(`${this._relayUrl}/proxy`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url, headers, body: jsonBody }), redirect: 'error'
                    });
                    if (!RUNTIME.running) throw new Error('Shutdown');
                } catch (e) {
                    if (!RUNTIME.running) throw e;
                    this._relayProbe = null;
                }
                if (r) {
                    if (!r.ok) {
                        const body = await r.text();
                        if (!RUNTIME.running) throw new Error('Shutdown');
                        throw { status: r.status, body };
                    }
                    const result = await r.json();
                    if (!RUNTIME.running) throw new Error('Shutdown');
                    if (!result.ok) throw { status: result.status, body: result.body };
                    return result;
                }
            }

            try {
                const helper = window.VencordNative?.pluginHelpers?.OrionQuests;
                if (helper) {
                    const u = new URL(url);
                    const appId = u.hostname.split('.')[0];
                    const questId = headers['X-Discord-Quest-ID'];
                    const referrer = headers['Referer'];
                    if (u.pathname.endsWith('/acf/authorize')) {
                        const { code } = JSON.parse(jsonBody);
                        const r = await helper.discordsaysAuthorize({ appId, questId, authCode: code, referrer });
                        if (!RUNTIME.running) throw new Error('Shutdown');
                        if (!r.ok) throw { status: r.status, body: r.body };
                        return { ok: true, status: r.status, body: r.body };
                    }
                    if (u.pathname.endsWith('/acf/quest/progress')) {
                        const { progress } = JSON.parse(jsonBody);
                        const token = headers['X-Auth-Token'];
                        const r = await helper.discordsaysProgress({ appId, questId, token, target: progress, referrer });
                        if (!RUNTIME.running) throw new Error('Shutdown');
                        if (!r.ok) throw { status: r.status, body: r.body };
                        return { ok: true, status: r.status, body: r.body };
                    }
                }
            } catch (e) {
                if (!RUNTIME.running) throw e;
                if (e?.status) throw e;
            }

            const dn = window.DiscordNative;
            if (dn) {
                const probes = [ () => dn.http?.makeRequest, () => dn.app?.makeRequest ];
                for (const probe of probes) {
                    if (!RUNTIME.running) throw new Error('Shutdown');
                    try {
                        const fn = probe();
                        if (typeof fn === 'function') {
                            const r = await fn.call(dn, { method: 'POST', url, headers, body: jsonBody });
                            if (!RUNTIME.running) throw new Error('Shutdown');
                            if (r && (r.status || r.statusCode)) {
                                const status = r.status ?? r.statusCode;
                                return { ok: status >= 200 && status < 300, status, body: r.body ?? r.responseText ?? '' };
                            }
                        }
                    } catch (e) { if (!RUNTIME.running) throw e; }
                }
            }

            if (!RUNTIME.running) throw new Error('Shutdown');
            const res = await fetch(url, { method: 'POST', headers, body: jsonBody, redirect: 'error' });
            if (!RUNTIME.running) throw new Error('Shutdown');
            const body = await res.text();
            if (!RUNTIME.running) throw new Error('Shutdown');
            if (!res.ok) throw { status: res.status, body };
            return { ok: true, status: res.status, body };
        },

        async bypassAchievement(q, t) {
            const appId = t.appId || q.config?.application?.id;
            let reason = null;
            if (!appId) { reason = 'no application id'; return { ok: false, reason }; }
            if (!/^\d+$/.test(String(appId))) { reason = 'non-numeric appId'; return { ok: false, reason }; }

            let preGrantIds;
            try {
                const before = await Mods.API.get({ url: '/oauth2/tokens' });
                if (!RUNTIME.running) return { ok: false, reason };
                preGrantIds = new Set((before?.body || []).filter(tk => tk.application?.id === appId).map(tk => tk.id));
            } catch (e) {
                if (!RUNTIME.running) return { ok: false, reason };
                return { ok: false, reason };
            }

            try {
                let appName = null;
                try {
                    const a = await Mods.API.get({ url: `/applications/public?application_ids=${appId}` });
                    if (!RUNTIME.running) return { ok: false, reason };
                    appName = a?.body?.[0]?.name ?? null;
                } catch (_) { if (!RUNTIME.running) return { ok: false, reason }; }

                const consented = await Consent.ask(appId, appName);
                if (!RUNTIME.running) return { ok: false, reason };
                if (!consented) return { ok: false, reason };

                const authRes = await Mods.API.post({
                    url: '/oauth2/authorize',
                    query: { response_type: 'code', client_id: appId, scope: 'identify applications.commands applications.entitlements' },
                    body: { permissions: '0', authorize: true, integration_type: 1, location_context: { guild_id: '10000', channel_id: '10000', channel_type: 10000 } }
                });
                if (!RUNTIME.running) return { ok: false, reason };
                const location = authRes?.body?.location;
                if (!location) throw new Error('no location in /oauth2/authorize');
                const authCode = new URL(location).searchParams.get('code');
                if (!authCode) throw new Error('no code in authorize');

                const ticketRes = await Mods.API.post({ url: `/applications/${appId}/proxy-tickets`, body: {} });
                if (!RUNTIME.running) return { ok: false, reason };
                const proxyTicket = ticketRes?.body?.ticket;
                if (!proxyTicket) throw new Error('no proxy ticket');

                const referrer = `https://${appId}.discordsays.com/?instance_id=example-cl-instance&platform=desktop&discord_proxy_ticket=${encodeURIComponent(proxyTicket)}`;

                const dsAuthRes = await Tasks._bypassPost(
                    `https://${appId}.discordsays.com/.proxy/acf/authorize`,
                    { 'Content-Type': 'application/json', 'X-Auth-Token': '', 'X-Discord-Quest-ID': q.id, 'Referer': referrer },
                    JSON.stringify({ code: authCode })
                );
                if (!RUNTIME.running) return { ok: false, reason };
                let dsToken;
                try { dsToken = JSON.parse(dsAuthRes.body)?.token; }
                catch { throw new Error('discordsays non-JSON'); }
                if (!dsToken) throw new Error('no discordsays token');

                await Tasks._bypassPost(
                    `https://${appId}.discordsays.com/.proxy/acf/quest/progress`,
                    { 'Content-Type': 'application/json', 'X-Auth-Token': dsToken, 'X-Discord-Quest-ID': q.id, 'Referer': referrer },
                    JSON.stringify({ progress: t.target })
                );
                if (!RUNTIME.running) return { ok: false, reason };

                Logger.log(`[Bypass] Success. "${t.name}" completed via Discord Says.`, 'success');
                return { ok: true, reason: null };
            } catch (e) {
                if (!RUNTIME.running) return { ok: false, reason };
                const code = e?.body?.code;
                if (code === 50165) return { ok: false, reason: 'age-gated/delisted' };
                return { ok: false, reason: 'bypass failed' };
            } finally {
                if (preGrantIds) {
                    try {
                        const after = await Mods.API.get({ url: '/oauth2/tokens' });
                        const ours = (after?.body || []).filter(tk => tk.application?.id === appId && !preGrantIds.has(tk.id));
                        for (const g of ours) await Mods.API.del({ url: `/oauth2/tokens/${g.id}` });
                    } catch (e) {}
                }
            }
        },

        async ACHIEVEMENT(q, t) {
            Logger.updateTask(q.id, { name: t.name, type: "ACHIEVEMENT", cur: 0, max: t.target, status: "RUNNING" });
            const key = buildStreamKey();

            if (key) {
                const beat = { stream_key: key, application_id: String(t.appId || ''), terminal: false };
                let cur = 0; let failCount = 0;

                while (cur < t.target && RUNTIME.running) {
                    try {
                        const r = await Traffic.enqueue(`/quests/${q.id}/heartbeat`, beat);
                        if (!RUNTIME.running) return;
                        cur = r?.body?.progress?.[t.keyName]?.value ?? r?.body?.progress?.ACHIEVEMENT_IN_ACTIVITY?.value ?? cur;
                        Logger.updateTask(q.id, { name: t.name, type: "ACHIEVEMENT", cur, max: t.target, status: "RUNNING" });
                        failCount = 0;

                        if (cur >= t.target) {
                            try { await Traffic.enqueue(`/quests/${q.id}/heartbeat`, { ...beat, terminal: true }); } catch (_) { }
                            break;
                        }
                    } catch (e) {
                        if (!RUNTIME.running) return;
                        failCount++;
                        const err = ErrorHandler.classify(e);
                        if (err.isClientError || failCount >= SYS.MAX_TASK_FAILURES) break;
                    }
                    await sleep(rnd(6000, 9000));
                }
                if (cur >= t.target && RUNTIME.running) return Tasks.finish(q, t);
            }

            if (!RUNTIME.running) return;
            const bypass = await Tasks.bypassAchievement(q, t);
            if (!RUNTIME.running) return;
            if (bypass.ok) return Tasks.finish(q, t);

            return Tasks.failTask(q, t, bypass.reason ?? 'no auto-completion path worked');
        },

        async ACTIVITY(q, t) {
            const key = buildStreamKey();
            if (!key) return Tasks.failTask(q, t, 'No voice channel found');

            const beat = { stream_key: key, application_id: String(t.appId || ''), terminal: false };
            let cur = 0; let failCount = 0; let stalledBeats = 0;
            Logger.updateTask(q.id, { name: t.name, type: "ACTIVITY", cur, max: t.target, status: "RUNNING" });
            const startTime = Date.now();

            while (cur < t.target && RUNTIME.running) {
                try {
                    const r = await Traffic.enqueue(`/quests/${q.id}/heartbeat`, beat);
                    const reported = r?.body?.progress?.[t.keyName]?.value ?? r?.body?.progress?.PLAY_ACTIVITY?.value;
                    if (typeof reported === 'number') { cur = reported; stalledBeats = 0; }
                    else if (++stalledBeats >= SYS.MAX_TASK_FAILURES) return Tasks.failTask(q, t, 'Discord credited no progress');
                    Logger.updateTask(q.id, { name: t.name, type: "ACTIVITY", cur, max: t.target, status: "RUNNING" });
                    failCount = 0;
                    if (cur >= t.target) {
                        try { await Traffic.enqueue(`/quests/${q.id}/heartbeat`, { ...beat, terminal: true }); } catch (e) {}
                        break;
                    }
                } catch (e) {
                    failCount++;
                    const err = ErrorHandler.classify(e);
                    if (err.isClientError) return Tasks.failTask(q, t, `Client Error`);
                    if (failCount >= SYS.MAX_TASK_FAILURES) return Tasks.failTask(q, t, 'Too many network failures');
                }
                if (Date.now() - startTime > SYS.MAX_TIME) return Tasks.failTask(q, t, 'Timeout exceeded');
                await sleep(rnd(8000, 12000));
            }
            if (RUNTIME.running && cur >= t.target) Tasks.finish(q, t);
        },

        async finish(q, t) {
            Logger.updateTask(q.id, { name: t.name, type: t.type, cur: t.target, max: t.target, status: "COMPLETED" });
            Logger.log(`[Task] Completed "${t.name}"!`, 'success');
            Sound.play('tick');

            if (RUNTIME.autoClaim) {
                try {
                    await sleep(rnd(1000, 2000));
                    if (!RUNTIME.running) return;
                    const claimRes = await this.claimReward(q.id);
                    if (claimRes?.body?.claimed_at) {
                        Logger.log(`[Claim] Reward for "${t.name}" claimed automatically!`, 'success');
                        Logger.updateTask(q.id, { name: t.name, type: t.type, cur: t.target, max: t.target, status: "CLAIMED" });
                        setTimeout(() => Logger.removeTask(q.id), 2000);
                        return;
                    }
                } catch (e) {
                    Logger.log(`[Claim] Auto-claim challenged for "${t.name}". Use UI button.`, 'warn');
                }
            }

            Logger.updateTask(q.id, { name: t.name, type: t.type, cur: t.target, max: t.target, status: "COMPLETED", claimable: true, questId: q.id });
        }
    };

    /* ── Webpack Loader ── */
    function findShowCurrentGameSetting(moduleCache) {
        if (!moduleCache) return undefined;
        let actions, delay, BoolValue;
        for (const m of Object.values(moduleCache)) {
            try {
                const exp = m?.exports;
                if (!exp || typeof exp !== 'object') continue;
                for (const key of Object.keys(exp)) {
                    const p = exp[key];
                    if (!p) continue;
                    if (!BoolValue && typeof p.create === 'function' && String(p.typeName ?? '').includes('Bool')) BoolValue = p;
                    if (!actions && typeof p.updateAsync === 'function' && (p.ProtoClass?.typeName?.endsWith('.PreloadedUserSettings') || p.type === 1)) {
                        actions = p; delay = exp.UserSettingsDelay?.INFREQUENT_USER_ACTION ?? 0;
                    }
                }
                if (actions && BoolValue) break;
            } catch {}
        }
        if (!actions) return undefined;
        return {
            getSetting: () => actions.getCurrentValue?.()?.status?.showCurrentGame?.value,
            updateSetting: value => actions.updateAsync('status', settings => {
                if (settings.showCurrentGame && typeof settings.showCurrentGame.value === 'boolean') {
                    settings.showCurrentGame.value = value;
                } else if (BoolValue) {
                    settings.showCurrentGame = BoolValue.create({ value });
                } else { throw new Error('BoolValue not found'); }
            }, delay)
        };
    }

    function loadModules() {
        try {
            if (typeof window.Vencord !== 'undefined' && window.Vencord.Webpack) {
                Logger.log('[System] Vencord API connected.', 'info');
                const W = window.Vencord.Webpack;

                let routerModule;
                try {
                    const m = W.findByCode('transitionTo -');
                    if (m) {
                        for (const prop of [m, m.default, ...Object.values(m)]) {
                            if (typeof prop === 'function' && prop.toString().includes('transitionTo -')) {
                                routerModule = { transitionTo: prop }; break;
                            }
                        }
                    }
                } catch (e) {}

                Mods = {
                    QuestStore: W.findStore('QuestStore') || W.findStore('QuestsStore'),
                    RunStore: W.findStore('RunningGameStore'),
                    StreamStore: W.findStore('ApplicationStreamingStore'),
                    ChanStore: W.findStore('ChannelStore'),
                    GuildChanStore: W.findStore('GuildChannelStore'),
                    UserStore: W.findStore('UserStore'),
                    Dispatcher: W.Common?.FluxDispatcher || W.findByProps('dispatch', 'subscribe', 'flushWaitQueue'),
                    API: W.Common?.RestAPI || W.findByProps('get', 'post', 'del'),
                    Router: routerModule,
                    ShowCurrentGame: findShowCurrentGameSetting(W.cache || W.wreq?.c)
                };

                const required = ['QuestStore', 'API', 'Dispatcher', 'RunStore'];
                const missing = required.filter(k => !Mods[k]);

                if (missing.length === 0) {
                    Patcher.init(Mods.RunStore);
                    return true;
                }
            }

            if (typeof webpackChunkdiscord_app === 'undefined') throw new Error("Webpack chunk not found");

            let req;
            webpackChunkdiscord_app.push([[Symbol()], {}, (r) => {
                const cur = Object.keys(req?.c || {}).length;
                const incoming = Object.keys(r?.c || {}).length;
                if (incoming > cur) req = r;
            }]);
            webpackChunkdiscord_app.pop();

            if (!req?.c) throw new Error("Module registry not available");
            const modules = Object.values(req.c);

            function findStore(storeName) {
                for (const m of modules) {
                    try {
                        const exp = m?.exports;
                        if (!exp || typeof exp !== 'object') continue;
                        for (const key of Object.keys(exp)) {
                            const prop = exp[key];
                            if (prop && typeof prop === 'object' && prop.__proto__?.constructor?.displayName === storeName) return prop;
                        }
                    } catch {}
                }
                return undefined;
            }

            function findDispatcher() {
                for (const m of modules) {
                    try {
                        const exp = m?.exports;
                        if (!exp || typeof exp !== 'object') continue;
                        for (const key of Object.keys(exp)) {
                            const prop = exp[key];
                            if (prop && prop._subscriptions && typeof prop.subscribe === 'function' && typeof prop.dispatch === 'function') return prop;
                        }
                    } catch {}
                }
                return undefined;
            }

            function findAPI() {
                for (const m of modules) {
                    try {
                        const exp = m?.exports;
                        if (!exp || typeof exp !== 'object') continue;
                        for (const key of Object.keys(exp)) {
                            const prop = exp[key];
                            if (prop && typeof prop.get === 'function' && typeof prop.post === 'function' && typeof prop.del === 'function') return prop;
                        }
                    } catch {}
                }
                return undefined;
            }

            function findRouter() {
                for (const m of modules) {
                    try {
                        const exp = m?.exports;
                        if (!exp) continue;
                        for (const prop of [exp, exp.default, ...Object.values(exp)]) {
                            if (typeof prop === 'function' && prop.toString().includes('transitionTo -')) return { transitionTo: prop };
                        }
                    } catch {}
                }
                return undefined;
            }

            Mods = {
                QuestStore: findStore('QuestStore'),
                RunStore: findStore('RunningGameStore'),
                StreamStore: findStore('ApplicationStreamingStore'),
                ChanStore: findStore('ChannelStore'),
                GuildChanStore: findStore('GuildChannelStore'),
                UserStore: findStore('UserStore'),
                Dispatcher: findDispatcher(),
                API: findAPI(),
                Router: findRouter(),
                ShowCurrentGame: findShowCurrentGameSetting(req.c)
            };

            const required = ['QuestStore', 'API', 'Dispatcher', 'RunStore'];
            const missing = required.filter(k => !Mods[k]);
            if (missing.length > 0) throw new Error(`Core modules missing: ${missing.join(', ')}`);
            Patcher.init(Mods.RunStore);
            return true;
        } catch (e) {
            Logger.log(`[System] Module load error: ${e.message ?? e}`, 'err');
            return false;
        }
    }

    /* ── Параллельное исполнение задач ── */
    async function runConcurrent(tasks, limit) {
        const executing = new Set();
        for (const task of tasks) {
            if (!RUNTIME.running) break;
            const p = task().finally(() => executing.delete(p));
            executing.add(p);
            await sleep(rnd(250, 450));
            if (executing.size >= limit) { await Promise.race(executing); }
        }
        return Promise.allSettled(executing);
    }

    async function main() {
        Logger.init();
        if (!loadModules()) return Logger.log('[System] Failed to connect to Discord Webpack.', 'err');

        const getQuests = () => {
            const q = Mods.QuestStore.quests;
            return q instanceof Map ? [...q.values()] : Object.values(q);
        };

        let quests = getQuests().filter(q =>
            !q.userStatus?.completedAt && notExpired(q) && q.id !== CONST.ID && !Tasks.skipped.has(q.id)
        );

        if (!quests.length) {
            Logger.log('[System] All available quests are completed!', 'success');
            return Logger.shutdown();
        }

        const pickerResult = await Logger.showQuestPicker(quests);
        if (!RUNTIME.running) return;

        RUNTIME.autoEnroll = pickerResult.autoEnroll;
        RUNTIME.autoClaim = pickerResult.autoClaim;
        RUNTIME.playSound = pickerResult.playSound;
        RUNTIME.randomDelay = pickerResult.randomDelay;

        if (pickerResult.selectedQuests.size === 0) {
            Logger.log('[System] No quests selected. Shutting down.', 'info');
            return Logger.shutdown();
        }

        let loopCount = 1;

        while (RUNTIME.running) {
            try {
                Logger.log(`[Cycle] Processing loop #${loopCount}...`, 'info');

                const blockedUntil = enrollmentBlockedUntil();
                if (blockedUntil) {
                    Logger.log(`[System] Quest enrollment blocked until ${blockedUntil.toLocaleString()}.`, 'err');
                    break;
                }

                quests = getQuests();
                const active = quests.filter(q =>
                    pickerResult.selectedQuests.has(q.id) && !q.userStatus?.completedAt && notExpired(q) && q.id !== CONST.ID && !Tasks.skipped.has(q.id)
                );

                if (!active.length) {
                    Logger.log('[System] All selected quests completed!', 'success');
                    Sound.play('done');
                    break;
                }

                const queues = { video: [], game: [] };

                active.forEach(q => {
                    try {
                        const cfg = q.config?.taskConfig ?? q.config?.taskConfigV2;
                        if (!cfg?.tasks || typeof cfg.tasks !== 'object') return;

                        const typeData = Tasks.detectType(cfg, q.config?.application?.id);
                        if (!typeData) return;
                        if (!SYS.IS_DESKTOP && (typeData.type === 'GAME' || typeData.type === 'STREAM')) return;

                        const { type, keyName, target, appId } = typeData;
                        if (target <= 0) return;
                        if ((type === 'GAME' || type === 'STREAM') && !appId) {
                            Tasks.skipped.add(q.id); return;
                        }

                        const tInfo = { id: q.id, appId: appId ?? 0, name: q.config?.messages?.questName ?? "Quest", target, type, keyName };

                        if (!q.userStatus?.enrolledAt && !RUNTIME.autoEnroll) {
                            Logger.updateTask(tInfo.id, { name: tInfo.name, type: tInfo.type, cur: 0, max: tInfo.target, status: "PENDING", actionRequired: 'ENROLL' });
                            return;
                        }

                        if (Logger.tasks.has(q.id) && Logger.tasks.get(q.id).status === "RUNNING") return;

                        Logger.updateTask(tInfo.id, { name: tInfo.name, type: tInfo.type, cur: 0, max: tInfo.target, status: "QUEUE", actionRequired: null });

                        const taskFunc = async () => {
                            if (!q.userStatus?.enrolledAt) {
                                Logger.log(`[Enroll] Accepting: ${tInfo.name}`, 'info');
                                try {
                                    await Traffic.enqueue(`/quests/${q.id}/enroll`, { location: 11, is_targeted: false, metadata_sealed: null, traffic_metadata_sealed: sealedFor(q.id) });
                                    await sleep(rnd(200, 400));
                                } catch (e) {
                                    const err = ErrorHandler.classify(e);
                                    if (ErrorHandler.isSkippableQuest(e)) Tasks.skipped.add(q.id);
                                    return Tasks.failTask(q, tInfo, `Enrollment failed`);
                                }
                            }

                            if (type === "WATCH_VIDEO") return Tasks.VIDEO(q, tInfo, q.userStatus);
                            if (type === "ACHIEVEMENT") return Tasks.ACHIEVEMENT(q, tInfo);
                            const runner = type === "STREAM" ? Tasks.STREAM : (type === "ACTIVITY" ? Tasks.ACTIVITY : Tasks.GAME);
                            return runner(q, tInfo, q.userStatus);
                        };

                        if (type === "WATCH_VIDEO") queues.video.push(taskFunc);
                        else queues.game.push(taskFunc);
                    } catch (e) {}
                });

                const totalTasks = queues.video.length + queues.game.length;

                if (totalTasks > 0) {
                    Logger.log(`[Parallel] Running: ${queues.video.length} videos, ${queues.game.length} games.`, 'info');
                    // До 5 игр и 5 видео одновременно
                    const pGames = runConcurrent(queues.game, 5);
                    const pVideos = runConcurrent(queues.video, 5);
                    await Promise.all([pGames, pVideos]);
                } else {
                    if (active.length === 0) break;
                    else await sleep(rnd(1500, 2500));
                }

                if (!RUNTIME.running) break;
                await sleep(rnd(800, 1500));
                loopCount++;

            } catch (cycleError) {
                Logger.log(`[Cycle] Error: ${cycleError?.message ?? cycleError}`, 'err');
                await sleep(1500);
                loopCount++;
            }
        }

        const hasUnclaimed = [...Logger.tasks.values()].some(t => t.claimable && !t.removing);
        if (hasUnclaimed) {
            Logger.log('[System] Tasks finished. Claim your rewards in UI, then click STOP.', 'info');
            return;
        }

        Logger.shutdown();
    }

    main().catch(e => {
        const msg = e?.message ?? e?.toString?.() ?? "Fatal error";
        console.error('[Orion Fatal]', e);
        try { Logger.log(`[System] FATAL: ${msg}`, 'err'); } catch (_) { }
        Logger.shutdown();
        setTimeout(() => { window.orionLock = false; }, 1500);
    });
})();
