import { CasperClient, CLPublicKey, Keys, CLKey } from "casper-js-sdk";
import { FreezeArgs, InitializeArgs, PauseData, SigData, UnpauseData, UpdateGroupKey, ValidateBlacklist, ValidateTransferData, ValidateUnfreezeData, ValidateWhitelist, WithdrawArgs, WithdrawFeeData } from "./types";
import { Contracts } from "casper-js-sdk";
export declare class XpBridgeClient {
    nodeAddress: string;
    networkName: string;
    casperClient: CasperClient;
    contractClient: Contracts.Contract;
    contractHashKey: CLKey;
    private keys?;
    private deploySender?;
    constructor(nodeAddress: string, networkName: string, deploySender?: CLPublicKey, keys?: Keys.AsymmetricKey[]);
    deploy(paymentAmount: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[], wasm?: Uint8Array): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    setContractHash(contractHash: string, contractPackageHash?: string): void;
    initialize(args: InitializeArgs, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    freezeNft(args: FreezeArgs, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    withdrawNft(args: WithdrawArgs, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    validatePause(args: PauseData & SigData, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    validateUnpause(args: UnpauseData & SigData, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    validateTransferNft(args: ValidateTransferData & SigData, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    validateUnfreezeNft(args: ValidateUnfreezeData & SigData, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    validateUpdateGroupKey(args: UpdateGroupKey & SigData, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    validateUpdateFeePk(args: UpdateGroupKey & SigData, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    validateWithdrawFees(args: WithdrawFeeData & SigData, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    validateBlacklist(args: ValidateBlacklist & SigData, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
    validateWhitelist(args: ValidateWhitelist & SigData, amt: string, deploySender: CLPublicKey, keys?: Keys.AsymmetricKey[]): import("casper-js-sdk/dist/lib/DeployUtil").Deploy;
}
//# sourceMappingURL=index.d.ts.map