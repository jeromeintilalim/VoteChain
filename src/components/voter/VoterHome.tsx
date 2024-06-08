// VoterDashboard.tsx
import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue
} from '@chakra-ui/react';

const VoterHome = () => {
  return (
    <Box p={8}>
      <Heading mb={6}>Voter Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        <Stat
          p={5}
          shadow="md"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          borderRadius="md"
        >
          <StatLabel>Upcoming Elections</StatLabel>
          <StatNumber>3</StatNumber>
        </Stat>
        <Stat
          p={5}
          shadow="md"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          borderRadius="md"
        >
          <StatLabel>Ongoing Elections</StatLabel>
          <StatNumber>2</StatNumber>
        </Stat>
        <Stat
          p={5}
          shadow="md"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          borderRadius="md"
        >
          <StatLabel>Past Elections</StatLabel>
          <StatNumber>5</StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default VoterHome;
