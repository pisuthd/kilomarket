"use client"

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const InteractiveTerminal = ({ autoStart = false, embedded = false }: { autoStart?: boolean; embedded?: boolean }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [terminalState, setTerminalState] = useState({
        screen: 'main',
        selectedItem: 0,
        messages: [] as string[],
        userInput: '',
        processing: false
    });
    
    const terminalRef = useRef<HTMLDivElement>(null);
    const demoControllerRef = useRef<{
        shouldStop: boolean;
        shouldPause: boolean;
        resume: () => void;
    }>({
        shouldStop: false,
        shouldPause: false,
        resume: () => {}
    });

    const mainMenuItems = [
        'Interactive Mode',
        'Manage Agents', 
        'Settings'
    ];

    const demoSteps = [
        {
            type: 'show_main_menu',
            delay: 2000
        },
        {
            type: 'navigate_to_interactive',
            delay: 1000
        },
        {
            type: 'select_interactive',
            delay: 500
        },
        {
            type: 'start_interactive_mode',
            delay: 1000
        },
        {
            type: 'user_input',
            input: 'help me check ETH/USDC price on Uniswap',
            delay: 2000
        },
        {
            type: 'ai_detection',
            delay: 2000
        },
        {
            type: 'select_provider',
            delay: 3000
        },
        {
            type: 'payment_required',
            delay: 2000
        },
        {
            type: 'process_payment',
            delay: 3000
        },
        {
            type: 'execute_query',
            delay: 1000
        },
        {
            type: 'ai_response',
            delay: 3000
        },
        {
            type: 'demo_complete',
            delay: 4000
        }
    ];

    useEffect(() => {
        if (autoStart && !isPlaying) {
            runDemo();
        }
        
        return () => {
            // Cleanup on unmount
            demoControllerRef.current.shouldStop = true;
        };
    }, [autoStart]);

    // Auto-scroll to bottom when terminal state changes
    useEffect(() => {
        if (terminalRef.current) {
            setTimeout(() => {
                terminalRef.current?.scrollTo({
                    top: terminalRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, [terminalState]);

    const sleep = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    const waitForResume = () => {
        return new Promise<void>((resolve) => {
            const checkResume = () => {
                if (!demoControllerRef.current.shouldPause) {
                    resolve();
                } else {
                    setTimeout(checkResume, 100);
                }
            };
            checkResume();
        });
    };

    const runDemo = async () => {
        const startDemo = async () => {
            setIsPlaying(true);
            setIsPaused(false);
            demoControllerRef.current.shouldStop = false;
            demoControllerRef.current.shouldPause = false;

            try {
                for (let i = 0; i < demoSteps.length; i++) {
                    if (demoControllerRef.current.shouldStop) break;
                    
                    if (demoControllerRef.current.shouldPause) {
                        await waitForResume();
                    }
                    
                    if (demoControllerRef.current.shouldStop) break;

                    const step = demoSteps[i];
                    
                    // Execute step based on type
                    switch (step.type) {
                        case 'show_main_menu':
                            setTerminalState({
                                screen: 'main',
                                selectedItem: 0,
                                messages: [],
                                userInput: '',
                                processing: false
                            });
                            break;
                            
                        case 'navigate_to_interactive':
                            // Navigate to Interactive Mode
                            for (let j = 0; j <= 0; j++) {
                                setTerminalState(prev => ({ ...prev, selectedItem: j }));
                                await sleep(300);
                            }
                            break;
                            
                        case 'select_interactive':
                            await sleep(500);
                            break;
                            
                        case 'start_interactive_mode':
                            setTerminalState({
                                screen: 'chat',
                                selectedItem: 0,
                                messages: [
                                    '🤖 Agent Terminal v1.0.0',
                                    '💬 Start chatting with AI agents...',
                                    '💳 Checking account credits...',
                                    '✅ Account connected',
                                    '',
                                    'Type your request below:'
                                ],
                                userInput: '',
                                processing: false
                            });
                            break;
                            
                        case 'user_input':
                            setTerminalState(prev => ({ ...prev, userInput: '', processing: true }));
                            // Simulate typing
                            for (let char of step.input!) {
                                setTerminalState(prev => ({ ...prev, userInput: prev.userInput + char }));
                                await sleep(50);
                            }
                            setTerminalState(prev => ({ 
                                ...prev, 
                                messages: [...prev.messages, `> ${prev.userInput}`],
                                userInput: '',
                                processing: true
                            }));
                            break;
                            
                        case 'ai_detection':
                            setTerminalState(prev => ({ 
                                ...prev, 
                                messages: [
                                    ...prev.messages,
                                    '',
                                    '🔍 Detecting required AI service...',
                                    '📋 Matched: AI Provider Service',
                                    '',
                                    '💼 Available AI Providers on KiloMarket:',
                                    '┌─────────────────────────────────────┐',
                                    '│ 1️⃣ kilo-provider-1 - 0.02 QUI / call│',
                                    '│    • Model: LLaMA-3.1-8B            │',
                                    '│    • Avg latency: 420ms             │',
                                    '│    • Real-time data processing      │',
                                    '│                                     │',
                                    '│ 2️⃣ kilo-provider-2 - 0.05 DOL / call│',
                                    '│    • Model: Mixtral-8x7B            │',
                                    '│    • Advanced reasoning             │',
                                    '│    • Cost-effective                 │',
                                    '│                                     │',
                                    '│ 3️⃣ kilo-provider-3 - 0.01 CON / call│',
                                    '│    • Model: Custom ZK-Verified      │',
                                    '│    • Fast response times            │',
                                    '│    • Multi-modal capabilities       │',
                                    '└─────────────────────────────────────┘',
                                    '',
                                    '💳 Checking your account credits...'
                                ]
                            }));
                            break;
                            
                        case 'select_provider':
                            setTerminalState(prev => ({ 
                                ...prev, 
                                messages: [
                                    ...prev.messages,
                                    '🎯 Auto-selecting optimal provider...',
                                    '✅ Selected: LLaMA-3.1-8B (Best value - Fast response + Multi-modal)',
                                    '',
                                    '💰 Required: 0.02 QUI per query',
                                    '💳 Checking your account credits...'
                                ]
                            }));
                            break;
                            
                        case 'payment_required':
                            setTerminalState(prev => ({ 
                                ...prev, 
                                messages: [
                                    ...prev.messages,
                                    '⚠️  Insufficient credits for LLaMA-3.1-8B',
                                    '',
                                    '💰 Required: 0.02 QUI per query',
                                    '🔒 Payment Method: x402 Protocol',
                                    '',
                                    'Processing payment automatically...'
                                ],
                                processing: true
                            }));
                            break;
                            
                        case 'process_payment':
                            setTerminalState(prev => ({ 
                                ...prev, 
                                messages: [
                                    ...prev.messages,
                                    '⏳ Processing x402 payment...',
                                    '✅ Payment successful! Transaction: 0x7f9a...2b3c',
                                    '⛽ Gas Fee: 0.0001 ETH',
                                    '⏱️ Confirmed in 2.3s',
                                    '',
                                    '🤖 Connecting to LLaMA-3.1-8B...'
                                ]
                            }));
                            break;
                            
                        case 'execute_query':
                            setTerminalState(prev => ({ 
                                ...prev, 
                                messages: [
                                    ...prev.messages,
                                    '📊 LLaMA-3.1-8B initialized',
                                    '💰 Credits: 0.01 ETH available',
                                    ''
                                ],
                                processing: true
                            }));
                            break;
                            
                        case 'ai_response':
                            const response = [
                                '',
                                '🔍 Querying Uniswap v4 pools...',
                                '📊 Fetching real-time data...',
                                '',
                                '📍 ETH/USDC Price Data:',
                                '┌─────────────────────────────────────┐',
                                '│ Current Price: $3,427.85           │',
                                '│ 24h Change: +2.3% ↗️                │',
                                '│ 24h Volume: $45,234,567           │',
                                '│ TVL: $128,745,892                 │',
                                '│ Pool: 0x1234...abcd                 │',
                                '│ Fee Tier: 0.05%                     │',
                                '└─────────────────────────────────────┘',
                                '',
                                '💡 Market Analysis:',
                                '• Liquidity: Deep (>100M)',
                                '• Volatility: Moderate',
                                '• Optimal for: Large swaps >$10K',
                                '',
                                '🔮 Price Prediction (1h): $3,435-$3,420',
                                '📈 Trend: Bullish short-term'
                            ];
                            
                            setTerminalState(prev => ({ 
                                ...prev, 
                                messages: [...prev.messages, ...response],
                                processing: false
                            }));
                            break;
                            
                        case 'demo_complete':
                            setTerminalState(prev => ({ 
                                ...prev, 
                                messages: [...prev.messages, '', '✨ Query complete! Ready for next request.']
                            }));
                            break;
                    }
                    
                    if (demoControllerRef.current.shouldStop) break;
                    
                    // Wait before next step
                    await sleep(step.delay);
                }
            } catch (error) {
                console.error('Demo execution error:', error);
            } finally {
                setIsPlaying(false);
                setIsPaused(false);
                
                // Auto-restart after 4 seconds if not stopped
                if (!demoControllerRef.current.shouldStop) {
                    await sleep(4000);
                    if (!demoControllerRef.current.shouldStop) {
                        startDemo();
                    }
                }
            }
        };

        startDemo();
    };

    // Render terminal content based on current state
    const renderTerminalContent = () => {
        const { screen, selectedItem, messages, userInput, processing } = terminalState;

        if (screen === 'main') {
            return (
                <div className="text-green-400">
                    <div className="text-center mb-4">AGENT TERMINAL</div>
                    <div className="text-center mb-6 text-green-300">v1.0.0</div>
                    <div className="space-y-1">
                        {mainMenuItems.map((item, index) => (
                            <div key={index} className={index === selectedItem ? 'bg-green-400 text-black px-2' : ''}>
                                {index === selectedItem ? '●' : '  '} {item}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-green-300 text-xs">
                        Use ↑↓ arrows to navigate • Enter to select • Escape to go back • <span className="animate-pulse">_</span>
                    </div>
                </div>
            );
        }

        if (screen === 'chat') {
            return (
                <div className="text-green-400">
                    <div className="space-y-1">
                        {messages.map((message, index) => (
                            <div key={index} className={
                                message.includes('✅') || message.includes('⚡') ? 'text-green-400' :
                                message.includes('🤖') || message.includes('📊') || message.includes('🔍') ? 'text-blue-400' :
                                message.includes('📈') || message.includes('💰') || message.includes('🔄') ? 'text-yellow-400' :
                                message.includes('Agent:') || message.includes('Balance:') || message.includes('Network:') ? 'text-green-300' :
                                message.startsWith('>') ? 'text-green-400 font-bold' :
                                message.includes('┌') || message.includes('│') || message.includes('└') ? 'text-cyan-400' :
                                message.includes('🔮') || message.includes('💡') ? 'text-purple-400' :
                                message.includes('⚠️') || message.includes('⏳') ? 'text-orange-400' :
                                'text-gray-300'
                            }>
                                {message}
                            </div>
                        ))}
                    </div>
                    {processing && (
                        <div className="flex items-center gap-2 mt-2">
                            <div className="text-green-400">{userInput}</div>
                            <span className="animate-pulse">_</span>
                        </div>
                    )}
                    {!processing && messages.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-green-400">{`>`}</span>
                            <span className="animate-pulse">_</span>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="text-gray-500">
                <p>Welcome to Agent Terminal!</p>
                <p>Discover and interact with AI agents in our marketplace.</p>
                <p className="mt-2">Features:</p>
                <ul className="ml-4 mt-1 space-y-1">
                    <li>• Agent-to-Agent marketplace</li>
                    <li>• x402 protocol payments</li>
                    <li>• Real-time service execution</li>
                    <li>• Uniswap v4 hooks integration</li>
                    <li>• On-chain verification</li>
                </ul>
            </div>
        );
    };

    return (
        <section className={`${embedded ? '' : 'py-20 px-6 bg-black/50'}`}>
            <div className={`${embedded ? '' : 'max-w-6xl mx-auto'}`}>
                {/* Section Header - Only show when not embedded */}
                {!embedded && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <motion.h2
                            className="text-3xl lg:text-4xl font-bold mb-6"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="bg-gradient-to-r from-[#00ff88] via-[#00d4ff] to-[#ff00ff] bg-clip-text text-transparent">
                                Discover AI Agents in Our Marketplace
                            </span>
                        </motion.h2>
                        <motion.p
                            className="text-xl text-gray-400 max-w-3xl mx-auto"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Watch how AI agents discover, trade, and monetize services autonomously with x402 payments.
                        </motion.p>
                    </motion.div>
                )}

                {/* Terminal Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-black border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
                        {/* Terminal Header */}
                        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-800">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 font-mono text-sm">Agent Terminal</span>
                            </div>
                            {isPlaying && (
                                <motion.div
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-[#00ff88]"
                                        animate={{ scale: [1, 1.5, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                    <span className="text-gray-400 text-xs">Live Demo</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Terminal Content */}
                        <div
                            ref={terminalRef}
                            className="p-4 h-[28rem] overflow-y-auto font-mono text-sm"
                            style={{ backgroundColor: '#0a0a0f' }}
                            role="log"
                            aria-live="polite"
                            aria-label="Terminal output"
                        >
                            {renderTerminalContent()}

                            {/* Progress Indicator */}
                            {isPlaying && (
                                <motion.div
                                    className="flex items-center gap-2 mt-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <motion.div
                                        className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-[#00ff88]'}`}
                                        animate={!isPaused ? { scale: [1, 1.5, 1] } : {}}
                                        transition={{ duration: 1, repeat: !isPaused ? Infinity : 0 }}
                                    />
                                    <span className="text-gray-400">
                                        {isPaused ? 'Paused' : 'Processing...'}
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default InteractiveTerminal;