import { Box, Button, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react';
import React from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidates: { [key: number]: string[] };
  positions: {
    id: number;
    name: string;
    candidates: {
      id: number;
      name: string;
      partyList: string;
      extraText: string;
      imageUrl: string;
    }[];
  }[];
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, selectedCandidates, positions }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Review Your Ballot</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {positions.map((position) => (
            <Box key={position.id} mb={4}>
              <strong>{position.name}</strong>
              <ul>
                {(selectedCandidates[position.id] || []).map((selectedId) => {
                  const candidate = position.candidates.find((c) => c.id.toString() === selectedId);
                  return (
                    <Box key={candidate?.id} mb={4}>
                      <Image src={candidate?.imageUrl} alt={candidate?.name} boxSize="50px" mb={2} />
                      <Text fontWeight="bold">{candidate?.name}</Text>
                      <Text>{candidate?.partyList}</Text>
                      <Text fontSize="sm">{candidate?.extraText}</Text>
                    </Box>
                  );
                })}
              </ul>
            </Box>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReviewModal;
