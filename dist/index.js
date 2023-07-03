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
        const rt_args = casper_js_sdk_1.RuntimeArgs.fromMap({});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsaURBUXVCO0FBZXZCLGlEQUEwQztBQUMxQyw0RUFBb0Q7QUFDcEQsMEZBQTZEO0FBQzdELDhGQUFpRTtBQUNqRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcseUJBQVMsQ0FBQztBQUUvQixNQUFNLHdCQUF3QixHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUU7SUFDbkQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3RCLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUMvQixPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QjtJQUNELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFjLEVBQUUsRUFBRSxDQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FDbkIsOEJBQWMsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FDNUQsQ0FBQztBQUNKLE1BQWEsY0FBYztJQVd6QixZQUNTLFdBQW1CLEVBQ25CLFdBQW1CLEVBQzFCLFlBQTBCLEVBQzFCLElBQTJCO1FBSHBCLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBSTFCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElB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