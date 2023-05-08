import fs from "fs";
export const CONTRACT_WASM = fs.readFileSync("./src/wasms/contract.wasm");
