import {
	Box,
	CloseButton,
	Drawer,
	DrawerContent,
	Flex,
	Icon,
	IconButton,
	Text,
	useColorModeValue,
	useDisclosure,
	Button,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { FaDropbox, FaVoteYea, FaUserCog, FaSignOutAlt } from 'react-icons/fa';
import { FiHome, FiMenu } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

interface LinkItemProps {
	name: string;
	icon: IconType;
	to: string;
}

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
			<Box ml={{ base: 0, md: '288px' }} p="4">
				{children}
			</Box>
		</Box>
	);
}

interface SidebarProps {
	onClose: () => void;
	display?: { base: string; md: string };
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
	return (
		<Flex
			direction="column"
			justifyContent="space-between"
			bg="linear-gradient(145deg, #4a3b9b, #6d58d1)"
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
						fontSize="2xl"
						fontFamily="monospace"
						fontWeight="bold"
					>
						Logo
					</Text>
					<CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
				</Flex>
				{LinkItems.map((link) => (
					<NavItem as={RouterLink} to={link.to} key={link.name} icon={link.icon}>
						{link.name}
					</NavItem>
				))}
			</Box>
			<Box height="15%">  {/* Ensures that this section stays at the bottom */}
				<NavItem as={RouterLink} to="/account-settings" icon={FaUserCog}>
					Account Settings
				</NavItem>
				<Flex px={4} mt="2">
					<Button
						w="full"
						colorScheme="red"
						leftIcon={<FaSignOutAlt />}
						onClick={() => {
							// Handle logout logic here
						}}
					>
						Logout
					</Button>
				</Flex>
			</Box>
		</Flex>
	);
};

interface NavItemProps {
	icon: IconType;
	children: string;
	to?: string;
	as?: any;
}

const NavItem = ({ icon, children, ...rest }: NavItemProps) => {
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

			<Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
				Logo
			</Text>
		</Flex>
	);
};
