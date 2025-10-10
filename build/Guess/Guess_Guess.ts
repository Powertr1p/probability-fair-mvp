import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type NewSession = {
    $$type: 'NewSession';
    queryId: bigint;
    newAnchor: bigint;
}

export function storeNewSession(src: NewSession) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeUint(src.newAnchor, 256);
    };
}

export function loadNewSession(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newAnchor = sc_0.loadUintBig(256);
    return { $$type: 'NewSession' as const, queryId: _queryId, newAnchor: _newAnchor };
}

export function loadTupleNewSession(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newAnchor = source.readBigNumber();
    return { $$type: 'NewSession' as const, queryId: _queryId, newAnchor: _newAnchor };
}

export function loadGetterTupleNewSession(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newAnchor = source.readBigNumber();
    return { $$type: 'NewSession' as const, queryId: _queryId, newAnchor: _newAnchor };
}

export function storeTupleNewSession(source: NewSession) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.newAnchor);
    return builder.build();
}

export function dictValueParserNewSession(): DictionaryValue<NewSession> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNewSession(src)).endCell());
        },
        parse: (src) => {
            return loadNewSession(src.loadRef().beginParse());
        }
    }
}

export type SetOwner = {
    $$type: 'SetOwner';
    queryId: bigint;
    owner: Address;
}

export function storeSetOwner(src: SetOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.owner);
    };
}

export function loadSetOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _owner = sc_0.loadAddress();
    return { $$type: 'SetOwner' as const, queryId: _queryId, owner: _owner };
}

export function loadTupleSetOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _owner = source.readAddress();
    return { $$type: 'SetOwner' as const, queryId: _queryId, owner: _owner };
}

export function loadGetterTupleSetOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _owner = source.readAddress();
    return { $$type: 'SetOwner' as const, queryId: _queryId, owner: _owner };
}

export function storeTupleSetOwner(source: SetOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.owner);
    return builder.build();
}

export function dictValueParserSetOwner(): DictionaryValue<SetOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetOwner(src)).endCell());
        },
        parse: (src) => {
            return loadSetOwner(src.loadRef().beginParse());
        }
    }
}

export type Withdraw = {
    $$type: 'Withdraw';
    queryId: bigint;
    amount: bigint;
    address: Address;
}

export function storeWithdraw(src: Withdraw) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.address);
    };
}

export function loadWithdraw(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _address = sc_0.loadAddress();
    return { $$type: 'Withdraw' as const, queryId: _queryId, amount: _amount, address: _address };
}

export function loadTupleWithdraw(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'Withdraw' as const, queryId: _queryId, amount: _amount, address: _address };
}

export function loadGetterTupleWithdraw(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _address = source.readAddress();
    return { $$type: 'Withdraw' as const, queryId: _queryId, amount: _amount, address: _address };
}

export function storeTupleWithdraw(source: Withdraw) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.address);
    return builder.build();
}

export function dictValueParserWithdraw(): DictionaryValue<Withdraw> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdraw(src)).endCell());
        },
        parse: (src) => {
            return loadWithdraw(src.loadRef().beginParse());
        }
    }
}

export type Deposit = {
    $$type: 'Deposit';
    queryId: bigint;
    amount: bigint;
}

export function storeDeposit(src: Deposit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
    };
}

export function loadDeposit(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    return { $$type: 'Deposit' as const, queryId: _queryId, amount: _amount };
}

export function loadTupleDeposit(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    return { $$type: 'Deposit' as const, queryId: _queryId, amount: _amount };
}

export function loadGetterTupleDeposit(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    return { $$type: 'Deposit' as const, queryId: _queryId, amount: _amount };
}

export function storeTupleDeposit(source: Deposit) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserDeposit(): DictionaryValue<Deposit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeposit(src)).endCell());
        },
        parse: (src) => {
            return loadDeposit(src.loadRef().beginParse());
        }
    }
}

export type DepositEvent = {
    $$type: 'DepositEvent';
    player: Address;
    amount: bigint;
    timestamp: bigint;
}

export function storeDepositEvent(src: DepositEvent) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1935855772, 32);
        b_0.storeAddress(src.player);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.timestamp, 32);
    };
}

export function loadDepositEvent(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1935855772) { throw Error('Invalid prefix'); }
    const _player = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _timestamp = sc_0.loadUintBig(32);
    return { $$type: 'DepositEvent' as const, player: _player, amount: _amount, timestamp: _timestamp };
}

export function loadTupleDepositEvent(source: TupleReader) {
    const _player = source.readAddress();
    const _amount = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    return { $$type: 'DepositEvent' as const, player: _player, amount: _amount, timestamp: _timestamp };
}

export function loadGetterTupleDepositEvent(source: TupleReader) {
    const _player = source.readAddress();
    const _amount = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    return { $$type: 'DepositEvent' as const, player: _player, amount: _amount, timestamp: _timestamp };
}

export function storeTupleDepositEvent(source: DepositEvent) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.player);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.timestamp);
    return builder.build();
}

export function dictValueParserDepositEvent(): DictionaryValue<DepositEvent> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDepositEvent(src)).endCell());
        },
        parse: (src) => {
            return loadDepositEvent(src.loadRef().beginParse());
        }
    }
}

export type WithdrawEvent = {
    $$type: 'WithdrawEvent';
    player: Address;
    amount: bigint;
    timestamp: bigint;
}

export function storeWithdrawEvent(src: WithdrawEvent) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2231401631, 32);
        b_0.storeAddress(src.player);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.timestamp, 32);
    };
}

export function loadWithdrawEvent(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2231401631) { throw Error('Invalid prefix'); }
    const _player = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _timestamp = sc_0.loadUintBig(32);
    return { $$type: 'WithdrawEvent' as const, player: _player, amount: _amount, timestamp: _timestamp };
}

export function loadTupleWithdrawEvent(source: TupleReader) {
    const _player = source.readAddress();
    const _amount = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    return { $$type: 'WithdrawEvent' as const, player: _player, amount: _amount, timestamp: _timestamp };
}

export function loadGetterTupleWithdrawEvent(source: TupleReader) {
    const _player = source.readAddress();
    const _amount = source.readBigNumber();
    const _timestamp = source.readBigNumber();
    return { $$type: 'WithdrawEvent' as const, player: _player, amount: _amount, timestamp: _timestamp };
}

export function storeTupleWithdrawEvent(source: WithdrawEvent) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.player);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.timestamp);
    return builder.build();
}

export function dictValueParserWithdrawEvent(): DictionaryValue<WithdrawEvent> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawEvent(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawEvent(src.loadRef().beginParse());
        }
    }
}

export type Guess$Data = {
    $$type: 'Guess$Data';
    owner: Address | null;
    anchor: bigint;
    totalDeposits: bigint;
}

export function storeGuess$Data(src: Guess$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.anchor, 256);
        b_0.storeCoins(src.totalDeposits);
    };
}

export function loadGuess$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadMaybeAddress();
    const _anchor = sc_0.loadUintBig(256);
    const _totalDeposits = sc_0.loadCoins();
    return { $$type: 'Guess$Data' as const, owner: _owner, anchor: _anchor, totalDeposits: _totalDeposits };
}

export function loadTupleGuess$Data(source: TupleReader) {
    const _owner = source.readAddressOpt();
    const _anchor = source.readBigNumber();
    const _totalDeposits = source.readBigNumber();
    return { $$type: 'Guess$Data' as const, owner: _owner, anchor: _anchor, totalDeposits: _totalDeposits };
}

export function loadGetterTupleGuess$Data(source: TupleReader) {
    const _owner = source.readAddressOpt();
    const _anchor = source.readBigNumber();
    const _totalDeposits = source.readBigNumber();
    return { $$type: 'Guess$Data' as const, owner: _owner, anchor: _anchor, totalDeposits: _totalDeposits };
}

export function storeTupleGuess$Data(source: Guess$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.anchor);
    builder.writeNumber(source.totalDeposits);
    return builder.build();
}

export function dictValueParserGuess$Data(): DictionaryValue<Guess$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGuess$Data(src)).endCell());
        },
        parse: (src) => {
            return loadGuess$Data(src.loadRef().beginParse());
        }
    }
}

 type Guess_init_args = {
    $$type: 'Guess_init_args';
}

function initGuess_init_args(src: Guess_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
    };
}

async function Guess_init() {
    const __code = Cell.fromHex('b5ee9c7241021f0100050500022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d90116020271020d020120030802015804060151b03dfb51343480006384f5cb00645b64fe9000788074fffe8015481b04e54c3e109c0838b6cf1b0c60050002200151b2697b51343480006384f5cb00645b64fe9000788074fffe8015481b04e54c3e109c0838b6cf1b0c6007000222020120090b0155b41bbda89a1a400031c27ae580322db27f48003c403a7fff400aa40d8272a61f084e041c4aa25b678d86300a0072019b9320d74a91d5e868f90400da11019b9320d74a91d5e868f90400da1101c8cbffc9d09b9320d74a91d5e868f90400da1101ba91719170e20151b7da5da89a1a400031c27ae580322db27f48003c403a7fff400aa40d8272a61f084e041c5b678d86300c0002210201200e130201480f110155b38ffb51343480006384f5cb00645b64fe9000788074fffe8015481b04e54c3e109c0838954cb6cf1b0c6010011c5520db3c75a908a401ba9171e070150151f9da89a1a400031c27ae580322db27f48003c403a7fff400aa40d8272a61f084e041c4aa65b678d8631200aa039b9320d74a91d5e868f90400da11029b9320d74a91d5e868f90400da11c812cb3fc9d09b9320d74a91d5e868f90400da11c813cbffcbffcbffc9d09b9320d74a91d5e868f90400da1175a908a401ba91719170e20155bb56ced44d0d200018e13d72c01916d93fa4001e201d3fffa0055206c139530f8427020e25522db3c6c31814010cdb3c75a908a41500aac813cbffc9d09b9320d74a91d5e868f90400da11c812cbffc9d09b9320d74a91d5e868f90400da11c813cb3fc9d09b9320d74a91d5e868f90400da11c812cbff12cbffcbffc9d09b9320d74a91d5e868f90400da1104bc01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e13d72c01916d93fa4001e201d3fffa0055206c139530f8427020e204925f04e07023d74920c21f953103d31f04de21c002e30221c001e30221c004e30221c0031718191a00725b02d33f31fa40308200c241f8425003206e925b7092c705e212f2f402c87f01ca0055205a206e9430cf84809201cee212cbff01fa02c9ed54007e5f0301d33f31d3ff3082009858226eb39cf84223206e925b7092c705e29170e2f2f458c87f01ca0055205a206e9430cf84809201cee212cbff01fa02c9ed5400b65b02d33f31fa00305133a0f842f8234150c8552082107362d09c5004cb1f12ce01fa02cb1fc9c88258c000000000000000000000000101cb67ccc970fb0002c87f01ca0055205a206e9430cf84809201cee212cbff01fa02c9ed5402dee302218210946a98b6ba8e535b02d33f30c8018210aff90f5758cb1fcb3fc913f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055205a206e9430cf84809201cee212cbff01fa02c9ed54e034c00003c12113b0e3025f03f2c0821b1e02fe5b02d33f31fa00fa4030817a19f84224206e925b7092c705e2f2f48200b4665352bef2f45141a1f823546530c85520821085007c9f5004cb1f12ce01fa02cb1fc9c88258c000000000000000000000000101cb67ccc970fb005044716d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf818a1c1d001a58cf8680cf8480f400f400cf810048e2f400c901fb0002c87f01ca0055205a206e9430cf84809201cee212cbff01fa02c9ed54003a02c87f01ca0055205a206e9430cf84809201cee212cbff01fa02c9ed54151d51f3');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initGuess_init_args({ $$type: 'Guess_init_args' })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const Guess_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    31257: { message: "Withdrawal is only allowed for owner" },
    39000: { message: "FORBIDDEN" },
    46182: { message: "Insufficient balance in contract" },
    49729: { message: "Unauthorized" },
} as const

export const Guess_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Withdrawal is only allowed for owner": 31257,
    "FORBIDDEN": 39000,
    "Insufficient balance in contract": 46182,
    "Unauthorized": 49729,
} as const

const Guess_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"NewSession","header":1,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newAnchor","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"SetOwner","header":2,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Withdraw","header":3,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Deposit","header":4,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"DepositEvent","header":1935855772,"fields":[{"name":"player","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"timestamp","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"WithdrawEvent","header":2231401631,"fields":[{"name":"player","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"timestamp","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"Guess$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":true}},{"name":"anchor","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"totalDeposits","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
]

const Guess_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "NewSession": 1,
    "SetOwner": 2,
    "Withdraw": 3,
    "Deposit": 4,
    "DepositEvent": 1935855772,
    "WithdrawEvent": 2231401631,
}

const Guess_getters: ABIGetter[] = [
    {"name":"get_owner","methodId":80293,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"get_anchor","methodId":98002,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_total_deposits","methodId":73975,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"verifyRound","methodId":101951,"arguments":[{"name":"serverSeed","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"roomSeed","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nonce","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"claimedResult","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"verifyRoundSlice","methodId":106495,"arguments":[{"name":"serverSeedSlice","type":{"kind":"simple","type":"slice","optional":false}},{"name":"roomSeedSlice","type":{"kind":"simple","type":"slice","optional":false}},{"name":"nonce","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"claimedResult","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"calculateResult","methodId":128364,"arguments":[{"name":"serverSeed","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"roomSeed","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nonce","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"verifyChainLink","methodId":82141,"arguments":[{"name":"seedNextSlice","type":{"kind":"simple","type":"slice","optional":false}},{"name":"seedCurrentSlice","type":{"kind":"simple","type":"slice","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
]

export const Guess_getterMapping: { [key: string]: string } = {
    'get_owner': 'getGetOwner',
    'get_anchor': 'getGetAnchor',
    'get_total_deposits': 'getGetTotalDeposits',
    'verifyRound': 'getVerifyRound',
    'verifyRoundSlice': 'getVerifyRoundSlice',
    'calculateResult': 'getCalculateResult',
    'verifyChainLink': 'getVerifyChainLink',
}

const Guess_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"empty"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetOwner"}},
    {"receiver":"internal","message":{"kind":"typed","type":"NewSession"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deposit"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Withdraw"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class Guess implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = Guess_errors_backward;
    public static readonly opcodes = Guess_opcodes;
    
    static async init() {
        return await Guess_init();
    }
    
    static async fromInit() {
        const __gen_init = await Guess_init();
        const address = contractAddress(0, __gen_init);
        return new Guess(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new Guess(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  Guess_types,
        getters: Guess_getters,
        receivers: Guess_receivers,
        errors: Guess_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: null | SetOwner | NewSession | Deposit | Withdraw | Deploy) {
        
        let body: Cell | null = null;
        if (message === null) {
            body = new Cell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetOwner') {
            body = beginCell().store(storeSetOwner(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'NewSession') {
            body = beginCell().store(storeNewSession(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deposit') {
            body = beginCell().store(storeDeposit(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Withdraw') {
            body = beginCell().store(storeWithdraw(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_owner', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
    async getGetAnchor(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_anchor', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetTotalDeposits(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_total_deposits', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getVerifyRound(provider: ContractProvider, serverSeed: bigint, roomSeed: bigint, nonce: bigint, claimedResult: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(serverSeed);
        builder.writeNumber(roomSeed);
        builder.writeNumber(nonce);
        builder.writeNumber(claimedResult);
        const source = (await provider.get('verifyRound', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getVerifyRoundSlice(provider: ContractProvider, serverSeedSlice: Slice, roomSeedSlice: Slice, nonce: bigint, claimedResult: bigint) {
        const builder = new TupleBuilder();
        builder.writeSlice(serverSeedSlice.asCell());
        builder.writeSlice(roomSeedSlice.asCell());
        builder.writeNumber(nonce);
        builder.writeNumber(claimedResult);
        const source = (await provider.get('verifyRoundSlice', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getCalculateResult(provider: ContractProvider, serverSeed: bigint, roomSeed: bigint, nonce: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(serverSeed);
        builder.writeNumber(roomSeed);
        builder.writeNumber(nonce);
        const source = (await provider.get('calculateResult', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getVerifyChainLink(provider: ContractProvider, seedNextSlice: Slice, seedCurrentSlice: Slice) {
        const builder = new TupleBuilder();
        builder.writeSlice(seedNextSlice.asCell());
        builder.writeSlice(seedCurrentSlice.asCell());
        const source = (await provider.get('verifyChainLink', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
}