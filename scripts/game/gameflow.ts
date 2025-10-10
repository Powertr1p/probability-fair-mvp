import { initServer, playRound, getNextSeedCommitment } from "./server";
import { openWallet, sendWithdraw } from "./wallet";
import { SEEDS_FILE } from "./constants";
import { 
    displayGameWelcome, 
    getPlayerGuessWithRetry,
    displayGameResult,
    displayVerificationData,
    displayPlayerBalance,
    askForDeposit,
    askPlayerBet,
    displayNextServerSeed
} from "./client";
import { getPlayerBalance, deductPlayerBalance, addPlayerWinnings } from "../utils/depositMonitor";
import { toNano } from "@ton/ton";

const withddrawAll = false;

async function main(){
    const { walletContract, keyPair } = await openWallet();
    const playerAddress = walletContract.address.toString();

    if (withddrawAll){
        await sendWithdraw();
        return;   
    }

    const balance = await displayPlayerBalance(playerAddress);
    const minBet = toNano("0.01");
    
    if (balance < minBet) {
        const balanceTON = Number(balance) / 1_000_000_000;
        console.log(`\n⚠️  Недостаточно средств для игры!`);
        console.log(`   Ваш баланс: ${balanceTON.toFixed(4)} TON`);
        console.log(`   Минимальная ставка: 0.01 TON`);
        
        const deposited = await askForDeposit();
        
        if (deposited) {
            console.log('\n✅ Депозит успешно отправлен и баланс обновлен!');
            console.log('💡 Запустите игру снова чтобы начать играть.\n');
            return;
        } else {
            console.log('\n❌ Невозможно начать игру без достаточного баланса.\n');
            return;
        }
    }

    await initServer(walletContract, keyPair);

    const nextSeed = getNextSeedCommitment(SEEDS_FILE);
    if (nextSeed) {
        displayNextServerSeed(nextSeed);
    }

    displayGameWelcome();
    
    const currentBalance = getPlayerBalance(playerAddress);
    let betTON = 0;
    
    while (betTON === 0) {
        betTON = await askPlayerBet(currentBalance);
        if (betTON === 0) {
            console.log('⚠️  Попробуйте еще раз');
        }
    }
    
    const betNano = toNano(betTON.toString());
    
    const deducted = deductPlayerBalance(playerAddress, betNano);
    if (!deducted) {
        console.log('\n❌ Не удалось списать ставку. Игра отменена.');
        return;
    }
    
    console.log(`\n✅ Ставка ${betTON} TON принята!`);
    console.log(`   Ваш баланс: ${((Number(currentBalance - betNano) / 1_000_000_000).toFixed(4))} TON\n`);
    
    const guess = await getPlayerGuessWithRetry();

    const { result, isWin, serverSeed, nextServerSeed, roomSeed, nonce } = await playRound(guess);

    displayGameResult(guess, result, isWin, nonce);
    
    if (isWin) {
        const winnings = betNano * 2n;
        addPlayerWinnings(playerAddress, winnings);
    } else {
        console.log(`\n💸 Вы проиграли ставку ${betTON} TON`);
    }
    
    displayVerificationData(serverSeed, roomSeed, nonce, result, nextServerSeed);
}

main();