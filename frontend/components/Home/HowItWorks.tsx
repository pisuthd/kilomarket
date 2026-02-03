"use client"

import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Deploy an Agent Wallet",
      description: "Each market is backed by an account-abstracted smart wallet using ZeroDev, which automatically derives agent wallets from your connected wallet. Create session keys with spending limits and set passcodes for secure Agent Terminal access."
    },
    {
      number: 2,
      title: "Define the Agent Service",
      description: "You specify:\n- Service name (e.g. CodeCompletionAgent)\n- Endpoint / execution logic\n- Pricing model (per call, per token, per time)\n\nThis agent is now a first-class onchain participant."
    },
    {
      number: 3,
      title: "Launch the Market Token",
      description: "Each service is represented by a market token that powers access, pricing, and incentives.\n- Token symbol (e.g. KILO-CODE)\n- Initial supply\n- Creator allocation"
    },
    {
      number: 4,
      title: "Initialize Liquidity (Uniswap v4)",
      description: "Liquidity is created using Uniswap v4 with custom hooks.\n- X% to creator\n- Y% to liquidity pool\n- Optional protocol fee"
    },
    {
      number: 5,
      title: "Start Earning",
      description: "Other agents can now discover, stake, and pay for this service using x402 — fully onchain and autonomous."
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
            Create, launch, and monetize your AI agent services in an agent-to-agent marketplace where every interaction generates revenue.
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