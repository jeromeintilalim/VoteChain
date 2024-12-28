// Import necessary packages and components from Chakra UI and React libraries
import { Box, Button, Spinner, Text, VStack, useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Web3 from 'web3';
import ElectionABI from '../../blockchain/ElectionABI.json';
import ElectionRadioGroup from './components/ElectionRadioGroup';
import ReviewModal from './components/ReviewModal';


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

interface Election {
	id: number;
	name: string;
	positions: Position[];
}

interface Ballot {
	// userId: number;
	ballotId: number;
	electionId: string;
	voterAddress: string;
	votes: { positionId: number; candidateId: number }[];
}

const CONTRACT_ADDRESS = "0x10dbdbf7fe4d71ddea551102953ffd2cc93661ca";

const VotePage = () => {
	const { joinCode } = useParams<{ joinCode: string }>();
	const [election, setElection] = useState<Election | null>(null);
	const [selectedCandidates, setSelectedCandidates] = useState<{ [key: number]: string[] }>({});
	const [isLoading, setIsLoading] = useState(false);
	const positionRefs = useRef<(HTMLDivElement | null)[]>([]);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();
	const navigate = useNavigate();

	// const [web3, setWeb3] = useState<typeof Web3 | null>(null);
	const [web3, setWeb3] = useState<Web3 | null>(null);
	const [contract, setContract] = useState<any>(null);

	// Initialize Web3 and the contract
	const initWeb3 = async () => {
		if (window.ethereum) {
			try {
				const web3Instance = new Web3(window.ethereum);
				await window.ethereum.request({ method: 'eth_requestAccounts' });
				setWeb3(web3Instance);

				const abi = JSON.parse(ElectionABI.result);
				const electionContract = new web3Instance.eth.Contract(abi, CONTRACT_ADDRESS);
				setContract(electionContract);

				console.log("Contract instance created successfully:", electionContract);
			} catch (error) {
				console.error("Error initializing Web3:", error);
				toast({
					title: 'Web3 Initialization Failed',
					description: 'Please check your MetaMask connection.',
					status: 'error',
					duration: 3000,
					isClosable: true,
				});
			}
		} else {
			toast({
				title: 'MetaMask Not Found',
				description: 'Please install MetaMask to vote.',
				status: 'warning',
				duration: 3000,
				isClosable: true,
			});
		}
	};

	useEffect(() => {
		const fetchElection = async () => {
			const token = localStorage.getItem('token');
			if (!token) {
				navigate('/login');
				return;
			}

			try {
				const response = await fetch(`http://localhost:7122/api/election/${joinCode}`, {
					method: 'GET',
					headers: { Authorization: `Bearer ${token}` },
				});

				if (response.ok) {
					const data: Election = await response.json();
					setElection(data);
				} else {
					toast({ title: 'Failed to fetch election data.', status: 'error' });
				}
			} catch (error) {
				toast({
					title: 'Error Fetching Election Data',
					description: 'Please try again later.',
					status: 'error',
				});
			}
		};

		fetchElection();
		initWeb3();
	}, [joinCode, navigate, toast]);

	const handleCandidateChange = (positionId: number, selected: string[]) => {
		setSelectedCandidates((prev) => ({ ...prev, [positionId]: selected }));
	};

	const fetchTransactionDataWithRetry = async (joinCode: string, voterAddress: string, maxRetries = 5, delay = 2000) => {
		for (let attempt = 0; attempt < maxRetries; attempt++) {
			// const response = await fetch(`http://localhost:7122/api/vote/transaction-data/${joinCode}/${voterAddress}`);
			const response = await fetch(`http://localhost:7122/api/vote/transaction-data/${joinCode}/${voterAddress}`, {
				method: "GET",
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});

			console.log("response: ", response);
			if (response.ok) {
				const data = await response.json();
				// Check if the user has already voted
				if (data.message === "AlreadyVoted") {
					toast({
						title: "Already Voted",
						description: "You have already voted in this election. Redirecting to results...",
						status: "info",
						duration: 3000,
						isClosable: true,
					});
					// Redirect to results page
					navigate(`/election/results/${joinCode}`);
					return null; // Stop further retries
				}
				return data;
			}
			console.log(`Transaction data not found. Retrying... (${attempt + 1}/${maxRetries})`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}

		throw new Error("Transaction data not found after multiple retries.");
	};

	const handleVote = async () => {
		try {
			if (!web3) throw new Error("Web3 is not initialized.");
			if (!contract) throw new Error("Election contract is not initialized.");

			// Validate that the user has selected at least one candidate
			const hasSelections = Object.values(selectedCandidates).some(
				(candidates) => candidates.length > 0
			);

			if (!hasSelections) {
				toast({
					title: "Empty Ballot",
					description: "Your ballot is empty. Please select at least one candidate to vote.",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
				return;
			}
			setIsLoading(true);

			const voterAddress = await window.ethereum.request({ method: "eth_accounts" });
			console.log("Voter Address: ", voterAddress[0]);

			// Fetch user information first
			const userResponse = await fetch("http://localhost:7122/api/user/me", {
				method: "GET",
				headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
			});

			let userId;
			if (userResponse.ok) {
				const user = await userResponse.json();
				userId = user.userId;
			} else {
				throw new Error("Failed to fetch user information.");
			}

			// Construct the ballot
			const ballot = {
				joinCode,
				voterAddress: voterAddress[0],
				userId: userId,
				votes: Object.entries(selectedCandidates).flatMap(([positionId, candidateIds]) =>
					candidateIds.map((candidateId) => ({
						positionId: parseInt(positionId),
						candidateId: parseInt(candidateId),
					}))
				),
			};

			// Submit the ballot to the backend
			const submitResponse = await fetch(`http://localhost:7122/api/vote/submit-to-queue`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(ballot),
			});

			if (submitResponse.status === 409) {
				const data = await submitResponse.json();
				toast({
					title: "Duplicate Vote",
					description: data.message || "You have already voted in this election.",
					status: "error",
					duration: 5000,
				});
				return;
			}

			if (!submitResponse.ok) {
				throw new Error("Failed to submit vote. Please try again.");
			}

			console.log("submitResponse: ", submitResponse);
			console.log("submitResponse JSON: ", JSON.stringify(submitResponse));

			console.log("Vote submitted to the queue successfully.");

			// Wait briefly to give the consumer time to process the vote
			await new Promise((resolve) => setTimeout(resolve, 5000)); // Adjust delay as needed

			// Now fetch the transaction data
			const transactionData = await fetchTransactionDataWithRetry(joinCode!, voterAddress[0]);
			console.log("Transaction Data: ", transactionData);

			if (transactionData.status === "Completed") {
				toast({
					title: "Vote Already Processed",
					description: "This vote has already been confirmed on-chain.",
					status: "info",
					duration: 5000,
				});
				navigate(`/results/${joinCode}`);
				return;
			}

			// Proceed with blockchain transaction
			const electionId = web3.utils.toHex("0x" + transactionData.electionIdHash);
			const merkleRoot = "0x" + transactionData.merkleRoot;

			const gasEstimate = await contract.methods
				.setMerkleRoot(electionId, merkleRoot)
				.estimateGas({ from: voterAddress[0] });

			const tx = await contract.methods
				.setMerkleRoot(electionId, merkleRoot)
				.send({ from: voterAddress[0], gas: gasEstimate });

			console.log("Transaction signed:", tx);

			// Confirm the transaction with the backend
			const confirmPayload = {
				transactionId: transactionData.transactionId,
				transactionHash: tx.transactionHash,
				transactionGasFee: Number(gasEstimate),
			};

			const confirmResponse = await fetch(`http://localhost:7122/api/vote/confirm-transaction`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(confirmPayload),
			});

			if (!confirmResponse.ok) throw new Error("Failed to confirm transaction.");

			toast({
				title: "Vote submitted successfully",
				description: "Your vote has been recorded on-chain and IPFS.",
				status: "success",
			});

			navigate(`/results/${joinCode}`);
		} catch (error: any) {
			console.error("Error in handleVote:", error);
			toast({ title: "Error", description: error.message, status: "error" });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Box height="100vh" overflowY="auto" p={5}>
			{election ? (
				<>
					{election.positions.map((position, _index) => (
						<ElectionRadioGroup
							key={position.positionId}
							position={position}
							onCandidateChange={(selected: string[]) => handleCandidateChange(position.positionId, selected)}
							selectedCandidates={selectedCandidates[position.positionId] || []}
						/>
					))}

					<Box position="sticky" bottom="0" width="100%" bg="white" p={5} shadow="md">
						<Button colorScheme="blue" onClick={handleVote} isLoading={isLoading}>
							Submit Ballot
						</Button>
						<Button ml={4} colorScheme="teal" onClick={onOpen}>
							Review Ballot
						</Button>
					</Box>

					<ReviewModal
						isOpen={isOpen}
						onClose={onClose}
						selectedCandidates={selectedCandidates}
						positions={election.positions}
						handleVote={handleVote}
					/>
				</>
			) : (
				<VStack color="#8C56FF" justifyContent="center" alignItems="center" height="100vh">
					<Spinner color="#8C56FF" />
					<Text color="black">Loading...</Text>
				</VStack>
			)}
		</Box>
	);
};

export default VotePage;
