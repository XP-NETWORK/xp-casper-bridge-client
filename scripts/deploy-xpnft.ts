import { CEP78Client, InstallArgs, } from "casper-cep78-js-client";
import { CLPublicKey, Keys, CasperServiceByJsonRPC, CasperClient } from "casper-js-sdk";
import { readFileSync } from "fs";

export async function deployXpNft(nodeUrl: string, installArgs: InstallArgs, keys: Keys.AsymmetricKey) {
    const nft = new CEP78Client(nodeUrl, process.env.NETWORK_NAME!);
    const installDeploy = nft.install(installArgs, "300000000000", keys.publicKey, [keys], readFileSync("./wasms/xpnft.wasm"))

    const deployHash = await installDeploy.send(nodeUrl)

    await getDeploy(nodeUrl, deployHash)

    const acc = await getAccountInfo(nodeUrl, keys.publicKey)

    const xpnftContractHash = acc.namedKeys
        .filter(
            (e: { name: string }) =>
                e.name === `cep78_contract_hash_${installArgs.collectionName}`
        )
        .map((e: { key: string }) => e.key)[0];

    return xpnftContractHash
}
export const getAccountInfo: any = async (
    nodeAddress: string,
    publicKey: CLPublicKey
) => {
    const client = new CasperServiceByJsonRPC(nodeAddress);
    const stateRootHash = await client.getStateRootHash();
    const accountHash = publicKey.toAccountHashStr();
    const blockState = await client.getBlockState(stateRootHash, accountHash, []);
    return blockState.Account;
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
export const getDeploy = async (nodeURL: string, deployHash: string) => {
    // Sleep for a second to wait for the deploy to be processed
    await sleep(1000);
    const client = new CasperClient(nodeURL);
    let i = 300;
    while (i !== 0) {
        try {
            const [deploy, raw] = await client.getDeploy(deployHash);

            if (raw.execution_results.length !== 0) {
                // @ts-ignore
                if (raw.execution_results[0].result.Success) {
                    return deploy;
                } else {
                    // @ts-ignore
                    throw Error(
                        "Contract execution: " +
                        // @ts-ignore
                        raw.execution_results[0].result.Failure.error_message
                    );
                }
            } else {
                i--;
                await sleep(1000);
                continue;
            }
        } catch (e: any) {
            if (e.message.includes("deploy not known")) {
                i--;
                await sleep(1000);
                continue;
            } else {
                throw e;
            }
        }
    }
    throw Error("Timeout after " + i + "s. Something's wrong");
};
