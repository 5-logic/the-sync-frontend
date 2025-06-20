'use client';

import { Card, Col, Row, Tag } from 'antd';

import { mockTheses } from '@/data/thesis';

export default function ThesisDuplicateList() {
	return (
		<div style={{ marginTop: 32 }}>
			<Row gutter={[16, 16]}>
				{mockTheses.map((thesis) => {
					let statusColor: string;
					switch (thesis.status) {
						case 'Approved':
							statusColor = 'green';
							break;
						case 'Pending':
							statusColor = 'orange';
							break;
						default:
							statusColor = 'red';
							break;
					}

					const cardStyle = thesis.highlight
						? {
								border: '2px solid gold',
								boxShadow: '0 0 6px rgba(255, 215, 0, 0.5)',
								backgroundColor: '#fff8e1',
								height: '100%',
							}
						: { height: '100%' };

					return (
						<Col xs={24} md={8} key={thesis.id}>
							<div
								style={{
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<Card
									title={thesis.englishName}
									extra={
										thesis.highlight && (
											<Tag color="gold">{thesis.highlight}</Tag>
										)
									}
									size="small"
									style={{
										...cardStyle,
										flex: 1,
										display: 'flex',
										flexDirection: 'column',
									}}
									bodyStyle={{
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'space-between',
										flex: 1,
									}}
								>
									<div>
										<Tag color="blue">{thesis.domain}</Tag>

										<div style={{ marginTop: 8 }}>
											{thesis.skills?.map((skill) => (
												<Tag key={skill}>{skill}</Tag>
											))}
										</div>

										<div style={{ marginTop: 8 }}>
											<Tag color={statusColor}>{thesis.status}</Tag>
										</div>
									</div>

									<div
										style={{
											marginTop: 12,
											color: 'rgba(0, 0, 0, 0.45)',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											display: '-webkit-box',
											WebkitLineClamp: 3,
											WebkitBoxOrient: 'vertical',
										}}
									>
										{thesis.description}
									</div>
								</Card>
							</div>
						</Col>
					);
				})}
			</Row>
		</div>
	);
}
