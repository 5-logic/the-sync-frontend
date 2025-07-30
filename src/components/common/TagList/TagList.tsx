import { Tag, Typography } from 'antd';

const { Text } = Typography;

interface TagListProps {
	items: Array<{ id: string; name: string; level?: string }>;
	color: string;
	maxVisible?: number;
	showLevel?: boolean;
	minHeight?: string;
	maxHeight?: string;
}

export default function TagList({
	items,
	color,
	maxVisible = 3,
	showLevel = false,
	minHeight = '40px',
	maxHeight = '40px',
}: TagListProps) {
	if (!items || items.length === 0) {
		return (
			<div
				style={{ minHeight, maxHeight, display: 'flex', alignItems: 'center' }}
			>
				<Text className="text-gray-400 italic">Not specified</Text>
			</div>
		);
	}

	const visibleItems = items.slice(0, maxVisible);
	const remainingCount = items.length - maxVisible;

	return (
		<div
			className="flex flex-wrap gap-1"
			style={{
				minHeight,
				maxHeight,
				overflow: 'hidden',
				alignItems: 'flex-start',
				alignContent: 'flex-start',
			}}
		>
			{visibleItems.map((item) => (
				<Tag
					key={item.id}
					color={color}
					className="text-xs"
					style={{ margin: '1px' }}
				>
					{item.name}
					{showLevel && item.level && ` (${item.level})`}
				</Tag>
			))}
			{remainingCount > 0 && (
				<Tag
					className="text-xs border-dashed"
					style={{
						backgroundColor: '#f5f5f5',
						borderColor: '#d9d9d9',
						margin: '1px',
					}}
				>
					+{remainingCount}
				</Tag>
			)}
		</div>
	);
}
