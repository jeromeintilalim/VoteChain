import {
    Box,
    Button,
    Heading,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useColorModeValue
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch users from backend
    const fetchUsers = async () => {
      // Example data fetching
      const fetchedUsers: User[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        // Add more users as needed
      ];
      setUsers(fetchedUsers);
    };

    fetchUsers();
  }, []);

  return (
    <Box p={8}>
      <Heading as="h1" mb={6}>Manage Users</Heading>
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
              <Th>Email</Th>
              <Th textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map(user => (
              <Tr key={user.id}>
                <Td>{user.id}</Td>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
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

export default ManageUsersPage;
