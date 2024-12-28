import {
	Box,
	Button,
	CloseButton,
	Drawer,
	DrawerContent,
	Flex,
	Icon,
	IconButton,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useColorModeValue,
	useDisclosure,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { FaDropbox, FaSignOutAlt, FaUserCog, FaVoteYea } from 'react-icons/fa';
import { FiHome, FiMenu } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

interface LinkItemProps {
	name: string;
	icon: IconType;
	to: string;
}

// Sidebar link items
const LinkItems: Array<LinkItemProps> = [
	{ name: 'Home', icon: FiHome, to: '/dashboard' },
	{ name: 'My Elections', icon: FaVoteYea, to: '/elections' },
	{ name: 'Vote', icon: FaVoteYea, to: '/voterelections' },
	{ name: 'Results', icon: FaDropbox, to: '/results' },
];

export default function Sidebar({ children }: { children: ReactNode }) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	return (
		<Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
			<SidebarContent
				onClose={onClose}
				display={{ base: 'none', md: 'block' }}
			/>
			<Drawer
				autoFocus={false}
				isOpen={isOpen}
				placement="left"
				onClose={onClose}
				returnFocusOnClose={false}
				onOverlayClick={onClose}
				size="full"
			>
				<DrawerContent>
					<SidebarContent onClose={onClose} />
				</DrawerContent>
			</Drawer>
			<MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
			<Box ml={{ base: 0, md: '288px' }}>
				{children}
			</Box>
		</Box>
	);
}

// Sidebar content (nav links and account actions)
interface SidebarProps {
	onClose: () => void;
	display?: { base: string; md: string };
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
	const navigate = useNavigate();
	const {
		isOpen: isLogoutModalOpen,
		onOpen: onOpenLogoutModal,
		onClose: onCloseLogoutModal,
	} = useDisclosure();

	const handleLogout = () => {
		// Clear the token from localStorage
		localStorage.removeItem('token');
		// Redirect to the login page
		navigate('/login');
	};

	return (
		<Flex
			direction="column"
			justifyContent="space-between"
			bg="linear-gradient(145deg, #4c20c4, #6d3ce1)"
			borderRight="1px"
			borderRightColor={useColorModeValue('gray.200', 'gray.700')}
			w={{ base: 'full', md: '288px' }}
			pos="fixed"
			h="full"
			{...rest}
		>
			<Box flex="1" height="85%">
				<Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
					<Text
						color="white"
						fontSize="3xl"
						fontFamily="Poppins"
						fontWeight="bold"
						fontStyle="italic"
					>
						VoteChain
					</Text>
					<CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
				</Flex>
				{LinkItems.map((link) => (
					<NavItem as={RouterLink} to={link.to} key={link.name} icon={link.icon} onClose={onClose}>
						{link.name}
					</NavItem>
				))}
			</Box>
			<Box height="15%">  {/* Ensures that this section stays at the bottom */}
				<NavItem as={RouterLink} to="/accountsettings" icon={FaUserCog}>
					Account Settings
				</NavItem>
				<Flex px={4} mt="2">
					<Button
						w="full"
						colorScheme="red"
						leftIcon={<FaSignOutAlt />}
						onClick={onOpenLogoutModal}  // Open confirmation modal
					>
						Logout
					</Button>
				</Flex>
			</Box>

			{/* Logout Confirmation Modal */}
			<Modal isOpen={isLogoutModalOpen} onClose={onCloseLogoutModal}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Confirm Logout</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Text>Are you sure you want to log out?</Text>
					</ModalBody>
					<ModalFooter>
						<Button colorScheme="red" mr={3} onClick={handleLogout}>
							Logout
						</Button>
						<Button variant="ghost" onClick={onCloseLogoutModal}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

// Navigation Item
interface NavItemProps {
	icon: IconType;
	children: string;
	to?: string;
	as?: any;
	onClose?: () => void; // Add this property
}

const NavItem = ({ icon, children, to, as, ...rest }: NavItemProps) => {
	const navigate = useNavigate(); // Hook for navigation
	const { onClose } = rest; // Get the onClose function from the props

	const handleClick = () => {
		if (onClose) onClose(); // Close the sidebar
		if (to) navigate(to); // Navigate to the destination
	};

	return (
		<Flex
			align="center"
			p="4"
			mx="4"
			borderRadius="lg"
			role="group"
			cursor="pointer"
			color="white"
			_hover={{
				bg: 'sidebar.hover',
				bgColor: '#51419d',
			}}
			onClick={handleClick} // Close sidebar and navigate
			{...rest}
		>
			{icon && (
				<Icon
					mr="4"
					fontSize="16"
					_groupHover={{
						color: 'white',
					}}
					as={icon}
				/>
			)}
			{children}
		</Flex>
	);
};

// Mobile Navigation for small screens
interface MobileProps {
	onOpen: () => void;
	display: { base: string; md: string };
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
	return (
		<Flex
			ml={{ base: 0, md: 60 }}
			px={{ base: 4, md: 24 }}
			height="20"
			alignItems="center"
			bg={useColorModeValue('white', 'gray.900')}
			borderBottomWidth="1px"
			borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
			justifyContent="flex-start"
			{...rest}
		>
			<IconButton
				variant="outline"
				onClick={onOpen}
				aria-label="open menu"
				icon={<FiMenu />}
			/>

			{/* <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
				Logo
			</Text> */}
			<Text ml="4"
				fontSize="3xl"
				fontFamily="Poppins"
				fontWeight="bold"
				fontStyle="italic"
			>
				VoteChain
			</Text>
		</Flex>
	);
};