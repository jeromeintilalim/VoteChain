import React, { useEffect, useState } from 'react';
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useToast,
} from '@chakra-ui/react';

interface Election {
    electionId: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    positions?: string[];
    joinCode: string;
}

interface CreateElectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateSuccess: () => void;
    creatorWalletAddress: string;
    election?: Election | null;
}

const CreateElectionModal: React.FC<CreateElectionModalProps> = ({
    isOpen,
    onClose,
    onCreateSuccess,
    creatorWalletAddress,
    election,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const toast = useToast();

    // Reset form fields whenever the modal is opened
    useEffect(() => {
        if (isOpen) {
            if (election) {
                // Prefill form fields when editing an election
                setTitle(election.title);
                setDescription(election.description);
                setStartDate(election.startDate);
                setEndDate(election.endDate);
            } else {
                // Clear form fields when creating a new election
                setTitle('');
                setDescription('');
                setStartDate('');
                setEndDate('');
            }
            setErrors({}); // Clear any previous errors
        }
    }, [isOpen, election]);

    const validateFields = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!title.trim()) newErrors.title = 'Election name is required.';
        if (!startDate) newErrors.startDate = 'Start date is required.';
        if (!endDate) newErrors.endDate = 'End date is required.';

        const minDate = new Date('1753-01-01');
        const maxDate = new Date('9999-12-31');
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (startDate && (start < minDate || start > maxDate)) {
            newErrors.startDate = 'Start date must be between 1/1/1753 and 12/31/9999.';
        }

        if (endDate && (end < minDate || end > maxDate)) {
            newErrors.endDate = 'End date must be between 1/1/1753 and 12/31/9999.';
        }

        if (startDate && endDate && start > end) {
            newErrors.endDate = 'End date must be after the start date.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateOrUpdateElection = async () => {
        if (!validateFields()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found. Please log in.');
            return;
        }

        const electionData = {
            creatorId: creatorWalletAddress,
            title,
            description,
            startDate,
            endDate,
            positions: election ? election.positions : [],
            joinCode: election ? election.joinCode : '',
            electionAccesses: [],
        };

        try {
            const response = election
                ? await fetch(`http://localhost:7122/api/election/update`, {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ ...electionData, electionId: election.electionId }),
                  })
                : await fetch(`http://localhost:7122/api/election/create`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(electionData),
                  });

            if (response.ok) {
                toast({
                    title: election ? 'Election updated successfully.' : 'Election created successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onCreateSuccess();
                onClose();
            } else {
                const errorText = await response.text();
                toast({
                    title: election ? 'Failed to update election.' : 'Failed to create election.',
                    description: errorText,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error creating/updating election:', error);
            toast({
                title: 'An error occurred.',
                description: election ? 'Unable to update election.' : 'Unable to create election.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{election ? 'Edit Election' : 'Create New Election'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl isInvalid={!!errors.title} mb={4} isRequired>
                        <FormLabel>Election Name</FormLabel>
                        <Input
                            placeholder="Enter election name"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        {errors.title && <Text color="red.500" fontSize="sm">{errors.title}</Text>}
                    </FormControl>
                    <Flex gap={4} flexDirection={{ base: 'column', md: 'row' }} mb={4}>
                        <FormControl isInvalid={!!errors.startDate} isRequired>
                            <FormLabel>Start Date</FormLabel>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            {errors.startDate && <Text color="red.500" fontSize="sm">{errors.startDate}</Text>}
                        </FormControl>
                        <FormControl isInvalid={!!errors.endDate} isRequired>
                            <FormLabel>End Date</FormLabel>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            {errors.endDate && <Text color="red.500" fontSize="sm">{errors.endDate}</Text>}
                        </FormControl>
                    </Flex>
                    <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            placeholder="Enter election description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={handleCreateOrUpdateElection}>
                        {election ? 'Update' : 'Create'}
                    </Button>
                    <Button variant="ghost" ml={3} onClick={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreateElectionModal;