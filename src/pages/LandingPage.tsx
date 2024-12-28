import { Box, Card, Center, Flex, Heading, Stack, Text, useBreakpointValue } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { FaEthereum } from "react-icons/fa";
import NewMetamaskLogin from './../components/login/NewMetamaskLogin';

const LandingPage = () => {
    const formVariants = {
        hidden: { x: "100%", opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: "-100%", opacity: 0 },
    };

    // Simplified transition without explicit typing
    const transition = { duration: "0.2", ease: "linear" };

    const iconFontSize = useBreakpointValue({ base: "150px", md: "300px" });

    return (
        <Flex direction={{ base: 'column', md: 'row' }} minH="100vh">
            {/* Left Side: Ethereum Logo */}
            <Center display={{ base: 'none', md: 'flex' }} w={{ base: '100%', md: '50%' }} h={{ base: '40vh', md: '100vh' }} bg="linear-gradient(145deg, #8C56FF, #6937FF)">
                <FaEthereum color="white" fontSize={iconFontSize} />
            </Center>

            {/* Right Side: Content */}
            <Box w={{ base: '100%', md: '50%' }} h={{ base: '100vh', md: '100vh' }} bg={{ base: "#774aff", md: "white" }} p={{ base: 4, md: 8 }} overflow="hidden">
                <AnimatePresence mode="wait">
                    <Center
                        key="main"
                        as={motion.div}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={formVariants}
                        transition={transition} // Simplified transition
                        w="100%"
                        h="100%"
                        display={{ base: 'block', md: 'flex' }}
                    >
                        <Center display={{ base: 'flex', md: 'none' }} w={{ base: '100%', md: '50%' }} bgColor="transparent" h={{ base: '40vh', md: '100vh' }}>
                            <FaEthereum color="white" fontSize={iconFontSize} />
                        </Center>
                        <Card p="6"
                            display={{ base: 'block', md: 'none' }}>
                            <Stack align="center" textAlign="center">
                                <Heading fontWeight="700" fontSize={{ base: "2xl", md: "5xl" }}>
                                    Welcome to{" "}
                                    <Text as="span" color="#8C56FF" fontStyle="italic">
                                        VoteChain
                                    </Text>
                                </Heading>
                                <NewMetamaskLogin />
                            </Stack>
                        </Card>
                        <Stack display={{ base: 'none', md: 'block' }} align="center" textAlign="center">
                            <Heading fontWeight="800" fontSize={{ base: "2xl", md: "5xl" }}>
                                Welcome to{" "}
                                <Text as="span" color="#8c56ff" fontStyle="italic">
                                    VoteChain
                                </Text>
                            </Heading>
                            <NewMetamaskLogin />
                        </Stack>
                    </Center>
                </AnimatePresence>
            </Box>
        </Flex>
    );
};

export default LandingPage;
