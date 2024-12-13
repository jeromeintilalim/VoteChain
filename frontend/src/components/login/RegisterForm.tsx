import { Button, Card, CardBody, FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
    const location = useLocation();
    const { walletAddress } = location.state as { walletAddress: string };
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        birthDate: '',
        email: '',
        userType: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requestBody = {
            ...formData,
            walletAddress: walletAddress,
            nonce: "1", // Placeholder; will be replaced by the backend
            userType: 'user'
        };

        try {
            const response = await fetch(`http://localhost:7122/api/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const registeredUser = await response.json();
                console.log('User registered successfully:', registeredUser);

                // Optionally, log the user in automatically
                const token = await loginUser(walletAddress);
                if (token) {
                    localStorage.setItem('token', token); // Store JWT token
                    navigate('/dashboard');
                }
            } else {
                console.error('Error registering user:', response.statusText);
            }
        } catch (error) {
            console.error('Error registering user:', error);
        }
    };

    // Define the loginUser function
    const loginUser = async (walletAddress: string): Promise<string | null> => {
        const url = `http://localhost:7122/api/user/login`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ walletAddress }), // Adjust payload if needed
            });

            if (response.ok) {
                const data = await response.json();
                return data.token; // Return JWT token
            } else {
                console.error('Login failed:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error logging in user:', error);
            return null;
        }
    };

    return (
        <Card maxW='sm' m="auto">
            <CardBody>
                <VStack as="form" spacing={4} onSubmit={handleSubmit}>
                    <FormControl id="firstName">
                        <FormLabel>First Name</FormLabel>
                        <Input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    </FormControl>
                    <FormControl id="lastName">
                        <FormLabel>Last Name</FormLabel>
                        <Input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </FormControl>
                    <FormControl id="address">
                        <FormLabel>Address</FormLabel>
                        <Input type="text" name="address" value={formData.address} onChange={handleChange} required />
                    </FormControl>
                    <FormControl id="birthDate">
                        <FormLabel>Birth Date</FormLabel>
                        <Input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required />
                    </FormControl>
                    <FormControl id="email">
                        <FormLabel>Email</FormLabel>
                        <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </FormControl>
                    <Button colorScheme="blue" type="submit">
                        Register
                    </Button>
                </VStack>
            </CardBody>
        </Card>
    );
};

export default RegisterForm;
