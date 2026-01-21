import { TonClient, WalletContractV3R2, WalletContractV4, Address, toNano, beginCell, internal, OpenedContract } from '@ton/ton';
import { Guess, NewSession as NewSessionMsg, storeNewSession } from "../../build/Guess/Guess_Guess";
import { sharedClient } from "./tonClient";
import { createHash, randomBytes } from 'crypto';
import { 
    hasSeeds, 
    loadSeeds, 
    saveSeeds, 
    getCurrentSeed, 
    getNextSeed, 
    popCurrentSeed, 
    getSeedsCount, 
    getAnchorSeed 
} from '../utils/seedsStorage';
import { gameContractAdress, SEEDS_FILE } from './constants';
import { getCurrentSeqno, waitForSeqnoUpdate } from './seqnoUtils';
import { initHistory, addRoundToHistory } from './history';

async function generateSession(walletContract: any, keyPair: any, length: number = 50): Promise<void> {
    if (!hasSeeds(SEEDS_FILE)){
        const seeds: Buffer[] = new Array(length);

        seeds[0] = createHash('sha256').update(randomBytes(32)).digest();
        const anchorHex: string = "0x" + seeds[0].toString('hex');
    
        for (let i = 1; i < length; i++){
            seeds[i] = createHash('sha256').update(seeds[i - 1]).digest();
        }
        
        saveSeedsToDatabase(seeds, SEEDS_FILE);
        
        initHistory(anchorHex.replace('0x', ''));

        await sendNewSessionToContract(anchorHex, walletContract, keyPair);

        const contract = sharedClient.open(Guess.fromAddress(Address.parse(gameContractAdress)));
        await awaitAnchor(contract, BigInt(anchorHex));
        return;
    }
    else
    {
        console.log("Существующая сессия найдена. Инициализация не требуется.");
        return;
    }
}

function saveSeedsToDatabase(seeds: Buffer[], filePath: string) {
   const hexSeeds = seeds.map(seed => seed.toString("hex"));
   saveSeeds(filePath, hexSeeds);
   console.log(`Seeds saved to ${filePath}`);
}

async function awaitAnchor(contract: OpenedContract<Guess>, expectedAnchor: bigint) {
    console.log("Ожидание установки якоря в контракте...");
    let attempts = 0;
    while (attempts < 20) {
        const currentAnchor = await contract.getGetAnchor();
        if (currentAnchor === expectedAnchor) {
            console.log("Якорь успешно установлен!");
            return;
        }
        attempts++;
        console.log(`Якорь еще не установлен, попытка ${attempts}/20...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    throw new Error("Не удалось дождаться установки якоря.");
}


export function getAnchorForClient(filePath: string): string | null {
    return getAnchorSeed(filePath);
}

export function getPublicSeedForClient(filePath: string): string | null {
    return getCurrentSeed(filePath);
}

function revealCurrentSeed(filePath: string): string | null {
    if (!hasSeeds(filePath)) {
        console.log("[Server] Сессия не найдена. Сгенерируйте новую сессию.");
        return null;
    }

    const currentSeed = popCurrentSeed(filePath);
    if (!currentSeed) {
        console.log("[Server] Недостаточно сидов. Сессия закончилась.");
        return null;
    }

    const { createBOCFromHex } = require('../utils/bocUtils');
    const currentSeedBOC = createBOCFromHex(currentSeed);
    console.log(`[Server] Использован seed: ${currentSeedBOC}`);
    console.log(`[Server] Осталось сидов: ${getSeedsCount(filePath)}`);
    return currentSeed;
}

function peekNextSeed(filePath: string): string | null {
    if (!hasSeeds(filePath)) {
        console.log("[Server] Сессия не найдена.");
        return null;
    }

    const nextSeed = getNextSeed(filePath);
    if (!nextSeed) {
        console.log("[Server] Недостаточно сидов для показа следующего.");
        return null;
    }

    return nextSeed;
}

export function getNextSeedCommitment(filePath: string): string | null {
    return peekNextSeed(filePath);
}

let currentNonce = 0;

function initNonceFromHistory(): void {
    try {
        const { getHistory } = require('./history');
        const history = getHistory();
        
        if (history.rounds && history.rounds.length > 0) {
            const maxNonce = Math.max(...history.rounds.map((round: any) => round.nonce));
            currentNonce = maxNonce + 1;
            console.log(`[Server] 📊 Восстановлен nonce из истории: ${currentNonce}`);
        } else {
            currentNonce = 0;
            console.log(`[Server] 🆕 Начинаем с nonce: ${currentNonce}`);
        }
    } catch (error) {
        currentNonce = 0;
        console.log(`[Server] 🆕 История не найдена, начинаем с nonce: ${currentNonce}`);
    }
}

export function getCurrentNonce(): number {
    return currentNonce;
}

export async function playRound(playerGuess: number): Promise<{ result: number, isWin: boolean, serverSeed: string, nextServerSeed: string, roomSeed: string, nonce: number }> {
    console.log(`\n[Server] 🎲 Начинаем раунд в комнате #${currentNonce}...`);

    const nextServerSeed = peekNextSeed(SEEDS_FILE);
    if (!nextServerSeed) {
        throw new Error("[Server] Не удалось получить следующий server seed.");
    }

    const serverSeed = revealCurrentSeed(SEEDS_FILE);
    if (!serverSeed) {
        throw new Error("[Server] Не удалось получить server seed. Возможно, сессия закончилась.");
    }
    
    const { createBOCFromHex } = require('../utils/bocUtils');
    const serverSeedBOC = createBOCFromHex(serverSeed);
    const nextServerSeedBOC = createBOCFromHex(nextServerSeed);
    
    console.log(`[Server] 🔑 Server Seed (использован): ${serverSeedBOC}`);
    console.log(`[Server] 📢 Следующий seed (commitment): ${nextServerSeedBOC}`);

    const roomSeedBuffer = randomBytes(32);
    const roomSeed = BigInt("0x" + roomSeedBuffer.toString('hex'));
    const roomSeedBOC = createBOCFromHex(roomSeedBuffer.toString('hex'));
    
    console.log(`[Server] 🏠 Room Seed: ${roomSeedBOC}`);
    console.log(`[Server] #️⃣ Nonce (комната): ${currentNonce}`);

    const contract = sharedClient.open(Guess.fromAddress(Address.parse(gameContractAdress)));
    const result = await contract.getCalculateResult(
        BigInt("0x" + serverSeed),
        roomSeed,
        BigInt(currentNonce)
    );

    console.log(`[Server] 🎯 Вычислен результат: ${result}`);

    const isWin = Number(result) === playerGuess;

    const roundData = {
        result: Number(result),
        isWin,
        serverSeed,
        nextServerSeed,
        roomSeed: roomSeedBuffer.toString('hex'),
        nonce: currentNonce
    };
    
    addRoundToHistory({
        nonce: currentNonce,
        serverSeedBOC,
        nextServerSeedBOC,
        roomSeedBOC,
        result: Number(result),
        timestamp: new Date().toISOString()
    });

    currentNonce++;
    console.log(`[Server] ⏭️ Nonce увеличен до ${currentNonce} для следующей комнаты`);

    return roundData;
}

export async function initServer(walletContract: any, keyPair: any): Promise<void> {
    initNonceFromHistory();
    
    if (hasSeeds(SEEDS_FILE)) {
        console.log("[Server] Существующая сессия найдена. Инициализация не требуется.");
        return;
    } else {
        console.log("[Server] Сессия не найдена. Генерируем новую...");
        await generateSession(walletContract, keyPair);
    }
}

export async function startNewSession(walletContract: any, keyPair: any, length: number = 50): Promise<void> {
    console.log("🔄 Начинаем новую игровую сессию...");
    
    const seeds: Buffer[] = new Array(length);
    
    seeds[0] = createHash('sha256').update(randomBytes(32)).digest();
    
    for (let i = 1; i < length; i++) {
        seeds[i] = createHash('sha256').update(seeds[i - 1]).digest();
    }
    
    const anchor = seeds[0];
    const newAnchor: string = "0x" + anchor.toString('hex');
    
    console.log(`[Server] 🔗 Сгенерирована цепочка из ${length} сидов`);
    console.log(`[Server] 🏁 Якорь (seed[0]): ${newAnchor.slice(0, 18)}...`);
    console.log(`[Server] 📢 Публичный seed (seed[${length-1}]): 0x${seeds[length-1].toString('hex').slice(0, 16)}...`);
    
    saveSeedsToDatabase(seeds, SEEDS_FILE);
    
    await sendNewSessionToContract(newAnchor, walletContract, keyPair);
    
    console.log(`✅ Новая сессия создана с ${length} сидами`);
    console.log(`🔗 Новый якорь: ${newAnchor}`);
}

async function sendNewSessionToContract(newAnchor: string, walletContract: any, keyPair: any): Promise<void> {
    let currentSeqno = await getCurrentSeqno(walletContract, 'NewSession');
    
    const newSessionMsg: NewSessionMsg = {
        $$type: 'NewSession',
        queryId: BigInt(Date.now()),
        newAnchor: BigInt(newAnchor)
    };

    const messageBody = beginCell().store(storeNewSession(newSessionMsg)).endCell();

    try {
        await walletContract.sendTransfer({
            seqno: currentSeqno,
            secretKey: keyPair.secretKey,
            messages: [internal({
                to: gameContractAdress,
                value: toNano("0.05"),
                body: messageBody
            })]
        });

        console.log(`Транзакция для установки нового якоря ${newAnchor} успешно отправлена!`);
        
        await waitForSeqnoUpdate(walletContract, currentSeqno + 1);
    } catch (error: any) {
        if (error?.response?.data?.error?.includes('Duplicate msg_seqno')) {
            console.log(`⚠️  Обнаружен дубликат seqno ${currentSeqno}, получаем актуальный...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            currentSeqno = await walletContract.getSeqno();
            console.log(`Повторная попытка с seqno ${currentSeqno}`);
            
            await walletContract.sendTransfer({
                seqno: currentSeqno,
                secretKey: keyPair.secretKey,
                messages: [internal({
                    to: gameContractAdress,
                    value: toNano("0.05"),
                    body: messageBody
                })]
            });
            
            console.log(`Транзакция для установки нового якоря ${newAnchor} успешно отправлена!`);
            await waitForSeqnoUpdate(walletContract, currentSeqno + 1);
        } else {
            console.error(`Ошибка при отправке NewSession:`, error);
            throw error;
        }
    }
}

export function getRemainingSeeds(): number {
    if (!hasSeeds(SEEDS_FILE)) {
        return 0;
    }
    
    return getSeedsCount(SEEDS_FILE);
}

