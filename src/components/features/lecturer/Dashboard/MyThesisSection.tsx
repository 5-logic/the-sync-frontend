import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Tag, Typography } from 'antd';
import React from 'react';

import { mockTheses } from '@/data/thesis';

const { Paragraph } = Typography;

const statusColor = {
	Approved: 'green',
	Pending: 'orange',
	Rejected: 'red',
};

const MyThesisSection: React.FC = () => {
	return (
		<Card>
			<Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
				<Col>
					<Typography.Title level={5} style={{ margin: 0 }}>
						My Thesis Topics
					</Typography.Title>
				</Col>
				<Col>
					<Button type="primary" icon={<PlusOutlined />}>
						New Thesis Topic
					</Button>
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				{mockTheses.map((item) => (
					<Col xs={24} md={12} lg={8} key={item.id}>
						<Card
							title={
								<Row justify="space-between">
									<Col>
										<Tag
											color={
												statusColor[item.status as keyof typeof statusColor]
											}
										>
											{item.status}
										</Tag>
									</Col>
									<Col>
										<Tag>{item.domain}</Tag>
									</Col>
								</Row>
							}
							actions={[
								<Button
									key="view"
									type="link"
									icon={<EyeOutlined />}
									size="small"
								>
									View Details
								</Button>,
								<Button
									key="edit"
									type="link"
									icon={<EditOutlined />}
									size="small"
								>
									Edit
								</Button>,
							]}
						>
							<h4>{item.englishName}</h4>
							<Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
							<Row gutter={[4, 4]}>
								{item.skills.map((skill) => (
									<Col key={skill}>
										<Tag>{skill}</Tag>
									</Col>
								))}
							</Row>
						</Card>
					</Col>
				))}
			</Row>
		</Card>
	);
};

export default MyThesisSection;
