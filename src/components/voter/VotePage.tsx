import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import ElectionRadioGroup from './components/ElectionRadioGroup';
import ReviewModal from './components/ReviewModal';

interface Election {
  id: number;
  name: string;
  positions: {
    id: number;
    name: string;
    candidates: {
      id: number;
      name: string;
      partyList: string;
      extraText: string;
      imageUrl: string;
    }[];
    multiple?: boolean;
  }[];
}

const VotePage = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<{ [key: number]: string[] }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchElections = async () => {
      const fetchedElections: Election[] = [
        {
          id: 1,
          name: 'Election A',
          positions: [
            {
              id: 1,
              name: 'President',
              candidates: [
                { id: 1, name: 'Candidate 1', partyList: 'Party A', extraText: 'Extra info 1', imageUrl: 'https://placehold.co/200' },
                { id: 2, name: 'Candidate 2', partyList: 'Party B', extraText: 'Extra info 2', imageUrl: 'https://placehold.co/200' },
              ],
            },
            {
              id: 2,
              name: 'Vice President',
              candidates: [
                { id: 3, name: 'Candidate 3', partyList: 'Party C', extraText: 'Extra info 3', imageUrl: 'https://placehold.co/200' },
                { id: 4, name: 'Candidate 4', partyList: 'Party D', extraText: 'Extra info 4', imageUrl: 'https://placehold.co/200' },
              ],
              multiple: true,
            },
            {
              id: 3,
              name: 'Secretary',
              candidates: [
                { id: 5, name: 'Candidate 5', partyList: 'Party E', extraText: 'Extra info 5', imageUrl: 'https://placehold.co/200' },
                { id: 6, name: 'Candidate 6', partyList: 'Party F', extraText: 'Extra info 6', imageUrl: 'https://placehold.co/200' },
              ],
            },
          ],
        },
      ];
      setElections(fetchedElections);
    };

    fetchElections();
  }, []);

  const handleCandidateChange = (positionId: number, selected: string[]) => {
    setSelectedCandidates((prev) => ({ ...prev, [positionId]: selected }));
  };

  const handleVote = () => {
    console.log('Submitting vote with selections:', selectedCandidates);
    // Implement vote submission logic
  };

  return (
    <Box
      ref={containerRef}
      width="100%"
      height="100vh"
      overflowX="hidden"
      overflowY="auto"
      flexDirection="column"
      margin="auto"
      sx={{
        "& > *": {
          flex: "0 0 100%",
          scrollSnapAlign: "start",
        },
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        scrollbarWidth: "none",
        "::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {elections.map((election) =>
        election.positions.map((position) => (
          <ElectionRadioGroup
            key={position.id}
            position={position}
            onCandidateChange={(selected) => handleCandidateChange(position.id, selected)}
          />
        ))
      )}
      <Box p={5}>
        <Button mt={4} colorScheme="blue" onClick={handleVote}>
          Submit Ballot
        </Button>
        <Button mt={4} ml={4} colorScheme="teal" onClick={onOpen}>
          Review Ballot
        </Button>
      </Box>
      <ReviewModal isOpen={isOpen} onClose={onClose} selectedCandidates={selectedCandidates} positions={elections[0]?.positions || []} />
    </Box>
  );
};

export default VotePage;
