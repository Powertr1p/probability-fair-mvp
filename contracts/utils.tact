// Утилиты для работы с хешами и BOC

inline fun mixSalt(s: Int, lt: Int, from: Address, n: Int): Int {
    let b = beginCell();
    b.storeUint(s, 256);
    b.storeUint(lt, 64);
    b.storeAddress(from);
    b.storeUint(n, 32);
    return sha256(b.endCell().asSlice());
}

// Создает Cell из 256-битного числа (для консистентности с TypeScript утилитами)
inline fun createCellFromUint256(value: Int): Cell {
    return beginCell().storeUint(value, 256).endCell();
}

// Хеширует Slice и возвращает результат как Int
inline fun hashSlice(slice: Slice): Int {
    return sha256(slice);
}

// Сравнивает два хеша (для verifyChainLink)
inline fun compareHashes(hash1: Int, hash2: Int): Int {
    return hash1 == hash2 ? 1 : 0;
}