'use client';

import { BookOutlined } from '@ant-design/icons';
import { Card, Space, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { DOMAIN_COLOR_MAP } from '@/lib/constants/domains';
import thesesService from '@/lib/services/theses.service';

const { Title, Text } = Typography;

interface ThesisStatusCardProps {
	readonly thesisId: string;
}

export default function ThesisStatusCard({ thesisId }: ThesisStatusCardProps) {
	const [thesis, setThesis] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchThesis = async () => {
			try {
				setLoading(true);
				const response = await thesesService.findOne(thesisId);
				if (response.success) {
					setThesis(response.data);
				}
			} catch (error) {
				console.error('Failed to fetch thesis:', error);
			} finally {
				setLoading(false);
			}
		};

		if (thesisId) {
			fetchThesis();
		}
	}, [thesisId]);

	if (loading || !thesis) {
		return (
			<Card
				title={
					<Space>
						<BookOutlined />
						<span>Thesis Status</span>
					</Space>
				}
				loading={loading}
			/>
		);
	}
	// Get domain color
	const domainColor = thesis.domain
		? DOMAIN_COLOR_MAP[thesis.domain] || 'default'
		: 'default';

	return (
		<Card
			title={
				<Space>
					<BookOutlined />
					<span>Thesis Status</span>
				</Space>
			}
		>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				<Space direction="vertical" size={4}>
					<Text type="secondary">Thesis title</Text>
					<Title level={5} style={{ margin: 0 }}>
						{thesis.englishName}
					</Title>
				</Space>

				<Space direction="vertical" size={4}>
					<Text type="secondary">Description</Text>
					<div
						style={{
							display: '-webkit-box',
							WebkitLineClamp: 3,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							lineHeight: '1.5em',
							maxHeight: '4.5em', // 3 lines × 1.5 line-height
							wordBreak: 'break-word',
						}}
					>
						{thesis.description}
					</div>
				</Space>

				<Space direction="vertical" size={4}>
					<Text type="secondary">Domain</Text>
					<Space>
						{thesis.domain && <Tag color={domainColor}>{thesis.domain}</Tag>}
					</Space>
				</Space>

				<Space direction="vertical" size={4}>
					<Text type="secondary">Status</Text>
					<Space>
						<Tag color="green">{thesis.status}</Tag>
					</Space>
				</Space>

				<Space direction="vertical" size={4}>
					<Text type="secondary">Required Skills</Text>
					<Space>
						{thesis.thesisRequiredSkills &&
						thesis.thesisRequiredSkills.length > 0 ? (
							<Space size={[4, 8]} wrap>
								{thesis.thesisRequiredSkills.map(
									(
										skillItem: any, // eslint-disable-line @typescript-eslint/no-explicit-any
									) => (
										<Tag key={skillItem.skill.id} color="blue">
											{skillItem.skill.name}
										</Tag>
									),
								)}
							</Space>
						) : (
							<Text type="secondary">No skills required</Text>
						)}
					</Space>
				</Space>
			</Space>
		</Card>
	);
}
