import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Row, Space, Tag, Typography } from 'antd';
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
						Create New Thesis
					</Button>
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				{mockTheses.map((item) => (
					<Col xs={24} md={12} lg={8} key={item.id}>
						<Card
							title={
								<Row justify="space-between" align="middle">
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
										<Tag color="blue">{item.domain}</Tag>
									</Col>
								</Row>
							}
							style={{ height: '100%' }}
							bodyStyle={{
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between',
								padding: 16,
							}}
						>
							<Flex vertical style={{ height: '100%' }}>
								{/* Nội dung chính */}
								<div>
									<Typography.Title
										level={4}
										style={{
											margin: '0 0 16px 0',
											fontSize: '16px',
											fontWeight: 600,
											color: '#1f2937',
											lineHeight: '1.4',
											minHeight: '44.8px',
										}}
									>
										{item.englishName}
									</Typography.Title>

									<Paragraph
										ellipsis={{ rows: 3 }}
										style={{
											margin: '0 0 16px 0',
											color: '#6b7280',
											fontSize: '14px',
											lineHeight: '1.5',
										}}
									>
										{item.description}
									</Paragraph>

									<Space size={[8, 8]} wrap>
										{item.skills.map((skill) => (
											<Tag
												key={skill}
												style={{
													padding: '4px 8px',
													borderRadius: '6px',
													fontSize: '12px',
												}}
											>
												{skill}
											</Tag>
										))}
									</Space>
								</div>

								{/* Actions luôn nằm đáy */}
								<Space
									style={{
										marginTop: 'auto',
										justifyContent: 'flex-end',
										width: '100%',
									}}
								>
									<Button type="link" icon={<EyeOutlined />} size="small">
										View Details
									</Button>
									<Button type="link" icon={<EditOutlined />} size="small">
										Edit
									</Button>
								</Space>
							</Flex>
						</Card>
					</Col>
				))}
			</Row>
		</Card>
	);
};

export default MyThesisSection;
