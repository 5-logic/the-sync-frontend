import { SearchOutlined } from '@ant-design/icons';
import { Col, Empty, Grid, Input, Row, Select, Space, Typography } from 'antd';

import GroupCard from '@/components/features/student/FormOrJoinGroup/JoinGroup/GroupBrowsing/GroupCard';
import PagedGroupListSection from '@/components/features/student/FormOrJoinGroup/JoinGroup/GroupBrowsing/PagedGroupListSection';
import { THESIS_DOMAINS } from '@/lib/constants/domains';
import { type GroupRequest } from '@/lib/services/requests.service';

const { Title } = Typography;
const { useBreakpoint } = Grid;

// Constants to avoid magic numbers
const BREAKPOINT_CONFIGS = {
	SEARCH_WIDTH: { span: 17 }, // ~70% of 24 columns
	CATEGORY_WIDTH: { span: 7 }, // ~30% of 24 columns
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

// Helper function to render filter controls
const renderFilterControls = (
	fontSize: number,
	screens: Record<string, boolean>,
	search?: string,
	onSearchChange?: (value: string) => void,
	category?: string,
	onCategoryChange?: (value: string | undefined) => void,
) => {
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
		</>
	);
};

// Helper function to render groups without pagination
const renderGroupsWithoutPagination = (
	groups: readonly GroupUI[],
	fontSize: number,
	onRequestSent?: () => void,
	existingRequests?: readonly GroupRequest[],
) => (
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
	groups: readonly GroupUI[],
	fontSize: number,
	pageSize: number,
	showFilter: boolean,
	search?: string,
	category?: string,
	onRequestSent?: () => void,
	existingRequests?: readonly GroupRequest[],
) => {
	const hasGroups = groups.length > 0;

	if (hasGroups) {
		return (
			<PagedGroupListSection
				groups={groups}
				fontSize={fontSize}
				pageSize={pageSize}
				onRequestSent={onRequestSent}
				existingRequests={existingRequests}
			/>
		);
	}

	return showFilter
		? renderEmptyStateForFilteredView(search, category)
		: renderEmptyStateForDefaultView();
};

// Helper function to render content without pagination
const renderContentWithoutPagination = (
	groups: readonly GroupUI[],
	fontSize: number,
	showFilter: boolean,
	search?: string,
	category?: string,
	onRequestSent?: () => void,
	existingRequests?: readonly GroupRequest[],
) => {
	const hasGroups = groups.length > 0;

	if (hasGroups) {
		return renderGroupsWithoutPagination(
			groups,
			fontSize,
			onRequestSent,
			existingRequests,
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
					{renderFilterControls(
						fontSize,
						screens,
						search,
						onSearchChange,
						category,
						onCategoryChange,
					)}
				</Row>
			)}

			{enablePagination
				? renderContentWithPagination(
						groups,
						fontSize,
						pageSize,
						showFilter,
						search,
						category,
						onRequestSent,
						existingRequests,
					)
				: renderContentWithoutPagination(
						groups,
						fontSize,
						showFilter,
						search,
						category,
						onRequestSent,
						existingRequests,
					)}
		</Space>
	);
}
