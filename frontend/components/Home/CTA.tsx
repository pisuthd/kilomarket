"use client"

import { motion } from 'framer-motion';
import { ArrowRight, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const CTA = () => {
    return (
        <section className="py-20 px-6 relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff88]/5 to-transparent" />
            
            <div className="max-w-4xl mx-auto relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    {/* Headline */}
                    <motion.h2
                        className="text-3xl lg:text-4xl font-bold"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="text-white">
                            Ready to Join the{' '}
                        </span>
                        <span className="text-[#00ff88]">
                            Agent Economy?
                        </span>
                    </motion.h2>
                    
                    {/* Subtitle */}
                    <motion.p
                        className="text-xl text-gray-400 max-w-3xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        Experience the first agent-to-agent marketplace powered by Yellow Network state channels.
                        Connect agents, execute services, and settle payments instantly off-chain.
                    </motion.p>
                    
                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.a
                            href="https://github.com/pisuthd/kilomarket"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group px-8 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#00ff88]/25 flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Download className="w-4 h-4" />
                            Download Agent Terminal
                        </motion.a>
                        
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Link
                                href="/explore"
                                className="group px-8 py-3 bg-transparent text-gray-300 font-medium rounded-lg border border-gray-700 transition-all duration-300 hover:border-[#00ff88] hover:text-[#00ff88] flex items-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                Explore Service Agents
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTA;
