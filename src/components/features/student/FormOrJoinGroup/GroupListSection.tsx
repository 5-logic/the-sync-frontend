import { SearchOutlined } from '@ant-design/icons';
import { Col, Empty, Grid, Input, Row, Select, Space, Typography } from 'antd';

import GroupCard from '@/components/features/student/FormOrJoinGroup/GroupCard';
import PagedGroupListSection from '@/components/features/student/FormOrJoinGroup/PagedGroupListSection';

const { Title } = Typography;
const { useBreakpoint } = Grid;

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
		<Space direction="vertical" size={8} style={{ width: '100%' }}>
			<Row
				align="middle"
				justify="space-between"
				style={{ marginTop: 24, marginBottom: 8 }}
				wrap
				gutter={[16, 8]}
			>
				<Col xs={24} sm={24} md={12} lg={16} xl={18}>
					<Title level={2} style={{ margin: 0, fontSize: fontSize + 2 }}>
						{title}
					</Title>
				</Col>
				{showFilter && (
					<Col xs={24} sm={24} md={12} lg={8} xl={6}>
						<Row gutter={8} justify={screens.md ? 'end' : 'center'}>
							<Col xs={14} sm={14} md={14} lg={14} xl={14}>
								<Input
									placeholder="Search groups"
									prefix={<SearchOutlined />}
									value={search}
									onChange={(e) => onSearchChange?.(e.target.value)}
									style={{
										width: '100%',
										fontSize: screens.xs ? fontSize - 1 : fontSize,
										height: screens.xs ? 32 : 36,
									}}
									allowClear
									size={screens.xs ? 'small' : 'middle'}
								/>
							</Col>
							<Col xs={10} sm={10} md={10} lg={10} xl={10}>
								<Select
									placeholder="Category"
									style={{
										width: '100%',
										fontSize: screens.xs ? fontSize - 1 : fontSize,
										height: screens.xs ? 32 : 36,
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
					</Col>
				)}
			</Row>
			{enablePagination ? (
				groups.length > 0 ? (
					<PagedGroupListSection
						groups={groups}
						fontSize={fontSize}
						pageSize={pageSize}
					/>
				) : (
					<Empty
						description={
							showFilter && (search || category)
								? 'No groups found matching your search criteria'
								: 'No groups available'
						}
						style={{ margin: '40px 0' }}
					/>
				)
			) : groups.length > 0 ? (
				<Row gutter={[16, 16]} align="stretch">
					{groups.map((group) => (
						<Col
							xs={24}
							sm={24}
							md={24}
							lg={12}
							xl={8}
							xxl={8}
							key={group.id}
							style={{
								display: 'flex',
								marginBottom: 16,
							}}
						>
							<div style={{ width: '100%' }}>
								<GroupCard group={group} fontSize={fontSize} />
							</div>
						</Col>
					))}
				</Row>
			) : (
				<Empty
					description={
						showFilter && (search || category)
							? 'No groups found matching your search criteria'
							: 'No groups available'
					}
					style={{ margin: '40px 0' }}
				/>
			)}
		</Space>
	);
}
