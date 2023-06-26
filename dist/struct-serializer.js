"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serializer = void 0;
const casper_js_sdk_1 = require("casper-js-sdk");
function Serializer() {
    const u256Serializer = new casper_js_sdk_1.CLU256BytesParser();
    const u512Serializer = new casper_js_sdk_1.CLU512BytesParser();
    const u8Serializer = new casper_js_sdk_1.CLU8BytesParser();
    const byteArraySerializer = new casper_js_sdk_1.CLByteArrayBytesParser();
    const stringSerializer = new casper_js_sdk_1.CLStringBytesParser();
    const accountHashSerializer = new casper_js_sdk_1.CLAccountHashBytesParser();
    const keySerializer = new casper_js_sdk_1.CLKeyBytesParser();
    return {
        whitelistNft(args) {
            const act_id = u256Serializer
                .toBytes(new casper_js_sdk_1.CLU256(args.action_id))
                .expect("Serialize(ValidateWhitelist): Failed to serialize action id to bytes.");
            const contract = byteArraySerializer
                .toBytes(new casper_js_sdk_1.CLByteArray(Buffer.from(args.contract, "hex")))
                .expect("Serialize(ValidateWhitelist): Failed to serialize contract to bytes.");
            return Buffer.concat([act_id, contract]);
        },
        blacklistNft(args) {
            const act_id = u256Serializer
                .toBytes(new casper_js_sdk_1.CLU256(args.action_id))
                .expect("Serialize(ValidateBlacklist): Failed to serialize action id to bytes.");
            const contract = byteArraySerializer
                .toBytes(new casper_js_sdk_1.CLByteArray(Buffer.from(args.contract, "hex")))
                .expect("Serialize(ValidateBlacklist): Failed to serialize contract to bytes.");
            return Buffer.concat([act_id, contract]);
        },
        freezeNft(args) {
            // let (contract, remainder) = ContractHash::from_bytes(bytes)?;
            // let (to, remainder) = String::from_bytes(remainder)?;
            // let (token_id, remainder) = TokenIdentifier::from_bytes(remainder)?;
            // let (mint_with, remainder) = String::from_bytes(remainder)?;
            // let (sig_data, remainder) = Vec::from_bytes(remainder)?;
            // let (chain_nonce, remainder) = u8::from_bytes(remainder)?;
            // let (amt, remainder) = U512::from_bytes(remainder)?;
            const contract = byteArraySerializer
                .toBytes(new casper_js_sdk_1.CLByteArray(Buffer.from(args.contract, "hex")))
                .expect("Serialize(FreezeArgs): Failed to serialize contract to bytes.");
            const to = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(args.to))
                .expect("Serialize(FreezeArgs): Failed to serialize to to bytes.");
            const tokenIdentifier = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(args.token_id))
                .expect("Serialize(FreezeArgs): Failed to serialize token_id to bytes.");
            const mint_with = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(args.mint_with))
                .expect("Serialize(FreezeArgs): Failed to serialize mint_with to bytes.");
            const sig_data = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(Buffer.from(args.sig_data).toString("hex")))
                .expect("Serialize(FreezeArgs): Failed to serialize sig_data to bytes.");
            console.log(`Sig:`, Buffer.from(sig_data).toString("hex"));
            const chain_nonce = u8Serializer
                .toBytes(new casper_js_sdk_1.CLU8(args.chain_nonce))
                .expect("Serialize(FreezeArgs): Failed to serialize chain_nonce to bytes.");
            const amt = u512Serializer
                .toBytes(new casper_js_sdk_1.CLU512(args.amt))
                .expect("Serialize(FreezeArgs): Failed to serialize amt to bytes.");
            return Buffer.concat([
                contract,
                to,
                tokenIdentifier,
                mint_with,
                sig_data,
                chain_nonce,
                amt,
            ]);
        },
        withdrawNft(args) {
            // let (contract, remainder) = ContractHash::from_bytes(bytes)?;
            // let (to, remainder) = String::from_bytes(remainder)?;
            // let (token_id, remainder) = TokenIdentifier::from_bytes(remainder)?;
            // let (sig_data, remainder) = Vec::from_bytes(remainder)?;
            // let (chain_nonce, remainder) = u8::from_bytes(remainder)?;
            // let (amt, remainder) = U512::from_bytes(remainder)?;
            const contract = byteArraySerializer
                .toBytes(new casper_js_sdk_1.CLByteArray(Buffer.from(args.contract, "hex")))
                .expect("Serialize(WithdrawArgs): Failed to serialize contract to bytes.");
            const to = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(args.to))
                .expect("Serialize(WithdrawArgs): Failed to serialize to to bytes.");
            const tokenIdentifier = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(args.token_id))
                .expect("Serialize(WithdrawArgs): Failed to serialize token_id to bytes.");
            const sig_data = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(Buffer.from(args.sig_data).toString("hex")))
                .expect("Serialize(WithdrawArgs): Failed to serialize sig_data to bytes.");
            const chain_nonce = u8Serializer
                .toBytes(new casper_js_sdk_1.CLU8(args.chain_nonce))
                .expect("Serialize(WithdrawArgs): Failed to serialize chain_nonce to bytes.");
            const amt = u512Serializer
                .toBytes(new casper_js_sdk_1.CLU512(args.amt))
                .expect("Serialize(WithdrawArgs): Failed to serialize amt to bytes.");
            return Buffer.concat([
                contract,
                to,
                tokenIdentifier,
                sig_data,
                chain_nonce,
                amt,
            ]);
        },
        withdrawFee(args) {
            // let (action_id, remainder) = U256::from_bytes(bytes)?;
            // let (receiver, remainder) = AccountHash::from_bytes(remainder)?;
            let action_id = u256Serializer
                .toBytes(new casper_js_sdk_1.CLU256(args.action_id))
                .expect("Serialize(WithdrawFeeData): Failed to serialize action_id to bytes.");
            let receiver = accountHashSerializer
                .toBytes(new casper_js_sdk_1.CLAccountHash(Buffer.from(args.receiver, "hex")))
                .expect("Serialize(WithdrawFeeData): Failed to serialize receiver to bytes.");
            return Buffer.concat([action_id, receiver]);
        },
        pauseData(args) {
            let action_id = u256Serializer
                .toBytes(new casper_js_sdk_1.CLU256(args.actionId))
                .expect("Serialize(PauseData): Failed to serialize action_id to bytes.");
            return Buffer.concat([action_id]);
        },
        unpauseData(args) {
            let action_id = u256Serializer
                .toBytes(new casper_js_sdk_1.CLU256(args.actionId))
                .expect("Serialize(UnpauseData): Failed to serialize action_id to bytes.");
            return Buffer.concat([action_id]);
        },
        validateTransferData(args) {
            //   let (mint_with, remainder) = ContractHash::from_bytes(bytes)?;
            //   let (receiver, remainder) = Key::from_bytes(remainder)?;
            //   let (metadata, remainder) = String::from_bytes(remainder)?;
            //   let (action_id, remainder) = U256::from_bytes(remainder)?;
            const mint_with = byteArraySerializer
                .toBytes(new casper_js_sdk_1.CLByteArray(Buffer.from(args.mint_with, "hex")))
                .expect("Serialize(ValidateTransferData): Failed to serialize mint_with to bytes.");
            const receiver = keySerializer
                .toBytes(new casper_js_sdk_1.CLKey(new casper_js_sdk_1.CLAccountHash(Buffer.from(args.receiver, "hex"))))
                .expect("Serialize(ValidateTransferData): Failed to serialize receiver to bytes.");
            const metadata = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(args.metadata))
                .expect("Serialize(ValidateTransferData): Failed to serialize metadata to bytes.");
            const action_id = u256Serializer
                .toBytes(new casper_js_sdk_1.CLU256(args.action_id))
                .expect("Serialize(ValidateTransferData): Failed to serialize action_id to bytes.");
            return Buffer.concat([mint_with, receiver, metadata, action_id]);
        },
        validateUnfreezeData(args) {
            //  let (contract, remainder) = ContractHash::from_bytes(bytes)?;
            //  let (receiver, remainder) = Key::from_bytes(remainder)?;
            //  let (token_id, remainder) = TokenIdentifier::from_bytes(remainder)?;
            //  let (action_id, remainder) = U256::from_bytes(remainder)?;
            const contract = byteArraySerializer
                .toBytes(new casper_js_sdk_1.CLByteArray(Buffer.from(args.contract, "hex")))
                .expect("Serialize(ValidateUnfreezeData): Failed to serialize contract to bytes.");
            const receiver = keySerializer
                .toBytes(new casper_js_sdk_1.CLKey(new casper_js_sdk_1.CLAccountHash(Buffer.from(args.receiver, "hex"))))
                .expect("Serialize(ValidateUnfreezeData): Failed to serialize receiver to bytes.");
            const tokenIdentifier = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(args.token_id))
                .expect("Serialize(ValidateUnfreezeData): Failed to serialize token_id to bytes.");
            const action_id = u256Serializer
                .toBytes(new casper_js_sdk_1.CLU256(args.action_id))
                .expect("Serialize(ValidateUnfreezeData): Failed to serialize action_id to bytes.");
            return Buffer.concat([contract, receiver, tokenIdentifier, action_id]);
        },
        updateGroupKeyData(args) {
            //  let (action_id, remainder) = U256::from_bytes(bytes)?;
            // let (new_key, remainder) = Vec::from_bytes(remainder)?;
            const action_id = u256Serializer
                .toBytes(new casper_js_sdk_1.CLU256(args.action_id))
                .expect("Serialize(UpdateGroupKey): Failed to serialize action_id to bytes.");
            const new_key = byteArraySerializer
                .toBytes(new casper_js_sdk_1.CLByteArray(args.new_key))
                .expect("Serialize(UpdateGroupKey): Failed to serialize new_key to bytes.");
            return Buffer.concat([action_id, new_key]);
        },
        feeSig(args) {
            const value = u512Serializer
                .toBytes(new casper_js_sdk_1.CLU512(args.value))
                .expect("Serialize(FeeSig): Failed to serialize value to bytes.");
            const from = u8Serializer
                .toBytes(new casper_js_sdk_1.CLU8(args.from))
                .expect("Serialize(FeeSig): Failed to serialize from to bytes.");
            const to = u8Serializer
                .toBytes(new casper_js_sdk_1.CLU8(args.to))
                .expect("Serialize(FeeSig): Failed to serialize to to bytes.");
            const receiver = stringSerializer
                .toBytes(new casper_js_sdk_1.CLString(args.receiver))
                .expect("Serialize(FeeSig): Failed to serialize receiver to bytes.");
            return Buffer.concat([value, from, to, receiver]);
        },
    };
}
exports.Serializer = Serializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RydWN0LXNlcmlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc3RydWN0LXNlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaURBZXVCO0FBZXZCLFNBQWdCLFVBQVU7SUFDeEIsTUFBTSxjQUFjLEdBQUcsSUFBSSxpQ0FBaUIsRUFBRSxDQUFDO0lBQy9DLE1BQU0sY0FBYyxHQUFHLElBQUksaUNBQWlCLEVBQUUsQ0FBQztJQUMvQyxNQUFNLFlBQVksR0FBRyxJQUFJLCtCQUFlLEVBQUUsQ0FBQztJQUMzQyxNQUFNLG1CQUFtQixHQUFHLElBQUksc0NBQXNCLEVBQUUsQ0FBQztJQUN6RCxNQUFNLGdCQUFnQixHQUFHLElBQUksbUNBQW1CLEVBQUUsQ0FBQztJQUNuRCxNQUFNLHFCQUFxQixHQUFHLElBQUksd0NBQXdCLEVBQUUsQ0FBQztJQUM3RCxNQUFNLGFBQWEsR0FBRyxJQUFJLGdDQUFnQixFQUFFLENBQUM7SUFDN0MsT0FBTztRQUNMLFlBQVksQ0FBQyxJQUF1QjtZQUNsQyxNQUFNLE1BQU0sR0FBRyxjQUFjO2lCQUMxQixPQUFPLENBQUMsSUFBSSxzQkFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDbkMsTUFBTSxDQUNMLHVFQUF1RSxDQUN4RSxDQUFDO1lBQ0osTUFBTSxRQUFRLEdBQUcsbUJBQW1CO2lCQUNqQyxPQUFPLENBQUMsSUFBSSwyQkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUMzRCxNQUFNLENBQ0wsc0VBQXNFLENBQ3ZFLENBQUM7WUFDSixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQ0QsWUFBWSxDQUFDLElBQXVCO1lBQ2xDLE1BQU0sTUFBTSxHQUFHLGNBQWM7aUJBQzFCLE9B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