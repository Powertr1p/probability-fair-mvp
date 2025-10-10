import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/ton';
import { Guess } from '../build/Guess/Guess_Guess';
import { createSliceFromHex, createCellFromHex } from '../scripts/utils/bocUtils';
import '@ton/test-utils';

describe('Guess - Real Game Data', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let guess: SandboxContract<Guess>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        guess = blockchain.openContract(await Guess.fromInit());

        const deployResult = await guess.send(
            deployer.getSender(),
            { value: toNano('0.05') },
            { $$type: 'Deploy', queryId: 0n }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            deploy: true,
            success: true,
        });
    });


    it('должен проверить verifyChainLink с сидами 49 и 50 из seeds.json', async () => {
        console.log('\n=== ТЕСТ С СИДАМИ 49 И 50 ИЗ SEEDS.JSON ===');
        
        // Сиды из seeds.json (49-й и 50-й)
        const seed49 = "30a9f92e3ca1d0672ba349f9b472b828775eb9a81586f3d4d60587a8fc217d19"; // Next Seed (commitment)
        const seed50 = "42ebf16e501d0d54abe9ba2d02d513b04449c2383e7576107e28e213ba635e8e"; // Current Seed (использован)
        
        console.log('seed49 (Next - commitment):', seed49);
        console.log('seed50 (Current - использован):', seed50);
        
        // Проверяем честность: hash(Next Seed) должно равняться Current Seed
        const crypto = require('crypto');
        const hashOfSeed49 = crypto.createHash('sha256').update(Buffer.from(seed49, 'hex')).digest('hex');
        console.log('hash(seed49):       ', hashOfSeed49);
        console.log('seed50:             ', seed50);
        console.log('Цепочка верна:', hashOfSeed49 === seed50);
        
        // Упаковываем в BOC как делаем в игре
        const { createCellFromHex, extractHexFromBOC } = require('../scripts/utils/bocUtils');
        const seed49Cell = createCellFromHex(seed49);
        const seed50Cell = createCellFromHex(seed50);
        
        const seed49BOC = seed49Cell.toBoc().toString('base64');
        const seed50BOC = seed50Cell.toBoc().toString('base64');
        
        console.log('\n=== УПАКОВКА В BOC ===');
        console.log('Исходный seed49 hex:', seed49);
        console.log('seed49 BOC:          ', seed49BOC);
        console.log('Исходный seed50 hex:', seed50);
        console.log('seed50 BOC:          ', seed50BOC);
        
        // Проверяем распаковку обратно
        const unpackedSeed49 = extractHexFromBOC(seed49BOC);
        const unpackedSeed50 = extractHexFromBOC(seed50BOC);
        
        console.log('\n=== РАСПАКОВКА ИЗ BOC ===');
        console.log('Распакованный seed49:', unpackedSeed49);
        console.log('Совпадает с исходным:', seed49 === unpackedSeed49);
        console.log('Распакованный seed50:', unpackedSeed50);
        console.log('Совпадает с исходным:', seed50 === unpackedSeed50);
        
        // Проверяем что происходит внутри Cell
        console.log('\n=== ВНУТРЕННЯЯ СТРУКТУРА CELL ===');
        console.log('seed49 Cell bits:', seed49Cell.bits.length);
        console.log('seed49 Cell refs:', seed49Cell.refs.length);
        console.log('seed50 Cell bits:', seed50Cell.bits.length);
        console.log('seed50 Cell refs:', seed50Cell.refs.length);
        
        // Читаем сырые данные из Slice
        const seed49Slice = seed49Cell.asSlice();
        const seed50Slice = seed50Cell.asSlice();
        
        console.log('\n=== ЧТЕНИЕ ИЗ SLICE ===');
        console.log('seed49 Slice remaining bits:', seed49Slice.remainingBits);
        console.log('seed50 Slice remaining bits:', seed50Slice.remainingBits);
        
        // Читаем как 256-битное число (используем loadUintBig для больших чисел)
        const seed49AsUint = seed49Slice.loadUintBig(256);
        const seed50AsUint = seed50Slice.loadUintBig(256);
        
        console.log('seed49 как uint256:', seed49AsUint.toString(16));
        console.log('seed50 как uint256:', seed50AsUint.toString(16));
        
        // Тестируем через контракт
        // Проверяем честность: сыгранный сид был сгенерирован из commitment'а
        const chainResult = await guess.getVerifyChainLink(
            seed49Cell.asSlice(),  // Next Seed (commitment) - показали игроку заранее
            seed50Cell.asSlice()   // Current Seed (использован) - должен быть hash(Next Seed)
        );
        
        console.log('verifyChainLink result:', chainResult);
        
        if (hashOfSeed49 === seed50) {
            expect(chainResult).toBe(1n);
            console.log('✅ Цепочка верна, контракт подтвердил!');
        } else {
            expect(chainResult).toBe(0n);
            console.log('❌ Цепочка неверна, контракт отклонил');
        }
    });
});
