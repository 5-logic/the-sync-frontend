import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
	Button,
	Col,
	Empty,
	Grid,
	Input,
	Row,
	Select,
	Space,
	Spin,
	Typography,
} from 'antd';

import GroupCard from '@/components/features/student/FormOrJoinGroup/JoinGroup/GroupBrowsing/GroupCard';
import PagedGroupListSection from '@/components/features/student/FormOrJoinGroup/JoinGroup/GroupBrowsing/PagedGroupListSection';
import { THESIS_DOMAINS } from '@/lib/constants/domains';
import { type GroupRequest } from '@/lib/services/requests.service';

const { Title } = Typography;
const { useBreakpoint } = Grid;

// Constants to avoid magic numbers
const BREAKPOINT_CONFIGS = {
	SEARCH_WIDTH: { span: 15 }, // Reduced width for search
	CATEGORY_WIDTH: { span: 6 }, // Reduced width for category
	REFRESH_WIDTH: { span: 3 }, // Further reduced width for refresh button
	CARD_WIDTH: { xs: 24, sm: 24, md: 24, lg: 12, xl: 8, xxl: 8 },
} as const;

const STYLE_CONSTANTS = {
	FONT_SIZE_OFFSET: 2,
	MARGIN_TOP: 24,
	MARGIN_BOTTOM: 8,
	EMPTY_STATE_MARGIN: '40px 0',
	INPUT_HEIGHT: { xs: 32, default: 36 },
	CARD_MARGIN_BOTTOM: 16,
	GUTTER_SIZE: 8,
	SPACE_SIZE: 8,
} as const;

const MESSAGES = {
	NO_RESULTS: 'No groups found matching your search criteria',
	NO_GROUPS: 'No groups available',
	SEARCH_PLACEHOLDER: 'Search groups',
	CATEGORY_PLACEHOLDER: 'Category',
} as const;

type GroupUI = {
	id: string;
	name: string;
	leader: string;
	domain: string;
	members: number;
};

interface RenderContentParams {
	readonly groups: readonly GroupUI[];
	readonly fontSize: number;
	readonly showFilter: boolean;
	readonly search?: string;
	readonly category?: string;
	readonly onRequestSent?: () => void;
	readonly existingRequests?: readonly GroupRequest[];
	readonly loading?: boolean;
}

interface RenderContentWithPaginationParams extends RenderContentParams {
	readonly pageSize: number;
	readonly loading?: boolean;
}

interface GroupListSectionProps {
	readonly title: string;
	readonly groups: readonly GroupUI[];
	readonly showFilter?: boolean;
	readonly search?: string;
	readonly onSearchChange?: (value: string) => void;
	readonly category?: string;
	readonly onCategoryChange?: (value: string | undefined) => void;
	readonly fontSize?: number;
	readonly pageSize?: number;
	readonly enablePagination?: boolean;
	readonly onRequestSent?: () => void;
	readonly existingRequests?: readonly GroupRequest[];
	readonly loading?: boolean;
	readonly error?: string | null;
	readonly onRefresh?: () => void;
}

// Helper functions for empty state messages
const getFilteredEmptyMessage = (
	search?: string,
	category?: string,
): string => {
	if (search && category) {
		return `No groups found for "${search}" in ${category}`;
	} else if (search) {
		return `No groups found for "${search}"`;
	} else if (category) {
		return `No groups found in ${category}`;
	}
	return MESSAGES.NO_RESULTS;
};

const getEmptyStateMessageForFilteredView = (
	search?: string,
	category?: string,
): string => getFilteredEmptyMessage(search, category);

const getEmptyStateMessageForDefaultView = (): string => MESSAGES.NO_GROUPS;

// Interface for filter controls props to reduce parameter count
interface FilterControlsProps {
	readonly fontSize: number;
	readonly screens: Record<string, boolean>;
	readonly search?: string;
	readonly onSearchChange?: (value: string) => void;
	readonly category?: string;
	readonly onCategoryChange?: (value: string | undefined) => void;
	readonly loading?: boolean;
	readonly onRefresh?: () => void;
}

// Helper function to render filter controls
const renderFilterControls = (props: FilterControlsProps) => {
	const {
		fontSize,
		screens,
		search,
		onSearchChange,
		category,
		onCategoryChange,
		loading,
		onRefresh,
	} = props;

	return (
		<>
			<Col {...BREAKPOINT_CONFIGS.SEARCH_WIDTH}>
				<Input
					placeholder={MESSAGES.SEARCH_PLACEHOLDER}
					prefix={<SearchOutlined />}
					value={search}
					onChange={(e) => onSearchChange?.(e.target.value)}
					style={{
						width: '100%',
						fontSize: screens.xs ? fontSize - 1 : fontSize,
						height: screens.xs
							? STYLE_CONSTANTS.INPUT_HEIGHT.xs
							: STYLE_CONSTANTS.INPUT_HEIGHT.default,
					}}
					allowClear
					size={screens.xs ? 'small' : 'middle'}
				/>
			</Col>
			<Col {...BREAKPOINT_CONFIGS.CATEGORY_WIDTH}>
				<Select
					placeholder={MESSAGES.CATEGORY_PLACEHOLDER}
					style={{
						width: '100%',
						fontSize: screens.xs ? fontSize - 1 : fontSize,
						height: screens.xs
							? STYLE_CONSTANTS.INPUT_HEIGHT.xs
							: STYLE_CONSTANTS.INPUT_HEIGHT.default,
					}}
					dropdownStyle={{
						fontSize: screens.xs ? fontSize - 1 : fontSize,
					}}
					value={category}
					onChange={onCategoryChange}
					allowClear
					size={screens.xs ? 'small' : 'middle'}
					options={THESIS_DOMAINS.map((domain) => ({
						label: domain,
						value: domain,
					}))}
				/>
			</Col>
			<Col {...BREAKPOINT_CONFIGS.REFRESH_WIDTH}>
				<Button
					icon={<ReloadOutlined />}
					onClick={onRefresh}
					loading={loading}
					style={{
						width: '100%',
						height: screens.xs
							? STYLE_CONSTANTS.INPUT_HEIGHT.xs
							: STYLE_CONSTANTS.INPUT_HEIGHT.default,
						padding: '0 4px',
						fontSize: screens.xs ? fontSize - 2 : fontSize - 1,
					}}
					size={screens.xs ? 'small' : 'middle'}
				>
					{screens.xs ? '' : 'Refresh'}
				</Button>
			</Col>
		</>
	);
};

// Helper function to render groups without pagination
const renderGroupsWithoutPagination = (
	groups: readonly GroupUI[],
	fontSize: number,
	onRequestSent?: () => void,
	existingRequests?: readonly GroupRequest[],
	loading?: boolean,
) => (
	<Spin spinning={loading}>
		<Row gutter={[16, 16]} align="stretch">
			{groups.map((group) => (
				<Col
					{...BREAKPOINT_CONFIGS.CARD_WIDTH}
					key={group.id}
					style={{
						display: 'flex',
						marginBottom: STYLE_CONSTANTS.CARD_MARGIN_BOTTOM,
					}}
				>
					<div style={{ width: '100%' }}>
						<GroupCard
							group={group}
							fontSize={fontSize}
							onRequestSent={onRequestSent}
							existingRequests={existingRequests}
						/>
					</div>
				</Col>
			))}
		</Row>
	</Spin>
);

// Helper function to render empty state for filtered view
const renderEmptyStateForFilteredView = (
	search?: string,
	category?: string,
) => (
	<Empty
		description={getEmptyStateMessageForFilteredView(search, category)}
		style={{ margin: STYLE_CONSTANTS.EMPTY_STATE_MARGIN }}
	/>
);

// Helper function to render empty state for default view
const renderEmptyStateForDefaultView = () => (
	<Empty
		description={getEmptyStateMessageForDefaultView()}
		style={{ margin: STYLE_CONSTANTS.EMPTY_STATE_MARGIN }}
	/>
);

// Helper function to render content with pagination
const renderContentWithPagination = (
	params: RenderContentWithPaginationParams,
) => {
	const {
		groups,
		fontSize,
		pageSize,
		showFilter,
		search,
		category,
		onRequestSent,
		existingRequests,
		loading,
	} = params;

	// Hiển thị loading state khi đang loading ngay cả khi không có groups
	if (loading) {
		return (
			<Spin spinning={loading}>
				<div
					style={{
						minHeight: 200,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Empty
						description="Loading groups..."
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				</div>
			</Spin>
		);
	}

	const hasGroups = groups.length > 0;

	if (hasGroups) {
		return (
			<PagedGroupListSection
				groups={groups}
				fontSize={fontSize}
				pageSize={pageSize}
				onRequestSent={onRequestSent}
				existingRequests={existingRequests}
				loading={loading}
			/>
		);
	}

	return showFilter
		? renderEmptyStateForFilteredView(search, category)
		: renderEmptyStateForDefaultView();
};

// Helper function to render content without pagination
const renderContentWithoutPagination = (params: RenderContentParams) => {
	const {
		groups,
		fontSize,
		showFilter,
		search,
		category,
		onRequestSent,
		existingRequests,
		loading,
	} = params;

	// Hiển thị loading state khi đang loading ngay cả khi không có groups
	if (loading) {
		return (
			<Spin spinning={loading}>
				<div
					style={{
						minHeight: 200,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Empty
						description="Loading groups..."
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				</div>
			</Spin>
		);
	}

	const hasGroups = groups.length > 0;

	if (hasGroups) {
		return renderGroupsWithoutPagination(
			groups,
			fontSize,
			onRequestSent,
			existingRequests,
			loading,
		);
	}

	return showFilter
		? renderEmptyStateForFilteredView(search, category)
		: renderEmptyStateForDefaultView();
};

export default function GroupListSection({
	title,
	groups,
	showFilter = false,
	search,
	onSearchChange,
	category,
	onCategoryChange,
	fontSize = 16,
	pageSize = 6,
	enablePagination = true,
	onRequestSent,
	existingRequests = [],
	loading = false,
	error = null,
	onRefresh,
}: GroupListSectionProps) {
	const screens = useBreakpoint();

	return (
		<Space
			direction="vertical"
			size={STYLE_CONSTANTS.SPACE_SIZE}
			style={{ width: '100%' }}
		>
			{/* Title Row */}
			<Row
				style={{
					marginTop: STYLE_CONSTANTS.MARGIN_TOP,
					marginBottom: showFilter ? 8 : STYLE_CONSTANTS.MARGIN_BOTTOM,
				}}
			>
				<Col span={24}>
					<Title
						level={2}
						style={{
							margin: 0,
							fontSize: fontSize + STYLE_CONSTANTS.FONT_SIZE_OFFSET,
						}}
					>
						{title}
					</Title>
				</Col>
			</Row>

			{/* Search and Filter Row */}
			{showFilter && (
				<Row
					gutter={[16, 8]}
					style={{
						marginBottom: STYLE_CONSTANTS.MARGIN_BOTTOM,
					}}
				>
					{renderFilterControls({
						fontSize,
						screens,
						search,
						onSearchChange,
						category,
						onCategoryChange,
						loading,
						onRefresh,
					})}
				</Row>
			)}

			{/* Error State */}
			{error && (
				<Empty
					description={`Error loading groups: ${error}`}
					style={{ margin: STYLE_CONSTANTS.EMPTY_STATE_MARGIN }}
				/>
			)}

			{/* Content */}
			{!error &&
				(enablePagination
					? renderContentWithPagination({
							groups,
							fontSize,
							pageSize,
							showFilter,
							search,
							category,
							onRequestSent,
							existingRequests,
							loading,
						})
					: renderContentWithoutPagination({
							groups,
							fontSize,
							showFilter,
							search,
							category,
							onRequestSent,
							existingRequests,
							loading,
						}))}
		</Space>
	);
}
