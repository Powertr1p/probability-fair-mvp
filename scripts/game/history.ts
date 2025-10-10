import fs from 'fs';
import path from 'path';
import { HISTORY_FILE } from './constants';

export interface RoundHistory {
    nonce: number;
    serverSeedBOC: string;       // BOC для проверки в TonViewer
    nextServerSeedBOC: string;   // BOC следующего seed (commitment)
    roomSeedBOC: string;         // BOC room seed
    result: number;
    timestamp: string;
    players?: number;            // Количество игроков в комнате
}

export interface SessionHistory {
    anchor: string;
    sessionStart: string;
    rounds: RoundHistory[];
}

export function initHistory(anchor: string): void {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const session: SessionHistory = {
        anchor,
        sessionStart: new Date().toISOString(),
        rounds: []
    };

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(session, null, 2));
    console.log(`[History] Инициализирована новая сессия с якорем: ${anchor.slice(0, 16)}...`);
}

export function addRoundToHistory(round: RoundHistory): void {
    if (!fs.existsSync(HISTORY_FILE)) {
        throw new Error('[History] Файл истории не найден. Инициализируйте сессию сначала.');
    }

    const session: SessionHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    session.rounds.push(round);

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(session, null, 2));
    console.log(`[History] Добавлен раунд #${round.nonce}`);
}

export function getHistory(): SessionHistory {
    if (!fs.existsSync(HISTORY_FILE)) {
        throw new Error('[History] Файл истории не найден.');
    }

    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
}

export function getRound(nonce: number): RoundHistory | undefined {
    const history = getHistory();
    return history.rounds.find(r => r.nonce === nonce);
}

export function hasHistory(): boolean {
    return fs.existsSync(HISTORY_FILE);
}

export function clearHistory(): void {
    if (fs.existsSync(HISTORY_FILE)) {
        fs.unlinkSync(HISTORY_FILE);
        console.log('[History] История очищена');
    }
}
