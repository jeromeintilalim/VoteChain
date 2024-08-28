import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import CreateElectionModal from './components/CreateElectionModal';
import Web3 from 'web3';

interface Election {
  electionId: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  positions?: string[];
}

const CreatorElectionsManagementPage = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    const initWeb3 = async () => {
      if ((window as any).ethereum) {
        const web3 = new Web3((window as any).ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    };

    initWeb3();
  }, []);

  const fetchElections = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found. Redirecting to login.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:7122/api/election', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error('Unauthorized. Redirecting to login.');
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setElections(data);
      } else {
        console.error('Failed to fetch elections:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
    }
  };

  const handleEditElection = (election: Election) => {
    setSelectedElection(election);
    setModalOpen(true); // Reuse the modal for editing
  };

  const handleDeleteElection = (election: Election) => {
    setSelectedElection(election);
    onOpen(); // Open the confirmation dialog
  };

  const confirmDeleteElection = async () => {
    if (!selectedElection) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. Redirecting to login.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:7122/api/election/delete/${selectedElection.electionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({ title: 'Election deleted successfully.', status: 'success', duration: 3000, isClosable: true });
        fetchElections(); // Refresh the list after deletion
        onClose(); // Close the confirmation dialog
      } else {
        toast({ title: 'Failed to delete election.', status: 'error', duration: 3000, isClosable: true });
      }
    } catch (error) {
      toast({ title: 'Error deleting election.', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedElection(null); // Reset the selected election
    fetchElections(); // Refresh the elections list after creating or updating
  };

  return (
    <Box p={8}>
      <Flex>
        <Heading as="h1" mb={6}>
          Manage Elections
        </Heading>
        <Button colorScheme="blue" ml="auto" onClick={() => setModalOpen(true)}>
          Create Election
        </Button>
      </Flex>
      <Box
        p={5}
        shadow="md"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        borderRadius="md"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {elections.map((election) => (
              <Tr key={election.electionId}>
                <Td>{election.electionId}</Td>
                <Td>
                  <Link to={`/elections/${election.electionId}`}>
                    {election.title}
                  </Link>
                </Td>
                <Td>{new Date(election.startDate).toLocaleString()}</Td>
                <Td>{new Date(election.endDate).toLocaleString()}</Td>
                <Td display="flex" justifyContent="center">
                  <Button colorScheme="blue" mr={3} onClick={() => handleEditElection(election)}>
                    Edit
                  </Button>
                  <Button colorScheme="red" onClick={() => handleDeleteElection(election)}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      <CreateElectionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCreateSuccess={handleModalClose}
        creatorWalletAddress={walletAddress}
        election={selectedElection} // Pass the selected election for editing
      />

      {/* Delete Confirmation Modal */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
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
