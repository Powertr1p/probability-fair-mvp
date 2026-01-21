import { mnemonicToWalletKey } from "@ton/crypto";
import { Address, beginCell, internal, toNano, WalletContractV3R2 } from "@ton/ton";
import { sharedClient } from "./tonClient";
import { gameContractAdress, mnemonics } from "./constants";
import { getCurrentSeqno, waitForSeqnoUpdate } from './seqnoUtils';
import { getPlayerBalance, deductPlayerBalance } from '../utils/depositMonitor';

export async function openWallet() {
    console.log("Подключаемся к кошельку...");
    const client = sharedClient;
    const keyPair = await mnemonicToWalletKey(mnemonics.trim().split(/\s+/));
    const wallet = WalletContractV3R2.create({ workchain: 0, publicKey: keyPair.publicKey });
    const walletContract = client.open(wallet);
    console.log(`Кошелек ${walletContract.address} открыт для отправки транзакций.`);
    return { walletContract, keyPair };
}

export async function getSeqno(){
    const { walletContract } = await openWallet();
    return await walletContract.getSeqno();
}

export async function sendDeposit(amountTON: number): Promise<void> {
    console.log(`\n📤 Отправляем депозит ${amountTON} TON...`);
    
    const { walletContract, keyPair } = await openWallet();
    const playerAddress = walletContract.address.toString();
    let currentSeqno = await getCurrentSeqno(walletContract, 'Deposit');
    const amount = toNano(amountTON.toString());

    const message = beginCell()
        .storeUint(4, 32) // op: Deposit
        .storeUint(BigInt(Date.now()), 64) // queryId
        .storeCoins(amount)
        .endCell();

    try {
        await walletContract.sendTransfer({
            secretKey: keyPair.secretKey,
            seqno: currentSeqno,
            messages: [internal({
                to: Address.parse(gameContractAdress),
                value: amount + toNano("0.05"),
                body: message,
                bounce: false
            })]
        });
        
        await waitForSeqnoUpdate(walletContract, currentSeqno + 1);
    } catch (error: any) {
        if (error?.response?.data?.error?.includes('Duplicate msg_seqno')) {
            console.log(`⚠️  Обнаружен дубликат seqno ${currentSeqno}, получаем актуальный...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            currentSeqno = await walletContract.getSeqno();
            console.log(`Повторная попытка с seqno ${currentSeqno}`);
            
            await walletContract.sendTransfer({
                secretKey: keyPair.secretKey,
                seqno: currentSeqno,
                messages: [internal({
                    to: Address.parse(gameContractAdress),
                    value: amount + toNano("0.05"),
                    body: message,
                    bounce: false
                })]
            });
            
            await waitForSeqnoUpdate(walletContract, currentSeqno + 1);
        } else {
            throw error;
        }
    }
    
    const { updatePlayerBalance } = await import('../utils/depositMonitor');
    updatePlayerBalance(playerAddress, amount);
    
    console.log(`✅ Депозит ${amountTON} TON добавлен к балансу!`);
}

export async function sendWithdraw(amountTON?: string): Promise<void> {
    const { walletContract, keyPair } = await openWallet();
    const playerAddress = walletContract.address.toString();
    
    const balance = getPlayerBalance(playerAddress);
    
    if (balance === 0n) {
        console.error(`\n❌ Ошибка: У вас нет депозита в системе!`);
        console.error(`   Адрес: ${playerAddress.slice(0, 10)}...${playerAddress.slice(-6)}`);
        console.error(`   Сначала пополните баланс через игру.`);
        return;
    }
    
    const withdrawAmount = amountTON ? toNano(amountTON) : balance;
    
    if (withdrawAmount > balance) {
        console.error(`\n❌ Ошибка: Недостаточно средств!`);
        console.error(`   Ваш баланс: ${formatBalance(balance)} TON`);
        console.error(`   Запрошено: ${formatBalance(withdrawAmount)} TON`);
        return;
    }
    
    console.log(`\n💰 Выводим средства из контракта...`);
    console.log(`   Сумма: ${formatBalance(withdrawAmount)} TON`);
    
    let currentSeqno = await getCurrentSeqno(walletContract, 'Withdraw');

    const message = beginCell()
        .storeUint(3, 32) // op: Withdraw
        .storeUint(BigInt(Date.now()), 64) // queryId
        .storeCoins(withdrawAmount)
        .storeAddress(walletContract.address)
        .endCell();

    try {
        await walletContract.sendTransfer({
            secretKey: keyPair.secretKey,
            seqno: currentSeqno,
            messages: [internal({
                to: Address.parse(gameContractAdress),
                value: toNano("0.01"),
                body: message,
                bounce: false
            })]
        });
        
        await waitForSeqnoUpdate(walletContract, currentSeqno + 1);
    } catch (error: any) {
        if (error?.response?.data?.error?.includes('Duplicate msg_seqno')) {
            console.log(`⚠️  Обнаружен дубликат seqno ${currentSeqno}, получаем актуальный...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            currentSeqno = await walletContract.getSeqno();
            console.log(`Повторная попытка с seqno ${currentSeqno}`);
            
            await walletContract.sendTransfer({
                secretKey: keyPair.secretKey,
                seqno: currentSeqno,
                messages: [internal({
                    to: Address.parse(gameContractAdress),
                    value: toNano("0.01"),
                    body: message,
                    bounce: false
                })]
            });
            
            await waitForSeqnoUpdate(walletContract, currentSeqno + 1);
        } else {
            throw error;
        }
    }
    
    const success = deductPlayerBalance(playerAddress, withdrawAmount);
    
    if (success) {
        console.log(`✅ Средства выведены успешно!`);
        console.log(`   Новый баланс: ${formatBalance(balance - withdrawAmount)} TON`);
    } else {
        console.error(`⚠️  Транзакция отправлена, но не удалось обновить баланс в системе.`);
    }
}

function formatBalance(nanoTON: bigint): string {
    const ton = Number(nanoTON) / 1_000_000_000;
    return ton.toFixed(4);
}