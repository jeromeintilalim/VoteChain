import {
	Box,
	Button,
	Image,
	List,
	ListItem,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useToast,
	Text,
} from '@chakra-ui/react';
import React from 'react';

interface Candidate {
	candidateId: number;
	name: string;
	partyList: string;
	details: string;
	imageUrl: string;
}

interface Position {
	positionId: number;
	title: string;
	candidates: Candidate[];
	multiple?: boolean;
	maxSelections?: number;
}

interface ReviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedCandidates: { [key: number]: string[] };
	positions: Position[];
	handleVote: () => Promise<void>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, selectedCandidates, positions, handleVote }) => {
	const toast = useToast();

	// Check if the selected candidates exceed max selections for any position
	const hasExceededSelections = positions.some((position) => {
		const selectedCount = selectedCandidates[position.positionId]?.length || 0;
		return position.maxSelections && selectedCount > position.maxSelections;
	});

	const handleConfirm = async () => {
		// Validate the selections before submitting
		if (hasExceededSelections) {
			toast({
				title: "Selection Error",
				description: "You have selected too many candidates for one or more positions.",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		try {
			await handleVote();
			toast({
				title: "Ballot submitted successfully.",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			onClose();
		} catch (error: any) {
			toast({
				title: "Submission Failed",
				description: error.message,
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Review Your Ballot</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<List spacing={3}>
						{positions.map((position) => (
							<Box key={`position-${position.positionId}`} mb={4}>
								<ListItem fontWeight="bold">{position.title}</ListItem>
								<List ml={4}>
									{position.candidates.length > 0 ? (
										selectedCandidates[position.positionId]?.length > 0 ? (
											selectedCandidates[position.positionId]?.map((candidateId) => {
												const candidate = position.candidates.find(c => c.candidateId === Number(candidateId));
												if (!candidate) {
													console.error(`Candidate with ID ${candidateId} not found in position ${position.positionId}`);
													return null;
												}
												return (
													<ListItem key={`candidate-${position.positionId}-${candidateId}`} display="flex" alignItems="center" my={1}>
														<Image
															src={`http://localhost:7122/${candidate.imageUrl}`}
															alt={candidate.name}
															boxSize="40px"
															borderRadius="full"
															mr={2}
														/>
														<Box>
															<Text><Text as="span" fontWeight="bold">{candidate.name}</Text> - {candidate.details}</Text>
														</Box>
													</ListItem>
												);
											})
										) : (
											<Text color="red.500">No candidates selected.</Text>
										)
									) : (
										<Text>No candidates available.</Text>
									)}
								</List>
								{/* Display validation message if too many candidates are selected */}
								{position.maxSelections && (selectedCandidates[position.positionId]?.length || 0) > position.maxSelections && (
									<Text color="red.500">
										You have selected too many candidates. Max allowed: {position.maxSelections}.
									</Text>
								)}
							</Box>
						))}
					</List>
				</ModalBody>
				<ModalFooter>
					<Button onClick={onClose} mr={3}>Cancel</Button>
					<Button colorScheme="blue" onClick={handleConfirm} isDisabled={hasExceededSelections}>
						Submit Ballot
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default ReviewModal;
