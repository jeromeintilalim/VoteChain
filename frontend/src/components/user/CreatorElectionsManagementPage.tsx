import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Box,
	Button,
	Flex,
	Heading,
	Skeleton,
	Table,
	TableCaption,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tooltip,
	Tr,
	VStack,
	useColorModeValue,
	useDisclosure,
	useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import CreateElectionModal from './components/CreateElectionModal';

interface Election {
	electionId: number;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	positions?: string[];
	joinCode: string;
}

const CreatorElectionsManagementPage = () => {
	const [elections, setElections] = useState<Election[]>([]);
	const [isModalOpen, setModalOpen] = useState(false);
	const [walletAddress, setWalletAddress] = useState<string>('');
	const [selectedElection, setSelectedElection] = useState<Election | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const cancelRef = React.useRef<HTMLButtonElement>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');

		if (token) {
			const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
			const currentTime = Math.floor(Date.now() / 1000);

			if (decodedToken.exp && decodedToken.exp < currentTime) {
				console.error('Token expired. Redirecting to login.');
				navigate('/login');
			} else {
				fetchMyElections();
				initWeb3();
			}
		} else {
			console.error('No token found. Redirecting to login.');
			navigate('/login');
		}
	}, [navigate]);

	const initWeb3 = async () => {
		if ((window as any).ethereum) {
			const web3 = new Web3((window as any).ethereum);
			const accounts = await web3.eth.getAccounts();
			if (accounts.length > 0) {
				setWalletAddress(accounts[0]);
			}
		}
	};

	const fetchMyElections = async () => {
		setLoading(true);
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		try {
			const response = await fetch('http://localhost:7122/api/election/userElections', {
				method: 'GET',
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				const data = await response.json();
				setElections(data);
			} else {
				console.error('Failed to fetch elections.');
			}
		} catch (error) {
			console.error('Error fetching elections:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleEditElection = (election: Election) => {
		setSelectedElection(election);
		setModalOpen(true);
	};

	const handleDeleteElection = (election: Election) => {
		setSelectedElection(election);
		onOpen();
	};

	const confirmDeleteElection = async () => {
		if (!selectedElection) return;

		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		try {
			const response = await fetch(`http://localhost:7122/api/election/delete/${selectedElection.electionId}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				toast({ title: 'Election deleted successfully.', status: 'success', duration: 3000 });
				fetchMyElections();
				onClose();
			} else {
				toast({ title: 'Failed to delete election.', status: 'error', duration: 3000 });
			}
		} catch (error) {
			toast({ title: 'Error deleting election.', status: 'error', duration: 3000 });
		}
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setSelectedElection(null);
		fetchMyElections();
	};

	return (
		<Box
			p={{ base: 4, md: 8 }}
			as={motion.div}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
		>
			<Flex
				justifyContent="space-between"
				alignItems="center"
				flexDirection={{ base: 'column', md: 'row' }} // Stack elements on smaller screens
				mb={6}
				gap={4} // Add spacing between elements in a column layout
			>
				<Heading as="h1" size={{ base: 'lg', md: 'xl' }}>
					Manage Elections
				</Heading>
				{elections.length > 0 ? (
					<Button
						color="white"
						bgColor="#8c56ff"
						onClick={() => setModalOpen(true)}
						_hover={{ bgColor: '#6937FF' }}
					>
						Create Election
					</Button>
				) : (
					null
				)}
			</Flex>
			<Box
				p={5}
				shadow="md"
				border="1px solid"
				borderColor={useColorModeValue('gray.200', 'gray.700')}
				borderRadius="md"
				overflowX="auto" // Make the table scrollable horizontally
			>
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th w="15%">Title</Th>
							<Th w="15%">Start Date</Th>
							<Th w="15%">End Date</Th>
							<Th w="40%">Description</Th>
							<Th w="15%" textAlign="center">Actions</Th>
						</Tr>
					</Thead>
					{loading ? (
						<Tbody>
							{Array(3)
								.fill('')
								.map((_, index) => (
									<Tr key={index}>
										<Td><Skeleton height="20px" /></Td>
										<Td><Skeleton height="20px" /></Td>
										<Td><Skeleton height="20px" /></Td>
										<Td><Skeleton height="20px" width="80px" /></Td>
									</Tr>
								))}
						</Tbody>
					) : elections.length > 0 ? (
						<Tbody>
							{elections.map((election) => (
								<Tr
									key={election.electionId}
									onClick={() => navigate(`/elections/${election.joinCode}`)}
									_hover={{ cursor: 'pointer', bg: 'gray.100' }}
								>
									<Td>{election.title}</Td>
									<Td>{new Date(election.startDate).toLocaleDateString()}</Td>
									<Td>{new Date(election.endDate).toLocaleDateString()}</Td>
									{election.description ?
										<Td>{election.description}</Td>
										:
										<Td fontStyle="italic">{election.description || "No election details."}</Td>
									}
									<Td textAlign="center">
										<Flex justifyContent="center" gap={2} wrap="wrap">
											<Button
												colorScheme="blue"
												mr={3}
												onClick={(e) => {
													e.stopPropagation();
													handleEditElection(election);
												}}
											>
												Edit
											</Button>
											<Button
												colorScheme="red"
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteElection(election);
												}}
											>
												Delete
											</Button>
										</Flex>
									</Td>
								</Tr>
							))}
						</Tbody>
					) : (
						<Tbody>
							<Tr>
								<Td colSpan={5} textAlign="center">
									<VStack>
										<Text>No Elections yet.</Text>
										<Button
											color="white"
											bgColor="#8c56ff"
											onClick={() => setModalOpen(true)}
											_hover={{ bgColor: '#6937FF' }}>
											Create Election
										</Button>
									</VStack>
								</Td>
							</Tr>
						</Tbody>
					)}
					<TableCaption>Click on an election to manage positions.</TableCaption>
				</Table>
			</Box>
			<CreateElectionModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onCreateSuccess={handleModalClose}
				creatorWalletAddress={walletAddress}
				election={selectedElection}
			/>

			<AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Delete Election
						</AlertDialogHeader>
						<AlertDialogBody>
							Are you sure you want to delete the election "{selectedElection?.title}"? This action cannot be undone.
						</AlertDialogBody>
						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onClose}>
								Cancel
							</Button>
							<Button colorScheme="red" onClick={confirmDeleteElection} ml={3}>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Box>
	);
};

export default CreatorElectionsManagementPage;
