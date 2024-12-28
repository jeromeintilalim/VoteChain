import { Box, Button, Spinner, Text, VStack, useToast } from "@chakra-ui/react";
import { useState } from "react";

const VerifyMerklePage = ({ joinCode, voterAddress, electionId }: any) => {
  const [loading, setLoading] = useState(false);
  const [ipfsData, setIpfsData] = useState<null | { MerkleRoot: string; Proof: string[] }>(null);
  const [blockchainMerkleRoot, setBlockchainMerkleRoot] = useState<null | string>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null); // Allow boolean or null
  const toast = useToast();

  const fetchIpfsMerkleData = async () => {
    try {
      const response = await fetch(
        `http://localhost:7122/api/vote/merkle-proof/${joinCode}/${voterAddress}`
      );

      if (!response.ok) throw new Error("Failed to fetch data from IPFS.");

      const data = await response.json();
      setIpfsData(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching IPFS data:", error);
      toast({
        title: "Error Fetching IPFS Data",
        description: error.message,
        status: "error",
      });
    }
  };

  const fetchBlockchainMerkleRoot = async () => {
    try {
      const response = await fetch(
        `http://localhost:7122/api/vote/blockchain-merkle-root/${electionId}`
      );

      if (!response.ok) throw new Error("Failed to fetch data from blockchain.");

      const data = await response.json();
      setBlockchainMerkleRoot(data.MerkleRoot);
      return data.MerkleRoot;
    } catch (error: any) {
      console.error("Error fetching Blockchain data:", error);
      toast({
        title: "Error Fetching Blockchain Data",
        description: error.message,
        status: "error",
      });
    }
  };

  const verifyMerkleData = async () => {
    setLoading(true);
    try {
      const ipfsResult = await fetchIpfsMerkleData();
      const blockchainResult = await fetchBlockchainMerkleRoot();

      const isVerified = ipfsResult?.MerkleRoot === blockchainResult;
      setVerificationResult(isVerified); // No error, as `boolean | null` is valid
      toast({
        title: isVerified ? "Verification Success" : "Verification Failed",
        description: isVerified
          ? "The Merkle Roots match."
          : "The Merkle Roots do not match.",
        status: isVerified ? "success" : "error",
      });
    } catch (error: any) {
      console.error("Error during verification:", error);
      toast({
        title: "Verification Error",
        description: error.message,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Text fontSize="xl" fontWeight="bold">
        Verify Your Vote
      </Text>

      <Box>
        <Button
          colorScheme="teal"
          onClick={verifyMerkleData}
          isLoading={loading}
        >
          Verify Merkle Data
        </Button>
      </Box>

      {loading && <Spinner size="lg" />}

      {ipfsData && (
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            IPFS Merkle Data
          </Text>
          <Text>Merkle Root: {ipfsData.MerkleRoot}</Text>
          <Text>Proof: {ipfsData.Proof?.join(", ")}</Text>
        </Box>
      )}

      {blockchainMerkleRoot && (
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Blockchain Merkle Root
          </Text>
          <Text>{blockchainMerkleRoot}</Text>
        </Box>
      )}

      {verificationResult !== null && (
        <Box>
          <Text fontSize="lg" fontWeight="bold" color={verificationResult ? "green.500" : "red.500"}>
            {verificationResult ? "Verified: Merkle Roots Match!" : "Verification Failed: Roots Do Not Match"}
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default VerifyMerklePage;
