import { Card, Col, Row, Tag, Typography } from 'antd';

import MockDuplicateList from '@/data/duplicateList';

const { Paragraph } = Typography;

export default function ThesisDuplicateList() {
	return (
		<div style={{ marginTop: 32 }}>
			<Row gutter={[16, 16]}>
				{MockDuplicateList.map((thesis, index) => (
					<Col xs={24} md={8} key={index}>
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
								{thesis.skills.map((skill, idx) => (
									<Tag key={idx}>{skill}</Tag>
								))}
							</div>

							<div style={{ marginTop: 8 }}>
								<Tag
									color={
										thesis.status === 'Approved'
											? 'green'
											: thesis.status === 'Pending'
												? 'orange'
												: 'red'
									}
								>
									{thesis.status}
								</Tag>
							</div>

							<Paragraph style={{ marginTop: 12 }} type="secondary">
								{thesis.description}
							</Paragraph>
						</Card>
					</Col>
				))}
			</Row>
		</div>
	);
}
