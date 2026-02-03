import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { http } from 'viem'
import { toECDSASigner } from '@zerodev/permissions/signers'
import { toSudoPolicy } from '@zerodev/permissions/policies'
import { serializePermissionAccount, toPermissionValidator } from '@zerodev/permissions'
import { createKernelAccount, addressToEmptyAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import { ENTRY_POINT, KERNEL_VERSION, publicClient } from './zerodev'
import { unichainSepolia } from './chains'


export interface SessionKeyData {
  id: string
  address: string
  passcode: string
  timeLimit: number
  ethLimit: string
  createdAt: Date
  expiresAt: Date
  status: 'active' | 'expired' | 'revoked'
  approval?: string // Serialized permission account
}

export interface CreateSessionKeyParams {
  eoaSigner: any
  agentWalletAddress: string
  timeLimit: number
  ethLimit: string
  passcode: string
}

export class SessionKeyManager {
  static async createSessionKey(params: CreateSessionKeyParams): Promise<SessionKeyData> {
    const { eoaSigner, agentWalletAddress, timeLimit, ethLimit, passcode } = params

    try {

      // Create session key from passcode 
      const sessionPrivateKey = passcodeManager.constructPrivateKeyFromPasscode(passcode)

      const sessionKeyAccount = privateKeyToAccount(sessionPrivateKey as `0x${string}`)

      const sessionKeySigner = await toECDSASigner({
        signer: sessionKeyAccount,
      })

      // Create ECDSA validator from EOA signer
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: eoaSigner,
        entryPoint: ENTRY_POINT,
        kernelVersion: KERNEL_VERSION
      })

      // Create permission validator with policies
      const permissionPlugin = await toPermissionValidator(publicClient, {
        entryPoint: ENTRY_POINT,
        signer: sessionKeySigner,
        policies: [
          // In production, you'd want more restrictive policies
          // For now, we use sudo policy to allow everything within time/ETH limits
          toSudoPolicy({}),
        ],
        kernelVersion: KERNEL_VERSION,
      })

      // Create the kernel account with session key
      const sessionKeyAccountWithPermissions = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
          regular: permissionPlugin,
        },
        entryPoint: ENTRY_POINT,
        kernelVersion: KERNEL_VERSION,
      })

      const approval = await serializePermissionAccount(sessionKeyAccountWithPermissions);

      // Create the session key data object
      const sessionKeyData: SessionKeyData = {
        id: Date.now().toString(),
        address: sessionKeyAccountWithPermissions.address,
        passcode: passcode,
        timeLimit,
        ethLimit,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + timeLimit * 24 * 60 * 60 * 1000),
        status: 'active',
        approval: approval
      }

      return sessionKeyData
    } catch (error) {
      console.error('Error creating session key:', error)
      throw new Error('Failed to create session key')
    }
  }

  static async revokeSessionKey(
    eoaSigner: any,
    sessionKeyAddress: string
  ): Promise<string> {
    try {
      // Create ECDSA validator from EOA signer
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: eoaSigner,
        entryPoint: ENTRY_POINT,
        kernelVersion: KERNEL_VERSION
      })

      // Create sudo account for revoking
      const sudoAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint: ENTRY_POINT,
        kernelVersion: KERNEL_VERSION,
      })

      // Create kernel paymaster client
      const kernelPaymaster = createZeroDevPaymasterClient({
        chain: unichainSepolia,
        transport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
      })

      // Create sudo kernel client
      const sudoKernelClient = createKernelAccountClient({
        account: sudoAccount,
        chain: unichainSepolia,
        bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_RPC),
        paymaster: kernelPaymaster,
      })

      // Create empty account for the session key to uninstall
      const emptyAccount = addressToEmptyAccount(sessionKeyAddress as `0x${string}`)
      const emptySessionKeySigner = await toECDSASigner({
        signer: emptyAccount
      })

      // Create permission validator for the session key to uninstall
      const permissionPlugin = await toPermissionValidator(publicClient, {
        entryPoint: ENTRY_POINT,
        signer: emptySessionKeySigner,
        policies: [toSudoPolicy({})],
        kernelVersion: KERNEL_VERSION,
      })

      // Uninstall the plugin (actual on-chain revoke)
      const unInstallUserOpHash = await sudoKernelClient.uninstallPlugin({
        plugin: permissionPlugin,
      })

      console.log('Uninstall user operation hash:', unInstallUserOpHash)

      // Wait for the transaction receipt
      const txReceipt = await sudoKernelClient.waitForUserOperationReceipt({
        hash: unInstallUserOpHash,
      })

      console.log('Session key revoked successfully:', {
        userOpHash: unInstallUserOpHash,
        txHash: txReceipt.receipt.transactionHash
      })

      return txReceipt.receipt.transactionHash

    } catch (error) {
      console.error('Error revoking session key:', error)
      throw new Error('Failed to revoke session key')
    }
  }

  static saveSessionKey(sessionKey: SessionKeyData, eoaAddress: string): void {
    try {
      const existingKeys = this.getSessionKeys(eoaAddress)
      existingKeys.push(sessionKey)
      localStorage.setItem(`sessionKeys_${eoaAddress}`, JSON.stringify(existingKeys))
    } catch (error) {
      console.error('Error saving session key:', error)
      throw new Error('Failed to save session key')
    }
  }

  static getSessionKeys(eoaAddress: string): SessionKeyData[] {
    try {
      const stored = localStorage.getItem(`sessionKeys_${eoaAddress}`)
      if (!stored) return []

      const parsed = JSON.parse(stored)
      return parsed.map((key: any) => ({
        ...key,
        createdAt: new Date(key.createdAt),
        expiresAt: new Date(key.expiresAt)
      }))
    } catch (error) {
      console.error('Error loading session keys:', error)
      return []
    }
  }

  static updateSessionKeyStatus(
    keyId: string,
    status: 'active' | 'expired' | 'revoked',
    eoaAddress: string
  ): void {
    try {
      const keys = this.getSessionKeys(eoaAddress)
      const updatedKeys = keys.map(key =>
        key.id === keyId ? { ...key, status } : key
      )
      localStorage.setItem(`sessionKeys_${eoaAddress}`, JSON.stringify(updatedKeys))
    } catch (error) {
      console.error('Error updating session key status:', error)
      throw new Error('Failed to update session key status')
    }
  }

  static checkExpiredKeys(eoaAddress: string): void {
    try {
      const keys = this.getSessionKeys(eoaAddress)
      const now = new Date()

      keys.forEach(key => {
        if (key.status === 'active' && key.expiresAt < now) {
          this.updateSessionKeyStatus(key.id, 'expired', eoaAddress)
        }
      })
    } catch (error) {
      console.error('Error checking expired keys:', error)
    }
  }

  static formatTimeRemaining(expiresAt: Date): string {
    const now = new Date().getTime()
    const expiry = expiresAt.getTime()
    const diff = expiry - now

    if (diff <= 0) return 'Expired'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }
}

// Utility functions for passcode management (using component state instead of localStorage)
export const passcodeManager = {
  // Default passcode
  defaultPasscode: '1234',

  // Validate passcode format (4-8 digits only)
  validatePasscode: (passcode: string): boolean => {
    return /^\d{4,8}$/.test(passcode)
  },

  // Construct private key from passcode (MVP approach)
  // For passcode "1234", creates "0x0000...1234"
  constructPrivateKeyFromPasscode: function (passcode: string): string {
    if (!passcodeManager.validatePasscode(passcode)) {
      throw new Error('Invalid passcode format')
    }

    // Create a 64-character hex string with passcode at the end
    const prefix = '0'.repeat(64 - passcode.length) // 64 chars total - "0x" prefix - passcode length


    return `0x${prefix}${passcode}`
  },

  // Get the agent signer private key from passcode
  getAgentSignerPrivateKey: function (passcode?: string): string {
    const currentPasscode = passcode || passcodeManager.defaultPasscode
    return passcodeManager.constructPrivateKeyFromPasscode(currentPasscode)
  },

  // Get the agent signer account from passcode
  getAgentSignerAccount: function (passcode?: string) {
    const privateKey = passcodeManager.getAgentSignerPrivateKey(passcode)
    return privateKeyToAccount(privateKey as `0x${string}`)
  }
}
