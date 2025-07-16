import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Tag, Typography } from 'antd';
import React from 'react';

const { Paragraph } = Typography;

const MyThesisSection: React.FC = () => {
	const thesisList = [
		{
			id: 1,
			status: 'Approved',
			tags: ['Python', 'TensorFlow', 'Mobile'],
			title: 'AI-Powered Smart Campus Navigation System',
			description:
				'Developing an intelligent navigation system for university campuses using AI and...',
		},
		{
			id: 2,
			status: 'Pending',
			tags: ['Solidity', 'Web3', 'React'],
			title: 'Blockchain-based Academic Credential Verification',
			description:
				'Creating a secure and transparent system for verifying academic credentials using...',
		},
		{
			id: 3,
			status: 'Approved',
			tags: ['Arduino', 'Python', 'IoT'],
			title: 'IoT Environmental Monitoring System',
			description:
				'Building a comprehensive environmental monitoring system using IoT sensors and...',
		},
	];

	const statusColor = {
		Approved: 'green',
		Pending: 'orange',
	};

	return (
		<>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					marginBottom: 16,
				}}
			>
				<h3>My Thesis Topics</h3>
				<Button type="primary">+ New Thesis Topic</Button>
			</div>
			<Row gutter={[16, 16]}>
				{thesisList.map((item) => (
					<Col xs={24} md={12} lg={8} key={item.id}>
						<Card
							title={
								<div
									style={{ display: 'flex', justifyContent: 'space-between' }}
								>
									<Tag
										color={statusColor[item.status as keyof typeof statusColor]}
									>
										{item.status}
									</Tag>
									<Tag>{item.tags[0]}</Tag>
								</div>
							}
							actions={[
								// eslint-disable-next-line react/jsx-key
								<Button type="link" icon={<EyeOutlined />} size="small">
									View Details
								</Button>,
								// eslint-disable-next-line react/jsx-key
								<Button type="link" icon={<EditOutlined />} size="small">
									Edit
								</Button>,
							]}
						>
							<h4>{item.title}</h4>
							<Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
							<div>
								{item.tags.slice(1).map((tag) => (
									<Tag key={tag}>{tag}</Tag>
								))}
							</div>
						</Card>
					</Col>
				))}
			</Row>
		</>
	);
};

export default MyThesisSection;
