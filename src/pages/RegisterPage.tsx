import {
    Box,
    Button,
    Center,
    Flex,
    HStack,
    Heading,
    Input,
    Stack,
    useColorModeValue
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FaEthereum } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

export default function RegisterPage() {

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

    const formVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
    };

    const transition = { duration: "0.2", ease: "linear" }; // Faster transition

    return (
        <Flex direction={['column', 'row']}>
            {/* Left Side */}
            <Center w='50%' h='100vh' bg='#6937FF'>
                <FaEthereum color="white" fontSize="300px" />
            </Center>

            {/* Right Side */}
            <Box w='50%' h='100vh' bg='white' p="0" overflow="hidden">
                <AnimatePresence mode="wait">
                    <Center
                        key="main"
                        as={motion.div}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={formVariants}
                        transition={transition}
                        w='100%'
                        h='100%'
                    >
                        <Flex align={'center'} justify={'center'}>
                            <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                                <Stack align={'center'}>
                                    <Heading fontSize={'4xl'} textAlign={'center'}>
                                        Sign up
                                    </Heading>
                                </Stack>
                                <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} p={8}>
                                    <Stack as="form" spacing={4} onSubmit={handleSubmit}>
                                        <HStack>
                                            <Box>
                                                <Input
                                                    type="text"
                                                    bgColor="#F2EEFF"
                                                    placeholder='First Name'
                                                    name="firstName"  // Add this line
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Box>
                                            <Box>
                                                <Input
                                                    type="text"
                                                    bgColor="#F2EEFF"
                                                    placeholder='Last Name'
                                                    name="lastName"  // Add this line
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </Box>
                                        </HStack>
                                        <Input
                                            type="text"
                                            bgColor="#F2EEFF"
                                            placeholder='Address'
                                            name="address"  // Add this line
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Input
                                            type="date"
                                            bgColor="#F2EEFF"
                                            placeholder='Birthdate'
                                            name="birthDate"  // Add this line
                                            value={formData.birthDate}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Input
                                            type="email"
                                            bgColor="#F2EEFF"
                                            placeholder='Email'
                                            name="email"  // Add this line
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Stack spacing={10} pt={2}>
                                            <Button
                                                loadingText="Submitting"
                                                size="lg"
                                                bg={'#6937FF'}
                                                color={'white'}
                                                _hover={{ backgroundColor: "#5126d1" }}
                                                type='submit'
                                            >
                                                Sign up
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Flex>
                    </Center>
                </AnimatePresence>
            </Box>
        </Flex>
    );
}
