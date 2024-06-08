// ViewResultsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';

interface Result {
  electionId: number;
  electionName: string;
  candidateName: string;
  votes: number;
}

const ViewResultsPage = () => {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    // Fetch results from backend
    const fetchResults = async () => {
      // Example data fetching
      const fetchedResults: Result[] = [
        { electionId: 1, electionName: 'Election A', candidateName: 'Candidate 1', votes: 120 },
        { electionId: 1, electionName: 'Election A', candidateName: 'Candidate 2', votes: 150 },
        { electionId: 2, electionName: 'Election B', candidateName: 'Candidate 3', votes: 200 },
        // Add more results as needed
      ];
      setResults(fetchedResults);
    };

    fetchResults();
  }, []);

  return (
    <Box p={8}>
      <Heading as="h1" mb={6}>View Results</Heading>
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
              <Th>Election ID</Th>
              <Th>Election Name</Th>
              <Th>Candidate Name</Th>
              <Th>Votes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {results.map(result => (
              <Tr key={`${result.electionId}-${result.candidateName}`}>
                <Td>{result.electionId}</Td>
                <Td>{result.electionName}</Td>
                <Td>{result.candidateName}</Td>
                <Td>{result.votes}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ViewResultsPage;
