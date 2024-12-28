import React, { forwardRef } from 'react';
import { Box, Heading, Stack, Text, useCheckboxGroup, useRadioGroup } from '@chakra-ui/react';
import CheckboxCard from './CheckboxCard';
import RadioCard from './RadioCard';

interface Candidate {
    candidateId: number;
    name: string;
    partyList: string;
    details: string;
    imageUrl: string;
}

interface Position {
    positionId: number;
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

const ElectionRadioGroup = forwardRef<HTMLDivElement, ElectionRadioGroupProps>(
    ({ position, onCandidateChange, selectedCandidates }, ref) => {
        const isMultiple = position.multiple ?? false;
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

        const handleDeselect = () => {
            onCandidateChange([]); // Clear the selection
        };

        const radioGroupProps = useRadioGroup({
            name: `radio-group-${position.positionId}`,  // unique to each position
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
                ref={ref}
                height="100vh"
                p={5}
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                className="vertical-snap-item"
                data-position-id={position.positionId}
            >
                <Heading as="h2" size="md" mb={4}>
                    {position.title}
                </Heading>
                {isMultiple && <Text mb={4}>Select up to {maxSelections} candidates</Text>}

                <Stack direction="row" spacing={4} wrap="wrap">
                    {position.candidates.length > 0 ? (
                        position.candidates.map((candidate) => {
                            const candidateKey = `candidate-${position.positionId}-${candidate.candidateId}`;
                            const candidateValue = candidate.candidateId.toString();

                            if (isMultiple) {
                                const checkbox = checkboxGroupProps.getCheckboxProps({ value: candidateValue });
                                return (
                                    <CheckboxCard
                                        key={candidateKey}
                                        candidate={candidate}
                                        isChecked={selectedCandidates.includes(candidateValue)}
                                        {...checkbox}
                                    />
                                );
                            } else {
                                const radio = radioGroupProps.getRadioProps({ value: candidateValue });
                                return (
                                    <RadioCard
                                        key={candidateKey}
                                        candidate={candidate}
                                        // isChecked={selectedCandidates.includes(candidateValue)}
                                        isSelected={selectedCandidates.includes(candidateValue)}
                                        onDeselect={handleDeselect}
                                        {...radio}
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
    }
);

export default ElectionRadioGroup;
