import {
  CasperClient,
  CLKey,
  CLPublicKey,
  RuntimeArgs,
  Keys,
  CLValueBuilder,
  CLByteArray,
  CLU256,
  CLU8,
  CLAccountHash,
} from "casper-js-sdk";
import {
  FreezeArgs,
  InitializeArgs,
  PauseData,
  SigData,
  UnpauseData,
  UpdateGroupKey,
  ValidateBlacklist,
  ValidateTransferData,
  ValidateUnfreezeData,
  ValidateWhitelist,
  WithdrawArgs,
  WithdrawFeeData,
} from "./types";
import { Contracts } from "casper-js-sdk";
import { CONTRACT_WASM, FREEZE_NFT_WASM, WITHDRAW_NFT_WASM } from "./wasms";
import { Serializer } from "./struct-serializer";
const { Contract } = Contracts;

const convertHashStrToHashBuff = (hashStr: string) => {
  let hashHex = hashStr;
  if (hashStr.startsWith("hash-")) {
    hashHex = hashStr.slice(5);
  }
  return Buffer.from(hashHex, "hex");
};

const buildHashList = (list: string[]) =>
  list.map((hashStr) =>
    CLValueBuilder.byteArray(convertHashStrToHashBuff(hashStr))
  );
export class XpBridgeClient {
  public casperClient: CasperClient;

  public contractClient: Contracts.Contract;

  public contractHashKey: CLKey;

  private keys?: Keys.AsymmetricKey[];

  private deploySender?: CLPublicKey;
  private serializer = Serializer();

  constructor(
    public nodeAddress: string,
    public networkName: string,
    deploySender?: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    this.casperClient = new CasperClient(nodeAddress);
    this.contractClient = new Contract(this.casperClient);
    this.keys = keys;
    this.deploySender = deploySender;
  }

  public deploy(
    paymentAmount: string,
    deploySender?: CLPublicKey,
    keys?: Keys.AsymmetricKey[],
    wasm?: Uint8Array
  ) {
    const rt_args = RuntimeArgs.fromMap({
      number: new CLU256(Math.ceil(Math.random() * 1000000000)),
    });
    wasm = wasm || CONTRACT_WASM;

    return this.contractClient.install(
      wasm,
      rt_args,
      paymentAmount,
      deploySender || this.deploySender,
      this.networkName,
      keys || this.keys || []
    );
  }
  public setContractHash(contractHash: string, contractPackageHash?: string) {
    this.contractClient.setContractHash(contractHash, contractPackageHash);
    this.contractHashKey = CLValueBuilder.key(
      CLValueBuilder.byteArray(convertHashStrToHashBuff(contractHash))
    );
  }

  public initialize(
    args: InitializeArgs,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      group_key: CLValueBuilder.byteArray(args.group_key),
      fee_public_key: CLValueBuilder.byteArray(args.fee_public_key),
      whitelist: CLValueBuilder.list(buildHashList(args.whitelist)),
    });

    return this.contractClient.callEntrypoint(
      "init",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }

  public freezeNft(
    args: FreezeArgs,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      bridge_contract: CLValueBuilder.byteArray(this.contractHashKey.data.data),
      contract: CLValueBuilder.byteArray(
        convertHashStrToHashBuff(args.contract)
      ),
      token_id: CLValueBuilder.string(args.token_id),
      to: CLValueBuilder.string(args.to),
      mint_with: CLValueBuilder.string(args.mint_with),
      chain_nonce: CLValueBuilder.u8(args.chain_nonce),
      amount: CLValueBuilder.u512(args.amt),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.install(
      FREEZE_NFT_WASM,
      rt_args,
      amt,
      deploySender || this.deploySender,
      this.networkName,
      keys || this.keys || []
    );
  }

  public withdrawNft(
    args: WithdrawArgs,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      contract: CLValueBuilder.byteArray(
        convertHashStrToHashBuff(args.contract)
      ),
      bridge_contract: CLValueBuilder.byteArray(this.contractHashKey.data.data),
      token_id: CLValueBuilder.string(args.token_id),
      to: CLValueBuilder.string(args.to),
      chain_nonce: CLValueBuilder.u8(args.chain_nonce),
      amount: CLValueBuilder.u512(args.amt),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.install(
      WITHDRAW_NFT_WASM,
      rt_args,
      amt,
      deploySender || this.deploySender,
      this.networkName,
      keys || this.keys || []
    );
  }

  public validatePause(
    args: PauseData & SigData,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      action_id: CLValueBuilder.u256(args.actionId),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.callEntrypoint(
      "validate_pause",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }
  public validateUnpause(
    args: UnpauseData & SigData,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      action_id: CLValueBuilder.u256(args.actionId),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.callEntrypoint(
      "validate_unpause",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }
  public validateTransferNft(
    args: ValidateTransferData & SigData,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      metadata: CLValueBuilder.string(args.metadata),
      mint_with: CLValueBuilder.byteArray(
        convertHashStrToHashBuff(args.mint_with)
      ),
      receiver: CLValueBuilder.key(
        new CLAccountHash(Buffer.from(args.receiver, "hex"))
      ),
      action_id: CLValueBuilder.u256(args.action_id),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.callEntrypoint(
      "validate_transfer_nft",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }

  public validateUnfreezeNft(
    args: ValidateUnfreezeData & SigData,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      contract: CLValueBuilder.byteArray(
        convertHashStrToHashBuff(args.contract)
      ),
      token_id: CLValueBuilder.string(args.token_id),
      receiver: CLValueBuilder.key(
        new CLAccountHash(Buffer.from(args.receiver, "hex"))
      ),
      action_id: CLValueBuilder.u256(args.action_id),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.callEntrypoint(
      "validate_unfreeze_nft",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }

  public validateUpdateGroupKey(
    args: UpdateGroupKey & SigData,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      new_key: CLValueBuilder.byteArray(args.new_key),
      action_id: CLValueBuilder.u256(args.action_id),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.callEntrypoint(
      "validate_update_group_key",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }

  public validateUpdateFeePk(
    args: UpdateGroupKey & SigData,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      new_key: CLValueBuilder.byteArray(args.new_key),
      action_id: CLValueBuilder.u256(args.action_id),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.callEntrypoint(
      "validate_update_fee_pk",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }
  public validateWithdrawFees(
    args: WithdrawFeeData & SigData,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      receiver: CLValueBuilder.byteArray(
        convertHashStrToHashBuff(args.receiver)
      ),
      action_id: CLValueBuilder.u256(args.action_id),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.callEntrypoint(
      "validate_withdraw_fees",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }

  public validateBlacklist(
    args: ValidateBlacklist & SigData,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      contract: CLValueBuilder.byteArray(
        convertHashStrToHashBuff(args.contract)
      ),
      action_id: CLValueBuilder.u256(args.action_id),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.callEntrypoint(
      "validate_blacklist",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }
  public validateWhitelist(
    args: ValidateWhitelist & SigData,
    amt: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const rt_args = RuntimeArgs.fromMap({
      contract: CLValueBuilder.byteArray(
        convertHashStrToHashBuff(args.contract)
      ),
      action_id: CLValueBuilder.u256(args.action_id),
      sig_data: CLValueBuilder.byteArray(args.sig_data),
    });

    return this.contractClient.callEntrypoint(
      "validate_whitelist",
      rt_args,
      deploySender || this.deploySender,
      this.networkName,
      amt,
      keys || this.keys || []
    );
  }
}
