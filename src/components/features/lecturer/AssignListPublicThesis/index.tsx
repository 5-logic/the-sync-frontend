'use client';

import { Card, Col, Row, Typography } from 'antd';

import { mockTheses } from '@/data/thesis';

import ThesisFilterBar from './ThesisFilterBar';
import ThesisTable from './ThesisTable';

export default function AssignListPublicThesisPage() {
	const { Title, Paragraph } = Typography;
	return (
		<div className="p-6">
			<div>
				<Title level={2} style={{ marginBottom: '4px' }}>
					Assign List Public Thesis
				</Title>
				<Paragraph type="secondary" style={{ marginBottom: 0 }}>
					Manage the list of published thesis topics available for student
					selection.
				</Paragraph>
			</div>

			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Card>
						<ThesisFilterBar />
						<ThesisTable theses={mockTheses} />
					</Card>
				</Col>
			</Row>
		</div>
	);
}
