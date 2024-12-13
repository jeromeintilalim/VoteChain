import {
	AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
	AlertDialogOverlay, Box, Button, Checkbox, Flex, FormControl, FormLabel, Heading,
	Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
	ModalOverlay, Table, Tbody, Td, Th, Thead, Tr, useDisclosure, useToast, Skeleton, Switch, Textarea
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
	joinCode: string | undefined;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const ElectionSettingsPage: React.FC = () => {
	const { joinCode } = useParams<{ joinCode: string }>(); // Extract joinCode from URL
	const [positions, setPositions] = useState<Position[]>([]);
	const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
	const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [removeImage, setRemoveImage] = useState(false);
	const [loading, setLoading] = useState<boolean>(true);

	const addPositionModal = useDisclosure();
	const editPositionModal = useDisclosure();
	const addCandidateModal = useDisclosure();
	const editCandidateModal = useDisclosure();
	const deletePositionModal = useDisclosure();
	const deleteCandidateModal = useDisclosure();

	const cancelRef = useRef<HTMLButtonElement>(null);
	const toast = useToast();
	const navigate = useNavigate();

	const [isMultipleCandidatesAllowed, setIsMultipleCandidatesAllowed] = useState(false);

	const handleMultipleCandidatesToggle = () => {
		setIsMultipleCandidatesAllowed(!isMultipleCandidatesAllowed);
	};

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login'); // Redirect to login page if no token is found
			return;
		}

		if (joinCode) {
			fetchPositions(); // Fetch positions if joinCode is defined
			fetchElectionDetails(joinCode); // Fetch election details if joinCode is defined
		} else {
			toast({
				title: 'Error',
				description: 'JoinCode is missing. Please make sure you are on the correct election page.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
		}
	}, [joinCode]);

	// Remove setPositions from fetchElectionDetails if it's already fetching in fetchPositions
	const fetchElectionDetails = async (code: string) => {
		try {
			const response = await fetch(`http://localhost:7122/api/election/${code}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					navigate('/login');
				} else {
					toast({
						title: 'Failed to fetch election details',
						status: 'error',
						duration: 3000,
						isClosable: true,
					});
				}
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

	// Ensure positions are fetched only once, from fetchPositions
	const fetchPositions = async () => {
		setLoading(true);
		try {
			const response = await fetch(`http://localhost:7122/api/position/${joinCode}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setPositions(data);
			} else if (response.status === 401) {
				console.error('Unauthorized. Redirecting to login.');
				navigate('/login');
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
		} finally {
			setLoading(false); // End loading
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

	const handleAddPosition = async () => {
		if (!validatePosition()) return;

		if (!joinCode) {
			toast({
				title: 'Error',
				description: 'JoinCode is missing. Please make sure you are on the correct election page.',
				status: 'error',
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const newPosition: Position = {
			...selectedPosition!,
			electionId: 0, // ElectionId is no longer relevant
			joinCode: joinCode  // Ensure joinCode is set here
		};

		try {
			const response = await fetch(`http://localhost:7122/api/position/add?joinCode=${joinCode}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify(newPosition),
			});

			if (response.ok) {
				const addedPosition = await response.json(); // This line is now valid because backend returns JSON

				// Optimistically update the positions state
				setPositions((prevPositions) => [...prevPositions, addedPosition]);

				toast({
					title: 'Position added successfully.',
					status: 'success',
					duration: 3000,
					isClosable: true,
				});

				addPositionModal.onClose(); // Close the modal after adding the position
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
				// Update the positions state
				setPositions((prevPositions) =>
					prevPositions.map(position =>
						position.positionId === selectedPosition!.positionId
							? { ...position, ...selectedPosition }
							: position
					)
				);

				toast({ title: 'Position updated successfully.', status: 'success', duration: 3000, isClosable: true });
				editPositionModal.onClose(); // Close the modal after updating the position
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

	const handleDeletePosition = async (positionId: number) => {
		try {
			const response = await fetch(`http://localhost:7122/api/position/delete/${positionId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				// Remove the deleted position from the state
				setPositions((prevPositions) => prevPositions.filter(position => position.positionId !== positionId));

				toast({ title: 'Position deleted successfully.', status: 'success', duration: 3000, isClosable: true });
				deletePositionModal.onClose(); // Close the modal after deleting the position
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
				// Refresh the positions after adding a candidate
				fetchPositions();
				addCandidateModal.onClose(); // Close the modal after adding the candidate
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
				// Refresh the positions after updating a candidate
				fetchPositions();
				editCandidateModal.onClose(); // Close the modal after updating the candidate
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

	const handleDeleteCandidate = async (candidateId: number) => {
		try {
			const response = await fetch(`http://localhost:7122/api/candidate/delete/${candidateId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.ok) {
				toast({
					title: 'Candidate deleted successfully.',
					status: 'success',
					duration: 3000,
					isClosable: true,
				});
				// Refresh the positions after deleting a candidate
				fetchPositions();
			} else {
				toast({
					title: 'Failed to delete candidate',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error('Error deleting candidate:', error);
			toast({
				title: 'Error',
				description: 'An error occurred while deleting the candidate.',
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

	const openAddPositionModal = () => {
		setSelectedPosition({
			positionId: 0,
			electionId: 0, // ElectionId is no longer relevant
			title: '',
			description: '',
			candidates: [],
			expanded: false,
			maxSelection: 1,  // Set a default value for MaxSelection
			joinCode: joinCode,  // Set a default value for MaxSelection
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

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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


			<Box
				p={5}
				shadow="md"
				borderRadius="xl"
			>
				<Table>
					<Thead>
						<Tr>
							<Th>Title</Th>
							<Th>Description</Th>
							<Th>Max Selections Allowed</Th>
							<Th textAlign="center">Actions</Th>
						</Tr>
					</Thead>
					{loading ? (
						<Tbody>
							<Tr>
								<Td><Skeleton height="20px" my="10px" /></Td>
								<Td><Skeleton height="20px" my="10px" /></Td>
								<Td><Skeleton height="20px" my="10px" /></Td>
								<Td display="flex" justifyContent="center">
									<Skeleton height="20px" width="50px" mr={3} />
									<Skeleton height="20px" width="50px" />
								</Td>
							</Tr>
							<Tr>
								<Td><Skeleton height="20px" my="10px" /></Td>
								<Td><Skeleton height="20px" my="10px" /></Td>
								<Td><Skeleton height="20px" my="10px" /></Td>
								<Td display="flex" justifyContent="center">
									<Skeleton height="20px" width="50px" mr={3} />
									<Skeleton height="20px" width="50px" />
								</Td>
							</Tr>
							<Tr>
								<Td><Skeleton height="20px" my="10px" /></Td>
								<Td><Skeleton height="20px" my="10px" /></Td>
								<Td><Skeleton height="20px" my="10px" /></Td>
								<Td display="flex" justifyContent="center">
									<Skeleton height="20px" width="50px" mr={3} />
									<Skeleton height="20px" width="50px" />
								</Td>
							</Tr>
						</Tbody>
					) : (
						<Tbody>
							{
								positions.length > 0 ? (
									positions.map((position) => (
										<React.Fragment key={position.positionId}>
											<Tr
												onClick={() => togglePositionExpansion(position.positionId)}
												cursor="pointer"
												_hover={{ backgroundColor: "gray.100" }}
											>
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
									))
								) : (
									<Tr>
										<Td py={6} fontWeight="bold" fontSize="24">No positions yet.</Td>
									</Tr>
								)}
						</Tbody>
					)}
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
								<Textarea
									value={selectedPosition?.description || ''}
									onChange={handleDescriptionChange}
									noOfLines={5}
								/>
							</FormControl>
							<FormControl display="flex" alignItems="center" mb={4}>
								<Switch
									id="allow-multiple-candidates"
									isChecked={isMultipleCandidatesAllowed}
									onChange={handleMultipleCandidatesToggle}
									colorScheme="teal"
								/>
								<FormLabel htmlFor="allow-multiple-candidates" mb="0" ml={3} fontWeight="bold" fontSize="lg">
									Allow multiple candidates per vote
								</FormLabel>
							</FormControl>
							<FormControl
								display={isMultipleCandidatesAllowed ? 'flex' : 'none'}
								alignItems="flex-end"
								id="maxSelection"
								mb={4}
							>
								<FormLabel w="30%">Max Selection</FormLabel>
								<Input
									type="number"
									w="70%"
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
								<Textarea
									value={selectedPosition?.description || ''}
									onChange={handleDescriptionChange}
									noOfLines={5}
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
									disabled={removeImage}  // Disable file input if removeImage is checked
								/>
							</FormControl>
							<FormControl id="removeImage" mb={4}>
								<Flex align="center">
									<Checkbox
										isChecked={removeImage}
										onChange={handleRemoveImageChange}
										size="lg"
										mr={2}
										isDisabled={!!imageFile}  // Disable if a new image is selected
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
		</Box>
	);
};

export default ElectionSettingsPage;