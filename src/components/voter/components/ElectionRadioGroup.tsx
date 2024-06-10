import { Box, Heading, Stack, useCheckboxGroup, useRadioGroup } from '@chakra-ui/react';
import React from 'react';
import RadioCard from './RadioCard';
import CheckboxCard from './CheckboxCard';

interface ElectionRadioGroupProps {
  position: {
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
  };
  onCandidateChange: (selected: string[]) => void;
}

const ElectionRadioGroup: React.FC<ElectionRadioGroupProps> = ({ position, onCandidateChange }) => {
  const isMultiple = position.multiple;

  const handleChange = (selected: string | string[]) => {
    if (Array.isArray(selected)) {
      onCandidateChange(selected);
    } else {
      onCandidateChange([selected]);
    }
  };

  const radioGroupProps = useRadioGroup({
    onChange: (value) => handleChange(value as string),
  });

  const checkboxGroupProps = useCheckboxGroup({
    onChange: (value) => handleChange(value as string[]),
  });

  return (
    <Box
      p={5}
      height="100vh"
      shadow="md"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      className="vertical-snap-item"
    >
      <Heading as="h2" size="md" mb={4}>
        {position.name}
      </Heading>
      <Stack direction="row">
        {position.candidates.map((candidate) => {
          if (isMultiple) {
            const checkbox = checkboxGroupProps.getCheckboxProps({ value: candidate.id.toString() });
            return (
              <CheckboxCard key={candidate.id} candidate={candidate} {...checkbox} />
            );
          } else {
            const radio = radioGroupProps.getRadioProps({ value: candidate.id.toString() });
            return (
              <RadioCard key={candidate.id} candidate={candidate} {...radio} />
            );
          }
        })}
      </Stack>
    </Box>
  );
};

export default ElectionRadioGroup;
