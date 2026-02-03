import "dotenv/config";

import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
  addressToEmptyAccount,
} from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { http, Hex, createPublicClient, Address, zeroAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { unichainSepolia } from "viem/chains";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { toSudoPolicy } from "@zerodev/permissions/policies";
import {
  ModularSigner,
  deserializePermissionAccount,
  serializePermissionAccount,
  toPermissionValidator,
} from "@zerodev/permissions";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";

if (
  !process.env.NEXT_PUBLIC_ZERODEV_RPC ||
  !process.env.PRIVATE_KEY
) {
  throw new Error("ZERODEV_RPC or PRIVATE_KEY is not set");
}

const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
  chain: unichainSepolia,
});
const privateKey = process.env.PRIVATE_KEY
const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
const signer = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
const entryPoint = getEntryPoint("0.7");

const getApproval = async (sessionKeyAddress: Address) => {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    entryPoint,
    signer,
    kernelVersion: KERNEL_V3_1,
  });

  // Create an "empty account" as the signer -- you only need the public
  // key (address) to do this.
  const emptyAccount = addressToEmptyAccount(sessionKeyAddress);
  const emptySessionKeySigner = await toECDSASigner({ signer: emptyAccount });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    signer: emptySessionKeySigner,
    policies: [
      // In this example, we are just using a sudo policy to allow everything.
      // In practice, you would want to set more restrictive policies.
      toSudoPolicy({}),
    ],
    kernelVersion: KERNEL_V3_1,
  });

  const sessionKeyAccount = await createKernelAccount(publicClient, {
    entryPoint,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissionPlugin,
    },
    kernelVersion: KERNEL_V3_1,
  });

  return await serializePermissionAccount(sessionKeyAccount);
};

const useSessionKey = async (
  approval: string,
  sessionKeySigner: ModularSigner
) => {
  const sessionKeyAccount = await deserializePermissionAccount(
    publicClient,
    entryPoint,
    KERNEL_V3_1,
    approval,
    sessionKeySigner
  );

  const kernelPaymaster = createZeroDevPaymasterClient({
    chain: unichainSepolia,
    transport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
  });
  const kernelClient = createKernelAccountClient({
    account: sessionKeyAccount,
    chain: unichainSepolia,
    bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
    paymaster: {
      getPaymasterData(userOperation) {
        return kernelPaymaster.sponsorUserOperation({ userOperation });
      },
    },
  });

  console.log("sending 0.01 ETH to 0x50D0aD29e0dfFBdf5DAbf4372a5a1A1C1d28A6b1...")

  console.log("sessionKeyAccount:",sessionKeyAccount.address) // this is different 

  const userOpHash = await kernelClient.sendUserOperation({
    callData: await sessionKeyAccount.encodeCalls([
      {
        to: "0x50D0aD29e0dfFBdf5DAbf4372a5a1A1C1d28A6b1" as Address,
        value: BigInt("10000000000000000"), // 0.01 ETH in wei (18 decimals)
        data: "0x",
      },
    ]),
  });

  console.log("userOp hash:", userOpHash);

  const _receipt = await kernelClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });
  console.log({ txHash: _receipt.receipt.transactionHash });
};

const revokeSessionKey = async (sessionKeyAddress: Address) => {
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    entryPoint,
    signer,
    kernelVersion: KERNEL_V3_1,
  });
  const sudoAccount = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  const kernelPaymaster = createZeroDevPaymasterClient({
    chain: unichainSepolia,
    transport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
  });
  const sudoKernelClient = createKernelAccountClient({
    account: sudoAccount,
    chain: unichainSepolia,
    bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
    paymaster: kernelPaymaster,
  });

  const emptyAccount = addressToEmptyAccount(sessionKeyAddress);
  const emptySessionKeySigner = await toECDSASigner({ signer: emptyAccount });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    signer: emptySessionKeySigner,
    policies: [
      // In this example, we are just using a sudo policy to allow everything.
      // In practice, you would want to set more restrictive policies.
      toSudoPolicy({}),
    ],
    kernelVersion: KERNEL_V3_1,
  });

  const unInstallUserOpHash = await sudoKernelClient.uninstallPlugin({
    plugin: permissionPlugin,
  });
  console.log({ unInstallUserOpHash });
  const txReceipt = await sudoKernelClient.waitForUserOperationReceipt({
    hash: unInstallUserOpHash,
  });
  console.log({ unInstallTxHash: txReceipt.receipt.transactionHash });
};

const main = async () => {

  // The agent creates a public-private key pair and sends
  // the public key (address) to the owner.
  const sessionPrivateKey = generatePrivateKey();
  const sessionKeyAccount = privateKeyToAccount(sessionPrivateKey);

  console.log("sessionKeyAccount:", sessionKeyAccount.address)

  const sessionKeySigner = await toECDSASigner({
    signer: sessionKeyAccount,
  });

  // The owner approves the session key by signing its address and sending
  // back the signature
  const approval = await getApproval(sessionKeySigner.account.address);

  console.log("approval:", approval)

  // The agent constructs a full session key
  await useSessionKey(approval, sessionKeySigner);

  // revoke session key
  await revokeSessionKey(sessionKeySigner.account.address);

  process.exit(0);
};

main(); 
