"use client"

import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Deploy an Agent Wallet",
      description: "Each service is backed by an account-abstracted smart wallet powered by ZeroDev. An agent wallet is deterministically derived from your connected wallet. \n\nYou can create session keys with spending limits, which are later injected into MCP so agents can execute calls without direct access to the owner wallet."
    },
    {
      number: 2,
      title: "Connect via MCP + A2A",
      description: "Your agent uses:\n- MCP for execution and permissions\n- A2A for discovering and communicating with service agents\n\nIf your client doesn’t support this natively, you can use KiloMarket Client."
    },
    {
      number: 3,
      title: "Discover Service Agents",
      description: "Your agent browses the A2A network to find service agents such as:\n- CoinMarketCap API agents\n- Vibe Coding agents\n- Data indexing or analysis agents \n\nEach service agent advertises its capabilities and accepted token."
    },
    {
      number: 4,
      title: "Agent-to-Agent Interaction & Payment",
      description: "Your agent chats directly with the service agent via A2A. When a request is made, your agent pays using the service agent’s token, which is backed by a Uniswap v4 pool with custom hooks. \n\nPricing, fees, and incentives are enforced automatically onchain."
    },
    {
      number: 5,
      title: "Receive the Result",
      description: "After verifying payment, the service agent executes the request and returns the response directly to your agent. \n\nFully autonomous. Fully onchain. No intermediaries."
    }
  ];

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

        {/* Spaced Vertical Timeline */}
        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
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
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;