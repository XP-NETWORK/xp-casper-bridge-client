import {
  CLAccountHash,
  CLAccountHashBytesParser,
  CLByteArray,
  CLByteArrayBytesParser,
  CLKey,
  CLKeyBytesParser,
  CLString,
  CLStringBytesParser,
  CLU256,
  CLU256BytesParser,
  CLU512,
  CLU512BytesParser,
  CLU8,
  CLU8BytesParser,
} from "casper-js-sdk";
import {
  FreezeArgs,
  UpdateGroupKey,
  ValidateUnfreezeData,
  ValidateWhitelist,
  ValidateBlacklist,
  WithdrawArgs,
  WithdrawFeeData,
  PauseData,
  UnpauseData,
  ValidateTransferData,
  FeeSig,
} from "./types";

export function Serializer() {
  const u256Serializer = new CLU256BytesParser();
  const u512Serializer = new CLU512BytesParser();
  const u8Serializer = new CLU8BytesParser();
  const byteArraySerializer = new CLByteArrayBytesParser();
  const stringSerializer = new CLStringBytesParser();
  const accountHashSerializer = new CLAccountHashBytesParser();
  const keySerializer = new CLKeyBytesParser();
  return {
    whitelistNft(args: ValidateWhitelist) {
      const act_id = u256Serializer
        .toBytes(new CLU256(args.action_id))
        .expect(
          "Serialize(ValidateWhitelist): Failed to serialize action id to bytes."
        );
      const contract = byteArraySerializer
        .toBytes(new CLByteArray(Buffer.from(args.contract, "hex")))
        .expect(
          "Serialize(ValidateWhitelist): Failed to serialize contract to bytes."
        );
      return Buffer.concat([act_id, contract]);
    },
    blacklistNft(args: ValidateBlacklist) {
      const act_id = u256Serializer
        .toBytes(new CLU256(args.action_id))
        .expect(
          "Serialize(ValidateBlacklist): Failed to serialize action id to bytes."
        );
      const contract = byteArraySerializer
        .toBytes(new CLByteArray(Buffer.from(args.contract, "hex")))
        .expect(
          "Serialize(ValidateBlacklist): Failed to serialize contract to bytes."
        );
      return Buffer.concat([act_id, contract]);
    },
    freezeNft(args: FreezeArgs) {
      // let (contract, remainder) = ContractHash::from_bytes(bytes)?;
      // let (to, remainder) = String::from_bytes(remainder)?;
      // let (token_id, remainder) = TokenIdentifier::from_bytes(remainder)?;
      // let (mint_with, remainder) = String::from_bytes(remainder)?;
      // let (sig_data, remainder) = Vec::from_bytes(remainder)?;
      // let (chain_nonce, remainder) = u8::from_bytes(remainder)?;
      // let (amt, remainder) = U512::from_bytes(remainder)?;
      const contract = byteArraySerializer
        .toBytes(new CLByteArray(Buffer.from(args.contract, "hex")))
        .expect(
          "Serialize(FreezeArgs): Failed to serialize contract to bytes."
        );
      const to = stringSerializer
        .toBytes(new CLString(args.to))
        .expect("Serialize(FreezeArgs): Failed to serialize to to bytes.");

      const tokenIdentifier = stringSerializer
        .toBytes(new CLString(args.token_id))
        .expect(
          "Serialize(FreezeArgs): Failed to serialize token_id to bytes."
        );
      const mint_with = stringSerializer
        .toBytes(new CLString(args.mint_with))
        .expect(
          "Serialize(FreezeArgs): Failed to serialize mint_with to bytes."
        );
      const sig_data = stringSerializer
        .toBytes(new CLString(Buffer.from(args.sig_data).toString("hex")))
        .expect(
          "Serialize(FreezeArgs): Failed to serialize sig_data to bytes."
        );
      console.log(`Sig:`, Buffer.from(sig_data).toString("hex"));
      const chain_nonce = u8Serializer
        .toBytes(new CLU8(args.chain_nonce))
        .expect(
          "Serialize(FreezeArgs): Failed to serialize chain_nonce to bytes."
        );
      const amt = u512Serializer
        .toBytes(new CLU512(args.amt))
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
    withdrawNft(args: WithdrawArgs) {
      // let (contract, remainder) = ContractHash::from_bytes(bytes)?;
      // let (to, remainder) = String::from_bytes(remainder)?;
      // let (token_id, remainder) = TokenIdentifier::from_bytes(remainder)?;
      // let (sig_data, remainder) = Vec::from_bytes(remainder)?;
      // let (chain_nonce, remainder) = u8::from_bytes(remainder)?;
      // let (amt, remainder) = U512::from_bytes(remainder)?;
      const contract = byteArraySerializer
        .toBytes(new CLByteArray(Buffer.from(args.contract, "hex")))
        .expect(
          "Serialize(WithdrawArgs): Failed to serialize contract to bytes."
        );
      const to = stringSerializer
        .toBytes(new CLString(args.to))
        .expect("Serialize(WithdrawArgs): Failed to serialize to to bytes.");

      const tokenIdentifier = stringSerializer
        .toBytes(new CLString(args.token_id))
        .expect(
          "Serialize(WithdrawArgs): Failed to serialize token_id to bytes."
        );

      const sig_data = stringSerializer
        .toBytes(new CLString(Buffer.from(args.sig_data).toString("hex")))
        .expect(
          "Serialize(WithdrawArgs): Failed to serialize sig_data to bytes."
        );
      const chain_nonce = u8Serializer
        .toBytes(new CLU8(args.chain_nonce))
        .expect(
          "Serialize(WithdrawArgs): Failed to serialize chain_nonce to bytes."
        );
      const amt = u512Serializer
        .toBytes(new CLU512(args.amt))
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
    withdrawFee(args: WithdrawFeeData) {
      // let (action_id, remainder) = U256::from_bytes(bytes)?;
      // let (receiver, remainder) = AccountHash::from_bytes(remainder)?;
      let action_id = u256Serializer
        .toBytes(new CLU256(args.action_id))
        .expect(
          "Serialize(WithdrawFeeData): Failed to serialize action_id to bytes."
        );
      let receiver = accountHashSerializer
        .toBytes(new CLAccountHash(Buffer.from(args.receiver, "hex")))
        .expect(
          "Serialize(WithdrawFeeData): Failed to serialize receiver to bytes."
        );
      return Buffer.concat([action_id, receiver]);
    },
    pauseData(args: PauseData) {
      let action_id = u256Serializer
        .toBytes(new CLU256(args.actionId))
        .expect(
          "Serialize(PauseData): Failed to serialize action_id to bytes."
        );
      return Buffer.concat([action_id]);
    },
    unpauseData(args: UnpauseData) {
      let action_id = u256Serializer
        .toBytes(new CLU256(args.actionId))
        .expect(
          "Serialize(UnpauseData): Failed to serialize action_id to bytes."
        );
      return Buffer.concat([action_id]);
    },
    validateTransferData(args: ValidateTransferData) {
      //   let (mint_with, remainder) = ContractHash::from_bytes(bytes)?;
      //   let (receiver, remainder) = Key::from_bytes(remainder)?;
      //   let (metadata, remainder) = String::from_bytes(remainder)?;
      //   let (action_id, remainder) = U256::from_bytes(remainder)?;
      const mint_with = byteArraySerializer
        .toBytes(new CLByteArray(Buffer.from(args.mint_with, "hex")))
        .expect(
          "Serialize(ValidateTransferData): Failed to serialize mint_with to bytes."
        );
      const receiver = keySerializer
        .toBytes(
          new CLKey(new CLAccountHash(Buffer.from(args.receiver, "hex")))
        )
        .expect(
          "Serialize(ValidateTransferData): Failed to serialize receiver to bytes."
        );
      const metadata = stringSerializer
        .toBytes(new CLString(args.metadata))
        .expect(
          "Serialize(ValidateTransferData): Failed to serialize metadata to bytes."
        );
      const action_id = u256Serializer
        .toBytes(new CLU256(args.action_id))
        .expect(
          "Serialize(ValidateTransferData): Failed to serialize action_id to bytes."
        );
      return Buffer.concat([mint_with, receiver, metadata, action_id]);
    },
    validateUnfreezeData(args: ValidateUnfreezeData) {
      //  let (contract, remainder) = ContractHash::from_bytes(bytes)?;
      //  let (receiver, remainder) = Key::from_bytes(remainder)?;
      //  let (token_id, remainder) = TokenIdentifier::from_bytes(remainder)?;
      //  let (action_id, remainder) = U256::from_bytes(remainder)?;
      const contract = byteArraySerializer
        .toBytes(new CLByteArray(Buffer.from(args.contract, "hex")))
        .expect(
          "Serialize(ValidateUnfreezeData): Failed to serialize contract to bytes."
        );
      const receiver = keySerializer
        .toBytes(
          new CLKey(new CLAccountHash(Buffer.from(args.receiver, "hex")))
        )
        .expect(
          "Serialize(ValidateUnfreezeData): Failed to serialize receiver to bytes."
        );
      const tokenIdentifier = stringSerializer
        .toBytes(new CLString(args.token_id))
        .expect(
          "Serialize(ValidateUnfreezeData): Failed to serialize token_id to bytes."
        );
      const action_id = u256Serializer
        .toBytes(new CLU256(args.action_id))
        .expect(
          "Serialize(ValidateUnfreezeData): Failed to serialize action_id to bytes."
        );
      return Buffer.concat([contract, receiver, tokenIdentifier, action_id]);
    },
    updateGroupKeyData(args: UpdateGroupKey) {
      //  let (action_id, remainder) = U256::from_bytes(bytes)?;
      // let (new_key, remainder) = Vec::from_bytes(remainder)?;
      const action_id = u256Serializer
        .toBytes(new CLU256(args.action_id))
        .expect(
          "Serialize(UpdateGroupKey): Failed to serialize action_id to bytes."
        );
      const new_key = byteArraySerializer
        .toBytes(new CLByteArray(args.new_key))
        .expect(
          "Serialize(UpdateGroupKey): Failed to serialize new_key to bytes."
        );
      return Buffer.concat([action_id, new_key]);
    },
    feeSig(args: FeeSig) {
      const value = u512Serializer
        .toBytes(new CLU512(args.value))
        .expect("Serialize(FeeSig): Failed to serialize value to bytes.");
      const from = u8Serializer
        .toBytes(new CLU8(args.from))
        .expect("Serialize(FeeSig): Failed to serialize from to bytes.");
      const to = u8Serializer
        .toBytes(new CLU8(args.to))
        .expect("Serialize(FeeSig): Failed to serialize to to bytes.");
      const receiver = stringSerializer
        .toBytes(new CLString(args.receiver))
        .expect("Serialize(FeeSig): Failed to serialize receiver to bytes.");
      return Buffer.concat([value, from, to, receiver]);
    },
  };
}
