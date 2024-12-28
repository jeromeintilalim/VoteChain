// src/pages/ErrorPage.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const ErrorPage = () => (
  <Box textAlign="center" py={10} px={6}>
    <Heading as="h1" size="xl">
      404: Not Found
    </Heading>
    <Text mt={3}>The election you are trying to access does not exist or you are not enrolled in it.</Text>
    <Link to="/">Go back to homepage</Link>
  </Box>
);

export default ErrorPage;
