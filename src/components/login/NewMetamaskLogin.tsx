import { Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';

interface User {
    walletAddress: string;
    nonce: number;
}

const NewMetamaskLogin: React.FC = () => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        if ((window as any).ethereum) {
            const web3Instance = new Web3((window as any).ethereum);
            setWeb3(web3Instance);
        } else {
            console.error('MetaMask not detected');
        }
    }, []);

    const handleClick = async () => {
        if (!web3) {
            console.error('Web3 is not initialized');
            return;
        }
    
        try {
            await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
            const accounts = await web3.eth.getAccounts();
            const currentWalletAddress = accounts[0].toLowerCase();
            setWalletAddress(currentWalletAddress);
    
            const userExists = await checkUserExists(currentWalletAddress);
    
            if (userExists) {
                const nonce = await fetchNonce(currentWalletAddress);
                const signature = await signMessage(currentWalletAddress, nonce);
    
                const tokens = await verifySignature(currentWalletAddress, signature);  // Return an object now
    
                if (tokens) {
                    const { token, refreshToken } = tokens;  // Destructure from the returned object
                    localStorage.setItem('token', token);         // Store JWT token
                    localStorage.setItem('refreshToken', refreshToken); // Store refresh token
                    navigate('/dashboard');
                }
            } else {
                navigate('/register', { state: { walletAddress: currentWalletAddress } });
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const fetchNonce = async (walletAddress: string): Promise<string> => {
        const response = await fetch(`http://localhost:7122/api/user/request-nonce?walletAddress=${walletAddress}`);
        const data = await response.json();
        return data.nonce;
    };

    const signMessage = async (walletAddress: string, nonce: string): Promise<string> => {
        const message = `I am signing my one-time nonce: ${nonce}`;
        return await web3!.eth.personal.sign(message, walletAddress, '');
    };

    const verifySignature = async (walletAddress: string, signature: string): Promise<{ token: string, refreshToken: string } | null> => {
        const response = await fetch('http://localhost:7122/api/user/verify-nonce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress, signature }),
        });
    
        if (response.ok) {
            const data = await response.json();
            console.log('Received tokens:', data);  // Debugging step
            return { token: data.token, refreshToken: data.refreshToken };  // Make sure refreshToken is part of the API response
        } else {
            console.error('Signature verification failed:', response.statusText);
            return null;
        }
    };

    const checkUserExists = async (walletAddress: string): Promise<boolean> => {
        const response = await fetch(`http://localhost:7122/api/user/checkUserExists?walletAddress=${walletAddress}`);
        return response.ok;
    };

    return (
        <Button w="100%" color="white" bgColor="#8c56ff" onClick={handleClick}
            _hover={{ bgColor: "#7f43ff", boxShadow: "2px 2px 16px rgb(0 0 0 / 20%)" }}>
            Login with MetaMask
        </Button>
    );
};

export default NewMetamaskLogin;
