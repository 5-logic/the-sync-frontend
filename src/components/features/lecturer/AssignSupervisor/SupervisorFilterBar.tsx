import { SearchOutlined } from '@ant-design/icons';
import { Col, Input, Row, Select } from 'antd';

const { Option } = Select;

type StatusType = 'All' | 'Finalized' | 'Incomplete' | 'Unassigned';

interface Props {
	search: string;
	onSearchChange: (val: string) => void;
	status: StatusType;
	onStatusChange: (val: StatusType) => void;
}

export default function SupervisorFilterBar({
	search,
	onSearchChange,
	status,
	onStatusChange,
}: Readonly<Props>) {
	return (
		<Row
			gutter={[12, 12]}
			wrap
			align="middle"
			justify="start"
			style={{ marginBottom: 10 }}
		>
			<Col flex="auto">
				<Input
					allowClear
					prefix={<SearchOutlined />}
					placeholder="Search groups or thesis"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</Col>
			<Col style={{ width: 160 }}>
				<Select
					value={status}
					onChange={onStatusChange}
					style={{ width: '100%' }}
				>
					<Option value="All">All Status</Option>
					<Option value="Finalized">Finalized</Option>
					<Option value="Incomplete">Incomplete</Option>
					<Option value="Unassigned">Unassigned</Option>
				</Select>
			</Col>
		</Row>
	);
}
