import React, { useEffect, useState } from 'react';
import {
	Box,
	Heading,
	SimpleGrid,
	Stat,
	StatLabel,
	StatNumber,
	useColorModeValue,
	useToast,
	Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const VoterHome = () => {
	const [elections, setElections] = useState(0);
	const [user, setUser] = useState();

	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		fetchElectionData();
	}, [elections]);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			console.error('No token found. Redirecting to login.');
			navigate('/login');
		}
	}, []);

	const fetchElectionData = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			console.error('No token found. Redirecting to login.');
			navigate('/login');
			return;
		}

		try {
			const response = await fetch(`http://localhost:7122/api/election`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data: any = await response.json();
			setElections(data.length);
			console.log('Fetched Election Data:', elections);

		} catch (error) {
			console.error('Failed to fetch election', error);
			toast({
				title: "An error occurred.",
				description: "Unable to fetch election data.",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const fetchUserData = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			console.error('No token found. Redirecting to login.');
			navigate('/login');
			return;
		}

		try {
			const response = await fetch(`http://localhost:7122/api/user`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data: any = await response.json();
			setElections(data.length);
			console.log('Fetched Election Data:', elections);

		} catch (error) {
			console.error('Failed to fetch election', error);
			toast({
				title: "An error occurred.",
				description: "Unable to fetch election data.",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	};

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
					Voter Dashboard
				</Heading>
				<SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
					<Stat
						p={5}
						shadow="md"
						border="1px solid"
						borderColor={useColorModeValue('gray.200', 'gray.700')}
						borderRadius="md"
					>
						<StatLabel fontSize="lg" fontWeight="semibold">
							Upcoming Elections
						</StatLabel>
						<StatNumber fontSize="3xl">{elections}</StatNumber>
					</Stat>
				</SimpleGrid>
			</Box>
		</Flex>
	);
};

export default VoterHome;