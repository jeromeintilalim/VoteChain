import { Box, useRadio, UseRadioProps, Image, Text } from '@chakra-ui/react';
import React from 'react';

interface RadioCardProps extends UseRadioProps {
  candidate: {
    id: number;
    name: string;
    partyList: string;
    extraText: string;
    imageUrl: string;
  };
}

const RadioCard: React.FC<RadioCardProps> = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const radio = getRadioProps();

  return (
    <Box as="label">
      <input {...input} style={{ display: 'none' }} />
      <Box
        {...radio}
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

export default RadioCard;
