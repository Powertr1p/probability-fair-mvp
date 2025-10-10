import { getPlayerBalance } from '../utils/depositMonitor';
import { sendDeposit as walletSendDeposit, sendWithdraw } from './wallet';
import { gameContractAdress } from './constants';
import * as readline from 'readline';

export async function askPlayerGuess(): Promise<number | null> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Введите число от 1 до 5: ', (answer) => {
            rl.close();
            const num = parseInt(answer);
            if (num >= 1 && num <= 5) {
                resolve(num);
            } else {
                console.log('Неверное число! Попробуйте снова.');
                resolve(null);
            }
        });
    });
}

export function displaySessionAnchor(anchor: string | null) {
    if (anchor) {
        const { createBOCFromHex } = require('../utils/bocUtils');
        const anchorBOC = createBOCFromHex(anchor);
        
        console.log(`\n🔒 ЯКОРЬ СЕССИИ (первый seed в цепочке - seed[0]):`);
        console.log(`\n📋 Hex: ${anchor}`);
        console.log(`📦 BOC: ${anchorBOC}`);
        console.log(`\n💡 Это commitment для всей игровой сессии.`);
        console.log(`   Якорь ЗАКРЕПЛЕН на смарт-контракте и НЕ МОЖЕТ быть изменен.`);
        console.log(`   После каждого раунда вы получите server seed для проверки.`);
        console.log(`   где seed[X] - это раскрытый сид текущего раунда\n`);
    }
}

export function displayGameWelcome() {
    console.log(`\n🎮 Добро пожаловать в игру "Угадай число"!`);
    console.log(`   Сервер загадывает число от 1 до 5, вы делаете ставку и пытаетесь отгадать число.`);
}

export function displayNextServerSeed(nextSeed: string) {
    const { createBOCFromHex } = require('../utils/bocUtils');
    const nextSeedHash = createBOCFromHex(nextSeed);
    
    console.log(`\n🔐 COMMITMENT (следующий server seed, от которого был сгенерирован ваш сид для калькуляции):`);
    console.log(`   🔑 Следующий server seed: ${nextSeedHash}`);
    console.log(`\n💡 Запишите этот seed! После раунда вы получите текущий seed для проверки.`);
    console.log(`   Проверка: текущий seed == этот commitment\n`);
}

export function displayGameResult(
    guess: number, 
    result: number, 
    isWin: boolean, 
    nonce: number
) {
    console.log(`\n[Игрок] Ваше число: ${guess}`);
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎲 РЕЗУЛЬТАТ ИГРЫ В КОМНАТЕ #${nonce}`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Выпало число: ${result}`);
    console.log(`Ваше число: ${guess}`);
    
    if (isWin) {
        console.log(`\n🎉 ПОЗДРАВЛЯЕМ! ВЫ УГАДАЛИ!`);
    } else {
        console.log(`\n😞 Не угадали. Попробуйте еще раз!`);
    }
}

export function displayVerificationData(
    serverSeed: string,
    roomSeed: string, 
    nonce: number,
    result: number,
    nextServerSeed: string
) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🔍 ДАННЫЕ ДЛЯ ПРОВЕРКИ ЧЕСТНОСТИ`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Nonce (комната): ${nonce}`);
    console.log(`Результат: ${result}`);
    
    const { createTonViewerData } = require('../utils/bocUtils');
    const tonViewerData = createTonViewerData(serverSeed, roomSeed, nonce, result, nextServerSeed);

    console.log(`\n Адресс для проверки: https://testnet.tonviewer.com/${gameContractAdress}?section=method`);
    
    console.log(`\n📋 ДЛЯ ПРОВЕРКИ РЕЗУЛЬТАТА В TONVIEWER:`);
    console.log(`Метод: ${tonViewerData.method}`);
    console.log(`\nПараметры:`);
    console.log(`Server Seed (Slice): ${tonViewerData.serverSeedBOC}`);
    console.log(`Room Seed (Slice): ${tonViewerData.roomSeedBOC}`);
    console.log(`nonce (Number): ${tonViewerData.nonce}`);
    console.log(`claimedResult (Number): ${tonViewerData.result}`);
    
    if (tonViewerData.chainVerifyCommand) {
        console.log(`\n🔐 ДЛЯ ПРОВЕРКИ ЦЕПОЧКИ В TONVIEWER:`);
        console.log(`Метод: verifyChainLink`);
        console.log(`\nПараметры:`);
        console.log(`Следующий Server Seed (Slice):    ${tonViewerData.nextServerSeedBOC}`);
        console.log(`Текущий Server Seed (Slice): ${tonViewerData.serverSeedBOC}`);
        console.log(`\n💡 Проверяет: использованный сид был сгенерирован из следующего`);
        console.log(`   Результат должен быть 0x1 (true) если цепочка честная, если сервер обманул - 0x0 (false)`);
    }
}

export async function getPlayerGuessWithRetry(): Promise<number> {
    let guess: number | null = null;
    
    while (guess === null) {
        guess = await askPlayerGuess();
    }
    
    return guess;
}

export async function askPlayerBet(maxBet: bigint): Promise<number> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        const maxBetTON = Number(maxBet) / 1_000_000_000;
        rl.question(`\n💰 Введите ставку (от 0.01 до ${maxBetTON.toFixed(4)} TON): `, (answer) => {
            rl.close();
            
            const bet = parseFloat(answer);
            const betNano = bet * 1_000_000_000;
            
            if (isNaN(bet) || bet < 0.01) {
                console.log('❌ Минимальная ставка: 0.01 TON');
                resolve(0);
                return;
            }
            
            if (BigInt(Math.floor(betNano)) > maxBet) {
                console.log(`❌ Недостаточно средств! Максимальная ставка: ${maxBetTON.toFixed(4)} TON`);
                resolve(0);
                return;
            }
            
            resolve(bet);
        });
    });
}

export async function displayPlayerBalance(playerAddress: string): Promise<bigint> {
    const balance = getPlayerBalance(playerAddress);
    
    console.log(`\n💰 ВАШ БАЛАНС В ИГРЕ:`);
    console.log(`   Адрес: ${playerAddress.slice(0, 10)}...${playerAddress.slice(-6)}`);
    console.log(`   Баланс: ${formatTON(balance)} TON`);
    
    return balance;
}

export async function askForDeposit(): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('\n💵 Хотите пополнить баланс? (y/n): ', async (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'д') {
                rl.question('Введите сумму в TON: ', async (amountStr) => {
                    rl.close();
                    
                    const amount = parseFloat(amountStr);
                    if (isNaN(amount) || amount <= 0) {
                        console.log('❌ Неверная сумма!');
                        resolve(false);
                        return;
                    }
                    
                    try {
                        await walletSendDeposit(amount);
                        console.log('\n✅ Депозит отправлен! Ожидайте подтверждения...');
                        console.log('💡 Баланс обновится в течение 10-20 секунд');
                        resolve(true);
                    } catch (error) {
                        console.error('❌ Ошибка при отправке депозита:', error);
                        resolve(false);
                    }
                });
            } else {
                rl.close();
                resolve(false);
            }
        });
    });
}

export async function askForWithdraw(): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('\n💵 Хотите вывести средства? (y/n): ', async (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'д') {
                rl.question('Введите сумму в TON (или нажмите Enter для вывода всего): ', async (amountStr) => {
                    rl.close();
                    
                    try {
                        if (amountStr.trim() === '') {
                            // Выводим весь баланс
                            await sendWithdraw();
                        } else {
                            const amount = parseFloat(amountStr);
                            if (isNaN(amount) || amount <= 0) {
                                console.log('❌ Неверная сумма!');
                                resolve(false);
                                return;
                            }
                            await sendWithdraw(amount.toString());
                        }
                        resolve(true);
                    } catch (error) {
                        console.error('❌ Ошибка при выводе средств:', error);
                        resolve(false);
                    }
                });
            } else {
                rl.close();
                resolve(false);
            }
        });
    });
}

function formatTON(nanoTON: bigint): string {
    const ton = Number(nanoTON) / 1_000_000_000;
    return ton.toFixed(4);
}
