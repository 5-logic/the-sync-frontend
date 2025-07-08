'use client';

import { Button, Row, Space } from 'antd';

export default function ActionButtons() {
	return (
		<Row justify="end">
			<Space>
				<Button>Back to list</Button>
				<Button type="primary">Register Thesis</Button>
			</Space>
		</Row>
	);
}
