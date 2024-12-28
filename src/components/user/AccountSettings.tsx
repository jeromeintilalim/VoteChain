import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Spinner,
    useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        birthDate: '',
        email: '',
        walletAddress: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:7122/api/user/me', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                setLoading(false);
            } else {
                throw new Error('Failed to fetch user data.');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Could not fetch user data.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            navigate('/login');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:7122/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ address: userData.address, email: userData.email }),
            });
            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Your account has been updated.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                throw new Error('Failed to update user.');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Could not update user data.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <Flex
            justify="center"
            align="center"
            minH="100vh"
            px={{ base: 4, md: 8 }} // Add padding for smaller screens
            bg={'gray.100'} // Adjust background for contrast
        >
            <Box
                maxW={{ base: '100%', md: 'md' }} // Responsive width
                w="full"
                mx="auto"
                p={{ base: 4, md: 6 }}
                boxShadow="lg"
                borderRadius="md"
                bg="white"
            >
                <FormControl mb={4}>
                    <FormLabel>First Name</FormLabel>
                    <Input type="text" value={userData.firstName} isReadOnly disabled />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Last Name</FormLabel>
                    <Input type="text" value={userData.lastName} isReadOnly disabled />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Birth Date</FormLabel>
                    <Input type="text" value={userData.birthDate} isReadOnly disabled />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Wallet Address</FormLabel>
                    <Input type="text" value={userData.walletAddress} isReadOnly disabled />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Address</FormLabel>
                    <Input
                        type="text"
                        name="address"
                        value={userData.address}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Email</FormLabel>
                    <Input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                    />
                </FormControl>
                <Button
                    colorScheme="blue"
                    onClick={handleSave}
                    isLoading={isSaving}
                    isDisabled={isSaving}
                    w="full"
                >
                    Save Changes
                </Button>
            </Box>
        </Flex>
    );
};

export default AccountSettings;