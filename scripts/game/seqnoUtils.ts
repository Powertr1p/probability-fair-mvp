/**
 * Утилиты для работы с seqno
 */

/**
 * Ожидает обновления seqno в блокчейне после отправки транзакции
 * @param walletContract - контракт кошелька
 * @param expectedMinSeqno - минимальный ожидаемый seqno (обычно текущий + 1)
 * @param maxAttempts - максимальное количество попыток (по умолчанию 10)
 * @param delayMs - задержка между попытками в миллисекундах (по умолчанию 2000)
 * @returns актуальный seqno после обновления
 */
export async function waitForSeqnoUpdate(
    walletContract: any, 
    expectedMinSeqno?: number, 
    maxAttempts: number = 10, 
    delayMs: number = 2000
): Promise<number> {
    let currentSeqno = await walletContract.getSeqno();
    let attempts = 0;
    
    const minSeqno = expectedMinSeqno || currentSeqno + 1;
    
    console.log(`Ожидание обновления seqno (текущий: ${currentSeqno}, ожидаем >= ${minSeqno})`);
    
    if (currentSeqno >= minSeqno) {
        console.log(`Seqno уже актуален: ${currentSeqno}`);
        return currentSeqno;
    }
    
    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        const newSeqno = await walletContract.getSeqno();
        
        if (newSeqno >= minSeqno) {
            console.log(`Seqno обновлен: ${currentSeqno} → ${newSeqno}`);
            return newSeqno;
        }
        
        attempts++;
        console.log(`Ожидание обновления seqno, попытка ${attempts}/${maxAttempts}...`);
    }
    
    const finalSeqno = await walletContract.getSeqno();
    if (finalSeqno >= minSeqno) {
        console.log(`Seqno обновлен на последней проверке: ${currentSeqno} → ${finalSeqno}`);
        return finalSeqno;
    }
    
    throw new Error(`Seqno не обновился за ${maxAttempts} попыток. Ожидали >= ${minSeqno}, получили ${finalSeqno}. Возможно, транзакция не была принята блокчейном.`);
}

/**
 * Получает актуальный seqno и логирует его
 * @param walletContract - контракт кошелька
 * @param operationName - название операции для логирования
 * @returns актуальный seqno
 */
export async function getCurrentSeqno(walletContract: any, operationName: string): Promise<number> {
    const seqno = await walletContract.getSeqno();
    console.log(`Текущий seqno для ${operationName}: ${seqno}`);
    return seqno;
}
