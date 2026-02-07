import { YellowNetworkClient } from '../src/utils/yellow_client';
import { getEnvironmentConfig } from '../src/config';
import { ethers } from 'ethers';

// Configuration
const YELLOW_TOKEN_ADDRESS = '0xDB9F293e3898c9E5536A3be1b0C56c89d2b32DEb';
const TEST_DESTINATION = '0x50D0aD29e0dfFBdf5DAbf4372a5a1A1C1d28A6b1'; // Example address

class YellowNetworkTester {
    private client: YellowNetworkClient;

    constructor(privateKey: string) {
        this.client = new YellowNetworkClient(privateKey);
    }

    async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async testCustodyBalance(): Promise<void> {
        console.log('\n🏦 Testing On-Chain Custody Balance...');
        try {
            const balance = await this.client.getCustodyBalance(YELLOW_TOKEN_ADDRESS);
            console.log(`✅ On-Chain Custody Balance: ${ethers.formatUnits(balance, 6)} ytest.usd`);
        } catch (error) {
            console.error('❌ Custody Balance Error:', error instanceof Error ? error.message : error);
        }
    }

    async testLedgerBalances(): Promise<void> {
        console.log('\n📊 Testing Off-Chain Ledger Balances...');
        try {
            const balances = await this.client.getLedgerBalances();
            console.log(`✅ Found ${balances.length} ledger balance entries:`);
            
            if (balances.length === 0) {
                console.log('   No off-chain balances found');
            } else {
                balances.forEach((balance: any, index: number) => {
                    console.log(`  ${index + 1}. Asset: ${balance.asset || 'Unknown'}`);
                    console.log(`     Amount: ${balance.amount || '0'}`);
                });
            }
        } catch (error) {
            console.error('❌ Ledger Balances Error:', error instanceof Error ? error.message : error);
        }
    }

    async testListChannels(): Promise<any[]> {
        console.log('\n📋 Testing List Channels...');
        try {
            const channels = await this.client.listChannels();
            console.log(`✅ Found ${channels.length} channels:`);
            channels.forEach((channel: any, index: number) => {
                console.log(`  ${index + 1}. Channel ${channel.channel_id}`);
                console.log(`     Status: ${channel.status}`);
                console.log(`     Amount: ${channel.amount || '0'} ytest.usd`);
                console.log(`     Balance: ${channel.balance || '0'} ytest.usd`);
            });
            return channels;
        } catch (error) {
            console.error('❌ List Channels Error:', error instanceof Error ? error.message : error);
            return [];
        }
    }

    async testDepositToCustody(amount: number = 5): Promise<void> {
        console.log(`\n💰 Testing Deposit to Custody (${amount} ytest.usd)...`);
        try {
            const amountBigInt = BigInt(amount * 1_000_000); // Convert to wei (6 decimals)
            const txHash = await this.client.depositToCustody(amountBigInt, YELLOW_TOKEN_ADDRESS);
            console.log(`✅ Deposit successful!`);
            console.log(`   Transaction Hash: ${txHash}`);
            console.log(`   Explorer: https://sepolia.etherscan.io/tx/${txHash}`);
        } catch (error) {
            console.error('❌ Deposit Error:', error instanceof Error ? error.message : error);
        }
    }

    async testCreateChannel(): Promise<void> {
        console.log('\n🔗 Testing Create Channel...');
        try {
            const txHash = await this.client.createChannel();
            console.log(`✅ Channel created successfully!`);
            console.log(`   Transaction Hash: ${txHash}`);
            console.log(`   Explorer: https://sepolia.etherscan.io/tx/${txHash}`);
            
            // Wait a bit for the transaction to be processed
            await this.delay(5000);
        } catch (error) {
            console.error('❌ Create Channel Error:', error instanceof Error ? error.message : error);
        }
    }

    async testTransfer(destination: string = TEST_DESTINATION, amount: number = 1): Promise<void> {
        console.log(`\n💸 Testing Transfer (${amount} ytest.usd to ${destination})...`);
        try {
            const amountStr = amount.toString();
            await this.client.transfer(destination, amountStr);
            console.log(`✅ Transfer successful!`);
            console.log(`   Amount: ${amount} ytest.usd`);
            console.log(`   Destination: ${destination}`);
        } catch (error) {
            console.error('❌ Transfer Error:', error instanceof Error ? error.message : error);
        }
    }

    async testResizeChannel(channelId: string, allocateAmount: number = 10): Promise<void> {
        console.log(`\n📏 Testing Resize Channel (+${allocateAmount} ytest.usd)...`);
        try {
            const allocateAmountBigInt = BigInt(allocateAmount * 1_000_000);
            const txHash = await this.client.resizeChannel(channelId, allocateAmountBigInt);
            console.log(`✅ Channel resized successfully!`);
            console.log(`   Transaction Hash: ${txHash}`);
            console.log(`   Explorer: https://sepolia.etherscan.io/tx/${txHash}`);
        } catch (error) {
            console.error('❌ Resize Channel Error:', error instanceof Error ? error.message : error);
        }
    }

    async testCloseChannel(channelId?: string): Promise<void> {
        console.log('\n🔒 Testing Close Channel...');
        try {
            const txHash = await this.client.closeChannel(channelId);
            console.log(`✅ Channel closed successfully!`);
            console.log(`   Transaction Hash: ${txHash}`);
            console.log(`   Explorer: https://sepolia.etherscan.io/tx/${txHash}`);
        } catch (error) {
            console.error('❌ Close Channel Error:', error instanceof Error ? error.message : error);
        }
    }

    async testWithdrawFromCustody(amount: number = 2): Promise<void> {
        console.log(`\n🏧 Testing Withdraw from Custody (${amount} ytest.usd)...`);
        try {
            const amountBigInt = BigInt(amount * 1_000_000);
            const txHash = await this.client.withdrawFromCustody(YELLOW_TOKEN_ADDRESS, amountBigInt);
            console.log(`✅ Withdrawal successful!`);
            console.log(`   Transaction Hash: ${txHash}`);
            console.log(`   Explorer: https://sepolia.etherscan.io/tx/${txHash}`);
        } catch (error) {
            console.error('❌ Withdraw Error:', error instanceof Error ? error.message : error);
        }
    }

    async runFullTest(): Promise<void> {
        console.log('🚀 Starting Yellow Network Client Full Test Suite');
        console.log('==================================================');

        try {
            // Test 1: Custody Balance
            await this.testCustodyBalance();

            // Test 2: Ledger Balances
            await this.testLedgerBalances();

            // Test 3: List Channels
            const channels = await this.testListChannels();
 
            // Check balance after deposit
            await this.delay(3000);
            await this.testCustodyBalance();

            // Test 4: Create Channel
            await this.testCreateChannel();

            // List channels after creation
            await this.delay(3000);
            const updatedChannels = await this.testListChannels();

            // Test 5: Transfer (if we have an open channel)
            const openChannel = updatedChannels.find(c => c.status === 'open');
            if (openChannel) {
                await this.testTransfer(TEST_DESTINATION, 0.5);
                
                // Test 6: Resize Channel
                // await this.testResizeChannel(openChannel.channel_id, 3);
            } else {
                console.log('\n⚠️  No open channels found, skipping transfer and resize tests');
            }

            await this.delay(3000);

            // Test 7: Close Channel (if we have an open channel)
            if (openChannel) {
                await this.testCloseChannel(openChannel.channel_id);
            }

            // Test 8: Withdraw from Custody
            await this.testWithdrawFromCustody(1);

            // Final balance check
            await this.delay(3000);
            await this.testCustodyBalance();

            console.log('\n✨ Full test suite completed!');

        } catch (error) {
            console.error('\n💥 Test suite failed:', error instanceof Error ? error.message : error);
        } finally {
            this.client.disconnect();
            console.log('\n🔌 Disconnected from Yellow Network');
        }
    }

    async runBasicTest(): Promise<void> {
        console.log('🚀 Starting Yellow Network Client Basic Test');
        console.log('==============================================');

        try {
            // Test only most essential functions
            await this.testCustodyBalance();
            await this.testLedgerBalances();
            await this.testListChannels();

            console.log('\n✨ Basic test completed successfully!');

        } catch (error) {
            console.error('\n💥 Basic test failed:', error instanceof Error ? error.message : error);
        } finally {
            this.client.disconnect();
            console.log('\n🔌 Disconnected from Yellow Network');
        }
    }
}

// Main execution
async function main() {
    console.log('🔧 Loading configuration...');
    
    try {
        const config = getEnvironmentConfig();
        
        if (!config.privateKey) {
            console.error('❌ Configuration Error: ETHEREUM_PRIVATE_KEY environment variable is required');
            process.exit(1);
        }

        console.log('✅ Configuration loaded successfully');
        
        const tester = new YellowNetworkTester(config.privateKey);
        
        // Check command line arguments
        const args = process.argv.slice(2);
        const testType = args[0] || 'basic';
        
        if (testType === 'full') {
            await tester.runFullTest();
        } else {
            await tester.runBasicTest();
        }
        
    } catch (error) {
        console.error('❌ Failed to load configuration:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

export { YellowNetworkTester };