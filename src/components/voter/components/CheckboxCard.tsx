import { Box, Image, Text, UseCheckboxProps, useCheckbox } from '@chakra-ui/react';
import React from 'react';

interface Candidate {
    candidateId: number;
    name: string;
    partyList: string;
    details: string;
    imageUrl: string;
}

interface CheckboxCardProps extends UseCheckboxProps {
    candidate: Candidate;
}

const CheckboxCard: React.FC<CheckboxCardProps> = ({ candidate, ...props }) => {
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
                textAlign="center"
                width="250px"
                py={6}
				key={candidate.candidateId}
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
            </Box>
        </Box>
    );
};

export default CheckboxCard;
