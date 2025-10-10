import path from 'path';

export const gameContractAdress: string = "kQDHrQ1lEfXRPYtUwhU1VysVr7C2uD6_bc0K15rAyYCoHtFa";
export const mnemonics: string = "inform method liar science undo net off jungle alarm clinic census wall business crisp will bind decrease action ranch state boy manual corn force";

// Пути к файлам данных
const DATA_DIR = path.join(__dirname, '../../data');

export const SEEDS_FILE = path.join(DATA_DIR, 'seeds.json');
export const PLAYER_DATA_FILE = path.join(DATA_DIR, 'playerData.json');
export const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
export const LAST_LT_FILE = path.join(DATA_DIR, 'last_lt.json');