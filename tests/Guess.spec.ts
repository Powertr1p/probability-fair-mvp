import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano, Cell, beginCell, Address } from '@ton/core';
import { Guess, Withdraw, NewSession } from '../build/Guess/Guess_Guess';
import { createHash } from 'crypto';
import '@ton/test-utils';

describe('Guess', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let player1: SandboxContract<TreasuryContract>;
    let player2: SandboxContract<TreasuryContract>;
    let player3: SandboxContract<TreasuryContract>;
    let guess: SandboxContract<Guess>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        guess = blockchain.openContract(await Guess.fromInit());

        deployer = await blockchain.treasury('deployer');
        player1 = await blockchain.treasury('player1');
        player2 = await blockchain.treasury('player2');
        player3 = await blockchain.treasury('player3');

        const deployResult = await guess.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            null
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: guess.address,
            deploy: true,
            success: true,
        });
    });

    
    it('should deploy successfully', async () => {
        // Контракт уже развернут в beforeEach
        const owner = await guess.getGetOwner();
        expect(owner).toEqualAddress(deployer.address);
        
        const anchor = await guess.getGetAnchor();
        expect(anchor).toBe(0n);
    });

    it('should calculate results correctly', async () => {
        const serverSeed = 12345n;
        const roomSeed = 67890n;
        const nonce = 0n;
        
        const result = await guess.getCalculateResult(serverSeed, roomSeed, nonce);
        expect(result).toBeGreaterThanOrEqual(1n);
        expect(result).toBeLessThanOrEqual(5n);
    });
});
