import {
    Flex,
    Box,
    Input,
    InputGroup,
    HStack,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Link,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export default function RegisterPage({ onLoginClick }: { onLoginClick: () => void }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Flex align={'center'} justify={'center'}>
            <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'4xl'} textAlign={'center'}>
                        Sign up
                    </Heading>
                </Stack>
                <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} p={8}>
                    <Stack spacing={4}>
                        <HStack>
                            <Box>
                                <Input type="text" bgColor="#F2EEFF" placeholder='First Name' />
                            </Box>
                            <Box>
                                <Input type="text" bgColor="#F2EEFF" placeholder='Last Name' />
                            </Box>
                        </HStack>
                        <Input type="text" bgColor="#F2EEFF" placeholder='Address' />
                        <Input type="date" bgColor="#F2EEFF" placeholder='Birthdate' />
                        <InputGroup>
                            <Input type={showPassword ? 'text' : 'password'} bgColor="#F2EEFF" placeholder='Password' />
                            <InputRightElement h={'full'}>
                                <Button
                                    variant={'ghost'}
                                    onClick={() => setShowPassword((showPassword) => !showPassword)}
                                >
                                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        <InputGroup>
                            <Input type={showPassword ? 'text' : 'password'} bgColor="#F2EEFF" placeholder='Confirm Password' />
                            <InputRightElement h={'full'}>
                                <Button
                                    variant={'ghost'}
                                    onClick={() => setShowPassword((showPassword) => !showPassword)}
                                >
                                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText="Submitting"
                                size="lg"
                                bg={'#6937FF'}
                                color={'white'}
                                _hover={{ backgroundColor: "#5126d1" }}
                            >
                                Sign up
                            </Button>
                        </Stack>
                        <Stack pt={6}>
                            <Text align={'center'}>
                                Already a voter? <Link color={'#6937FF'} onClick={onLoginClick}>Login</Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}
