import {
	Box,
	Flex,
	Heading,
	SimpleGrid,
	Spinner,
	Stat,
	StatLabel,
	StatNumber,
	Text,
	VStack,
	useColorModeValue,
	useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
	firstName: string;
	lastName: string;
	email: string;
}

const VoterHome = () => {
	const [userElections, setUserElections] = useState<number>(0);
	const [enrolledElectionsLength, setEnrolledElectionsLength] = useState<number>(0);
	const [userData, setUserData] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const toast = useToast();
	const navigate = useNavigate();

	const showToast = useCallback(
		(options: { title: string; description?: string; status: "info" | "warning" | "success" | "error" }) => {
			toast({
				...options,
				duration: 3000,
				isClosable: true,
			});
		},
		[toast]
	);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		const fetchData = async () => {
			try {
				const headers = { Authorization: `Bearer ${token}` };

				// Fetch data in parallel
				const [enrolledResponse, userResponse, electionsResponse] = await Promise.all([
					fetch(`http://localhost:7122/api/election/enrolled`, { method: 'GET', headers }),
					fetch(`http://localhost:7122/api/user/me`, { method: 'GET', headers }),
					fetch(`http://localhost:7122/api/user/userElections`, { method: 'GET', headers }),
				]);

				if (enrolledResponse.ok) {
					const enrolledData = await enrolledResponse.json();
					setEnrolledElectionsLength(enrolledData.length);
				}

				if (userResponse.ok) {
					const userData = await userResponse.json();
					setUserData(userData);
				}

				if (electionsResponse.ok) {
					const userElectionsData = await electionsResponse.json();
					setUserElections(userElectionsData.length || 0);
				}
			} catch (error) {
				console.error('Failed to fetch data:', error);
				showToast({
					title: 'Error',
					description: 'Failed to load data. Please try again later.',
					status: 'error',
				});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [navigate, showToast]);

	if (loading) {
		return (
			<VStack color="#8C56FF" justifyContent="center" alignItems="center" height="100vh">
				<Spinner color="#8C56FF" />
				<Text color="black">Loading...</Text>
			</VStack>
		);
	}

	return (
		<Flex justify="center" align="center" minH="80vh" p="6">
			<Box
				bg={useColorModeValue('white', 'gray.800')}
				p="8"
				rounded="lg"
				boxShadow="lg"
				textAlign="center"
				as={motion.div}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				animation={{ duration: 0.5 }}
			>
				<Heading as="h1" size="2xl" fontWeight="bold" mb={6}>
					Hello, {userData?.firstName}!
				</Heading>
				<SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
					<Stat
						p={5}
						shadow="md"
						border="1px solid"
						borderColor={useColorModeValue('gray.200', 'gray.700')}
						borderRadius="md"
					>
						<StatLabel fontSize="lg" fontWeight="semibold">
							Enrolled Elections
						</StatLabel>
						<StatNumber fontSize="3xl">{enrolledElectionsLength}</StatNumber>
					</Stat>
					<Stat
						p={5}
						shadow="md"
						border="1px solid"
						borderColor={useColorModeValue('gray.200', 'gray.700')}
						borderRadius="md"
					>
						<StatLabel fontSize="lg" fontWeight="semibold">
							My Elections
						</StatLabel>
						<StatNumber fontSize="3xl">{userElections}</StatNumber>
					</Stat>
				</SimpleGrid>
			</Box>
		</Flex>
	);
};

export default VoterHome;