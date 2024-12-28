import { Box, Button, Image, Text, UseRadioProps, useRadio } from '@chakra-ui/react';
import React from 'react';

interface Candidate {
    candidateId: number;
    name: string;
    partyList: string;
    details: string;
    imageUrl: string;
}

interface RadioCardProps extends UseRadioProps {
    candidate: Candidate;
    onDeselect: () => void; // Function to handle deselection
    isSelected: boolean; // Indicate whether this candidate is selected
}

const RadioCard: React.FC<RadioCardProps> = ({ candidate, onDeselect, isSelected, ...props }) => {
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
                    bg: '#6d58d1',
                    color: 'white',
                    borderColor: 'teal.600',
                }}
                _focus={{
                    boxShadow: 'outline',
                }}
                px={5}
                py={3}
                textAlign="center"
                width="250px"
            >
                <Image
                    margin="auto"
                    src={candidate.imageUrl ? `http://localhost:7122/${candidate.imageUrl}` : 'http://localhost:7122/images/icon.png'}
                    alt={candidate.name}
                    boxSize="150px"
                    borderRadius="4px"
                />
                <Text fontWeight="bold">{candidate.name}</Text>
                <Text>{candidate.partyList}</Text>
                <Text fontSize="sm">{candidate.details}</Text>

                {isSelected && (
                    <Button size="sm" mt={2} colorScheme="red" onClick={onDeselect}>
                        Deselect
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default RadioCard;