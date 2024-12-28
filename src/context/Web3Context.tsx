import React, { createContext, useContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import { initWeb3, listenForWalletChanges } from '../services/web3Service';

interface Web3ContextType {
    web3: Web3 | null;
    account: string | null;
    loading: boolean;
}

const Web3Context = createContext<Web3ContextType>({
    web3: null,
    account: null,
    loading: true,
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            const web3Instance = await initWeb3();
            if (web3Instance) {
                const accounts = await web3Instance.eth.getAccounts();
                setWeb3(web3Instance);
                setAccount(accounts[0]);
                localStorage.setItem('authenticatedAccount', accounts[0]);
                listenForWalletChanges();
            }
            setLoading(false);
        };

        initialize();
    }, []);

    return (
        <Web3Context.Provider value={{ web3, account, loading }}>
            {children}
        </Web3Context.Provider>
    );
};

// Hook to use Web3 context
export const useWeb3 = () => useContext(Web3Context);
