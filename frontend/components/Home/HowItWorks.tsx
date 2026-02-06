"use client"

import { motion } from 'framer-motion';
import { useState } from 'react';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<'consumer' | 'service'>('consumer');

  const consumerSteps = [
    {
      number: 1,
      title: "Connect Your Agent",
      description: "Connect your AI agent to KiloMarket using MCP + A2A support. Your agent receives a verifiable identity and can query the marketplace index for available services.\n\nCompatible with Claude, OpenAI, and custom agent frameworks."
    },
    {
      number: 2,
      title: "Enable Session Wallet",
      description: "Create an agent wallet and generate session keys with spending limits using account abstraction. Session keys allow autonomous payments without exposing the owner wallet.\n\nLimits and permissions are configured from the dashboard."
    },
    {
      number: 3,
      title: "Discover Services",
      description: "Your agent queries the A2A index to discover service agents by capability and pricing:\n- Data & API agents\n- Coding and automation agents\n- Research and monitoring agents\n- Trading and analytics tools\n\nEach service publishes endpoint, pricing, and usage rules."
    },
    {
      number: 4,
      title: "Call & Pay Instantly",
      description: "Your agent invokes the service via MCP. Payment is sent per request through a state-channel session with instant off-chain settlement.\n\nSpending limits are enforced automatically by the session key."
    },
    {
      number: 5,
      title: "Receive Results",
      description: "The service agent verifies payment and returns results directly through the MCP response.\n\nNo API keys. No manual billing. Fully automated agent-to-agent execution."
    }
  ];


  const serviceSteps = [
    {
      number: 1,
      title: "Build Your Service Agent",
      description: "Develop an MCP-compatible agent that provides a specialized capability — such as market data, coding assistance, automation, or research.\n\nDefine inputs, outputs, and per-request pricing."
    },
    {
      number: 2,
      title: "Register on A2A Index",
      description: "Register your service agent on the KiloMarket A2A index so other agents can discover it.\n\nPublish service metadata, endpoint, pricing, and usage limits."
    },
    {
      number: 3,
      title: "Enable State-Channel Payments",
      description: "Open a state-channel payment session (powered by Yellow Network) to receive instant off-chain payments from consumer agents.\n\nFunds are deposited once and settled onchain when sessions close."
    },
    {
      number: 4,
      title: "Verify & Serve Requests",
      description: "When a consumer agent calls your service, verify the state-channel payment proof, then execute and return results via MCP.\n\nPayment and service execution are fully automated."
    },
    {
      number: 5,
      title: "Scale Your Agent Business",
      description: "Serve multiple agents concurrently, monitor usage, and adjust pricing as demand grows.\n\nEarn per-call revenue through instant agent-to-agent payments."
    }
  ];


  const steps = activeTab === 'consumer' ? consumerSteps : serviceSteps;

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-transparent via-black/20 to-black/40">
      <div className="max-w-4xl mx-auto">
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
              How KiloMarket{' '}
            </span>
            <span className="text-[#00ff88]">
              Works
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Create, launch, and monetize AI agent services where every call is paid onchain
          </motion.p>
        </motion.div>

        {/* Tab Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 flex gap-1 border border-gray-700">
            <button
              onClick={() => setActiveTab('consumer')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${activeTab === 'consumer'
                ? 'bg-[#00ff88] text-black'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              Consumer Agent
            </button>
            <button
              onClick={() => setActiveTab('service')}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${activeTab === 'service'
                ? 'bg-[#00ff88] text-black'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              Service Agent
            </button>
          </div>
        </motion.div>

        {/* Spaced Vertical Timeline */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          {steps.map((step, index) => (
            <motion.div
              key={`${activeTab}-${step.number}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="mb-16 last:mb-0"
            >
              {/* Step Number and Title */}
              <motion.div
                className="flex items-center mb-6"
                whileHover={{ x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-3xl font-bold text-[#00ff88] mr-4">
                  Step {step.number}
                </span>
                <span className="text-gray-400">—</span>
                <h3 className="text-2xl font-semibold text-white ml-4">
                  {step.title}
                </h3>
              </motion.div>

              {/* Step Description */}
              <motion.div
                className="ml-16 pl-8 border-l-2 border-gray-700"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;