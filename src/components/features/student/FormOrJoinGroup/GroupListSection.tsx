import { SearchOutlined } from '@ant-design/icons';
import { Col, Empty, Grid, Input, Row, Select, Space, Typography } from 'antd';

import GroupCard from '@/components/features/student/FormOrJoinGroup/GroupCard';
import PagedGroupListSection from '@/components/features/student/FormOrJoinGroup/PagedGroupListSection';

const { Title } = Typography;
const { useBreakpoint } = Grid;

// Constants to avoid magic numbers
const BREAKPOINT_CONFIGS = {
	SEARCH_WIDTH: { xs: 14, sm: 14, md: 14, lg: 14, xl: 14 },
	CATEGORY_WIDTH: { xs: 10, sm: 10, md: 10, lg: 10, xl: 10 },
	CARD_WIDTH: { xs: 24, sm: 24, md: 24, lg: 12, xl: 8, xxl: 8 },
	TITLE_WIDTH: { xs: 24, sm: 24, md: 12, lg: 16, xl: 18 },
	FILTER_WIDTH: { xs: 24, sm: 24, md: 12, lg: 8, xl: 6 },
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

const domainColorMap: Record<string, string> = {
	AI: 'geekblue',
	'Artificial Intelligence': 'geekblue',
	Blockchain: 'cyan',
	'Internet of Things': 'gold',
	'Data Analytics': 'purple',
	'Cloud Computing': 'volcano',
	'App Development': 'blue',
	'Web Development': 'blue',
	IoT: 'gold',
	Cybersecurity: 'red',
	'Data Science': 'purple',
	'Mobile Development': 'green',
};

type GroupUI = {
	id: string;
	name: string;
	description: string;
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
	readonly onCategoryChange?: (value: string) => void;
	readonly fontSize?: number;
	readonly pageSize?: number;
	readonly enablePagination?: boolean;
}

// Helper functions for empty state messages
const getFilteredEmptyMessage = (
	search?: string,
	category?: string,
): string => {
	return search || category ? MESSAGES.NO_RESULTS : MESSAGES.NO_GROUPS;
};

const getDefaultEmptyMessage = (): string => {
	return MESSAGES.NO_GROUPS;
};

// Separate methods for different empty state scenarios
const getEmptyStateMessageForFilteredView = (
	search?: string,
	category?: string,
): string => {
	return getFilteredEmptyMessage(search, category);
};

const getEmptyStateMessageForDefaultView = (): string => {
	return getDefaultEmptyMessage();
};

// Helper function to render search and category filters
const renderFilters = (
	screens: ReturnType<typeof useBreakpoint>,
	search: string | undefined,
	onSearchChange: ((value: string) => void) | undefined,
	category: string | undefined,
	onCategoryChange: ((value: string) => void) | undefined,
	fontSize: number,
) => (
	<Row
		gutter={STYLE_CONSTANTS.GUTTER_SIZE}
		justify={screens.md ? 'end' : 'center'}
	>
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
				options={Object.keys(domainColorMap).map((domain) => ({
					label: domain,
					value: domain,
				}))}
			/>
		</Col>
	</Row>
);

// Helper function to render groups without pagination
const renderGroupsWithoutPagination = (
	groups: readonly GroupUI[],
	fontSize: number,
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
					<GroupCard group={group} fontSize={fontSize} />
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
) => {
	const hasGroups = groups.length > 0;

	if (hasGroups) {
		return (
			<PagedGroupListSection
				groups={groups}
				fontSize={fontSize}
				pageSize={pageSize}
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
) => {
	const hasGroups = groups.length > 0;

	if (hasGroups) {
		return renderGroupsWithoutPagination(groups, fontSize);
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
}: GroupListSectionProps) {
	const screens = useBreakpoint();

	return (
		<Space
			direction="vertical"
			size={STYLE_CONSTANTS.SPACE_SIZE}
			style={{ width: '100%' }}
		>
			<Row
				align="middle"
				justify="space-between"
				style={{
					marginTop: STYLE_CONSTANTS.MARGIN_TOP,
					marginBottom: STYLE_CONSTANTS.MARGIN_BOTTOM,
				}}
				wrap
				gutter={[16, 8]}
			>
				<Col {...BREAKPOINT_CONFIGS.TITLE_WIDTH}>
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
				{showFilter && (
					<Col {...BREAKPOINT_CONFIGS.FILTER_WIDTH}>
						{renderFilters(
							screens,
							search,
							onSearchChange,
							category,
							onCategoryChange,
							fontSize,
						)}
					</Col>
				)}
			</Row>
			{enablePagination
				? renderContentWithPagination(
						groups,
						fontSize,
						pageSize,
						showFilter,
						search,
						category,
					)
				: renderContentWithoutPagination(
						groups,
						fontSize,
						showFilter,
						search,
						category,
					)}
		</Space>
	);
}
