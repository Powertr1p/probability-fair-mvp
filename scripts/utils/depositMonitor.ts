import { Address } from "@ton/ton";
import { sharedClient } from "../game/tonClient";
import { gameContractAdress, PLAYER_DATA_FILE, LAST_LT_FILE } from "../game/constants";
import fs from 'fs';
import path from 'path';

interface LastLT {
    lt: string;
    hash: string;
}

interface PlayerData {
    [address: string]: {
        balance: string;
        totalDeposited: string;
        lastDepositTime: string;
        depositCount: number;
    };
}

function saveLastLT(lt: bigint, hash: string) {
    const dir = path.dirname(LAST_LT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(LAST_LT_FILE, JSON.stringify({ 
        lt: lt.toString(), 
        hash 
    }, null, 2));
    
    console.log(`[Monitor] Сохранен последний lt: ${lt}`);
}

function loadLastLT(): LastLT | null {
    if (!fs.existsSync(LAST_LT_FILE)) {
        console.log(`[Monitor] Файл last_lt.json не найден, начинаем с начала`);
        return null;
    }
    
    const data = JSON.parse(fs.readFileSync(LAST_LT_FILE, 'utf-8'));
    console.log(`[Monitor] Загружен последний lt: ${data.lt}`);
    return data;
}

function loadPlayerData(): PlayerData {
    if (!fs.existsSync(PLAYER_DATA_FILE)) {
        console.log(`[Monitor] Файл playerData.json не найден, создаем новый`);
        return {};
    }
    
    return JSON.parse(fs.readFileSync(PLAYER_DATA_FILE, 'utf-8'));
}

function savePlayerData(data: PlayerData) {
    const dir = path.dirname(PLAYER_DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(PLAYER_DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`[Monitor] Данные игроков сохранены`);
}

export function updatePlayerBalance(address: string, amount: bigint) {
    const playerData = loadPlayerData();
    
    if (!playerData[address]) {
        playerData[address] = {
            balance: "0",
            totalDeposited: "0",
            lastDepositTime: new Date().toISOString(),
            depositCount: 0
        };
    }
    
    const currentBalance = BigInt(playerData[address].balance);
    const currentTotal = BigInt(playerData[address].totalDeposited);
    
    playerData[address].balance = (currentBalance + amount).toString();
    playerData[address].totalDeposited = (currentTotal + amount).toString();
    playerData[address].lastDepositTime = new Date().toISOString();
    playerData[address].depositCount += 1;
    
    savePlayerData(playerData);
    
    const newBalance = currentBalance + amount;
    
    console.log(`💰 Обновлен баланс игрока ${address.slice(0, 8)}...`);
    console.log(`   Депозит: ${formatTON(amount)} TON`);
    console.log(`   Новый баланс: ${formatTON(newBalance)} TON`);
    console.log(`   Всего депозитов: ${playerData[address].depositCount}`);
}

export async function checkForNewDeposits(): Promise<number> {
    try {
        const contract = Address.parse(gameContractAdress);
        const lastLT = loadLastLT();
        
        const transactions = lastLT 
            ? await sharedClient.getTransactions(contract, {
                limit: 100,
                lt: lastLT.lt,
                hash: lastLT.hash
              })
            : await sharedClient.getTransactions(contract, { limit: 100 });
        
        if (transactions.length === 0) {
            return 0;
        }
        
        let newDepositsCount = 0;
        let lastProcessedLT: bigint | null = null;
        let lastProcessedHash: string | null = null;
        
        for (const tx of transactions) {
            if (lastProcessedLT === null) {
                lastProcessedLT = tx.lt;
                lastProcessedHash = tx.hash().toString('base64');
            }
            
            if (tx.outMessages && tx.outMessages.size > 0) {
                for (const outMsg of tx.outMessages.values()) {
                    if (outMsg.info.type === 'external-out') {
                        try {
                            const body = outMsg.body.beginParse();
                            const op = body.loadUint(32);
                            
                            if (op === 0x7362d09c) {
                                const playerAddress = body.loadAddress();
                                const amount = body.loadCoins();
                                const timestamp = body.loadUint(32);
                                
                                console.log(`\n💰 Обнаружен депозит (event)!`);
                                console.log(`   От: ${playerAddress.toString().slice(0, 10)}...${playerAddress.toString().slice(-6)}`);
                                console.log(`   Сумма: ${formatTON(amount)} TON`);
                                console.log(`   Время: ${new Date(timestamp * 1000).toLocaleString()}`);
                                
                                updatePlayerBalance(playerAddress.toString(), amount);
                                newDepositsCount++;
                            }
                            
                            if (op === 0x85007c9f) {
                                const playerAddress = body.loadAddress();
                                const amount = body.loadCoins();
                                const timestamp = body.loadUint(32);
                                
                                console.log(`\n💸 Обнаружен вывод (event)!`);
                                console.log(`   Кому: ${playerAddress.toString().slice(0, 10)}...${playerAddress.toString().slice(-6)}`);
                                console.log(`   Сумма: ${formatTON(amount)} TON`);
                            }
                        } catch (e) {}
                    }
                }
            }
        }
        
        if (lastProcessedLT !== null && lastProcessedHash !== null) {
            saveLastLT(lastProcessedLT, lastProcessedHash);
        }
        
        return newDepositsCount;
        
    } catch (error) {
        console.error(`❌ Ошибка при проверке депозитов:`, error);
        return 0;
    }
}

function formatTON(nanoTON: bigint): string {
    const ton = Number(nanoTON) / 1_000_000_000;
    return ton.toFixed(4);
}

export function getPlayerBalance(address: string): bigint {
    const playerData = loadPlayerData();
    
    if (!playerData[address]) {
        return 0n;
    }
    
    return BigInt(playerData[address].balance);
}

export function deductPlayerBalance(address: string, amount: bigint): boolean {
    const playerData = loadPlayerData();
    
    if (!playerData[address]) {
        console.log(`[Monitor] Игрок ${address.slice(0, 8)}... не найден`);
        return false;
    }
    
    const currentBalance = BigInt(playerData[address].balance);
    
    if (currentBalance < amount) {
        console.log(`[Monitor] Недостаточно средств у ${address.slice(0, 8)}...`);
        console.log(`[Monitor] Баланс: ${currentBalance}, требуется: ${amount}`);
        return false;
    }
    
    playerData[address].balance = (currentBalance - amount).toString();
    savePlayerData(playerData);
    
    console.log(`[Monitor] Списано ${amount} с баланса ${address.slice(0, 8)}...`);
    console.log(`[Monitor] Новый баланс: ${playerData[address].balance}`);
    
    return true;
}

export function addPlayerWinnings(address: string, amount: bigint): void {
    const playerData = loadPlayerData();
    
    if (!playerData[address]) {
        console.log(`❌ Игрок ${address.slice(0, 8)}... не найден`);
        return;
    }
    
    const currentBalance = BigInt(playerData[address].balance);
    playerData[address].balance = (currentBalance + amount).toString();
    
    savePlayerData(playerData);
    
    console.log(`\n💰 Выигрыш добавлен к балансу!`);
    console.log(`   Выигрыш: ${formatTON(amount)} TON`);
    console.log(`   Новый баланс: ${formatTON(currentBalance + amount)} TON`);
}

export function getAllPlayers(): PlayerData {
    return loadPlayerData();
}
