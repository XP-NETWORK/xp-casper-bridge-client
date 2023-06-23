import {
  CasperClient,
  Keys,
  CLPublicKey,
  CasperServiceByJsonRPC,
  RuntimeArgs,
  CLValue,
  CLBool,
  CLAccountHash,
  CLKey,
  CLValueBuilder,
  CLByteArray,
} from "casper-js-sdk";
import { XpBridgeClient } from "../src/index";
import * as ed from "@noble/ed25519";
import { describe, test } from "mocha";
import { expect } from "chai";
import crypto from "crypto";
import {
  CEP78Client,
  BurnMode,
  NFTIdentifierMode,
  NFTKind,
  NFTMetadataKind,
  MetadataMutability,
  NFTOwnershipMode,
  MintingMode,
  WhitelistMode,
  NFTHolderMode,
  EventsMode,
} from "casper-cep78-js-client/dist/src";
import fs from "fs";
import { Serializer } from "../src/struct-serializer";
import rl from "readline/promises";
import {
  FeeSig,
  FreezeArgs,
  ValidateBlacklist,
  ValidateTransferData,
  ValidateUnfreezeData,
  WithdrawArgs,
  WithdrawFeeData,
} from "../src/types";

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

describe("XP Bridge Client Tests", async () => {
  // const keys = Keys.Secp256K1.new();
  // fs.writeFileSync("./file.pem", keys.exportPrivateKeyInPem());
  const keys = Keys.Secp256K1.loadKeyPairFromPrivateFile("./file.pem");

  const nodeUrl = "https://rpc.testnet.casperlabs.io/rpc";

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
  const collectionName = `XpNft`;

  const nft = new CEP78Client(nodeUrl, "casper-test");

  test(`mint`, async () => {
    nft.setContractHash(
      "hash-5dcc145e51ed1e989b9411ee8312c408db3b21dcd6f91cbe70cc5202d18ba4fa"
    );

    //   console.log(
    //     await nft
    //       .setVariables(
    //         {
    //           contractWhitelist: [
    //             "0d4e795fdc348c0816737fb583b9f136c290822de8687d7318eeed74f0f8e133",
    //           ],
    //         },
    //         "4000000000",
    //         keys.publicKey,
    //         [keys]
    //       )
    //       .send(nodeUrl)
    //   );

    //   console.log(
    //     await nft
    //       .approve(
    //         {
    //           operator: new CLByteArray(
    //             Buffer.from(
    //               "df3387efd88b0d0e7ff57b76a65b5e2a1201dd18aa6c8019fb6ceb9c387af9b5",
    //               "hex"
    //             )
    //           ),
    //           tokenId: "1",
    //         },
    //         "2000000000",
    //         keys.publicKey,
    //         [keys]
    //       )
    //       .send(nodeUrl)
    //   );
  });

  // test("deploy xpnft", async () => {
  //   const n = await nft
  //     .install(
  //       {
  //         collectionName,
  //         collectionSymbol: "XPNFT",
  //         identifierMode: NFTIdentifierMode.Ordinal,
  //         metadataMutability: MetadataMutability.Immutable,
  //         nftKind: NFTKind.Digital,
  //         nftMetadataKind: NFTMetadataKind.Raw,
  //         ownershipMode: NFTOwnershipMode.Transferable,
  //         allowMinting: true,
  //         burnMode: BurnMode.Burnable,
  //         whitelistMode: WhitelistMode.Unlocked,
  //         mintingMode: MintingMode.Public,
  //         totalTokenSupply: "1000000",
  //         holderMode: NFTHolderMode.Mixed,
  //         eventsMode: EventsMode.CES,
  //         hashKeyName: `${collectionName}-hash`,
  //         contractWhitelist: [
  //           "contract-hash-acb0e52177383b5e7ac3d133bf95beb90966c77f166ee5055b3a31ca94c2fc99",
  //         ],
  //         jsonSchema: {
  //           properties: {},
  //         },
  //       },
  //       "300000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);

  //   expect(n).to.not.equal(undefined);

  //   console.log(`Xpnft Deploy Hash: `, n);
  // });

  const randomGroupPk = Buffer.from(
    "eaf2be5844bef3ade99bf7434f6f0badaaa1b797e920987081315458261c0364",
    "hex"
  ); // ed.utils.randomPrivateKey();
  console.log(`GroupPK: `, Buffer.from(randomGroupPk).toString("hex"));
  const randomFeePk = Buffer.from(
    "ae4b6d52459f0a8f1bef9c1e43e856276ae0b1ec53de1bca105bd211cdd4bc1e",
    "hex"
  );

  console.log(`FeePK: `, Buffer.from(randomFeePk).toString("hex"));
  const groupPublicKey = await ed.getPublicKey(randomGroupPk);
  console.log(`Group Public Key:`, Buffer.from(groupPublicKey).toString("hex"));

  const feePublicKey = await ed.getPublicKey(randomFeePk);
  console.log(`Fee Public Key:`, Buffer.from(feePublicKey).toString("hex"));
  const input = rl.createInterface(process.stdin, process.stdout);
  const serialize = Serializer();

  let contractHash: string;

  // test("test deploy", async () => {
  //   fs.writeFileSync("file.pem", keys.exportPrivateKeyInPem(), {
  //     flag: "w",
  //   });
  //   const response = await input.question("Funded? ");

  //   const res = client.deploy("250000000000");
  //   const result = await res.send(nodeUrl);
  //   console.log(result);
  //   await getDeploy(nodeUrl, result);
  //   console.log(`Deployed Hash:`, result);
  // });

  test("get deploy", async () => {
    // let acc = await getAccountInfo(nodeUrl, keys.publicKey);
    contractHash =
      "hash-df3387efd88b0d0e7ff57b76a65b5e2a1201dd18aa6c8019fb6ceb9c387af9b5";
    console.log(`Contract Hash:`, contractHash);
    client.setContractHash(contractHash);
  });

  // test("initialize", async () => {
  //   const res = await client
  //     .initialize(
  //       {
  //         fee_public_key: feePublicKey,
  //         group_key: groupPublicKey,
  //         whitelist: [
  //           "5dcc145e51ed1e989b9411ee8312c408db3b21dcd6f91cbe70cc5202d18ba4fa",
  //         ],
  //       },
  //       "10000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);
  //   console.log(res);
  //   await getDeploy(nodeUrl, res);
  // });

  // test("validate_pause", async () => {
  //   const action = {
  //     actionId: Math.floor(Math.random() * 10000000),
  //   };
  //   const res = await client
  //     .validatePause(
  //       {
  //         ...action,
  //         sig_data: await signData("SetPause", serialize.pauseData(action)),
  //       },
  //       "30000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);
  //   console.log(`Pause Res: `, res);
  //   await getDeploy(nodeUrl, res);
  //   const data: boolean = await client.contractClient.queryContractData([
  //     "bridge_paused",
  //   ]);
  //   console.log(`Paused: `, data);
  //   expect(data).to.equal(true);
  // });

  // test("validate_unpause", async () => {
  //   const action = {
  //     actionId: Math.floor(Math.random() * 10000000),
  //   };
  //   const res = await client
  //     .validateUnpause(
  //       {
  //         ...action,
  //         sig_data: await signData("SetUnpause", serialize.pauseData(action)),
  //       },
  //       "30000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);
  //   console.log(`Unpause Res: `, res);
  //   await getDeploy(nodeUrl, res);
  //   const data: boolean = await client.contractClient.queryContractData([
  //     "bridge_paused",
  //   ]);
  //   expect(data).to.equal(false);
  // });

  // test("validate_transfer_nft", async () => {
  //   console.log(keys.publicKey.toAccountRawHashStr());
  //   const action: ValidateTransferData = {
  //     action_id: Math.floor(Math.random() * 10000000),
  //     metadata: "https://meta.polkamon.com/meta?id=10001852306",
  //     mint_with:
  //       "c618184f2056b518fdaf7c51aa59fc70c5413c5b9dcabaf21fa3f9fa68efe06b",
  //     receiver: keys.publicKey.toAccountRawHashStr(),
  //   };
  //   const res = await client
  //     .validateTransferNft(
  //       {
  //         ...action,
  //         sig_data: await signData(
  //           "ValidateTransferNft",
  //           serialize.validateTransferData(action)
  //         ),
  //       },
  //       "30000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);
  //   console.log(`Validate Transfer Nft Res: `, res);
  //   await getDeploy(nodeUrl, res);
  // });

  async function generateFeeSig(args: FeeSig) {
    const feeSig = serialize.feeSig(args);

    const hash = crypto.createHash("sha512").update(feeSig).digest();

    return await ed.sign(hash, randomFeePk);
  }

  // test("approve", async () => {
  //   nft.setContractHash(
  //     "hash-665a5ba9bd825ae6b6c0f394bd2b3f105d596212136b3c7abfacd69f0fc01cb5"
  //   );
  //   const result = await nft
  //     .approve(
  //       {
  //         operator: new CLByteArray(
  //           Buffer.from(contractHash.split("-")[1], "hex")
  //         ),
  //         tokenId: "0",
  //       },
  //       "10000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);
  //   console.log(`Approve: `, result);
  // });

  // test("freeze nft", async () => {
  //   const action: FreezeArgs = {
  //     amt: "100",
  //     chain_nonce: 4,
  //     contract:
  //       "5dcc145e51ed1e989b9411ee8312c408db3b21dcd6f91cbe70cc5202d18ba4fa",
  //     mint_with: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
  //     to: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
  //     token_id: "1",
  //     sig_data: await generateFeeSig({
  //       from: 38,
  //       to: 4,
  //       receiver: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
  //       value: 100,
  //     }),
  //   };
  //   const res = await client
  //     .freezeNft(action, "30000000000", keys.publicKey, [keys])
  //     .send(nodeUrl);
  //   console.log(`freeze Nft Res: `, res);
  //   await getDeploy(nodeUrl, res);
  // });

  // test("withdraw nft", async () => {
  //   const action: WithdrawArgs = {
  //     amt: "1000000000",
  //     chain_nonce: 4,
  //     contract:
  //       "5dcc145e51ed1e989b9411ee8312c408db3b21dcd6f91cbe70cc5202d18ba4fa",
  //     to: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
  //     token_id: "0",
  //     sig_data: await generateFeeSig({
  //       from: 38,
  //       to: 4,
  //       receiver: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
  //       value: 1000000000,
  //     }),
  //   };
  //   const res = await client
  //     .withdrawNft(action, "30000000000", keys.publicKey, [keys])
  //     .send(nodeUrl);
  //   console.log(`freeze Nft Res: `, res);
  //   await getDeploy(nodeUrl, res);
  // });

  test("withdraw fees", async () => {
    const action: WithdrawFeeData = {
      action_id: Math.floor(Math.random() * 10000000),
      receiver: keys.publicKey.toAccountRawHashStr(),
    };
    const res = await client
      .validateWithdrawFees(
        {
          ...action,
          sig_data: await signData(
            "ValidateWithdrawFees",
            serialize.withdrawFee(action)
          ),
        },
        "30000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    console.log(`withdraw fee Res: `, res);
    await getDeploy(nodeUrl, res);
  });

  // test("validate_transfer_nft", async () => {
  //   console.log(keys.publicKey.toAccountRawHashStr());
  //   const action: ValidateTransferData = {
  //     action_id: Math.floor(Math.random() * 10000000),
  //     mint_with:
  //       "665a5ba9bd825ae6b6c0f394bd2b3f105d596212136b3c7abfacd69f0fc01cb5",
  //     metadata: "https://meta.polkamon.com/meta?id=10001852306",
  //     receiver: keys.publicKey.toAccountRawHashStr(),
  //   };
  //   const res = await client
  //     .validateTransferNft(
  //       {
  //         ...action,
  //         sig_data: await signData(
  //           "ValidateTransferNft",
  //           serialize.validateTransferData(action)
  //         ),
  //       },
  //       "30000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);
  //   console.log(`Validate Transfer Nft Res: `, res);
  //   await getDeploy(nodeUrl, res);
  // });

  // test("validate_unfreeze_nft", async () => {
  //   console.log(keys.publicKey.toAccountRawHashStr());
  //   const action: ValidateUnfreezeData = {
  //     action_id: Math.floor(Math.random() * 10000000),
  //     contract:
  //       "5dcc145e51ed1e989b9411ee8312c408db3b21dcd6f91cbe70cc5202d18ba4fa",
  //     token_id: "1",
  //     receiver: keys.publicKey.toAccountRawHashStr(),
  //   };
  //   const res = await client
  //     .validateUnfreezeNft(
  //       {
  //         ...action,
  //         sig_data: await signData(
  //           "ValidateUnfreezeNft",
  //           serialize.validateUnfreezeData(action)
  //         ),
  //       },
  //       "30000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);
  //   console.log(`Validate Unfreeze Nft Res: `, res);
  //   await getDeploy(nodeUrl, res);
  // });

  // test("validate_whitelist", async () => {
  //   const action = {
  //     action_id: Math.floor(Math.random() * 10000000),
  //     contract:
  //       "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf1",
  //   };
  //   const res = await client
  //     .validateWhitelist(
  //       {
  //         ...action,
  //         sig_data: await signData(
  //           "WhitelistNftAction",
  //           serialize.whitelistNft(action)
  //         ),
  //       },
  //       "30000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);
  //   console.log(res);
  // await getDeploy(nodeUrl, res);
  //   const data = await client.contractClient.queryContractDictionary(
  //     "whitelist_dict",
  //     "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf1"
  //   );
  //   console.log(`Whitelisted: `);
  //   expect(data.value()).to.equal(true);
  // });

  // test("validate_blacklist", async () => {
  //   const action: ValidateBlacklist = {
  //     action_id: Math.floor(Math.random() * 10000000),
  //     contract:
  //       "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf3",
  //   };
  //   const res = await client
  //     .validateBlacklist(
  //       {
  //         ...action,
  //         sig_data: await signData(
  //           "BlacklistNftAction",
  //           serialize.blacklistNft(action)
  //         ),
  //       },
  //       "30000000000",
  //       keys.publicKey,
  //       [keys]
  //     )
  //     .send(nodeUrl);
  //   await getDeploy(nodeUrl, res);
  //   const data = await client.contractClient.queryContractDictionary(
  //     "whitelist_dict",
  //     "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf3"
  //   );
  //   expect(data.value()).to.equal(false);
  // });
});
