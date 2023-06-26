"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XpBridgeClient = void 0;
const casper_js_sdk_1 = require("casper-js-sdk");
const casper_js_sdk_2 = require("casper-js-sdk");
const contract_wasm_1 = __importDefault(require("./wasmgen/contract.wasm"));
const freeze_nft_call_wasm_1 = __importDefault(require("./wasmgen/freeze_nft_call.wasm"));
const withdraw_nft_call_wasm_1 = __importDefault(require("./wasmgen/withdraw_nft_call.wasm"));
const { Contract } = casper_js_sdk_2.Contracts;
const convertHashStrToHashBuff = (hashStr) => {
    let hashHex = hashStr;
    if (hashStr.startsWith("hash-")) {
        hashHex = hashStr.slice(5);
    }
    return Buffer.from(hashHex, "hex");
};
const buildHashList = (list) => list.map((hashStr) => casper_js_sdk_1.CLValueBuilder.byteArray(convertHashStrToHashBuff(hashStr)));
class XpBridgeClient {
    constructor(nodeAddress, networkName, deploySender, keys) {
        this.nodeAddress = nodeAddress;
        this.networkName = networkName;
        this.casperClient = new casper_js_sdk_1.CasperClient(nodeAddress);
        this.contractClient = new Contract(this.casperClient);
        this.keys = keys;
        this.deploySender = deploySender;
    }
    deploy(paymentAmount, deploySender, keys, wasm) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            number: new casper_js_sdk_1.CLU256(Math.ceil(Math.random() * 1000000000)),
        });
        wasm = wasm || contract_wasm_1.default;
        return this.contractClient.install(wasm, rt_args, paymentAmount, deploySender || this.deploySender, this.networkName, keys || this.keys || []);
    }
    setContractHash(contractHash, contractPackageHash) {
        this.contractClient.setContractHash(contractHash, contractPackageHash);
        this.contractHashKey = casper_js_sdk_1.CLValueBuilder.key(casper_js_sdk_1.CLValueBuilder.byteArray(convertHashStrToHashBuff(contractHash)));
    }
    initialize(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            group_key: casper_js_sdk_1.CLValueBuilder.byteArray(args.group_key),
            fee_public_key: casper_js_sdk_1.CLValueBuilder.byteArray(args.fee_public_key),
            whitelist: casper_js_sdk_1.CLValueBuilder.list(buildHashList(args.whitelist)),
        });
        return this.contractClient.callEntrypoint("init", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
    freezeNft(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            bridge_contract: casper_js_sdk_1.CLValueBuilder.byteArray(this.contractHashKey.data.data),
            contract: casper_js_sdk_1.CLValueBuilder.byteArray(convertHashStrToHashBuff(args.contract)),
            token_id: casper_js_sdk_1.CLValueBuilder.string(args.token_id),
            to: casper_js_sdk_1.CLValueBuilder.string(args.to),
            mint_with: casper_js_sdk_1.CLValueBuilder.string(args.mint_with),
            chain_nonce: casper_js_sdk_1.CLValueBuilder.u8(args.chain_nonce),
            amount: casper_js_sdk_1.CLValueBuilder.u512(args.amt),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.install(freeze_nft_call_wasm_1.default, rt_args, amt, deploySender || this.deploySender, this.networkName, keys || this.keys || []);
    }
    withdrawNft(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            contract: casper_js_sdk_1.CLValueBuilder.byteArray(convertHashStrToHashBuff(args.contract)),
            bridge_contract: casper_js_sdk_1.CLValueBuilder.byteArray(this.contractHashKey.data.data),
            token_id: casper_js_sdk_1.CLValueBuilder.string(args.token_id),
            to: casper_js_sdk_1.CLValueBuilder.string(args.to),
            chain_nonce: casper_js_sdk_1.CLValueBuilder.u8(args.chain_nonce),
            amount: casper_js_sdk_1.CLValueBuilder.u512(args.amt),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.install(withdraw_nft_call_wasm_1.default, rt_args, amt, deploySender || this.deploySender, this.networkName, keys || this.keys || []);
    }
    validatePause(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            action_id: casper_js_sdk_1.CLValueBuilder.u256(args.actionId),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.callEntrypoint("validate_pause", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
    validateUnpause(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            action_id: casper_js_sdk_1.CLValueBuilder.u256(args.actionId),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.callEntrypoint("validate_unpause", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
    validateTransferNft(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            metadata: casper_js_sdk_1.CLValueBuilder.string(args.metadata),
            mint_with: casper_js_sdk_1.CLValueBuilder.byteArray(convertHashStrToHashBuff(args.mint_with)),
            receiver: casper_js_sdk_1.CLValueBuilder.key(new casper_js_sdk_1.CLAccountHash(Buffer.from(args.receiver, "hex"))),
            action_id: casper_js_sdk_1.CLValueBuilder.u256(args.action_id),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.callEntrypoint("validate_transfer_nft", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
    validateUnfreezeNft(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            contract: casper_js_sdk_1.CLValueBuilder.byteArray(convertHashStrToHashBuff(args.contract)),
            token_id: casper_js_sdk_1.CLValueBuilder.string(args.token_id),
            receiver: casper_js_sdk_1.CLValueBuilder.key(new casper_js_sdk_1.CLAccountHash(Buffer.from(args.receiver, "hex"))),
            action_id: casper_js_sdk_1.CLValueBuilder.u256(args.action_id),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.callEntrypoint("validate_unfreeze_nft", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
    validateUpdateGroupKey(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            new_key: casper_js_sdk_1.CLValueBuilder.byteArray(args.new_key),
            action_id: casper_js_sdk_1.CLValueBuilder.u256(args.action_id),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.callEntrypoint("validate_update_group_key", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
    validateUpdateFeePk(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            new_key: casper_js_sdk_1.CLValueBuilder.byteArray(args.new_key),
            action_id: casper_js_sdk_1.CLValueBuilder.u256(args.action_id),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.callEntrypoint("validate_update_fee_pk", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
    validateWithdrawFees(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            receiver: casper_js_sdk_1.CLValueBuilder.byteArray(convertHashStrToHashBuff(args.receiver)),
            action_id: casper_js_sdk_1.CLValueBuilder.u256(args.action_id),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.callEntrypoint("validate_withdraw_fees", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
    validateBlacklist(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            contract: casper_js_sdk_1.CLValueBuilder.byteArray(convertHashStrToHashBuff(args.contract)),
            action_id: casper_js_sdk_1.CLValueBuilder.u256(args.action_id),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.callEntrypoint("validate_blacklist", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
    validateWhitelist(args, amt, deploySender, keys) {
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({
            contract: casper_js_sdk_1.CLValueBuilder.byteArray(convertHashStrToHashBuff(args.contract)),
            action_id: casper_js_sdk_1.CLValueBuilder.u256(args.action_id),
            sig_data: casper_js_sdk_1.CLValueBuilder.byteArray(args.sig_data),
        });
        return this.contractClient.callEntrypoint("validate_whitelist", rt_args, deploySender || this.deploySender, this.networkName, amt, keys || this.keys || []);
    }
}
exports.XpBridgeClient = XpBridgeClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsaURBU3VCO0FBZXZCLGlEQUEwQztBQUMxQyw0RUFBb0Q7QUFDcEQsMEZBQTZEO0FBQzdELDhGQUFpRTtBQUNqRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcseUJBQVMsQ0FBQztBQUUvQixNQUFNLHdCQUF3QixHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUU7SUFDbkQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3RCLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUMvQixPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QjtJQUNELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFjLEVBQUUsRUFBRSxDQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FDbkIsOEJBQWMsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FDNUQsQ0FBQztBQUNKLE1BQWEsY0FBYztJQVd6QixZQUNTLFdBQW1CLEVBQ25CLFdBQW1CLEVBQzFCLFlBQTBCLEVBQzFCLElBQTJCO1FBSHBCLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBSTFCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElB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