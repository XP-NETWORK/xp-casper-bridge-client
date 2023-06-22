import { BigNumberish } from "@ethersproject/bignumber";

export interface InitializeArgs {
  readonly group_key: Uint8Array;
  readonly fee_public_key: Uint8Array;
  readonly whitelist: string[];
}

export interface FreezeArgs {
  readonly contract: string;
  readonly token_id: string;
  readonly to: string;
  readonly mint_with: string;
  readonly chain_nonce: number;
  readonly amt: string;
  readonly sig_data: Uint8Array;
}

export interface WithdrawArgs {
  readonly contract: string;
  readonly token_id: string;
  readonly to: string;
  readonly chain_nonce: number;
  readonly amt: string;
  readonly sig_data: Uint8Array;
}

export interface PauseData {
  actionId: BigNumberish;
}

export interface UnpauseData {
  actionId: BigNumberish;
}

export interface ValidateTransferData {
  readonly metadata: string;
  readonly mint_with: string;
  readonly receiver: string;
  readonly action_id: BigNumberish;
}

export interface ValidateUnfreezeData {
  readonly action_id: BigNumberish;
  readonly receiver: string;
  readonly token_id: string;
  readonly contract: string;
}

export interface UpdateGroupKey {
  readonly action_id: BigNumberish;
  readonly new_key: Uint8Array;
}

export interface WithdrawFeeData {
  action_id: BigNumberish;
  receiver: string;
}

export interface ValidateBlacklist {
  action_id: BigNumberish;
  contract: string;
}

export interface ValidateWhitelist {
  action_id: BigNumberish;
  contract: string;
}

export interface SigData {
  sig_data: Uint8Array;
}

export interface FeeSig {
  value: BigNumberish;
  from: number;
  to: number;
  receiver: string;
}
