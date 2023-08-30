import { Keys, CLPublicKey, CasperServiceByJsonRPC } from "casper-js-sdk";
import { XpBridgeClient } from "../src";
import { deployXpNft, getDeploy } from "./deploy-xpnft";
import readline from "readline/promises"
import { BurnMode, EventsMode, MetadataMutability, MintingMode, NFTIdentifierMode, NFTKind, NFTMetadataKind, NFTOwnershipMode, WhitelistMode } from "casper-cep78-js-client";
import { config } from "dotenv";

config()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const priv = Keys.Ed25519.parsePrivateKey(
    Buffer.from(process.env.PK!, "base64")
);

const pub = Keys.Ed25519.privateToPublicKey(priv);
const keys = Keys.Ed25519.parseKeyPair(pub, priv);
console.log(keys.publicKey.toAccountHashStr());

const nodeUrl = process.env.NODE_URL!;
const networkName: string = process.env.NETWORK_NAME!;
const client = new XpBridgeClient(nodeUrl, networkName, keys.publicKey, [
    keys,
]);

const randomGroupKey = Buffer.from(process.env.ED25519_PK!, "hex");
const randomFeeKey = Buffer.from(process.env.ED25519_FEE_PK!, "hex");

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


(async function main() {
    console.log(`Deploying bridge contract...`)
    const deploy = client.deploy("350000000000", keys.publicKey, [keys])
    const sent = await deploy.send(nodeUrl)
    console.log(`Sent deploy hash: ${sent}`)

    if (!sent) throw new Error("Deploy failed")

    await getDeploy(nodeUrl, sent)

    const acc = await getAccountInfo(nodeUrl, keys.publicKey)

    const bridgeContractHash = acc.namedKeys
        .filter((e: any) => e.name === "bridge_contract")
        .map((e: any) => e.key)[0];

    client.setContractHash(bridgeContractHash)

    const collectionName = await rl.question("Enter collection name: ")
    const collectionSymbol = await rl.question("Enter collection symbol: ")


    const xpnft = await deployXpNft(nodeUrl, {
        collectionName, collectionSymbol, identifierMode: NFTIdentifierMode.Ordinal, nftKind: NFTKind.Digital,
        metadataMutability: MetadataMutability.Immutable,
        nftMetadataKind: NFTMetadataKind.Raw,
        totalTokenSupply: "1000000",
        allowMinting: true,
        burnMode: BurnMode.Burnable,
        jsonSchema: {
            properties: {}
        },
        ownershipMode: NFTOwnershipMode.Transferable,
        eventsMode: EventsMode.CES,
        whitelistMode: WhitelistMode.Locked,
        contractWhitelist: [`contract-${bridgeContractHash}`],
        mintingMode: MintingMode.Installer
    }, keys)

    const whitelist = await rl.question("Enter whitelist (contract hash seprated by commma, no prefix like contract-hash-/hash-): ")

    if (whitelist === "") throw new Error("Cannot proceed with empty whitelist")

    console.log([bridgeContractHash.split("-")[1], ...(whitelist.split(","))])

    const init = await client.initialize({
        fee_public_key: new Uint8Array([...randomFeeKey]),
        group_key: new Uint8Array([...randomGroupKey]),
        whitelist: [bridgeContractHash.split("-")[1]]
    }, "30000000000", keys.publicKey, [keys]).send(nodeUrl)

    console.log(`Bridge Init deploy hash: ${init}`)

    await getDeploy(nodeUrl, init)

    console.log("Bridge Deployed to: ", bridgeContractHash)
    console.log(`XpNft Deployed to:`, xpnft)

})()