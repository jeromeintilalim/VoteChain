import { Button } from '@chakra-ui/react';
import { useState } from 'react';
import Web3 from 'web3';

function MetaMaskLogin() {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [nonce, setNonce] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [web3, setWeb3] = useState<Web3 | null>(null);

    const initializeWeb3 = async () => {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            await window.ethereum.enable();
            setWeb3(web3Instance);
            return web3Instance;
        } else {
            alert('MetaMask is not installed!');
            return null;
        }
    };

    const requestNonce = async (address: string) => {
        const response = await fetch(`/api/user/request-nonce?walletAddress=${address}`);
        const data = await response.json();
        return data.Nonce;
    };

    const verifySignature = async (address: string, signature: string) => {
        const response = await fetch('/api/user/verify-nonce', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ WalletAddress: address, Signature: signature })
        });
    
        if (response.ok) {
            const data = await response.json();
            return data.Token;  // Ensure you're accessing the token correctly
        } else {
            console.error('Failed to verify signature');
            return null;
        }
    };
    
    const connectMetaMask = async () => {
        const web3 = await initializeWeb3();
        if (!web3) return;
    
        try {
            const accounts = await web3.eth.getAccounts();
            const address = accounts[0];
            setWalletAddress(address);
    
            // Request the nonce from the server
            const nonce = await requestNonce(address);
            setNonce(nonce);
    
            // Sign the nonce using MetaMask
            const signature = await web3.eth.personal.sign(web3.utils.utf8ToHex(nonce), address, '');
    
            // Verify the signature on the server
            const token = await verifySignature(address, signature);
            console.log('Received token:', token); // Add this line to check if the token is received
            setToken(token);
    
            if (token) {
                alert('Login successful!');
                // Store the token in local storage or cookies for later use
                localStorage.setItem('token', token);
            } else {
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Error during MetaMask login:', error);
        }
    };
    
    return (
        <div>
            <h2>MetaMask Login</h2>
            <Button onClick={connectMetaMask}>Login with MetaMask</Button>
            {walletAddress && <p>Wallet Address: {walletAddress}</p>}
            {token && <p>JWT Token: {token}</p>}
        </div>
    );
}

export default MetaMaskLogin;
