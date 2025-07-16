import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Row, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { mockTheses } from '@/data/thesis';

const { Paragraph } = Typography;

const statusColor = {
	Approved: 'green',
	Pending: 'orange',
	Rejected: 'red',
};

const SkillsDisplay: React.FC<{ skills: string[] }> = ({ skills }) => {
	const [visibleSkills, setVisibleSkills] = useState<string[]>([]);
	const [hiddenCount, setHiddenCount] = useState(0);

	useEffect(() => {
		const maxTagsPerRow = 6;
		const maxRows = 2;
		const maxVisibleTags = maxTagsPerRow * maxRows;

		if (skills.length <= maxVisibleTags) {
			setVisibleSkills(skills);
			setHiddenCount(0);
		} else {
			const visible = maxVisibleTags - 1;
			setVisibleSkills(skills.slice(0, visible));
			setHiddenCount(skills.length - visible);
		}
	}, [skills]);

	return (
		<div
			style={{
				minHeight: '70px',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '8px',
				alignItems: 'flex-start',
				overflow: 'hidden',
				maxHeight: '64px',
			}}
		>
			{visibleSkills.map((skill) => (
				<Tag
					key={skill}
					style={{
						padding: '4px 8px',
						borderRadius: '6px',
						fontSize: '12px',
						margin: 0,
					}}
				>
					{skill}
				</Tag>
			))}
			{hiddenCount > 0 && (
				<Tag
					style={{
						padding: '4px 8px',
						borderRadius: '6px',
						fontSize: '12px',
						margin: 0,
						backgroundColor: '#f0f0f0',
						borderColor: '#d9d9d9',
						color: '#666',
					}}
				>
					+{hiddenCount} more
				</Tag>
			)}
		</div>
	);
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
							hoverable
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
							actions={[
								<span
									key="view"
									style={{
										color: '#000',
										cursor: 'pointer',
										transition: 'color 0.3s',
									}}
									onMouseEnter={(e) =>
										((e.currentTarget as HTMLElement).style.color = '#1890ff')
									}
									onMouseLeave={(e) =>
										((e.currentTarget as HTMLElement).style.color = '#000')
									}
								>
									<EyeOutlined style={{ marginRight: 4 }} />
									View Details
								</span>,
								<span
									key="edit"
									style={{
										color: '#000',
										cursor: 'pointer',
										transition: 'color 0.3s',
									}}
									onMouseEnter={(e) =>
										((e.currentTarget as HTMLElement).style.color = '#1890ff')
									}
									onMouseLeave={(e) =>
										((e.currentTarget as HTMLElement).style.color = '#000')
									}
								>
									<EditOutlined style={{ marginRight: 4 }} />
									Edit
								</span>,
							]}
							style={{ height: '100%' }}
						>
							<Flex vertical style={{ height: '100%' }}>
								<Typography.Title
									level={4}
									style={{
										fontSize: '16px',
										fontWeight: 600,
										color: '#1f2937',
										minHeight: '45px',
										marginBottom: 12,
									}}
								>
									{item.englishName}
								</Typography.Title>

								<Paragraph
									ellipsis={{ rows: 4 }}
									style={{
										color: '#6b7280',
										lineHeight: '1.5',
										marginBottom: 12,
									}}
								>
									{item.description}
								</Paragraph>

								<div style={{ marginTop: 'auto' }}>
									<SkillsDisplay skills={item.skills} />
								</div>
							</Flex>
						</Card>
					</Col>
				))}
			</Row>
		</Card>
	);
};

export default MyThesisSection;
