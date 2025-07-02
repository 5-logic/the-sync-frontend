import { SearchOutlined } from '@ant-design/icons';
import { Col, Grid, Input, Row, Select, Space, Typography } from 'antd';

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
};

type GroupUI = {
	id: string;
	name: string;
	description: string;
	domain: string;
	members: number;
};

interface GroupListSectionProps {
	title: string;
	groups: GroupUI[];
	showFilter?: boolean;
	search?: string;
	onSearchChange?: (value: string) => void;
	category?: string;
	onCategoryChange?: (value: string) => void;
	fontSize?: number;
	pageSize?: number;
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
}: GroupListSectionProps) {
	const screens = useBreakpoint();
	return (
		<Space direction="vertical" size={8} style={{ width: '100%' }}>
			<Row
				align="middle"
				justify="space-between"
				style={{ marginTop: 24, marginBottom: 8 }}
				wrap
			>
				<Col>
					<Title level={2} style={{ margin: 0, fontSize: fontSize + 2 }}>
						{title}
					</Title>
				</Col>
				{showFilter && (
					<Col xs={24} sm="auto" style={{ marginTop: screens.xs ? 8 : 0 }}>
						<Space
							direction={screens.xs ? 'vertical' : 'horizontal'}
							style={{
								width: screens.xs ? '100%' : undefined,
								justifyContent: 'flex-end',
								display: 'flex',
							}}
						>
							<Input
								placeholder="Search groups"
								prefix={<SearchOutlined />}
								value={search}
								onChange={(e) => onSearchChange?.(e.target.value)}
								style={{
									minWidth: 180,
									maxWidth: 220,
									width: screens.xs ? '100%' : 220,
									fontSize,
									height: 36,
								}}
								allowClear
							/>
							<Select
								placeholder="Category"
								style={{
									minWidth: 120,
									maxWidth: 140,
									width: screens.xs ? '100%' : 140,
									fontSize,
									height: 36,
									display: 'flex',
									alignItems: 'center',
								}}
								dropdownStyle={{ fontSize }}
								value={category}
								onChange={onCategoryChange}
								allowClear
								options={Object.keys(domainColorMap).map((domain) => ({
									label: domain,
									value: domain,
								}))}
							/>
						</Space>
					</Col>
				)}
			</Row>
			<PagedGroupListSection
				groups={groups}
				fontSize={fontSize}
				pageSize={pageSize}
			/>
		</Space>
	);
}
