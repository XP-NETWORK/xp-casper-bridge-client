import {
  CasperClient,
  Keys,
  CLPublicKey,
  CasperServiceByJsonRPC,
  CLByteArray,
} from "casper-js-sdk";
import { XpBridgeClient } from "../src/index";
import { Parser } from "@make-software/ces-js-parser";
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
  CESEventParserFactory,
} from "casper-cep78-js-client/dist/src";
import { Serializer } from "../src/struct-serializer";
import { config } from "dotenv";
import {
  FeeSig,
  FreezeArgs,
  ValidateBlacklist,
  ValidateTransferData,
  ValidateUnfreezeData,
  WithdrawArgs,
  WithdrawFeeData,
} from "../src/types";

config();

console.log(process.env.PK);

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
  const priv = Keys.Ed25519.parsePrivateKey(
    Buffer.from(process.env.PK!, "base64")
  );

  const pub = Keys.Ed25519.privateToPublicKey(priv);
  const keys = Keys.Ed25519.parseKeyPair(pub, priv);
  console.log(keys.publicKey.toAccountHashStr());

  const nodeUrl = "http://localhost:11101/rpc";
  const casper = new CasperClient(nodeUrl);
  const client = new XpBridgeClient(nodeUrl, "casper-net-1", keys.publicKey, [
    keys,
  ]);
  const randomGroupPk = ed.utils.randomPrivateKey();
  const randomFeePk = ed.utils.randomPrivateKey();
  const signData = async (context: string, buf: Buffer) => {
    const hashed = crypto
      .createHash("sha512")
      .update(context)
      .update(buf)
      .digest();
    return await ed.sign(hashed, randomGroupPk);
  };
  const collectionName = `XpNft`;

  const nft = new CEP78Client(nodeUrl, "casper-net-1");
  let bridgeContractHash: string;
  let xpnftContractHash: string;
  let userNftMinterContractHash: string;

  test("deploy xpnft", async () => {
    const n = await nft
      .install(
        {
          collectionName,
          collectionSymbol: "XPNFT",
          identifierMode: NFTIdentifierMode.Ordinal,
          metadataMutability: MetadataMutability.Immutable,
          nftKind: NFTKind.Digital,
          nftMetadataKind: NFTMetadataKind.Raw,
          ownershipMode: NFTOwnershipMode.Transferable,
          allowMinting: true,
          burnMode: BurnMode.Burnable,
          whitelistMode: WhitelistMode.Unlocked,
          mintingMode: MintingMode.Public,
          totalTokenSupply: "1000000",
          holderMode: NFTHolderMode.Mixed,
          eventsMode: EventsMode.CES,
          hashKeyName: `${collectionName}-hash`,
          contractWhitelist: [
            "contract-hash-acb0e52177383b5e7ac3d133bf95beb90966c77f166ee5055b3a31ca94c2fc99",
          ],
          jsonSchema: {
            properties: {},
          },
        },
        "300000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);

    expect(n).to.not.equal(undefined);

    console.log(`Xpnft Deploy Hash: `, n);
    await getDeploy(nodeUrl, n);
  });

  test("deploy umt", async () => {
    const n = await nft
      .install(
        {
          collectionName: "UserNftMinter",
          collectionSymbol: "UMT",
          identifierMode: NFTIdentifierMode.Ordinal,
          metadataMutability: MetadataMutability.Immutable,
          nftKind: NFTKind.Digital,
          nftMetadataKind: NFTMetadataKind.Raw,
          ownershipMode: NFTOwnershipMode.Transferable,
          allowMinting: true,
          burnMode: BurnMode.Burnable,
          whitelistMode: WhitelistMode.Unlocked,
          mintingMode: MintingMode.Public,
          totalTokenSupply: "1000000",
          holderMode: NFTHolderMode.Mixed,
          eventsMode: EventsMode.CES,
          hashKeyName: `UserNftMinter-hash`,
          contractWhitelist: [
            "contract-hash-acb0e52177383b5e7ac3d133bf95beb90966c77f166ee5055b3a31ca94c2fc99",
          ],
          jsonSchema: {
            properties: {},
          },
        },
        "300000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);

    expect(n).to.not.equal(undefined);

    console.log(`UMT Deploy Hash: `, n);
    await getDeploy(nodeUrl, n);
  });

  const serialize = Serializer();

  test("test deploy", async () => {
    const res = client.deploy("250000000000", keys.publicKey);
    const result = await res.send(nodeUrl);
    console.log(result);
    await getDeploy(nodeUrl, result);
    console.log(`Deployed Hash:`, result);
  });

  test("get deploy", async () => {
    let acc = await getAccountInfo(nodeUrl, keys.publicKey);
    bridgeContractHash = acc.namedKeys
      .filter((e: any) => e.name === "bridge_contract")
      .map((e: any) => e.key)[0];

    xpnftContractHash = acc.namedKeys
      .filter(
        (e: { name: string }) =>
          e.name === `cep78_contract_hash_${collectionName}`
      )
      .map((e: { key: string }) => e.key)[0];

    userNftMinterContractHash = acc.namedKeys
      .filter(
        (e: { name: string }) => e.name === `cep78_contract_hash_UserNftMinter`
      )
      .map((e: { key: string }) => e.key)[0];
    client.setContractHash(bridgeContractHash);
    nft.setContractHash(xpnftContractHash);
  });

  test("initialize", async () => {
    const res = await client
      .initialize(
        {
          fee_public_key: await ed.getPublicKey(randomFeePk),
          group_key: await ed.getPublicKey(randomGroupPk),
          whitelist: [userNftMinterContractHash.split("-")[1]],
        },
        "10000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    console.log(res);
    await getDeploy(nodeUrl, res);
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
        "30000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    console.log(`Pause Res: `, res);
    await getDeploy(nodeUrl, res);
    const data: boolean = await client.contractClient.queryContractData([
      "bridge_paused",
    ]);
    console.log(`Paused: `, data);
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
        "30000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    console.log(`Unpause Res: `, res);
    await getDeploy(nodeUrl, res);
    const data: boolean = await client.contractClient.queryContractData([
      "bridge_paused",
    ]);
    expect(data).to.equal(false);
  });

  test("validate_transfer_nft", async () => {
    console.log(keys.publicKey.toAccountRawHashStr());
    const action: ValidateTransferData = {
      action_id: Math.floor(Math.random() * 10000000),
      metadata: "https://meta.polkamon.com/meta?id=10001852306",
      mint_with: xpnftContractHash.split("-")[1],
      receiver: keys.publicKey.toAccountRawHashStr(),
    };
    const res = await client
      .validateTransferNft(
        {
          ...action,
          sig_data: await signData(
            "ValidateTransferNft",
            serialize.validateTransferData(action)
          ),
        },
        "30000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    console.log(`Validate Transfer Nft Res: `, res);
    const deploy = await getDeploy(nodeUrl, res);
  });

  async function generateFeeSig(args: FeeSig) {
    const feeSig = serialize.feeSig(args);

    const hash = crypto.createHash("sha512").update(feeSig).digest();

    return await ed.sign(hash, randomFeePk);
  }

  test("approve 0", async () => {
    nft.setContractHash(userNftMinterContractHash);

    const minted = await nft
      .mint(
        {
          meta: {
            name: "test",
            description: "test",
            image: "test",
          },
          owner: keys.publicKey,
          collectionName: "UserNftMinter",
        },
        { useSessionCode: false },
        "15000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    await getDeploy(nodeUrl, minted);
    const result = await nft
      .approve(
        {
          operator: new CLByteArray(
            Buffer.from(bridgeContractHash.split("-")[1], "hex")
          ),
          tokenId: "0",
        },
        "10000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    await getDeploy(nodeUrl, result);
    console.log(`Approve: `, result);
  });
  test("approve 1", async () => {
    nft.setContractHash(userNftMinterContractHash);

    const minted = await nft
      .mint(
        {
          meta: {
            name: "test",
            description: "test",
            image: "test",
          },
          owner: keys.publicKey,
          collectionName: "UserNftMinter",
        },
        { useSessionCode: false },
        "15000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    await getDeploy(nodeUrl, minted);
    const result = await nft
      .approve(
        {
          operator: new CLByteArray(
            Buffer.from(bridgeContractHash.split("-")[1], "hex")
          ),
          tokenId: "1",
        },
        "10000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    await getDeploy(nodeUrl, result);
    console.log(`Approve: `, result);
  });

  test("freeze nft", async () => {
    const action: FreezeArgs = {
      amt: "100",
      chain_nonce: 4,
      contract: userNftMinterContractHash.split("-")[1],
      mint_with: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
      to: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
      token_id: "0",
      sig_data: await generateFeeSig({
        from: 38,
        to: 4,
        receiver: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
        value: 100,
      }),
    };
    const res = await client
      .freezeNft(action, "50000000000", keys.publicKey, [keys])
      .send(nodeUrl);
    console.log(`freeze Nft Res: `, res);
    await getDeploy(nodeUrl, res);
  });

  test("withdraw nft", async () => {
    const action: WithdrawArgs = {
      amt: "1000000000",
      chain_nonce: 4,
      contract: userNftMinterContractHash.split("-")[1],
      to: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
      token_id: "0",
      sig_data: await generateFeeSig({
        from: 38,
        to: 4,
        receiver: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
        value: 1000000000,
      }),
    };
    const res = await client
      .withdrawNft(action, "30000000000", keys.publicKey, [keys])
      .send(nodeUrl);
    console.log(`freeze Nft Res: `, res);
    await getDeploy(nodeUrl, res);
  });

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

  test("validate_unfreeze_nft", async () => {
    const faction: FreezeArgs = {
      amt: "100",
      chain_nonce: 4,
      contract: userNftMinterContractHash.split("-")[1],
      mint_with: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
      to: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
      token_id: "1",
      sig_data: await generateFeeSig({
        from: 38,
        to: 4,
        receiver: "0x0d7df42014064a163DfDA404253fa9f6883b9187",
        value: 100,
      }),
    };
    const fres = await client
      .freezeNft(faction, "50000000000", keys.publicKey, [keys])
      .send(nodeUrl);
    console.log(`freeze Nft Res: `, fres);
    await getDeploy(nodeUrl, fres);

    const action: ValidateUnfreezeData = {
      action_id: Math.floor(Math.random() * 10000000),
      contract: userNftMinterContractHash.split("-")[1],
      token_id: "1",
      receiver: keys.publicKey.toAccountRawHashStr(),
    };
    const res = await client
      .validateUnfreezeNft(
        {
          ...action,
          sig_data: await signData(
            "ValidateUnfreezeNft",
            serialize.validateUnfreezeData(action)
          ),
        },
        "30000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    console.log(`Validate Unfreeze Nft Res: `, res);
    await getDeploy(nodeUrl, res);
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
        "30000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    console.log(res);
    await getDeploy(nodeUrl, res);
    const data = await client.contractClient.queryContractDictionary(
      "whitelist_dict",
      "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf1"
    );
    console.log(`Whitelisted: `);
    expect(data.value()).to.equal(true);
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
        "30000000000",
        keys.publicKey,
        [keys]
      )
      .send(nodeUrl);
    await getDeploy(nodeUrl, res);
    const data = await client.contractClient.queryContractDictionary(
      "whitelist_dict",
      "036d5da0cbd206615617d190ddb41d34abd6c51b1ef9273611ca7e5c463ceaf3"
    );
    expect(data.value()).to.equal(false);
  });
});
