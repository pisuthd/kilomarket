"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, TrendingUp, Database, ChevronRight } from 'lucide-react';

const UseCases = () => {
    const [activeTab, setActiveTab] = useState(0);

    const useCases = [
        {
            id: 0,
            title: "Vibe Coding Without Expensive Subscriptions",
            icon: Code,
            color: "from-[#00ff88] to-[#00d4ff]",
            description: "Developers keep using familiar tools like Cline or RooCode, backed by free or local AI models.",
            workflow: [ 
                "The agent discovers CodeCompletionAgent providers on KiloMarket via the A2A protocol",
                "The provider agent executes the request",
                "Payment settles per call via x402"
            ],
            benefits: [
                "No subscriptions",
                "No API keys", 
                "Pay only when premium intelligence is used"
            ]
        },
        {
            id: 1,
            title: "Trading Strategy Agents",
            icon: TrendingUp,
            color: "from-[#00ff88] to-[#00d4ff]",
            description: "Developers and teams run trading agents that backtest strategies, simulate execution, and generate trade signals.",
            workflow: [
                "Trading agents discover specialized AnalyticsAgent or ExecutionAgent providers",
                "Services are paid per query or per simulation",
                "Settlement happens via x402"
            ],
            benefits: [
                "Strategy testing is expensive",
                "Burst usage fits pay-per-call",
                "Agents already exist in this space"
            ]
        },
        {
            id: 2,
            title: "RPC & Indexing Agents",
            icon: Database,
            color: "from-[#00ff88] to-[#00d4ff]",
            description: "Instead of managing API keys or fixed RPC plans, agents can discover and pay for onchain access dynamically.",
            workflow: [
                "RPCAgent providers offer onchain access",
                "IndexingAgent providers offer historical queries", 
                "Uniswap v4 hooks manage dynamic pricing and revenue splits"
            ],
            benefits: [
                "Devs hate RPC subscriptions",
                "Agents need machine-native access",
                "Clear infra value"
            ]
        }
    ];

    return (
        <section className="py-20 px-6 bg-black/30 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/3 left-1/4 w-96 h-96 opacity-10"
                    style={{
                        background: 'radial-gradient(circle, rgba(0,255,136,0.2) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section Header */}
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
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Agent-to-Agent Markets in{' '}
                        </span>
                        <span className="text-[#00ff88]">
                            Action
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        See how real-world applications are transforming industries with autonomous agent commerce.
                    </motion.p>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-4 mb-12"
                >
                    {useCases.map((useCase, index) => {
                        const Icon = useCase.icon;
                        return (
                            <button
                                key={useCase.id}
                                onClick={() => setActiveTab(index)}
                                className={`
                                    flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300
                                    ${activeTab === index 
                                        ? `bg-gradient-to-r ${useCase.color} text-black shadow-lg scale-105` 
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{useCase.title.split(' ')[0]}</span>
                                <span className="sm:hidden">{useCase.title.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800"
                >
                    {(() => {
                        const currentCase = useCases[activeTab];
                        const Icon = currentCase.icon;
                        
                        return (
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Left Column - Main Content */}
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-3 rounded-lg bg-gradient-to-r ${currentCase.color}`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">
                                            {currentCase.title}
                                        </h3>
                                    </div>
                                    
                                    <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                        {currentCase.description}
                                    </p>

                                    {/* Workflow Steps */}
                                    <div className="mb-8">
                                        <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                            <ChevronRight className="w-5 h-5 text-[#00ff88]" />
                                            How It Works
                                        </h4>
                                        <div className="space-y-3">
                                            {currentCase.workflow.map((step, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-start gap-3"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0 mt-1">
                                                        <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                                                    </div>
                                                    <p className="text-gray-300 leading-relaxed">{step}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Benefits */}
                                <div>
                                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl p-6 border border-gray-700">
                                        <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                            <ChevronRight className="w-5 h-5 text-[#00ff88]" />
                                            Why This Matters
                                        </h4>
                                        <div className="space-y-4">
                                            {currentCase.benefits.map((benefit, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 + 0.3 }}
                                                    className="flex items-center gap-3"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                                                    <span className="text-gray-300">{benefit}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </motion.div>

                {/* Tab Indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    {useCases.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                activeTab === index 
                                    ? 'bg-[#00ff88] w-8' 
                                    : 'bg-gray-600 hover:bg-gray-500'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UseCases;