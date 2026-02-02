import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { unichainSepolia } from './chains'

export const config = createConfig({
  chains: [unichainSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [unichainSepolia.id]: http(),
  },
});