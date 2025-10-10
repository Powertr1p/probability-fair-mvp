import "@stdlib/deploy";
import "./messages";
import "./utils";

fun pfHash(seed: Int, roomSeed: Int, nonce: Int): Int {
    let hash1 = sha256(beginCell().storeUint(seed, 256).endCell().asSlice());
    let hash2 = sha256(beginCell().storeUint(roomSeed, 256).endCell().asSlice());
    let hash3 = sha256(beginCell().storeUint(nonce, 64).endCell().asSlice());
    
    let combined = beginCell()
        .storeUint(hash1, 256)
        .storeUint(hash2, 256)
        .storeUint(hash3, 256)
        .endCell();
    
    return sha256(combined.asSlice());
}

contract Guess with Deployable {
    owner: Address?;
    anchor: Int as uint256 = 0;
    totalDeposits: Int as coins = 0;

    init() {
        self.owner = sender();
        self.anchor = 0;
        self.totalDeposits = 0;
    }

    receive() {}

    receive(msg: SetOwner){
        require(sender() == self.owner, "Unauthorized");
        self.owner = msg.owner;
    }

    receive(msg: NewSession){
        require(self.owner != null && sender() == self.owner, "FORBIDDEN");
        self.anchor = msg.newAnchor;
    }

    receive(msg: Deposit){
        self.totalDeposits += msg.amount;
        
        emit(DepositEvent{
            player: sender(),
            amount: msg.amount,
            timestamp: now()
        }.toCell());
    }

    receive(msg: Withdraw) {
        require(sender() == self.owner, "Withdrawal is only allowed for owner");
        require(self.totalDeposits >= msg.amount, "Insufficient balance in contract");
        
        self.totalDeposits -= msg.amount;
        
        emit(WithdrawEvent{
            player: msg.address,
            amount: msg.amount,
            timestamp: now()
        }.toCell());
        
        send(SendParameters{
            to: msg.address,
            value: msg.amount,
            mode: SendPayGasSeparately
        });
    }

    get fun get_owner(): Address? { return self.owner; }
    get fun get_anchor(): Int { return self.anchor; }
    get fun get_total_deposits(): Int { return self.totalDeposits; }
    
    get fun verifyRound(
        serverSeed: Int,
        roomSeed: Int,
        nonce: Int,
        claimedResult: Int
    ): Int {
        let hash = pfHash(serverSeed, roomSeed, nonce);
        let expectedResult = (hash % 5) + 1;
        if (expectedResult == claimedResult) {
            return 1; // true
        } else {
            return 0; // false
        }
    }

    get fun verifyRoundSlice(
        serverSeedSlice: Slice,
        roomSeedSlice: Slice,
        nonce: Int,
        claimedResult: Int
    ): Int {
        let hash1 = sha256(serverSeedSlice);
        let hash2 = sha256(roomSeedSlice);
        let hash3 = sha256(beginCell().storeUint(nonce, 64).endCell().asSlice());
        
        let combined = beginCell()
            .storeUint(hash1, 256)
            .storeUint(hash2, 256)
            .storeUint(hash3, 256)
            .endCell();
        let finalHash = sha256(combined.asSlice());
        let result = (finalHash % 5) + 1;
        
        return result == claimedResult ? 1 : 0;
    }

    get fun calculateResult(
        serverSeed: Int,
        roomSeed: Int,
        nonce: Int
    ): Int {
        let hash = pfHash(serverSeed, roomSeed, nonce);
        let result = (hash % 5) + 1;
        return result;
    }

    get fun verifyChainLink(
        seedNextSlice: Slice,      // Next seed (commitment для следующего раунда)
        seedCurrentSlice: Slice    // Current seed (использованный в текущем раунде)
    ): Int {
        let hashOfNext = hashSlice(seedNextSlice);
        let hashOfCurrent = hashSlice(seedCurrentSlice);
        let expectedCurrentCell = createCellFromUint256(hashOfNext);
        let expectedCurrentHash = hashSlice(expectedCurrentCell.asSlice());
        
        return expectedCurrentHash == hashOfCurrent ? 1 : 0;
    }
}
