import { Box, Heading, Stack, Text, useCheckboxGroup, useRadioGroup } from '@chakra-ui/react';
import React from 'react';
import CheckboxCard from './CheckboxCard';
import RadioCard from './RadioCard';

interface Candidate {
    id: number;
    name: string;
    partyList: string;
    details: string;
    imageUrl: string;
}

interface Position {
    id: number;
    title: string;
    candidates: Candidate[];
    multiple?: boolean;
    maxSelections?: number;
}

interface ElectionRadioGroupProps {
    position: Position;
    onCandidateChange: (selected: string[]) => void;
    selectedCandidates: string[];
}

const ElectionRadioGroup: React.FC<ElectionRadioGroupProps> = ({ position, onCandidateChange, selectedCandidates }) => {
    const isMultiple = position.multiple;
    const maxSelections = isMultiple ? position.maxSelections || Infinity : 1;

    const handleChange = (selected: string | string[]) => {
        if (Array.isArray(selected)) {
            if (selected.length <= maxSelections) {
                onCandidateChange(selected);
            }
        } else {
            onCandidateChange([selected]);
        }
    };

    const radioGroupProps = useRadioGroup({
        onChange: (value) => handleChange(value as string),
        value: selectedCandidates[0] || '',
    });

    const checkboxGroupProps = useCheckboxGroup({
        onChange: (value) => {
            if ((value as string[]).length <= maxSelections) {
                handleChange(value as string[]);
            }
        },
        value: selectedCandidates,
    });

    return (
        <Box
            height="100vh"
            p={5}
            shadow="md"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            className="vertical-snap-item"
            data-position-id={position.id}
        >
            <Heading as="h2" size="md" mb={4}>
                {position.title}
            </Heading>
            {isMultiple && (
                <Text mb={4}>Select up to {maxSelections} candidates</Text>
            )}
            <Stack direction="row" spacing={4} wrap="wrap">
                {position.candidates.length > 0 ? (
                    position.candidates.map((candidate) => {
                        const candidateKey = `candidate-${position.id}-${candidate.id}`;

                        if (isMultiple) {
                            const checkbox = checkboxGroupProps.getCheckboxProps({ value: candidate.id.toString() });
                            return (
                                <CheckboxCard
                                    key={candidateKey}
                                    candidate={candidate}
                                    {...checkbox} // Spread checkbox props to CheckboxCard
                                />
                            );
                        } else {
                            const radio = radioGroupProps.getRadioProps({ value: candidate.id.toString() });
                            return (
                                <RadioCard
                                    key={candidateKey}
                                    candidate={candidate}
                                    {...radio} // Spread radio props to RadioCard
                                />
                            );
                        }
                    })
                ) : (
                <Text>No candidates available.</Text>
                )}
            </Stack>
        </Box>
    );
};

export default ElectionRadioGroup;
