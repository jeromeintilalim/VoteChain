import { Box, Image, Text, UseRadioProps, useRadio } from '@chakra-ui/react';
import React from 'react';

interface Candidate {
	id: number;
	name: string;
	partyList: string;
	details: string;
	imageUrl: string;
}

interface RadioCardProps extends UseRadioProps {
	candidate: Candidate;
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
				textAlign="center"
				width="150px"
			>
				{/* <Text>Radio</Text> */}
				<Image
					margin="auto"
					src={props.candidate.imageUrl ? `http://localhost:7122/${props.candidate.imageUrl}` : 'http://localhost:7122/images/icon.png'}
					alt={props.candidate.name}
					boxSize="50px"
					borderRadius="4px"
				/>
				<Text fontWeight="bold">{props.candidate.name}</Text>
				<Text>{props.candidate.partyList}</Text>
				<Text fontSize="sm">{props.candidate.details}</Text>
			</Box>
		</Box>
	);
};

export default RadioCard;
