import { CasperClient, Keys } from "casper-js-sdk";
import { XpBridgeClient } from "../src/index";
import * as ed from "@noble/ed25519";
import { describe, test } from "mocha";
import {
  BurnMode,
  CEP78Client,
  MetadataMutability,
  MintingMode,
  NFTIdentifierMode,
  NFTKind,
  NFTMetadataKind,
  NFTOwnershipMode,
  OwnerReverseLookupMode,
  WhitelistMode,
} from "casper-cep78-js-client";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getDeploy = async (nodeURL: string, deployHash: string) => {
  const client = new CasperClient(nodeURL);
  let i = 300;
  while (i !== 0) {
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
  }
  throw Error("Timeout after " + i + "s. Something's wrong");
};

describe("XP Bridge Client", async () => {
  const client = new XpBridgeClient(
    "http://65.21.235.219:7777/rpc",
    "casper-test"
  );
  const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("./file.pem");

  const nodeUrl = "http://65.21.235.219:7777/rpc";

  const nft = new CEP78Client(nodeUrl, "casper-test");

  const n = await nft
    .install(
      {
        collectionName: "Xp Wrapped Nft",
        collectionSymbol: "XPNFT",
        identifierMode: NFTIdentifierMode.Ordinal,
        metadataMutability: MetadataMutability.Immutable,
        nftKind: NFTKind.Digital,
        nftMetadataKind: NFTMetadataKind.Raw,
        ownershipMode: NFTOwnershipMode.Transferable,
        allowMinting: true,
        burnMode: BurnMode.Burnable,
        mintingMode: MintingMode.Installer,
        whitelistMode: WhitelistMode.Unlocked,
        totalTokenSupply: "1000000",
        jsonSchema: {
          properties: {},
        },
      },
      "300000000000",
      keys.publicKey,
      [keys as any]
    )
    .send(nodeUrl);

  console.log(n);

  const randomGroupPk = ed.utils.randomPrivateKey();
  const randomFeePk = ed.utils.randomPrivateKey();
  const groupPublicKey = await ed.getPublicKey(randomGroupPk);
  const feePublicKey = await ed.getPublicKey(randomFeePk);

  // let deployHash: string;

  // test("test deploy", async () => {
  //   const res = client.deploy("300000000000", keys.publicKey, [keys]);
  //   deployHash = await res.send("http://65.21.235.219:7777/rpc");
  //   console.log(`Deployed Hash:`, deployHash);
  // });

  // test("set contract hash", async () => {
  //   let de = await getDeploy("http://65.21.235.219:7777/rpc", deployHash);
  //   const res = client.setContractHash();
  //   console.log(await res.send("http://65.21.235.219:7777/rpc"));
  // });
});
