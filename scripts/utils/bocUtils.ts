import { beginCell, Cell, Slice } from '@ton/ton';

/**
 * Создает Cell из hex строки
 * Это базовая функция для всех операций с hex -> Cell
 */
export function createCellFromHex(hexString: string): Cell {
    // Убираем префикс 0x если есть
    const cleanHex = hexString.replace(/^0x/, '');
    
    // Создаем Cell с сырыми байтами
    return beginCell()
        .storeBuffer(Buffer.from(cleanHex, 'hex'))
        .endCell();
}

/**
 * Создает Slice из hex строки
 * Удобно для передачи в get-методы контракта
 */
export function createSliceFromHex(hexString: string): Slice {
    return createCellFromHex(hexString).asSlice();
}

/**
 * Создает base64 BOC из hex строки для использования в TonViewer
 * BOC содержит сырые байты которые можно хешировать через sha256(slice)
 */
export function createBOCFromHex(hexString: string): string {
    const cell = createCellFromHex(hexString);
    return cell.toBoc().toString('base64');
}

/**
 * Извлекает hex строку из Cell
 * Обратная операция к createCellFromHex
 */
export function extractHexFromCell(cell: Cell): string {
    const slice = cell.asSlice();
    const buffer = slice.loadBuffer(slice.remainingBits / 8);
    return buffer.toString('hex');
}

/**
 * Извлекает hex строку из base64 BOC
 * Обратная операция к createBOCFromHex
 */
export function extractHexFromBOC(base64BOC: string): string {
    const cell = Cell.fromBase64(base64BOC);
    return extractHexFromCell(cell);
}

/**
 * Создает готовые данные для TonViewer из результатов игры
 */
export function createTonViewerData(serverSeed: string, roomSeed: string, nonce: number, result: number, nextServerSeed?: string) {
    const serverSeedBOC = createBOCFromHex(serverSeed);
    const roomSeedBOC = createBOCFromHex(roomSeed);
    const nextServerSeedBOC = nextServerSeed ? createBOCFromHex(nextServerSeed) : undefined;
    
    return {
        method: 'verifyRoundSlice',
        serverSeedBOC,
        roomSeedBOC,
        nextServerSeedBOC,
        nonce,
        result,
        tonViewerCommand: `${serverSeedBOC} ${roomSeedBOC} ${nonce} ${result}`,
        chainVerifyCommand: nextServerSeedBOC ? `${nextServerSeedBOC} ${serverSeedBOC}` : undefined
    };
}

// Тестирование функции
if (require.main === module) {
    const testServerSeed = "94876a4823e6af0ab5e93ad82200e4e931fb3e2b25e6fc870c97613e2de55303";
    const testRoomSeed = "6b4c7d8a9e2f1b3c5d6e8f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c";
    
    console.log("=".repeat(80));
    console.log("🔧 ТЕСТ СОЗДАНИЯ BOC");
    console.log("=".repeat(80));
    
    const data = createTonViewerData(testServerSeed, testRoomSeed, 0, 3);
    
    console.log(`\n📋 ДАННЫЕ ДЛЯ TONVIEWER:`);
    console.log(`Метод: ${data.method}`);
    console.log(`\nПараметры (base64 encoded cells):`);
    console.log(`serverSeedSlice: ${data.serverSeedBOC}`);
    console.log(`roomSeedSlice: ${data.roomSeedBOC}`);
    console.log(`nonce: ${data.nonce}`);
    console.log(`claimedResult: ${data.result}`);
    
    console.log(`\n🔗 Команда для TonViewer (через пробел):`);
    console.log(`${data.tonViewerCommand}`);
    
    console.log("\n" + "=".repeat(80));
}
