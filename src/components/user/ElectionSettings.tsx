import {
	AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
	AlertDialogOverlay, Box, Button, Checkbox, Flex, FormControl, FormLabel, Heading,
	Image,
	Input,
	Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
	ModalOverlay, Table, Tbody, Td, Th, Thead, Tr, useDisclosure, useToast
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Candidate {
	candidateId: number;
	positionId: number;
	name: string;
	details: string;
	imageUrl: string | File;
}

interface Position {
	positionId: number;
	electionId: number;
	title: string;
	description: string;
	candidates: Candidate[];
	expanded?: boolean;
	maxSelection: number;  // Ensure this is handled in the backend
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const ElectionSettingsPage: React.FC = () => {
	const { electionId } = useParams<{ electionId: string }>();
	const [positions, setPositions] = useState<Position[]>([]);
	const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
	const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [removeImage, setRemoveImage] = useState(false);

	const addPositionModal = useDisclosure();
	const editPositionModal = useDisclosure();
	const addCandidateModal = useDisclosure();
	const editCandidateModal = useDisclosure();
	const deletePositionModal = useDisclosure();
	const deleteCandidateModal = useDisclosure();

	const cancelRef = useRef<HTMLButtonElement>(null);
	const toast = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			console.error('No token found. Redirecting to login.');
			navigate('/login');
			return;
		}

		if (electionId) {
			fetchElectionDetails(electionId);
		}
		fetchPositions();
	}, [electionId]);

	const fetchPositions = async () => {
		try {
			const response = await fetch(`http://localhost:7122/api/position/${electionId}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setPositions(data);
			} else {
				toast({
					title: 'Failed to fetch positions',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error('Failed to fetch positions', error);
			toast({
				title: 'Error',
				description: 'An error occurred while fetching positions.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const fetchElectionDetails = async (id: string) => {
		try {
			const response = await fetch(`http://localhost:7122/api/position/${id}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				const positions = await response.json();
				setPositions(positions);
			} else {
				toast({
					title: 'Failed to fetch election details',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error('Failed to fetch election details', error);
			toast({
				title: 'Error',
				description: 'An error occurred while fetching election details.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const validatePosition = () => {
		if (!selectedPosition?.title) {
			toast({
				title: 'Validation Error',
				description: 'Title is required.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return false;
		}

		if (!selectedPosition?.maxSelection || selectedPosition.maxSelection <= 0) {
			toast({
				title: 'Validation Error',
				description: 'Max Selection must be greater than 0.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return false;
		}

		return true;
	};

	const handleDeletePosition = async (positionId: number) => {
		try {
			const response = await fetch(`http://localhost:7122/api/position/delete/${positionId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				toast({ title: 'Position deleted successfully.', status: 'success', duration: 3000, isClosable: true });
				fetchElectionDetails(electionId!);
			} else {
				toast({
					title: 'Failed to delete position',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error('Error deleting position:', error);
			toast({
				title: 'Error',
				description: 'An error occurred while deleting the position.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];

			if (file.size > MAX_FILE_SIZE) {
				toast({
					title: 'File too large',
					description: `The file size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
				return;
			}

			setImageFile(file);
			setSelectedCandidate(prev => prev ? { ...prev, imageUrl: file } : null);
			setRemoveImage(false);
		} else {
			setImageFile(null);
		}
	};

	const handleAddCandidate = async () => {
		if (!selectedCandidate || !selectedPosition || !selectedCandidate.name.trim()) {
			toast({
				title: 'Validation Error',
				description: 'Candidate name is required.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		try {
			const formData = new FormData();
			formData.append('PositionId', selectedPosition.positionId.toString());
			formData.append('name', selectedCandidate.name);
			formData.append('details', selectedCandidate.details);

			if (imageFile) {
				formData.append('image', imageFile);
			}

			const response = await fetch(`http://localhost:7122/api/candidate/add`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: formData,
			});

			if (response.ok) {
				toast({
					title: 'Candidate added successfully.',
					status: 'success',
					duration: 3000,
					isClosable: true,
				});
				fetchElectionDetails(electionId!);
				addCandidateModal.onClose();
			} else {
				const errorData = await response.json();
				toast({
					title: 'Failed to add candidate',
					description: errorData.message,
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error('Error adding candidate:', error);
			toast({
				title: 'Error',
				description: 'An error occurred while adding the candidate.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const handleUpdateCandidate = async () => {
		if (!selectedCandidate || !selectedCandidate.name.trim()) {
			toast({
				title: 'Validation Error',
				description: 'Candidate name is required.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		try {
			const formData = new FormData();

			formData.append('CandidateId', selectedCandidate.candidateId.toString());
			formData.append('PositionId', selectedCandidate.positionId.toString());
			formData.append('Name', selectedCandidate.name);
			formData.append('Details', selectedCandidate.details);

			if (imageFile) {
				formData.append('image', imageFile);
			}

			formData.append('removeImage', removeImage.toString());

			const response = await fetch(`http://localhost:7122/api/candidate/update`, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: formData,
			});

			const data = await response.json();

			if (response.ok) {
				toast({
					title: data.message,
					status: 'success',
					duration: 3000,
					isClosable: true,
				});
				fetchElectionDetails(electionId!);
				editCandidateModal.onClose();
			} else {
				console.error(`Error: ${data.message}`);
				toast({
					title: 'Failed to update candidate',
					description: data.message,
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error('Error updating candidate:', error);
			toast({
				title: 'Error',
				description: 'An error occurred while updating the candidate.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setImageFile(null); // Clear the image file after update
		}
	};

	const openAddCandidateModal = (position: Position) => {
		setSelectedPosition(position);
		setSelectedCandidate({ candidateId: 0, positionId: position.positionId, name: '', details: '', imageUrl: '' });
		setImageFile(null); // Clear the previous image file when opening the modal
		addCandidateModal.onOpen();
	};

	const openEditCandidateModal = (candidate: Candidate) => {
		setSelectedCandidate(candidate);
		setImageFile(null); // Clear the previous image file when opening the modal

		// Set removeImage to false initially
		setRemoveImage(false);

		editCandidateModal.onOpen();
	};

	const handleRemoveImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRemoveImage(e.target.checked);

		// Clear the image file when removeImage is checked
		if (e.target.checked) {
			setImageFile(null);
		}
	};

	const handleAddPosition = async () => {
		if (!validatePosition()) return;

		const newPosition: Position = {
			...selectedPosition!,
			electionId: Number(electionId),
		};

		try {
			const response = await fetch(`http://localhost:7122/api/position/add`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify(newPosition),
			});

			if (response.ok) {
				toast({ title: 'Position added successfully.', status: 'success', duration: 3000, isClosable: true });
				fetchElectionDetails(electionId!);
				addPositionModal.onClose();
			} else {
				const errorData = await response.json();
				toast({
					title: 'Failed to add position',
					description: errorData.message,
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error('Error adding position:', error);
			toast({
				title: 'Error',
				description: 'An error occurred while adding the position.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const confirmDeleteCandidate = async () => {
		setIsDeleting(true);
		await handleDeleteCandidate(selectedCandidate?.candidateId!);
		deleteCandidateModal.onClose();
		setIsDeleting(false);
	};

	const handleDeleteCandidate = async (candidateId: number) => {
		try {
			const response = await fetch(`http://localhost:7122/api/candidate/delete/${candidateId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				toast({ title: 'Candidate deleted successfully.', status: 'success', duration: 3000, isClosable: true });
				fetchElectionDetails(electionId!);
			} else {
				console.error('Failed to delete candidate');
			}
		} catch (error) {
			console.error('Error deleting candidate:', error);
		}
	};

	const handleUpdatePosition = async () => {
		if (!validatePosition()) return;

		try {
			const response = await fetch(`http://localhost:7122/api/position/update`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify(selectedPosition),
			});

			if (response.ok) {
				toast({ title: 'Position updated successfully.', status: 'success', duration: 3000, isClosable: true });
				fetchElectionDetails(electionId!);
				editPositionModal.onClose();
			} else {
				toast({
					title: 'Failed to update position',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error('Error updating position:', error);
			toast({
				title: 'Error',
				description: 'An error occurred while updating the position.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const openAddPositionModal = () => {
		setSelectedPosition({
			positionId: 0,
			electionId: Number(electionId),
			title: '',
			description: '',
			candidates: [],
			expanded: false,
			maxSelection: 1,  // Set a default value for MaxSelection
		});
		addPositionModal.onOpen();
	};

	const openEditPositionModal = (position: Position) => {
		setSelectedPosition({ ...position });
		editPositionModal.onOpen();
	};

	const handleMaxSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedPosition(prev => prev ? { ...prev, maxSelection: parseInt(e.target.value) } : null);
	};

	const openDeletePositionModal = (position: Position) => {
		setSelectedPosition(position);
		deletePositionModal.onOpen();
	};

	const confirmDeletePosition = async () => {
		setIsDeleting(true);
		await handleDeletePosition(selectedPosition?.positionId!);
		deletePositionModal.onClose();
		setIsDeleting(false);
	};

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedPosition(prev => prev ? { ...prev, title: e.target.value } : null);
	};

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedPosition(prev => prev ? { ...prev, description: e.target.value } : null);
	};

	const togglePositionExpansion = (positionId: number) => {
		setPositions(prevPositions =>
			prevPositions.map(position =>
				position.positionId === positionId ? { ...position, expanded: !position.expanded } : position
			)
		);
	};

	return (
		<Box p={8}>
			<Flex justifyContent="space-between" mb={6}>
				<Heading as="h1">Election Settings</Heading>
				<Button colorScheme="blue" onClick={openAddPositionModal}>
					Add Position
				</Button>
			</Flex>

			<Table shadow="lg" borderRadius="10px">
				<Thead>
					<Tr>
						<Th>Title</Th>
						<Th>Description</Th>
						<Th>Max Selections Allowed</Th>
						<Th textAlign="center">Actions</Th>
					</Tr>
				</Thead>
				<Tbody>
					{positions.map((position) => (
						<React.Fragment key={position.positionId}>
							<Tr onClick={() => togglePositionExpansion(position.positionId)} cursor="pointer">
								<Td>{position.title}</Td>
								<Td>{position.description ? position.description : "No description added."}</Td>
								<Td>{position.maxSelection}</Td>
								<Td display="flex" justifyContent="center">
									<Button
										colorScheme="blue"
										mr={3}
										onClick={(e) => {
											e.stopPropagation();
											openEditPositionModal(position);
										}}
									>
										Edit
									</Button>
									<Button
										colorScheme="red"
										onClick={(e) => {
											e.stopPropagation();
											openDeletePositionModal(position);
										}}
									>
										Delete
									</Button>
								</Td>
							</Tr>

							{position.expanded && (
								<Tr>
									<Td colSpan={4} bgColor="#f3efff">
										<Table size="sm">
											<Thead>
												<Tr>
													<Th w="25%">Name</Th>
													<Th w="25%">Details</Th>
													<Th w="25%" textAlign="center">Image</Th>
													<Th w="25%" textAlign="center">Actions</Th>
												</Tr>
											</Thead>
											<Tbody>
												{position.candidates.length > 0 ? (
													position.candidates.map((candidate) => (
														<Tr key={candidate.candidateId}>
															<Td>{candidate.name}</Td>
															<Td>{candidate.details}</Td>
															<Td>
																<Image
																	src={candidate.imageUrl ? `http://localhost:7122${candidate.imageUrl}` : 'http://localhost:7122/images/icon.png'}
																	alt={candidate.name}
																	boxSize="50px"
																	borderRadius="4px"
																	m="auto"
																/>
															</Td>
															<Td display="flex" justifyContent="center">
																<Button
																	colorScheme="blue"
																	mr={3}
																	onClick={(e) => {
																		e.stopPropagation();
																		openEditCandidateModal(candidate);
																	}}
																>
																	Edit
																</Button>
																<Button
																	colorScheme="red"
																	onClick={(e) => {
																		e.stopPropagation();
																		setSelectedCandidate(candidate);
																		deleteCandidateModal.onOpen();
																	}}
																>
																	Delete
																</Button>
															</Td>
														</Tr>
													))
												) : (
													<Tr>
														<Td py={6} fontWeight="bold" fontSize="24">No candidates yet.</Td>
													</Tr>
												)}

												<Tr>
													<Td colSpan={4}>
														<Button
															colorScheme="green"
															onClick={(e) => {
																e.stopPropagation();
																openAddCandidateModal(position);
															}}
														>
															Add Candidate
														</Button>
													</Td>
												</Tr>
											</Tbody>
										</Table>
									</Td>
								</Tr>
							)}
						</React.Fragment>
					))}
				</Tbody>
			</Table>

			{/* Add Position Modal */}
			<Modal isOpen={addPositionModal.isOpen} onClose={addPositionModal.onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Add Position</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<FormControl id="title" mb={4}>
							<FormLabel>Title</FormLabel>
							<Input
								value={selectedPosition?.title || ''}
								onChange={handleTitleChange}
							/>
						</FormControl>
						<FormControl id="description" mb={4}>
							<FormLabel>Description</FormLabel>
							<Input
								value={selectedPosition?.description || ''}
								onChange={handleDescriptionChange}
							/>
						</FormControl>
						<FormControl id="maxSelection" mb={4}>
							<FormLabel>Max Selection</FormLabel>
							<Input
								type="number"
								value={selectedPosition?.maxSelection || 1}
								onChange={handleMaxSelectionChange}
							/>
						</FormControl>
					</ModalBody>
					<ModalFooter>
						<Button onClick={addPositionModal.onClose}>Cancel</Button>
						<Button
							colorScheme="blue"
							ml={3}
							onClick={handleAddPosition}
						>
							Add Position
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Edit Position Modal */}
			<Modal isOpen={editPositionModal.isOpen} onClose={editPositionModal.onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Edit Position</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<FormControl id="title" mb={4}>
							<FormLabel>Title</FormLabel>
							<Input
								value={selectedPosition?.title || ''}
								onChange={handleTitleChange}
							/>
						</FormControl>
						<FormControl id="description" mb={4}>
							<FormLabel>Description</FormLabel>
							<Input
								value={selectedPosition?.description || ''}
								onChange={handleDescriptionChange}
							/>
						</FormControl>
						<FormControl id="maxSelection" mb={4}>
							<FormLabel>Max Selection</FormLabel>
							<Input
								type="number"
								value={selectedPosition?.maxSelection || 1}
								onChange={handleMaxSelectionChange}
							/>
						</FormControl>
					</ModalBody>
					<ModalFooter>
						<Button onClick={editPositionModal.onClose}>Cancel</Button>
						<Button
							colorScheme="blue"
							ml={3}
							onClick={handleUpdatePosition}
						>
							Update Position
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Add Candidate Modal */}
			<Modal isOpen={addCandidateModal.isOpen} onClose={addCandidateModal.onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Add Candidate</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<FormControl id="name" mb={4}>
							<FormLabel>Name</FormLabel>
							<Input
								value={selectedCandidate?.name || ''}
								onChange={(e) =>
									setSelectedCandidate((prev) => ({ ...prev!, name: e.target.value }))
								}
							/>
						</FormControl>
						<FormControl id="details" mb={4}>
							<FormLabel>Details</FormLabel>
							<Input
								value={selectedCandidate?.details || ''}
								onChange={(e) =>
									setSelectedCandidate((prev) => ({ ...prev!, details: e.target.value }))
								}
							/>
						</FormControl>
						<FormControl id="image" mb={4}>
							<FormLabel>Upload Image</FormLabel>
							<Input
								type="file"
								accept=".png, .jpg, .jpeg"
								onChange={handleFileChange}
							/>
						</FormControl>
					</ModalBody>
					<ModalFooter>
						<Button onClick={addCandidateModal.onClose}>Cancel</Button>
						<Button colorScheme="blue" ml={3} onClick={handleAddCandidate}>
							Add Candidate
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Edit Candidate Modal */}
			<Modal isOpen={editCandidateModal.isOpen} onClose={editCandidateModal.onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Edit Candidate</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<FormControl id="name" mb={4}>
							<FormLabel>Name</FormLabel>
							<Input
								value={selectedCandidate?.name || ''}
								onChange={(e) =>
									setSelectedCandidate((prev) => ({ ...prev!, name: e.target.value }))
								}
							/>
						</FormControl>
						<FormControl id="details" mb={4}>
							<FormLabel>Details</FormLabel>
							<Input
								value={selectedCandidate?.details || ''}
								onChange={(e) =>
									setSelectedCandidate((prev) => ({ ...prev!, details: e.target.value }))
								}
							/>
						</FormControl>
						<FormControl id="image" mb={4}>
							<FormLabel>Upload Image</FormLabel>
							<Input
								type="file"
								accept=".png, .jpg, .jpeg"
								onChange={handleFileChange}
								disabled={removeImage}
							/>
						</FormControl>
						<FormControl id="removeImage" mb={4}>
							<Flex align="center">
								<Checkbox
									isChecked={removeImage}
									onChange={(e) => handleRemoveImageChange(e)}
									size="lg"
									mr={2}
									isDisabled={!!imageFile}  // Disable if an image is selected
								/>
								<FormLabel m={0}>Remove existing image</FormLabel>
							</Flex>
						</FormControl>
					</ModalBody>
					<ModalFooter>
						<Button onClick={editCandidateModal.onClose}>Cancel</Button>
						<Button colorScheme="blue" ml={3} onClick={handleUpdateCandidate}>
							Update Candidate
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Position Delete Confirmation Modal */}
			<AlertDialog
				isOpen={deletePositionModal.isOpen}
				leastDestructiveRef={cancelRef}
				onClose={deletePositionModal.onClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Delete Position
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure you want to delete the position "{selectedPosition?.title}"? This action cannot be undone.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={deletePositionModal.onClose}>
								Cancel
							</Button>
							<Button colorScheme="red" onClick={confirmDeletePosition} ml={3} isLoading={isDeleting}>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			{/* Candidate Delete Confirmation Modal */}
			<AlertDialog
				isOpen={deleteCandidateModal.isOpen}
				leastDestructiveRef={cancelRef}
				onClose={deleteCandidateModal.onClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Delete Candidate
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure you want to delete the candidate "{selectedCandidate?.name}"? This action cannot be undone.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={deleteCandidateModal.onClose}>
								Cancel
							</Button>
							<Button colorScheme="red" onClick={confirmDeleteCandidate} ml={3} isLoading={isDeleting}>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Box>
	);
};

export default ElectionSettingsPage;
