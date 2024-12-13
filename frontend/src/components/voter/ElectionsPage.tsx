import {
	Box,
	Button,
	Card,
	CardBody,
	CardFooter,
	Flex,
	Heading,
	HStack,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	PinInput,
	PinInputField,
	Text,
	useDisclosure,
	useToast,
	VStack,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Election interface
interface Election {
	electionId: number;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	joinCode: string;
}

const ElectionsPage: React.FC = () => {
	const [enrolledElections, setEnrolledElections] = useState<Election[]>([]);
	const [joinCode, setJoinCode] = useState('');
	const toast = useToast();
	const navigate = useNavigate();
	const { isOpen, onOpen, onClose } = useDisclosure();

	useEffect(() => {
		fetchEnrolledElections();
	}, []);

	// Fetch enrolled elections for the user
	const fetchEnrolledElections = async () => {
		try {
			const response = await fetch(`http://localhost:7122/api/election/enrolled`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setEnrolledElections(data);
			} else {
				throw new Error('Failed to fetch enrolled elections.');
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Could not fetch enrolled elections.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	// Join an election via JoinCode
	const handleJoinElection = async () => {
		if (!joinCode.trim()) {
			toast({
				title: 'Validation Error',
				description: 'Join code cannot be empty.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		try {
			const response = await fetch(`http://localhost:7122/api/election/join`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify({ joinCode }), // Send JoinCode in the request body
			});

			if (response.ok) {
				toast({
					title: 'Success',
					description: 'You have successfully joined the election.',
					status: 'success',
					duration: 3000,
					isClosable: true,
				});

				// Clear the input and close modal
				setJoinCode('');
				fetchEnrolledElections(); // Refresh enrolled elections
				onClose(); // Close the modal
			} else {
				const errorData = await response.json();
				toast({
					title: 'Error',
					description: errorData.message || 'Failed to join the election.',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'An error occurred while joining the election.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	return (
		<Box p={6}>
			<Flex justifyContent="space-between" alignItems="center" mb={6}>
				<Heading as="h1">Your Elections</Heading>
				{/* Button to open the Join Election Modal */}
				<Button colorScheme="blue" onClick={onOpen}>
					Join Election
				</Button>
			</Flex>

			{/* Modal for Join Election Form */}
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Join Election</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4} align="stretch">
							<Input
								placeholder="Enter Election Code"
								value={joinCode}
								onChange={(e) => setJoinCode(e.target.value)}
								isInvalid={!joinCode.trim()} // Add validation
							/>
						</VStack>
						<Text mt={4} textAlign="center">Enter the 6-digit PIN code to join the election.</Text>
						<HStack justifyContent="center" mt={4} spacing={2}>
							<PinInput type='alphanumeric'>
								<PinInputField />
								<PinInputField />
								<PinInputField />
								<PinInputField />
								<PinInputField />
								<PinInputField />
							</PinInput>
						</HStack>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" onClick={onClose}>
							Cancel
						</Button>
						<Button colorScheme="blue" ml={3} onClick={handleJoinElection}>
							Join Election
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Enrolled Elections */}
			<Flex flexWrap="wrap" gap={4}>
				{enrolledElections.length > 0 ? (
					enrolledElections.map((election) => (
						<Card key={election.electionId} width="300px" bg="gray.100">
							<CardBody>
								<Heading size="md">{election.title}</Heading>
								<Text>{election.description}</Text>
								<Text>Start: {new Date(election.startDate).toLocaleDateString()}</Text>
								<Text>End: {new Date(election.endDate).toLocaleDateString()}</Text>
							</CardBody>
							<CardFooter>
								<Button
									colorScheme="blue"
									onClick={() => navigate(`/vote/${election.joinCode}`)}  // Redirect to vote page with the electionId
								>
									Vote Now
								</Button>
							</CardFooter>
						</Card>
					))
				) : (
					<Text>No elections enrolled yet. Join using a code!</Text>
				)}
			</Flex>
		</Box>
	);
};

export default ElectionsPage;
