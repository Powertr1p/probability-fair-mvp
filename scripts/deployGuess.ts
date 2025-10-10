import { toNano } from '@ton/core';
import { Guess } from '../build/Guess/Guess_Guess';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const guess = provider.open(await Guess.fromInit());

    await guess.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        null,
    );

    await provider.waitForDeploy(guess.address);

    // run methods on `guess`
}
