import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    Input,
    Link,
    Stack,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';

export default function LoginPage({ onRegisterClick }: { onRegisterClick: () => void }) {
    return (
        <Flex align={'center'} justify={'center'}>
            <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                    <Heading fontSize={'4xl'}>Log in now to start voting!</Heading>
                </Stack>
                <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} p={8}>
                    <Stack spacing={4}>
                        <Input type="email" bgColor="#F2EEFF" placeholder='Voter ID' />
                        <Input type="password" bgColor="#F2EEFF" placeholder='Password' />
                        <Stack spacing={10}>
                            <Stack direction={{ base: 'column', sm: 'row' }} align={'start'} justify={'space-between'}>
                                <Checkbox iconColor='white' _checked={{
                                    "& .chakra-checkbox__control": { background: "#8C56FF", borderColor: "#8C56FF" }
                                }}   >Remember me</Checkbox>
                                <Link color={'#8C56FF'}>Forgot password?</Link>
                            </Stack>
                            <Button bg={'#8C56FF'} color={'white'} _hover={{ backgroundColor: "#5126d1" }}>
                                Sign in
                            </Button>
                            <Stack pt={6}>
                                <Text align={'center'}>
                                    Not a voter yet? <Link color={'#8C56FF'} onClick={onRegisterClick}>Register</Link>
                                </Text>
                            </Stack>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}
