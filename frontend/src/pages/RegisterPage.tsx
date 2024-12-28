import {
    Box,
    Button,
    Center,
    Flex,
    FormLabel,
    HStack,
    Heading,
    Input,
    Spinner,
    Stack,
    useColorModeValue
} from '@chakra-ui/react';
import imageCompression from 'browser-image-compression';
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
    });

    const [idDocument, setIdDocument] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<File | null>(null); // Selfie state
    const [kycStatus, setKycStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // Add loading state

    // Utility function to capitalize the first letter of each word
    const capitalizeWords = (str: string): string => {
        return str
            .toLowerCase() // Convert the whole string to lowercase first
            .split(' ') // Split by space to get individual words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
            .join(' '); // Join words back together
    };

    // Utility function to sanitize and capitalize addresses
    const sanitizeAddress = (address: string): string => {
        return address
            .replace(/[^a-zA-Z0-9\s,]/g, '') // Remove non-alphanumeric or space/comma characters
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .trim() // Trim leading/trailing spaces
            .split(' ') // Split address into individual words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
            .join(' '); // Join words back together
    };

    const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressedFile = await compressImage(file);  // Compress the image
                setIdDocument(compressedFile);  // Set the compressed file to state
            } catch (error) {
                console.error("Error compressing ID document:", error);
            }
        }
    };

    const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressedFile = await compressImage(file);  // Compress the image
                setSelfie(compressedFile);  // Set the compressed file to state
            } catch (error) {
                console.error("Error compressing selfie:", error);
            }
        }
    };

    // Image compression helper function
    const compressImage = async (file: File) => {
        const options = {
            maxSizeMB: 1,  // Maximum file size in MB
            maxWidthOrHeight: 1024,  // Max width/height of the image
            useWebWorker: true,  // Use web worker for better performance
        };
        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            throw error;
        }
    };

    // Updated KYC submission with better error logging
    const handleKYCVerification = async () => {
        if (!idDocument || !selfie) {
            alert("Please upload both an ID document and a selfie.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('IdDocument', idDocument); // Use key as defined in backend model
        formData.append('Selfie', selfie); // Use key as defined in backend model
        formData.append('WalletAddress', walletAddress); // Include wallet address

        const options = {
            method: 'POST',
            body: formData,
        };

        try {
            const response = await fetch(`http://localhost:7122/api/user/kyc-verify`, options);
            const result = await response.json();

            if (response.ok) {
                setKycStatus("KYC and selfie verified successfully!");
            } else {
                // Display detailed error message from the backend response
                console.error("Backend Response:", result);
                setKycStatus(result.message || "KYC or selfie verification failed.");
            }
        } catch (error) {
            // Log error details to help debugging
            console.error('Error during KYC verification:', error);
            setKycStatus("Error during KYC verification.");
        } finally {
            setLoading(false);
        }
    };

    const goToLogin = () => navigate('/login');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requestBody = {
            ...formData,
            walletAddress,
            userType: 'user',
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
                // Redirect the user to the login page
                navigate('/login');
            } else {
                console.error('Error registering user:', response.statusText);
            }
        } catch (error) {
            console.error('Error registering user:', error);
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
            <Center w='50%' h='100vh' bg='#8C56FF'>
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
                            <Stack mx={'auto'} maxW={'lg'} py={12} px={6}>
                                <Stack align={'center'}>
                                    <Heading fontSize={'4xl'} textAlign={'center'}>
                                        Sign up
                                    </Heading>
                                </Stack>
                                <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} p={8}>
                                    <Stack as="form" spacing={4} onSubmit={handleSubmit}>
                                        <HStack alignItems="self-end">
                                            <Box w='30%'>
                                                <FormLabel>Selfie</FormLabel>
                                            </Box>
                                            <Box w='70%'>
                                                <Input
                                                    type="file"
                                                    bgColor="#F2EEFF"
                                                    onChange={handleSelfieUpload}
                                                    disabled={loading} // Disable while loading
                                                    required
                                                />
                                            </Box>
                                        </HStack>
                                        <HStack alignItems="self-end">
                                            <Box w='30%'>
                                                <FormLabel>ID Document</FormLabel>
                                            </Box>
                                            <Box w='70%'>
                                                <Input
                                                    type="file"
                                                    bgColor="#F2EEFF"
                                                    onChange={handleIdUpload}
                                                    disabled={loading} // Disable while loading
                                                    required
                                                />
                                            </Box>
                                        </HStack>
                                        <Button
                                            onClick={handleKYCVerification}
                                            isDisabled={loading} // Disable button while loading
                                            colorScheme={loading ? 'gray' : 'blue'} // Change color to indicate loading
                                        >
                                            {loading ? <Spinner size="sm" /> : 'Verify ID & Selfie'} {/* Show loading spinner */}
                                        </Button>
                                        {kycStatus && <p>{kycStatus}</p>}
                                        <HStack>
                                            <Box>
                                                <Input
                                                    type="text"
                                                    bgColor="#F2EEFF"
                                                    placeholder='First Name'
                                                    name="firstName"
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
                                                    name="lastName"
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
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Input
                                            type="date"
                                            bgColor="#F2EEFF"
                                            placeholder='Birthdate'
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Input
                                            type="email"
                                            bgColor="#F2EEFF"
                                            placeholder='Email'
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Stack spacing={10} pt={2}>
                                            <Button
                                                loadingText="Submitting"
                                                size="lg"
                                                bg={'#8c56ff'}
                                                color={'white'}
                                                _hover={{ backgroundColor: "#5126d1" }}
                                                type='submit'
                                            >
                                                Sign up
                                            </Button>
                                            <Button
                                                w='inherit'
                                                m="auto"
                                                variant="link"
                                                colorScheme="blue"
                                                onClick={goToLogin}
                                            >
                                                Back to Login
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
