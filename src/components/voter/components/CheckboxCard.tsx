import { Box, Image, Text, UseCheckboxProps, useCheckbox } from '@chakra-ui/react';
import React from 'react';

interface Candidate {
	id: number;
	name: string;
	partyList: string;
	details: string;
	imageUrl: string;
}

interface CheckboxCardProps extends UseCheckboxProps {
	candidate: Candidate;
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
				textAlign="center"
				width="250px"
				py={6}
			>
				{/* <Text>Checkbox</Text> */}
				{/* <Image src={props.candidate.imageUrl} alt={props.candidate.name} mb={2} borderRadius="full" /> */}
				<Image
					margin="auto"
					src={props.candidate.imageUrl ? `http://localhost:7122/${props.candidate.imageUrl}` : 'http://localhost:7122/images/icon.png'}
					alt={props.candidate.name}
					boxSize="150px"
					borderRadius="4px"
				/>
				<Text fontWeight="bold">{props.candidate.name}</Text>
				<Text>{props.candidate.partyList}</Text>
				<Text fontSize="sm">{props.candidate.details}</Text>
			</Box>
		</Box>
	);
};

export default CheckboxCard;
