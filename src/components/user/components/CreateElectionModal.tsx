// src/components/CreateElectionModal.tsx
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Input,
    useToast,
    Flex,
    Textarea
} from '@chakra-ui/react';

interface Election {
    electionId: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    positions?: string[];
  }

interface CreateElectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateSuccess: () => void; // Callback to handle actions after a successful creation or update
    creatorWalletAddress: string;
    election?: Election | null; // Optional prop to handle editing an existing election
}

const CreateElectionModal: React.FC<CreateElectionModalProps> = ({ isOpen, onClose, onCreateSuccess, creatorWalletAddress, election }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const toast = useToast();

    // Pre-fill the form if we are editing an election
    useEffect(() => {
        if (election) {
            setTitle(election.title);
            setDescription(election.description);
            setStartDate(election.startDate);
            setEndDate(election.endDate);
        } else {
            setTitle('');
            setDescription('');
            setStartDate('');
            setEndDate('');
        }
    }, [election]);

    const handleCreateOrUpdateElection = async () => {
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
            positions: election ? election.positions : [], // Include positions even if empty
        };
    
        try {
            const response = election
                ? await fetch(`http://localhost:7122/api/election/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ...electionData, electionId: election.electionId }),
                })
                : await fetch(`http://localhost:7122/api/election/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(electionData),
                });
    
            if (response.ok) {
                toast({
                    title: election ? "Election updated successfully." : "Election created successfully.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                onCreateSuccess();
                onClose();
            } else {
                toast({
                    title: election ? "Failed to update election." : "Failed to create election.",
                    description: await response.text(),
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error creating/updating election:', error);
            toast({
                title: "An error occurred.",
                description: election ? "Unable to update election." : "Unable to create election.",
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
                <ModalHeader>{election ? 'Edit Election' : 'Create New Election'}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormLabel>Election Name</FormLabel>
                        <Input placeholder="Enter election name" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </FormControl>
                    <Flex gap={2}>
                        <FormControl mt={4}>
                            <FormLabel>Start Date</FormLabel>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel>End Date</FormLabel>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </FormControl>
                    </Flex>
                    <FormControl mt={4}>
                        <FormLabel>Description</FormLabel>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
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
