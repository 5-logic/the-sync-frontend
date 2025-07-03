import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Select, Space } from 'antd';

export default function ChecklistToolbar() {
	return (
		<Row gutter={[16, 16]} wrap justify="space-between">
			<Col>
				<Space>
					<Select
						placeholder="Select Semester"
						style={{ width: 160 }}
						allowClear
					/>
					<Select
						placeholder="Select Milestone"
						style={{ width: 160 }}
						allowClear
					/>
				</Space>
			</Col>
			<Col>
				<Button type="primary" icon={<PlusOutlined />}>
					Create New Checklist
				</Button>
			</Col>
		</Row>
	);
}
