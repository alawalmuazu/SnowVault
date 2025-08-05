'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { toast } from '@/hooks/use-toast'

interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  chainId: number | null
  balance: string | null
  ensName: string | null
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const AVALANCHE_MAINNET = {
  chainId: '0xa86a', // 43114
  chainName: 'Avalanche Network',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io/'],
}

const AVALANCHE_FUJI = {
  chainId: '0xa869', // 43113
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
}

const SUPPORTED_CHAINS = {
  43114: AVALANCHE_MAINNET,
  43113: AVALANCHE_FUJI,
  31337: {
    chainId: '0x7a69', // 31337
    chainName: 'Hardhat Local',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [''],
  },
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    balance: null,
    ensName: null,
  })

  const updateWalletState = useCallback((updates: Partial<WalletState>) => {
    setWalletState(prev => ({ ...prev, ...updates }))
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!walletState.provider || !walletState.address) return

    try {
      const balance = await walletState.provider.getBalance(walletState.address)
      const formattedBalance = ethers.formatEther(balance)
      updateWalletState({ balance: formattedBalance })
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }, [walletState.provider, walletState.address, updateWalletState])

  const getENSName = useCallback(async (address: string, provider: ethers.BrowserProvider) => {
    try {
      const ensName = await provider.lookupAddress(address)
      return ensName
    } catch (error) {
      // ENS not available on this network or other error
      return null
    }
  }, [])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: 'Wallet Not Found',
        description: 'Please install MetaMask or another Web3 wallet.',
        variant: 'destructive',
      })
      return
    }

    updateWalletState({ isConnecting: true })

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = accounts[0]
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      // Get ENS name if available
      const ensName = await getENSName(address, provider)

      updateWalletState({
        isConnected: true,
        isConnecting: false,
        address,
        provider,
        signer,
        chainId,
        ensName,
      })

      // Get balance
      const balance = await provider.getBalance(address)
      const formattedBalance = ethers.formatEther(balance)
      updateWalletState({ balance: formattedBalance })

      // Check if we're on a supported network
      if (!SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]) {
        toast({
          title: 'Unsupported Network',
          description: 'Please switch to Avalanche network.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}`,
        })
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      updateWalletState({ isConnecting: false })
      
      if (error.code === 4001) {
        toast({
          title: 'Connection Rejected',
          description: 'Please approve the connection request.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Connection Failed',
          description: error.message || 'Failed to connect wallet.',
          variant: 'destructive',
        })
      }
    }
  }, [updateWalletState, getENSName])

  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      isConnecting: false,
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      balance: null,
      ensName: null,
    })
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    })
  }, [])

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) return

    const chainConfig = SUPPORTED_CHAINS[targetChainId as keyof typeof SUPPORTED_CHAINS]
    if (!chainConfig) {
      toast({
        title: 'Unsupported Network',
        description: 'The requested network is not supported.',
        variant: 'destructive',
      })
      return
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainConfig.chainId }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          })
        } catch (addError) {
          console.error('Failed to add network:', addError)
          toast({
            title: 'Failed to Add Network',
            description: 'Could not add the network to your wallet.',
            variant: 'destructive',
          })
        }
      } else {
        console.error('Failed to switch network:', error)
        toast({
          title: 'Failed to Switch Network',
          description: error.message || 'Could not switch to the requested network.',
          variant: 'destructive',
        })
      }
    }
  }, [])

  // Handle account and network changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else if (accounts[0] !== walletState.address) {
        // Account changed, reconnect
        connect()
      }
    }

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16)
      updateWalletState({ chainId: newChainId })
      
      // Refresh balance on network change
      if (walletState.isConnected) {
        refreshBalance()
      }
    }

    const handleDisconnect = () => {
      disconnect()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    window.ethereum.on('disconnect', handleDisconnect)

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('disconnect', handleDisconnect)
      }
    }
  }, [walletState.address, walletState.isConnected, connect, disconnect, updateWalletState, refreshBalance])

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })

        if (accounts.length > 0) {
          await connect()
        }
      } catch (error) {
        console.error('Auto-connect failed:', error)
      }
    }

    autoConnect()
  }, [connect])

  const contextValue: WalletContextType = {
    ...walletState,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}