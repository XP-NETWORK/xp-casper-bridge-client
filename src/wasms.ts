import fs from "fs";
export const CONTRACT_WASM = fs.readFileSync("./src/wasms/contract.wasm");
export const FREEZE_NFT_WASM = fs.readFileSync(
  "./src/wasms/freeze_nft_call.wasm"
);

export const WITHDRAW_NFT_WASM = fs.readFileSync(
  "./src/wasms/withdraw_nft_call.wasm"
);
