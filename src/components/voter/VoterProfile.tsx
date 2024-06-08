// VoterProfilePage.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';

const VoterProfilePage = () => {
  const [profile, setProfile] = useState({
    name: 'Jane Doe',
    email: 'jane@example.com',
    // Add more fields as needed
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = () => {
    // Save profile changes to backend
    console.log('Profile saved:', profile);
  };

  return (
    <Box p={8}>
      <Heading as="h1" mb={6}>Profile</Heading>
      <Box
        p={5}
        shadow="md"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        borderRadius="md"
      >
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={profile.name} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input name="email" value={profile.email} onChange={handleChange} />
          </FormControl>
          {/* Add more form controls as needed */}
          <Button colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default VoterProfilePage;
