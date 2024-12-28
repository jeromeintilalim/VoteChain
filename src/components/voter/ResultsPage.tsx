import {
	Box,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Spinner,
	Table,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
	VStack,
	useDisclosure
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface CandidateResult {
	candidateName: string;
	candidateImage: string;
	voteCount: number;
}

interface PositionResult {
	positionId: number;
	positionName: string;
	candidates: CandidateResult[];
}

const ResultsPage = () => {
	const { joinCode } = useParams<{ joinCode: string }>();
	const [results, setResults] = useState<PositionResult[]>([]);
	const [loading, setLoading] = useState(true);
	const [voterAddress, setVoterAddress] = useState<string | null>(null);
	const [blockTransactionUrl, setBlockTransactionUrl] = useState<string | null>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [selectedPosition, setSelectedPosition] = useState<PositionResult | null>(null);
	const [message, setMessage] = useState<string | null>(null); // For handling "No votes" scenario

	useEffect(() => {
		const fetchWalletAddress = async () => {
			try {
				const accounts = await window.ethereum.request({ method: "eth_accounts" });
				if (accounts && accounts.length > 0) {
					setVoterAddress(accounts[0]);
				} else {
					console.error("No Ethereum wallet connected.");
				}
			} catch (error) {
				console.error("Error fetching wallet address:", error);
			}
		};

		fetchWalletAddress();
	}, []);

	useEffect(() => {
		const fetchResults = async () => {
			if (!joinCode || !voterAddress) {
				console.error("JoinCode or voter address missing.");
				return;
			}

			try {
				const response = await fetch(`http://localhost:7122/api/vote/results/${joinCode}`, {
					method: "GET",
					headers: { Authorization: `Bearer ${voterAddress}` }, // Use the voter address in place of a token.
				});

				console.log("Response:", response);

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`Failed to fetch results: ${errorText}`);
				}

				const data = await response.json();

				if (data.message === "No votes for this election yet.") {
					setMessage(data.message);
					setResults([]);
					return;
				}

				console.log("data:", data);
				// if (!data || data.length === 0) {
				//   throw new Error("No results data available.");
				// }

				// Transform data into PositionResult format
				const transformedResults: PositionResult[] = data.reduce(
					(acc: PositionResult[], item: any) => {
						const position = acc.find((p) => p.positionId === item.positionId);
						const candidate: CandidateResult = {
							candidateName: item.candidateName,
							candidateImage: item.candidateImage || "/images/icon.png",
							voteCount: item.voteCount,
						};
						if (position) {
							position.candidates.push(candidate);
						} else {
							acc.push({
								positionId: item.positionId,
								positionName: item.positionName,
								candidates: [candidate],
							});
						}
						return acc;
					},
					[]
				);

				// Sort candidates by vote count within each position
				transformedResults.forEach((position) =>
					position.candidates.sort((a, b) => b.voteCount - a.voteCount)
				);

				// Fetch transaction URL for voter
				const txResponse = await fetch(
					`http://localhost:7122/api/vote/transaction-data/${joinCode}/${voterAddress}`
				);
				// console.log("txResponse: ", txResponse.json());
				if (txResponse.ok) {
					const txData = await txResponse.json();
					console.log("txData:", txData);
					if (txData.transactionHash) {
						setBlockTransactionUrl(`https://testnet.bscscan.com/tx/${txData.transactionHash}`);
					}
				}

				setResults(transformedResults);
			} catch (error: any) {
				console.error("Error fetching results:", error);
				alert(`Error: ${error.message}`);
			} finally {
				setLoading(false);
			}
		};

		if (voterAddress) {
			fetchResults();
		}
	}, [joinCode, voterAddress]);

	const handleRowClick = (position: PositionResult) => {
		setSelectedPosition(position);
		onOpen();
	};

	if (loading) {
		return (
			<VStack color="#8C56FF" justifyContent="center" alignItems="center" height="100vh">
				<Spinner color="#8C56FF" />
				<Text color="black">Loading...</Text>
			</VStack>
		)
	}

	if (message) {
		return (
			<Box textAlign="center" py={10}>
				<Text fontSize="lg" fontWeight="bold">
					{message}
				</Text>
			</Box>
		);
	}

	if (results.length === 0) {
		return (
			<Box textAlign="center" pt={10}>
				<Text fontSize="xl" fontWeight="bold">
					No votes have been cast for this election yet.
				</Text>
			</Box>
		);
	}

	return (
		<Box position="relative" minH="100vh" py={{ base: "40px", md: "80px" }} display="flex" justifyContent="center">
			<Box
				width="80%"
				bg="white"
				borderRadius="lg"
				boxShadow="lg"
				p={5}
				overflow="hidden"
			>
				<Text fontSize="xl" fontWeight="bold" textAlign="center" mb={5}>
					Election Results
				</Text>
				<Table variant="simple" colorScheme="teal">
					<Thead>
						<Tr>
							<Th>Position</Th>
							<Th>Top 3 Leading Candidates</Th>
						</Tr>
					</Thead>
					<Tbody>
						{results.map((position) => (
							<Tr key={position.positionId} onClick={() => handleRowClick(position)} cursor="pointer">
								<Td fontWeight="bold">{position.positionName}</Td>
								<Td display="flex" gap={4}>
									{position.candidates.slice(0, 3).map((candidate, index) => (
										<Box key={index} textAlign="center">
											<Image
												m="auto"
												boxSize="50px"
												borderRadius="full"
												src={`http://localhost:7122${candidate.candidateImage}`}
												alt={candidate.candidateName}
											/>
											<Text fontSize="sm">{candidate.candidateName}</Text>
											<Text fontSize="xs" color="gray.1000">
												{candidate.voteCount} votes
											</Text>
										</Box>
									))}
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</Box>

			{blockTransactionUrl && (
				<Box
					position="fixed"
					bottom="0"
					left={{ base: "0", md: "288px" }}
					width={{ base: "100%", md: "calc(100% - 288px)" }}
					bg="white"
					py={3}
					borderTop="1px solid #e2e8f0"
					textAlign="center"
					zIndex="10"
				>
					<Text>
						Click{" "}
						<a
							style={{ color: "#8C56FF" }}
							href={blockTransactionUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							here{" "}
						</a>
						to view your transaction on the blockchain.
					</Text>
				</Box>
			)}

			{/* Modal for full results */}
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Full Results for {selectedPosition?.positionName}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Table variant="striped" colorScheme="teal">
							<Thead>
								<Tr>
									<Th w="65%">Candidate</Th>
									<Th w="35%">Vote Count</Th>
								</Tr>
							</Thead>
							<Tbody>
								{selectedPosition?.candidates.map((candidate, index) => (
									<Tr key={index}>
										<Td display="flex" alignItems="center">
											<Image
												boxSize="40px"
												borderRadius="full"
												me={3}
												src={`http://localhost:7122${candidate.candidateImage}`}
												alt={candidate.candidateName}
											/>
											<Text>{candidate.candidateName}</Text>
										</Td>
										<Td textAlign="center">{candidate.voteCount}</Td>
									</Tr>
								))}
							</Tbody>
						</Table>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default ResultsPage;