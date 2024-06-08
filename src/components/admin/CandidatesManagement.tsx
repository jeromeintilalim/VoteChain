import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';

interface Candidate {
  id: number;
  name: string;
  election: string;
}

const ManageCandidatesPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    // Fetch candidates from backend
    const fetchCandidates = async () => {
      // Example data fetching
      const fetchedCandidates: Candidate[] = [
        { id: 1, name: 'Candidate One', election: 'Election A' },
        { id: 2, name: 'Candidate Two', election: 'Election B' },
        // Add more candidates as needed
      ];
      setCandidates(fetchedCandidates);
    };

    fetchCandidates();
  }, []);

  return (
    <Box p={8}>
      <Heading as="h1" mb={6}>Manage Candidates</Heading>
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
              <Th>Name</Th>
              <Th>Election</Th>
              <Th textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {candidates.map(candidate => (
              <Tr key={candidate.id}>
                <Td>{candidate.id}</Td>
                <Td>{candidate.name}</Td>
                <Td>{candidate.election}</Td>
                <Td display="flex" justifyContent="center">
                  <Button colorScheme="blue" mr={3}>
                    Edit
                  </Button>
                  <Button colorScheme="red">
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ManageCandidatesPage;
