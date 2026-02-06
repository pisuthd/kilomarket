"use client"

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { WagmiProvider } from 'wagmi';
// import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
// import '@rainbow-me/rainbowkit/styles.css';
// import { config } from '@/lib/wagmi';

// const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
    // return (
    //     <WagmiProvider config={config}>
    //         <QueryClientProvider client={queryClient}>
    //             <RainbowKitProvider 
    //                 theme={darkTheme({
    //                     accentColor: '#00ff88',
    //                     accentColorForeground: '#000000',
    //                     borderRadius: 'medium',
    //                     fontStack: 'system',
    //                 })}
    //                 modalSize="compact"
    //             >
    //                 {children}
    //             </RainbowKitProvider>
    //         </QueryClientProvider>
    //     </WagmiProvider>
    // );
    return (
        <div>
            {children}
        </div>
    )
}
