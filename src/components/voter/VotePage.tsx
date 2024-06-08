// VotePage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Stack,
  Radio,
  RadioGroup,
} from '@chakra-ui/react';

interface Election {
  id: number;
  name: string;
  candidates: string[];
}

const VotePage = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  useEffect(() => {
    // Fetch elections from backend
    const fetchElections = async () => {
      // Example data fetching
      const fetchedElections: Election[] = [
        { id: 1, name: 'Election A', candidates: ['Candidate 1', 'Candidate 2'] },
        { id: 2, name: 'Election B', candidates: ['Candidate 3', 'Candidate 4'] },
        // Add more elections as needed
      ];
      setElections(fetchedElections);
      setSelectedElection(selectedElection)
    };

    fetchElections();
  }, []);

  const handleVote = () => {
    if (selectedElection !== null && selectedCandidate !== null) {
      // Submit vote to backend
      console.log(`Voted for ${selectedCandidate} in election ${selectedElection}`);
    } else {
      // Handle case where no candidate or election is selected
      console.log('Please select an election and a candidate.');
    }
  };

  return (
    <Box p={8}>
      <Heading as="h1" mb={6}>Vote in Elections</Heading>
      <Stack spacing={8}>
        {elections.map((election) => (
          <Box
            key={election.id}
            p={5}
            shadow="md"
            border="1px solid"
            borderColor='gray.200'
            borderRadius="md"
          >
            <Heading as="h2" size="md" mb={4}>{election.name}</Heading>
            <RadioGroup onChange={setSelectedCandidate}>
              <Stack direction="column">
                {election.candidates.map((candidate) => (
                  <Radio key={candidate} value={candidate}>
                    {candidate}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
            <Button mt={4} colorScheme="blue" onClick={handleVote}>
              Vote
            </Button>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default VotePage;
