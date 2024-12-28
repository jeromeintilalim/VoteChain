import {
	Box,
	Button,
	Card,
	CardBody,
	CardFooter,
	Flex,
	Heading,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	Text,
	VStack,
	useDisclosure,
	useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion'; // Import framer-motion
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Election interface
interface Election {
	electionId: number;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	joinCode: string;
	hasVoted: boolean;
	isEnrolled: boolean;
}

const ElectionsPage: React.FC = () => {
	const [enrolledElections, setEnrolledElections] = useState<Election[]>([]);
	const [selectedElection, setSelectedElection] = useState<Election | null>(null);
	const [electionToUnenroll, setElectionToUnenroll] = useState<Election | null>(null);
	const [joinCode, setJoinCode] = useState('');
	const [loading, setLoading] = useState(true);

	const toast = useToast();
	const navigate = useNavigate();

	const { isOpen: isUnenrollModalOpen, onOpen: onUnenrollModalOpen, onClose: onUnenrollModalClose } = useDisclosure();

	const joinModal = useDisclosure();
	const detailsModal = useDisclosure();

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			// Redirect to login immediately if token is not found
			console.error('No token found. Redirecting to login.');
			navigate('/login');
			return;
		}

		fetchEnrolledElections();
	}, [navigate]);


	// Fetch enrolled elections for the user
	const fetchEnrolledElections = async () => {
		const token = localStorage.getItem('token');
		if (!token) {
			console.error('No token found. Redirecting to login.');
			navigate('/login');
			return;
		}

		try {
			const response = await fetch(`http://localhost:7122/api/election/enrolled`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setEnrolledElections(data);
			} else if (response.status === 401) {
				console.error('Unauthorized, redirecting to login.');
				navigate('/login'); // Handle expired or invalid tokens
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
		} finally {
			setLoading(false);
		}

	};

	const getElectionStatus = (startDate: string, endDate: string): string => {
		const now = new Date();
		const start = new Date(startDate);
		const end = new Date(endDate);

		if (now < start) {
			return `Upcoming (Starts in ${getTimeRemaining(start)})`;
		} else if (now >= start && now <= end) {
			return 'Ongoing';
		} else {
			return 'Closed';
		}
	};

	const getTimeRemaining = (startDate: Date): string => {
		const now = new Date();
		const diffMs = startDate.getTime() - now.getTime();

		if (diffMs <= 0) return '';

		const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

		let result = '';
		if (days > 0) result += `${days}d `;
		if (hours > 0) result += `${hours}h `;
		if (minutes > 0) result += `${minutes}m`;

		return result.trim();
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
				joinModal.onClose(); // Close the modal
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

	const handleUnenroll = async (electionId: number) => {
		try {
			const response = await fetch(`http://localhost:7122/api/election/unenroll/${electionId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				toast({
					title: 'Successfully unenrolled from the election.',
					status: 'success',
					duration: 3000,
					isClosable: true,
				});

				fetchEnrolledElections(); // Refresh the list of enrolled elections
			} else {
				toast({
					title: 'Failed to unenroll from the election.',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error: any) {
			toast({
				title: 'Error occurred while unenrolling.',
				description: error.toString(),
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const handleOpenUnenrollModal = (election: Election) => {
		setElectionToUnenroll(election);
		onUnenrollModalOpen();
	};

	const confirmUnenroll = async () => {
		if (!electionToUnenroll) return;

		await handleUnenroll(electionToUnenroll.electionId);
		onUnenrollModalClose();
	};

	const openElectionDetails = (election: Election) => {
		setSelectedElection(election);
		detailsModal.onOpen();
	};

	if (loading) {
		return (
			<VStack color="#8C56FF" justifyContent="center" alignItems="center" height="100vh">
				<Spinner color="#8C56FF" />
				<Text color="black">Loading...</Text>
			</VStack>
		)
	}

	return (
		<Box p={6}
			as={motion.div}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			animation={{ duration: 0.5 }}>
			<Flex justifyContent="space-between" alignItems="center" mb={6}>
				<Heading as="h1">Your Elections</Heading>
				{/* Button to open the Join Election Modal */}
				<Button backgroundColor="#8c56ff" color="white" _hover={{ backgroundColor: "#6937FF" }} onClick={joinModal.onOpen}>
					Join Election
				</Button>
			</Flex>

			{/* Modal for Join Election Form */}
			<Modal isOpen={joinModal.isOpen} onClose={joinModal.onClose}>
				<ModalOverlay />
				<ModalContent width={{ base: "90%", md: "100%" }}>
					<ModalHeader>Join Election</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4} align="stretch">
							<Input
								placeholder="Enter Election Code"
								value={joinCode}
								onChange={(e) => setJoinCode(e.target.value)}
								required
								isRequired
							/>
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" onClick={joinModal.onClose}>
							Cancel
						</Button>
						<Button colorScheme="blue" ml={3} onClick={handleJoinElection}>
							Join Election
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Unenroll Confirmation Modal */}
			<Modal isOpen={isUnenrollModalOpen} onClose={onUnenrollModalClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Confirm Unenrollment</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						Are you sure you want to unenroll from <strong>{electionToUnenroll?.title}</strong>?
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" onClick={onUnenrollModalClose}>Cancel</Button>
						<Button colorScheme="red" ml={3} onClick={confirmUnenroll}>Unenroll</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
			<Flex flexWrap="wrap" gap={4}>
				{enrolledElections.length > 0 ? (
					enrolledElections.map((election) => {
						const electionStatus = getElectionStatus(election.startDate, election.endDate);
						const timeRemaining = getTimeRemaining(new Date(election.startDate));

						return (
							<Card
								shadow="lg"
								key={election.electionId}
								// width="310px"
								width={{ base: "100%", md: "310px" }}
								bg="gray.100"
								cursor="pointer"
								onClick={() => openElectionDetails(election)}>
								<CardBody>
									<Heading size="md" mb={2}>{election.title}</Heading>
									<Text mb={2}>{election.description}</Text>
									<Text fontSize="sm" color="gray.600">
										Start: {new Date(election.startDate).toLocaleDateString()}<br />
										End: {new Date(election.endDate).toLocaleDateString()}
									</Text>

									{/* Display time remaining only if the election is upcoming */}
									{electionStatus === 'Upcoming' && (
										<Text>Election starts in {timeRemaining}</Text>
									)}

									<Text
										fontWeight="bold"
										mt={3}
										color={
											electionStatus === 'Closed' ? 'red.500' :
												electionStatus === 'Ongoing' ? 'green.500' :
													'orange.500'
										}
									>
										<span style={{ color: "black" }}>Status:</span> {electionStatus}
									</Text>

									{election.hasVoted && (
										<Text fontWeight="bold" color="green.500" mt={2}>
											✅ You have already voted
										</Text>
									)}
								</CardBody>

								<CardFooter display="flex" flexDirection="column" alignItems="center" gap={2}>
									{/* Row with "Vote Now" and "Unenroll" buttons */}
									<Box display="flex" justifyContent="space-around" width="100%">
										<Button
											colorScheme="blue"
											onClick={() => navigate(`/vote/${election.joinCode}`)}
											isDisabled={election.hasVoted || electionStatus !== 'Ongoing'}
										>
											{election.hasVoted ? 'Already Voted' : electionStatus === 'Closed' ? 'Election Closed' : "Vote Now"}
										</Button>
										<Button colorScheme="red" onClick={() => handleOpenUnenrollModal(election)}>
											Unenroll
										</Button>
									</Box>

									{/* "View Results" button */}
									{election.hasVoted ? (
										<Button
											w="100%"
											colorScheme="green"
											onClick={() => navigate(`/results/${election.joinCode}`)}
										>
											View Results
										</Button>
									)
										: electionStatus === 'Closed' ?
											(
												<Button
													w="100%"
													colorScheme="green"
													onClick={() => navigate(`/results/${election.joinCode}`)}
												>
													View Results
												</Button>
											) : null
									}

								</CardFooter>

							</Card>
						);
					})
				) : (
					<Text>No elections enrolled yet. Join using a code!</Text>
				)}
			</Flex>

			{/* Election Details Modal */}
			{selectedElection && (
				<Modal isOpen={detailsModal.isOpen} onClose={detailsModal.onClose} size="xl">
					<ModalOverlay />
					<ModalContent width={{ base: "90%", md: "100%" }}>
						<ModalHeader>{selectedElection?.title || "Loading..."}</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							{selectedElection ? (
								<>
									<Text fontWeight="bold" mb={2}>
										Description:
									</Text>
									<Text mb={4}>{selectedElection.description}</Text>
									<Text>
										<strong>Start:</strong> <i>{new Date(selectedElection.startDate).toLocaleDateString()}</i>
									</Text>
									<Text>
										<strong>End:</strong> <i>{new Date(selectedElection.endDate).toLocaleDateString()}</i>
									</Text>
									<Text
										fontWeight="bold"
										my={3}
										color={
											getElectionStatus(selectedElection.startDate, selectedElection.endDate) === 'Closed' ? 'red.500' :
												getElectionStatus(selectedElection.startDate, selectedElection.endDate) === 'Ongoing' ? 'green.500' :
													'orange.500'
										}
									>
										<span style={{ color: "black" }}>Status:</span> {getElectionStatus(selectedElection.startDate, selectedElection.endDate)}
									</Text>
									{selectedElection.hasVoted && (
										<Box py="4">
											<hr />
											<Text fontWeight="bold" color="green.500" mt={2} textAlign="center">
												✅ You have already voted in this election
											</Text>
										</Box>
									)}
								</>
							) : (
								<VStack justifyContent="center" alignItems="center" height="200px">
									<Spinner />
									<Text>Loading details...</Text>
								</VStack>
							)}
						</ModalBody>
					</ModalContent>
				</Modal>
			)}
		</Box>
	);
};

export default ElectionsPage;
