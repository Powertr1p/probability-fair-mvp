import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/ton';
import { Guess } from '../build/Guess/Guess_Guess';
import { createCellFromHex } from '../scripts/utils/bocUtils';
import { beginCell } from '@ton/ton';
import '@ton/test-utils';
import { createHash } from 'crypto';

describe('Guess - Chain Debug', () => {
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
            to: guess.address,
            deploy: true,
            success: true,
        });
    });

    it('должен отладить verifyChainLink пошагово', async () => {
        console.log('\n=== ОТЛАДКА verifyChainLink ===');
        
        // Создаем правильную цепочку
        const seed0 = createHash('sha256').update(Buffer.from('test')).digest();
        const seed1 = createHash('sha256').update(seed0).digest();
        
        console.log('seed0 (hex):', seed0.toString('hex'));
        console.log('seed1 (hex):', seed1.toString('hex'));
        console.log('hash(seed0):', createHash('sha256').update(seed0).digest().toString('hex'));
        console.log('Цепочка верна:', createHash('sha256').update(seed0).digest().toString('hex') === seed1.toString('hex'));
        
        const seed0BOC = createCellFromHex(seed0.toString('hex'));
        const seed1BOC = createCellFromHex(seed1.toString('hex'));
        
        console.log('seed0 BOC:', seed0BOC.toBoc().toString('base64'));
        console.log('seed1 BOC:', seed1BOC.toBoc().toString('base64'));
        
        // Тестируем verifyChainLink
        const result = await guess.getVerifyChainLink(
            seed0BOC.asSlice(),
            seed1BOC.asSlice()
        );
        
        console.log('verifyChainLink result:', result);
        
        // Проверим что происходит внутри контракта
        // Имитируем логику контракта
        console.log('\n=== ИМИТАЦИЯ ЛОГИКИ КОНТРАКТА ===');
        
        // 1. sha256(seedCurrentSlice) - хешируем сырые байты seed0
        const hashOfCurrent = createHash('sha256').update(seed0).digest();
        console.log('hashOfCurrent (контракт):', hashOfCurrent.toString('hex'));
        
        // 2. Создаем expectedNextCell из hash
        const expectedNextCell = beginCell().storeUint(BigInt('0x' + hashOfCurrent.toString('hex')), 256).endCell();
        console.log('expectedNext BOC:', expectedNextCell.toBoc().toString('base64'));
        
        // 3. Хешируем оба для сравнения
        const nextHash = createHash('sha256').update(seed1).digest();
        const expectedHash = createHash('sha256').update(expectedNextCell.asSlice().loadBuffer(32)).digest();
        
        console.log('nextHash:', nextHash.toString('hex'));
        console.log('expectedHash:', expectedHash.toString('hex'));
        console.log('Хеши равны:', nextHash.toString('hex') === expectedHash.toString('hex'));
        
        expect(result).toBe(1n);
    });
});
