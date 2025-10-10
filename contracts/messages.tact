message(1) NewSession {
    queryId: Int as uint64;
    newAnchor: Int as uint256;
}

message(2) SetOwner{
    queryId: Int as uint64;
    owner: Address;
}

message(3) Withdraw {
    queryId: Int as uint64;
    amount: Int as coins;
    address: Address;
}

message(4) Deposit {
    queryId: Int as uint64;
    amount: Int as coins;
}

// Events (эмиты для отслеживания)
message(0x7362d09c) DepositEvent {
    player: Address;
    amount: Int as coins;
    timestamp: Int as uint32;
}

message(0x85007c9f) WithdrawEvent {
    player: Address;
    amount: Int as coins;
    timestamp: Int as uint32;
}
    