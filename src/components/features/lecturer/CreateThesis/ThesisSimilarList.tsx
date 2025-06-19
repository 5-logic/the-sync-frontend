import { Card, Col, Row, Tag } from 'antd';

const mockSimilarTheses = [
	{
		title: 'Machine Learning for Healthcare Data Analysis',
		field: 'Computer Science',
		status: 'Approved',
		skills: ['Python', 'Machine Learning', 'Healthcare'],
		highlight: 'High Similarity',
	},
	{
		title: 'AI-Driven Medical Diagnosis System',
		field: 'Information Systems',
		status: 'Pending',
		skills: ['Python', 'Deep Learning', 'Medical'],
	},
	{
		title: 'Healthcare Data Mining Framework',
		field: 'Software Engineering',
		status: 'Rejected',
		skills: ['Python', 'Data Mining', 'Big Data'],
	},
];

export default function ThesisSimilarList() {
	return (
		<div style={{ marginTop: 32 }}>
			<Row gutter={[16, 16]}>
				{mockSimilarTheses.map((thesis, index) => (
					<Col xs={24} md={8} key={index}>
						<Card
							title={thesis.title}
							extra={
								thesis.highlight && <Tag color="gold">{thesis.highlight}</Tag>
							}
							size="small"
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
						</Card>
					</Col>
				))}
			</Row>
		</div>
	);
}
