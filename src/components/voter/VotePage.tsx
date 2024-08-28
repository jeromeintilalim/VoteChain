// src/pages/VotePage.tsx
import { Box, Button, useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ElectionRadioGroup from './components/ElectionRadioGroup';
import ReviewModal from './components/ReviewModal';

interface Candidate {
	id: number;
	name: string;
	partyList: string;
	details: string;
	imageUrl: string;
}

interface Position {
	id: number;
	title: string;
	candidates: Candidate[];
	multiple?: boolean;
	maxSelections?: number;
}

interface Election {
	id: number;
	name: string;
	positions: Position[];
}

const VotePage = () => {
	const { electionId } = useParams<{ electionId: string }>();
	const [election, setElection] = useState<Election | null>(null);
	const [selectedCandidates, setSelectedCandidates] = useState<{ [key: number]: string[] }>({});
	const containerRef = useRef<HTMLDivElement>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchElection = async () => {
			const token = localStorage.getItem('token');
			if (!token) {
				console.error('No token found. Redirecting to login.');
				navigate('/login');
				return;
			}

			try {
				const response = await fetch(`http://localhost:7122/api/election/${electionId}`, {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.ok) {
					const data: Election = await response.json();
					console.log('Fetched Election Data:', data);

					// Ensure all positions have an ID and set the first position to be multiple selection
					const positionsWithId = data.positions.map((position, index) => {
						// Setting the first position to allow multiple selections
						if (index === 0) {
							return {
								...position,
								id: position.id ?? index + 1,
								multiple: true,  // Enable multiple selections for the first position
								maxSelections: position.maxSelections ?? 2,  // Set a max number of selections if needed
								candidates: position.candidates.map((candidate, candidateIndex) => ({
									...candidate,
									id: candidate.id ?? candidateIndex + 1,
								})),
							};
						}

						return {
							...position,
							id: position.id ?? index + 1,
							candidates: position.candidates.map((candidate, candidateIndex) => ({
								...candidate,
								id: candidate.id ?? candidateIndex + 1,
							})),
						};
					});

					setElection({ ...data, positions: positionsWithId });
				} else if (response.status === 401) {
					toast({
						title: "Unauthorized.",
						description: "Your session has expired. Please log in again.",
						status: "error",
						duration: 3000,
						isClosable: true,
					});
					navigate('/login');
				} else if (response.status === 404) {
					toast({
						title: "Election not found.",
						status: "error",
						duration: 3000,
						isClosable: true,
					});
				} else {
					toast({
						title: "Failed to fetch election data.",
						status: "error",
						duration: 3000,
						isClosable: true,
					});
				}
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

		fetchElection();
	}, [electionId, toast, navigate]);


	const handleCandidateChange = (positionId: number, selected: string[]) => {
		setSelectedCandidates((prev) => ({ ...prev, [positionId]: selected }));
	};

	const handleVote = () => {
		if (!election) return;

		for (const position of election.positions) {
			if (position.multiple && selectedCandidates[position.id]?.length > (position.maxSelections || Infinity)) {
				toast({
					title: `You can only select up to ${position.maxSelections} candidates for ${position.title}.`,
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
				document.querySelector(`[data-position-id="${position.id}"]`)?.scrollIntoView({ behavior: 'smooth' });
				return;
			}
		}

		console.log('Submitting vote with selections:', selectedCandidates);
		// Implement vote submission logic
	};

	return (
		<Box
			ref={containerRef}
			width="100%"
			height="100vh"
			overflowX="hidden"
			overflowY="auto"
			flexDirection="column"
			margin="auto"
			sx={{
				"& > *": {
					flex: "0 0 100%",
					scrollSnapAlign: "start",
				},
				scrollSnapType: "y mandatory",
				scrollBehavior: "smooth",
				scrollbarWidth: "none",
				"::-webkit-scrollbar": {
					display: "none",
				},
			}}
		>
			{election?.positions.map((position) => (
				<ElectionRadioGroup
					key={position.id}
					position={position}
					onCandidateChange={(selected: string[]) => handleCandidateChange(position.id, selected)}
					selectedCandidates={selectedCandidates[position.id] || []}
				/>
			))}
			<Box p={5}>
				<Button mt={4} colorScheme="blue" onClick={handleVote}>
					Submit Ballot
				</Button>
				<Button mt={4} ml={4} colorScheme="teal" onClick={onOpen}>
					Review Ballot
				</Button>
			</Box>
			<ReviewModal isOpen={isOpen} onClose={onClose} selectedCandidates={selectedCandidates} positions={election?.positions || []} />
		</Box>
	);
};

export default VotePage;