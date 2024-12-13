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

interface Election {
  id: number;
  name: string;
  date: string;
}

const ManageElectionsPage = () => {
  const [elections, setElections] = useState<Election[]>([]);

  useEffect(() => {
    // Fetch elections from backend
    const fetchElections = async () => {
      // Example data fetching
      const fetchedElections: Election[] = [
        { id: 1, name: 'Election A', date: '2023-05-01' },
        { id: 2, name: 'Election B', date: '2023-06-15' },
        // Add more elections as needed
      ];
      setElections(fetchedElections);
    };

    fetchElections();
  }, []);

  return (
    <Box p={8}>
      <Heading as="h1" mb={6}>Manage Elections</Heading>
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
              <Th>Date</Th>
              <Th textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {elections.map(election => (
              <Tr key={election.id}>
                <Td>{election.id}</Td>
                <Td>{election.name}</Td>
                <Td>{election.date}</Td>
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

export default ManageElectionsPage;
