// ... other imports
import { VStack, FormControl, FormLabel, Input, Button } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Web3 from 'web3';

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve the wallet address passed from MetaMask login
    const walletAddress = location.state?.walletAddress || '';

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        birthDate: '',
        email: '',
    });

    const [idDocument, setIdDocument] = useState<File | null>(null);
    const [kycStatus, setKycStatus] = useState<string | null>(null);

    // Handle ID upload
    const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIdDocument(e.target.files[0]);
        }
    };

    // Submit the ID document for KYC verification
    const handleKYCVerification = async () => {
        if (!idDocument) {
            alert("Please upload an ID document.");
            return;
        }

        const formData = new FormData();
        formData.append('idDocument', idDocument);

        try {
            const response = await fetch(`http://localhost:7122/api/user/kyc-verify?walletAddress=${walletAddress}`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const kycData = await response.json();
                setFormData({
                    firstName: kycData.firstName,
                    lastName: kycData.lastName,
                    address: kycData.address,
                    birthDate: kycData.birthDate,
                    email: '', // Email is manually filled
                });
                setKycStatus("KYC verified successfully!");
            } else {
                setKycStatus("KYC verification failed.");
            }
        } catch (error) {
            console.error('Error during KYC verification:', error);
            setKycStatus("Error during KYC verification.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const requestBody = {
            ...formData,
            walletAddress,
            userType: 'user',
        };
    
        try {
            const response = await fetch('http://localhost:7122/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.Token);
                localStorage.setItem('refreshToken', data.RefreshToken);
                console.log('User registered successfully:', data);
                console.log('login1');
                navigate('/login'); // Redirect to dashboard directly after registration and login
                console.log('login2');
            } else {
                console.error('Error registering user:', response.statusText);
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

    return (
        <VStack as="form" spacing={4} onSubmit={handleSubmit}>
            <FormControl id="idDocument">
                <FormLabel>Upload ID</FormLabel>
                <Input type="file" onChange={handleIdUpload} />
                <Button mt={2} onClick={handleKYCVerification}>Verify ID</Button>
                {kycStatus && <p>{kycStatus}</p>} {/* Display KYC status */}
            </FormControl>
            <FormControl id="firstName">
                <FormLabel>First Name</FormLabel>
                <Input type="text" value={formData.firstName} readOnly />
            </FormControl>
            <FormControl id="lastName">
                <FormLabel>Last Name</FormLabel>
                <Input type="text" value={formData.lastName} readOnly />
            </FormControl>
            <FormControl id="address">
                <FormLabel>Address</FormLabel>
                <Input type="text" value={formData.address} readOnly />
            </FormControl>
            <FormControl id="birthDate">
                <FormLabel>Birth Date</FormLabel>
                <Input type="date" value={formData.birthDate} readOnly />
            </FormControl>
            <FormControl id="email">
                <FormLabel>Email</FormLabel>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    isRequired
                />
            </FormControl>
            <Button colorScheme="blue" type="submit">
                Register
            </Button>
        </VStack>
    );
};

export default RegisterForm;
