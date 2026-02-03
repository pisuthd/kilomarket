import { createPublicClient, http, Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { unichainSepolia } from './chains'
import { getEntryPoint, KERNEL_V3_1 } from '@zerodev/sdk/constants'
import { signerToEcdsaValidator, getKernelAddressFromECDSA } from '@zerodev/ecdsa-validator'
import { createKernelAccount as createKernelAccountFn, createKernelAccountClient as createKernelAccountClientFn } from '@zerodev/sdk'

// ZeroDev configuration
export const ENTRY_POINT = getEntryPoint("0.7")
export const KERNEL_VERSION = KERNEL_V3_1

export const ZERODEV_RPC = process.env.NEXT_PUBLIC_ZERODEV_RPC

// Create public client for Unichain Sepolia
export const publicClient = createPublicClient({
  transport: http(),
  chain: unichainSepolia,
})

// Create ECDSA validator from signer
export async function createECDSAValidator(signer: any) {
  return await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_VERSION
  })
}

// Create Kernel account
export async function createKernelAccount(validator: any, index: number = 0) {
  return await createKernelAccountFn(publicClient, {
    plugins: {
      sudo: validator,
    },
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_VERSION,
    index: BigInt(index)
  })
}

// Create Kernel account client
export async function createKernelAccountClient(account: any) {
  return createKernelAccountClientFn({
    account,
    chain: unichainSepolia,
    bundlerTransport: http(ZERODEV_RPC),
    client: publicClient,
  })
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

// Create agent wallet from connected EOA signer
export async function createAgentWalletFromEOA(eoaSigner: any, index: number = 0) {
  try {

    const validator = await createECDSAValidator(eoaSigner)

    const account = await createKernelAccount(validator, index)

    return account
  } catch (error) {
    console.error('Error creating agent wallet from EOA:', error)
    throw error
  }
}

// Get wallet address from EOA without creating account
export async function getWalletAddressFromEOA(eoaAddress: string, index: number = 0) {
  try {
    return await getSmartAccountAddress(eoaAddress, index)
  } catch (error) {
    console.error('Error getting wallet address from EOA:', error)
    return null
  }
}

// Check if wallet is deployed
export async function isWalletDeployed(address: string): Promise<boolean> {
  try {
    const code = await publicClient.getBytecode({ address: address as Hex })
    return code !== '0x'
  } catch (error) {
    console.error('Error checking wallet deployment:', error)
    return false
  }
}

// Get wallet balance
export async function getWalletBalance(address: string): Promise<string> {
  try {
    const balance = await publicClient.getBalance({ address: address as Hex })
    return (Number(balance) / 1e18).toFixed(6)
  } catch (error) {
    console.error('Error getting wallet balance:', error)
    return "0"
  }
}