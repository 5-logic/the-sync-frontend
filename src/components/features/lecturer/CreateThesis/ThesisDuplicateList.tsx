'use client';

import { Card, Col, Row, Tag, Typography } from 'antd';

import MockDuplicateList from '@/data/duplicateList';

const { Paragraph } = Typography;

export default function ThesisDuplicateList() {
	return (
		<div style={{ marginTop: 32 }}>
			<Row gutter={[16, 16]}>
				{MockDuplicateList.map((thesis) => {
					const statusColor =
						thesis.status === 'Approved'
							? 'green'
							: thesis.status === 'Pending'
								? 'orange'
								: 'red';
					return (
						<Col xs={24} md={8} key={thesis.id}>
							<Card
								extra={
									thesis.highlight && <Tag color="gold">{thesis.highlight}</Tag>
								}
								title={thesis.title}
								size="small"
								style={
									thesis.highlight
										? {
												border: '2px solid gold',
												boxShadow: '0 0 6px rgba(255, 215, 0, 0.5)',
												backgroundColor: '#fff8e1',
											}
										: {}
								}
							>
								<Tag color="blue">{thesis.field}</Tag>

								<div style={{ marginTop: 8 }}>
									{thesis.skills.map((skill) => (
										<Tag key={skill}>{skill}</Tag>
									))}
								</div>

								<div style={{ marginTop: 8 }}>
									<Tag color={statusColor}>{thesis.status}</Tag>
								</div>

								<Paragraph style={{ marginTop: 12 }} type="secondary">
									{thesis.description}
								</Paragraph>
							</Card>
						</Col>
					);
				})}
			</Row>
		</div>
	);
}
