import { Box, useCheckbox, UseCheckboxProps, Image, Text } from '@chakra-ui/react';
import React from 'react';

interface CheckboxCardProps extends UseCheckboxProps {
  candidate: {
    id: number;
    name: string;
    partyList: string;
    extraText: string;
    imageUrl: string;
  };
}

const CheckboxCard: React.FC<CheckboxCardProps> = (props) => {
  const { getInputProps, getCheckboxProps } = useCheckbox(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} style={{ display: 'none' }} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: 'teal.600',
          color: 'white',
          borderColor: 'teal.600',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={5}
        py={3}
      >
        <Image src={props.candidate.imageUrl} alt={props.candidate.name} mb={2} />
        <Text fontWeight="bold">{props.candidate.name}</Text>
        <Text>{props.candidate.partyList}</Text>
        <Text fontSize="sm">{props.candidate.extraText}</Text>
      </Box>
    </Box>
  );
};

export default CheckboxCard;
