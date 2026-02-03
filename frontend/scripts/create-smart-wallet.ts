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

import { getKernelAddressFromECDSA } from '@zerodev/ecdsa-validator'

export const ENTRY_POINT = getEntryPoint("0.7")
export const KERNEL_VERSION = KERNEL_V3_1


// Create public client for Unichain Sepolia
export const publicClient = createPublicClient({
    transport: http(),
    chain: unichainSepolia,
})

// Get wallet address from EOA without creating account
export async function getWalletAddressFromEOA(eoaAddress: string, index: number = 0) {
    try {
        return await getSmartAccountAddress(eoaAddress, index)
    } catch (error) {
        console.error('Error getting wallet address from EOA:', error)
        return null
    }
}


// Get smart account address from EOA signer
export async function getSmartAccountAddress(eoaAddress: string, index: number = 0) {
    try {
        const smartAccountAddress = await getKernelAddressFromECDSA({
            publicClient,
            entryPoint: ENTRY_POINT,
            kernelVersion: KERNEL_VERSION,
            eoaAddress: eoaAddress as `0x${string}`,
            index: BigInt(index)
        })

        return smartAccountAddress
    } catch (error) {
        console.error('Error getting smart account address:', error)
        return null
    }
}

const main = async () => {

    const privateKey = process.env.PRIVATE_KEY || ""
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const signer = privateKeyToAccount(formattedPrivateKey as `0x${string}`);

    const account = await getWalletAddressFromEOA(signer.address, 0)

    console.log("account: ", account)

    process.exit(0);
};

main(); 