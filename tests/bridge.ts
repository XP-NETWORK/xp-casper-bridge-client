import {
  CLByteArray,
  CasperClient,
  Keys,
  CLU256,
  CLU256BytesParser,
  CLByteArrayBytesParser,
  RuntimeArgs,
  CLValueBuilder,
  CLU8,
  CLListBytesParser,
  CLList,
  CLAnyType,
  CLPublicKey,
  CasperServiceByJsonRPC,
} from "casper-js-sdk";
import { XpBridgeClient } from "../src/index";
import * as ed from "@noble/ed25519";
import { describe, test } from "mocha";
import { expect } from "chai";
import crypto from "crypto";
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
import fs from "fs";
import { Serializer } from "../src/struct-serializer";
import rl from "readline/promises";
import { ValidateBlacklist } from "../src/types";

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

describe("XP Bridge Client", async () => {
  // fs.writeFileSync("./file.pem", Keys.Secp256K1.new().exportPrivateKeyInPem());
  const keys = Keys.Secp256K1.new();
  const nodeUrl = "http://95.216.1.154:7777/rpc";
  const client = new XpBridgeClient(nodeUrl, "casper-test", keys.publicKey, [
    keys,
  ]);
  const signData = async (context: string, buf: Buffer) => {
    const hashed = crypto
      .createHash("sha512")
      .update(context)
      .update(buf)
      .digest();
    return await ed.sign(hashed, randomGroupPk);
  };
  const collectionName = `Xp Wrapped Nft Test ${Math.random() * 10000000000}`;

  const nft = new CEP78Client(nodeUrl, "casper-test");

  // const n = await nft
  //   .install(
  //     {
  //       collectionName,
  //       collectionSymbol: "XPNFT",
  //       identifierMode: NFTIdentifierMode.Ordinal,
  //       metadataMutability: MetadataMutability.Immutable,
  //       nftKind: NFTKind.Digital,
  //       nftMetadataKind: NFTMetadataKind.Raw,
  //       ownershipMode: NFTOwnershipMode.Transferable,
  //       allowMinting: true,
  //       burnMode: BurnMode.Burnable,
  //       mintingMode: MintingMode.Installer,
  //       whitelistMode: WhitelistMode.Unlocked,
  //       totalTokenSupply: "1000000",
  //       jsonSchema: {
  //         properties: {},
  //       },
  //     },
  //     "300000000000",
  //     keys.publicKey,
  //     [keys as any]
  //   )
  //   .send(nodeUrl);

  // console.log(n);

  const randomGroupPk = ed.utils.randomPrivateKey();
  console.log(`GroupPK: `, Buffer.from(randomGroupPk).toString("hex"));
  const randomFeePk = ed.utils.randomPrivateKey();
  console.log(`FeePK: `, Buffer.from(randomFeePk).toString("hex"));
  const groupPublicKey = await ed.getPublicKey(randomGroupPk);
  const feePublicKey = await ed.getPublicKey(randomFeePk);
  const input = rl.createInterface(process.stdin, process.stdout);
  const serialize = Serializer();

  let deployHash: string;
  let contractHash: string;

  test("test deploy", async () => {
    fs.writeFileSync("file.pem", keys.exportPrivateKeyInPem(), {
      flag: "w",
    });
    const response = await input.question("Funded? ");

    const res = client.deploy("280000000000");
    deployHash = await res.send(nodeUrl);
    console.log(`Deployed Hash:`, deployHash);
  });

  test("get deploy", async () => {
    let acc = await getAccountInfo(nodeUrl, keys.publicKey);
    contractHash = acc.namedKeys[1].key;
    console.log(`Contract Hash:`, contractHash);
  });

  test("set contract hash", async () => {
    client.setContractHash(contractHash);
    const res = await client
      .initialize(
        {
          fee_public_key: feePublicKey,
          group_key: groupPublicKey,
          whitelist: [
            "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf2",
          ],
        },
        "5000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    console.log(res);
  });

  test("validate_pause", async () => {
    const action = {
      actionId: Math.floor(Math.random() * 10000000),
    };
    const res = await client
      .validatePause(
        {
          ...action,
          sig_data: await signData("SetPause", serialize.pauseData(action)),
        },
        "50000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    const data: boolean = await client.contractClient.queryContractData([
      "bridge_paused",
    ]);
    expect(data).to.equal(true);
  });

  test("validate_unpause", async () => {
    const action = {
      actionId: Math.floor(Math.random() * 10000000),
    };
    const res = await client
      .validateUnpause(
        {
          ...action,
          sig_data: await signData("SetUnpause", serialize.pauseData(action)),
        },
        "50000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    const data: boolean = await client.contractClient.queryContractData([
      "bridge_paused",
    ]);
    expect(data).to.equal(false);
  });

  test("validate_whitelist", async () => {
    const action = {
      action_id: Math.floor(Math.random() * 10000000),
      contract:
        "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf1",
    };
    const res = await client
      .validateWhitelist(
        {
          ...action,
          sig_data: await signData(
            "WhitelistNftAction",
            serialize.whitelistNft(action)
          ),
        },
        "50000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    const data = await client.contractClient.queryContractDictionary(
      "whitelist_dict",
      "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf1"
    );
    expect(data.value).to.equal(true);
  });

  test("validate_blacklist", async () => {
    const action: ValidateBlacklist = {
      action_id: Math.floor(Math.random() * 10000000),
      contract:
        "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf3",
    };
    const res = await client
      .validateBlacklist(
        {
          ...action,
          sig_data: await signData(
            "BlacklistNftAction",
            serialize.blacklistNft(action)
          ),
        },
        "50000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    const data = await client.contractClient.queryContractDictionary(
      "whitelist_dict",
      "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf3"
    );
    expect(data.value).to.equal(false);
  });
});
