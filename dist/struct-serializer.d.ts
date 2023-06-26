/// <reference types="node" />
import { FreezeArgs, UpdateGroupKey, ValidateUnfreezeData, ValidateWhitelist, ValidateBlacklist, WithdrawArgs, WithdrawFeeData, PauseData, UnpauseData, ValidateTransferData, FeeSig } from "./types";
export declare function Serializer(): {
    whitelistNft(args: ValidateWhitelist): Buffer;
    blacklistNft(args: ValidateBlacklist): Buffer;
    freezeNft(args: FreezeArgs): Buffer;
    withdrawNft(args: WithdrawArgs): Buffer;
    withdrawFee(args: WithdrawFeeData): Buffer;
    pauseData(args: PauseData): Buffer;
    unpauseData(args: UnpauseData): Buffer;
    validateTransferData(args: ValidateTransferData): Buffer;
    validateUnfreezeData(args: ValidateUnfreezeData): Buffer;
    updateGroupKeyData(args: UpdateGroupKey): Buffer;
    feeSig(args: FeeSig): Buffer;
};
//# sourceMappingURL=struct-serializer.d.ts.map