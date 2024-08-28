// src/components/ReviewModal.tsx
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
	Text
} from '@chakra-ui/react';
import React from 'react';

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

interface ReviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedCandidates: { [key: number]: string[] };
	positions: Position[];
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, selectedCandidates, positions }) => {
	const toast = useToast();

	const handleConfirm = () => {
		toast({
			title: "Ballot submitted successfully.",
			status: "success",
			duration: 3000,
			isClosable: true,
		});
		onClose();
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
							<Box key={`position-${position.id}`} mb={4}>
								<ListItem fontWeight="bold">{position.title}</ListItem>
								<List ml={4}>
									{position.candidates.length > 0 ? (
										selectedCandidates[position.id]?.map((candidateId) => {
											const candidate = position.candidates.find(c => c.id === Number(candidateId));
											if (!candidate) {
												console.error(`Candidate with ID ${candidateId} not found in position ${position.id}`);
												return null;  // Skip if candidate is not found
											}
											return (
												<ListItem key={`candidate-${position.id}-${candidateId}`} display="flex" alignItems="center" my={1}>
													<Image src="https://placehold.co/400" alt={candidate.name} boxSize="40px" borderRadius="full" mr={2} />
													<Box>
														<Text><Text as="span" fontWeight="bold">{candidate.name}</Text> - {candidate.details}</Text>
														<Text></Text>
													</Box>
												</ListItem>
											);
										})
									) : (
										<Text>No candidates available.</Text>
									)}
								</List>
							</Box>
						))}

					</List>
				</ModalBody>
				<ModalFooter>
					<Button onClick={onClose} mr={3}>Cancel</Button>
					<Button colorScheme="blue" onClick={handleConfirm}>Submit Ballot</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default ReviewModal;
