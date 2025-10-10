import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/ton';
import { Guess } from '../build/Guess/Guess_Guess';
import { createCellFromHex } from '../scripts/utils/bocUtils';
import '@ton/test-utils';
import { createHash } from 'crypto';

describe('Guess - verifyChainLink', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let guess: SandboxContract<Guess>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        guess = blockchain.openContract(await Guess.fromInit());

        const deployResult = await guess.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: guess.address,
            deploy: true,
            success: true,
        });
    });

    it('должен проверить правильную цепочку seed\'ов', async () => {
        // Генерируем цепочку как в документе
        const seed0 = Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'hex');
        const seed1 = createHash('sha256').update(seed0).digest();
        
        console.log('seed0:', seed0.toString('hex'));
        console.log('seed1:', seed1.toString('hex'));
        console.log('hash(seed0):', createHash('sha256').update(seed0).digest().toString('hex'));
        
        // Создаем BOC для seed0 и seed1
        const seed0BOC = createCellFromHex(seed0.toString('hex'));
        const seed1BOC = createCellFromHex(seed1.toString('hex'));
        
        // Проверяем цепочку
        const result = await guess.getVerifyChainLink(
            seed0BOC.asSlice(),
            seed1BOC.asSlice()
        );
        
        console.log('verifyChainLink result:', result);
        expect(result).toBe(1n); // Должно быть true
    });

    it('должен отклонить неправильную цепочку', async () => {
        const seed0 = Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'hex');
        const wrongSeed = Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
        
        const seed0BOC = createCellFromHex(seed0.toString('hex'));
        const wrongSeedBOC = createCellFromHex(wrongSeed.toString('hex'));
        
        const result = await guess.getVerifyChainLink(
            seed0BOC.asSlice(),
            wrongSeedBOC.asSlice()
        );
        
        expect(result).toBe(0n); // Должно быть false
    });

    it('должен проверить реальную цепочку из 3 seed\'ов', async () => {
        // Генерируем цепочку из 3 элементов
        const seed0 = createHash('sha256').update(Buffer.from('test')).digest();
        const seed1 = createHash('sha256').update(seed0).digest();
        const seed2 = createHash('sha256').update(seed1).digest();
        
        console.log('\nЦепочка из 3 элементов:');
        console.log('seed0:', seed0.toString('hex'));
        console.log('seed1:', seed1.toString('hex'));
        console.log('seed2:', seed2.toString('hex'));
        
        // Проверяем seed0 -> seed1
        const seed0BOC = createCellFromHex(seed0.toString('hex'));
        const seed1BOC = createCellFromHex(seed1.toString('hex'));
        
        const result1 = await guess.getVerifyChainLink(
            seed0BOC.asSlice(),
            seed1BOC.asSlice()
        );
        
        console.log('seed0 -> seed1:', result1);
        expect(result1).toBe(1n);
        
        // Проверяем seed1 -> seed2
        const seed2BOC = createCellFromHex(seed2.toString('hex'));
        
        const result2 = await guess.getVerifyChainLink(
            seed1BOC.asSlice(),
            seed2BOC.asSlice()
        );
        
        console.log('seed1 -> seed2:', result2);
        expect(result2).toBe(1n);
    });

    it('должен работать с функцией createBOCFromHex (как в реальной игре)', async () => {
        // Используем централизованную функцию
        
        // Генерируем цепочку
        const seed0 = createHash('sha256').update(Buffer.from('real_game_test')).digest();
        const seed1 = createHash('sha256').update(seed0).digest();
        
        console.log('\nТест с createBOCFromHex:');
        console.log('seed0:', seed0.toString('hex'));
        console.log('seed1:', seed1.toString('hex'));
        
        // Используем функцию как в реальной игре
        const seed0BOC = createCellFromHex(seed0.toString('hex'));
        const seed1BOC = createCellFromHex(seed1.toString('hex'));
        
        const result = await guess.getVerifyChainLink(
            seed0BOC.asSlice(),
            seed1BOC.asSlice()
        );
        
        console.log('Результат с createBOCFromHex:', result);
        expect(result).toBe(1n);
    });
});
