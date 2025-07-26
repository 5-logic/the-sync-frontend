'use client';

import { Button, Card, Progress, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';

import { DuplicateThesis } from '@/lib/services/ai-duplicate.service';

interface Props {
	readonly duplicateThesis: DuplicateThesis;
}

export default function DuplicateThesisCard({ duplicateThesis }: Props) {
	const router = useRouter();

	// Get duplicate percentage color
	const getPercentageColor = (percentage: number) => {
		if (percentage >= 80) return '#ff4d4f'; // Red
		if (percentage >= 60) return '#fa8c16'; // Orange
		if (percentage >= 40) return '#fadb14'; // Yellow
		return '#52c41a'; // Green
	};

	// Handle view thesis details
	const handleViewDetails = () => {
		router.push(`/lecturer/thesis-management/${duplicateThesis.id}`);
	};

	return (
		<Card
			title={null}
			style={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				borderRadius: 12,
			}}
			bodyStyle={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
		>
			<Space
				direction="vertical"
				size="middle"
				style={{ width: '100%', flexGrow: 1 }}
			>
				{/* Duplicate Percentage */}
				<div style={{ textAlign: 'center' }}>
					<Progress
						type="circle"
						percent={duplicateThesis.duplicatePercentage}
						size={60}
						strokeColor={getPercentageColor(
							duplicateThesis.duplicatePercentage,
						)}
						format={(percent) => `${percent}%`}
					/>
					<Typography.Text
						type="secondary"
						style={{ display: 'block', marginTop: 8 }}
					>
						Similarity
					</Typography.Text>
				</div>

				{/* English Title */}
				<Typography.Title
					level={5}
					style={{
						marginBottom: 0,
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						lineHeight: '1.4',
						minHeight: '2.8em',
						maxHeight: '2.8em',
					}}
				>
					{duplicateThesis.englishName}
				</Typography.Title>

				{/* Vietnamese Title */}
				<Typography.Text
					type="secondary"
					style={{
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						lineHeight: '1.4',
						minHeight: '2.8em', // Always maintain 2 lines height
						maxHeight: '2.8em',
						fontStyle: 'italic',
					}}
				>
					{duplicateThesis.vietnameseName || '\u00A0'}{' '}
					{/* Non-breaking space if empty */}
				</Typography.Text>

				{/* Description */}
				<Typography.Text
					type="secondary"
					style={{
						display: '-webkit-box',
						WebkitLineClamp: 3,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						lineHeight: '1.4',
						minHeight: '4.2em',
						maxHeight: '4.2em',
					}}
				>
					{duplicateThesis.description}
				</Typography.Text>
			</Space>

			{/* View Details Button */}
			<Button
				type="primary"
				block
				onClick={handleViewDetails}
				style={{ marginTop: 16 }}
			>
				View Thesis Detail
			</Button>
		</Card>
	);
}
