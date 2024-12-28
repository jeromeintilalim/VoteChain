import Web3 from 'web3';
import { useToast } from '@chakra-ui/react';

let web3Instance: Web3 | null = null;
  const toast = useToast();

// Function to initialize Web3
export const initWeb3 = async (): Promise<Web3 | null> => {
  if (window.ethereum) {
    try {
      web3Instance = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return web3Instance;
    } catch (error) {
      console.error('Error initializing Web3:', error);
      toast({
        title: 'Web3 Initialization Failed',
        description: 'Please check your MetaMask connection.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  } else {
    toast({
      title: 'MetaMask Not Found',
      description: 'Please install MetaMask to use this application.',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
  }
  return null;
};

// Function to get the current Web3 instance
export const getWeb3 = (): Web3 | null => {
  return web3Instance;
};

// Function to handle logout
export const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authenticatedAccount');
  window.location.href = '/login'; // Redirect to login page
};

// Function to check for wallet changes
export const listenForWalletChanges = () => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      const authenticatedAccount = localStorage.getItem('authenticatedAccount');
      if (accounts.length === 0) {
        handleLogout();
      } else if (authenticatedAccount && authenticatedAccount.toLowerCase() !== accounts[0].toLowerCase()) {
        toast({
          title: 'Account Changed',
          description: 'Your MetaMask account has changed. You have been logged out for security reasons.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        handleLogout();
      }
    });
  }
};
