import {
    Box,
    //   Stack,
    Button,
    Grid,
    GridItem,
    Heading,
    Stat,
    StatHelpText,
    StatLabel,
    StatNumber,
    useColorModeValue
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register the necessary components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminHome = () => {
  const [electionCount, setElectionCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);

  // Example data for chart
  const data = {
    labels: ['Election 1', 'Election 2', 'Election 3'],
    datasets: [
      {
        label: 'Votes',
        data: [12, 19, 3],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const fetchData = async () => {
    // Fetch counts from backend
    // setElectionCount(fetchedElectionCount);
    // setUserCount(fetchedUserCount);
    // setCandidateCount(fetchedCandidateCount);
    setElectionCount(electionCount);
    setUserCount(userCount);
    setCandidateCount(candidateCount);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box p={8}>
      <Heading as="h1" mb={6}>Admin Dashboard</Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <GridItem>
          <Stat
            p={5}
            shadow="md"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            borderRadius="md"
          >
            <StatLabel>Elections</StatLabel>
            <StatNumber>{electionCount}</StatNumber>
            <StatHelpText>Managed elections</StatHelpText>
            {/* <Link to="/manage-elections"> */}
              <Button colorScheme="blue" mt={4}>
                Manage Elections
              </Button>
            {/* </Link> */}
          </Stat>
        </GridItem>
        <GridItem>
          <Stat
            p={5}
            shadow="md"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            borderRadius="md"
          >
            <StatLabel>Users</StatLabel>
            <StatNumber>{userCount}</StatNumber>
            <StatHelpText>Total users</StatHelpText>
            {/* <Link to="/manage-users"> */}
              <Button colorScheme="blue" mt={4}>
                Manage Users
              </Button>
            {/* </Link> */}
          </Stat>
        </GridItem>
        <GridItem>
          <Stat
            p={5}
            shadow="md"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            borderRadius="md"
          >
            <StatLabel>Candidates</StatLabel>
            <StatNumber>{candidateCount}</StatNumber>
            <StatHelpText>Registered candidates</StatHelpText>
            {/* <Link to="/manage-candidates"> */}
              <Button colorScheme="blue" mt={4}>
                Manage Candidates
              </Button>
            {/* </Link> */}
          </Stat>
        </GridItem>
      </Grid>
      <Box mt={10}>
        <Heading as="h2" size="lg" mb={4}>Recent Voting Activity</Heading>
        <Box
          p={5}
          shadow="md"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          borderRadius="md"
        >
          <Bar data={data} />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminHome;
