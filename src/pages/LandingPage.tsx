import { Box, Button, Center, Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from 'react';
import { FaEthereum } from "react-icons/fa";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import { MdKeyboardArrowLeft } from "react-icons/md";

const LandingPage = () => {
    const [activeForm, setActiveForm] = useState(''); // State to track which form is active

    const handleButtonClick = (formType: string) => {
        setActiveForm(formType);
    };

    const handleBackButtonClick = () => {
        setActiveForm('');
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
                    {activeForm === '' && (
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
                            <Stack>
                                <Heading fontWeight="800" fontSize="54px">Welcome to <Text as="span" color="#6937FF" fontStyle="italic">VoteChain</Text></Heading>
                                <Stack direction='row' justifyContent="space-evenly">
                                    <Button
                                        p="32px"
                                        w="45%"
                                        fontSize="28px"
                                        backgroundColor='#6937FF'
                                        color="white"
                                        size='lg'
                                        borderRadius="0"
                                        _hover={{ backgroundColor: "#5126d1" }}
                                        boxShadow="2xl"
                                        onClick={() => handleButtonClick('vote')}
                                    >
                                        Log in
                                    </Button>
                                    <Button
                                        p="27px"
                                        w="45%"
                                        fontSize="32px"
                                        backgroundColor='white'
                                        color="#6937FF"
                                        border="5px solid #6937FF"
                                        borderRadius="0"
                                        size='lg'
                                        variant="outline"
                                        _hover={{ backgroundColor: "#f4efff" }}
                                        boxShadow="2xl"
                                        onClick={() => handleButtonClick('register')}
                                    >
                                        Register
                                    </Button>
                                </Stack>
                            </Stack>
                        </Center>
                    )}

                    {activeForm === 'vote' && (
                        <Center
                            key="vote"
                            as={motion.div}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={formVariants}
                            transition={transition}
                            w='100%'
                            h='100%'
                        >
                            <Box w="100%">
                                <IconButton
                                    icon={<MdKeyboardArrowLeft />}
                                    onClick={handleBackButtonClick}
                                    aria-label="Back"
                                    position="absolute"
                                    top="4"
                                    left="4"
                                    fontSize="48px"
                                    backgroundColor="#6937FF"
                                    color="white"
                                    _hover={{ backgroundColor: "#5126d1" }}
                                />
                                <LoginPage onRegisterClick={() => handleButtonClick('register')} />
                            </Box>
                        </Center>
                    )}

                    {activeForm === 'register' && (
                        <Center
                            key="register"
                            as={motion.div}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={formVariants}
                            transition={transition}
                            w='100%'
                            h='100%'
                        >
                            <Box w="100%">
                                <IconButton
                                    icon={<MdKeyboardArrowLeft />}
                                    onClick={handleBackButtonClick}
                                    aria-label="Back"
                                    position="absolute"
                                    top="4"
                                    left="4"
                                    fontSize="48px"
                                    backgroundColor="#6937FF"
                                    color="white"
                                    _hover={{ backgroundColor: "#5126d1" }}
                                />
                                <RegisterPage onLoginClick={() => handleButtonClick('vote')} />
                            </Box>
                        </Center>
                    )}
                </AnimatePresence>
            </Box>
        </Flex>
    );
};

export default LandingPage;
