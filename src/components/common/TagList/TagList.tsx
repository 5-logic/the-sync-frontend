import { Tag, Tooltip, Typography } from 'antd';

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
				style={{
					minHeight: minHeight === 'auto' ? 'auto' : minHeight,
					maxHeight: maxHeight === 'none' ? 'none' : maxHeight,
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Text className="text-gray-400 italic">Not specified</Text>
			</div>
		);
	}

	const visibleItems = items.slice(0, maxVisible);
	const remainingCount = items.length - maxVisible;
	const remainingItems = items.slice(maxVisible);

	// Create tooltip content for remaining items
	const tooltipContent = remainingItems.length > 0 && (
		<div style={{ maxWidth: 200 }}>
			{remainingItems.map((item) => (
				<Tag
					key={item.id}
					color={color}
					className="text-xs"
					style={{ margin: '2px' }}
				>
					{item.name}
					{showLevel && item.level && ` (${item.level})`}
				</Tag>
			))}
		</div>
	);

	const containerStyle = {
		minHeight: minHeight === 'auto' ? 'auto' : minHeight,
		maxHeight: maxHeight === 'none' ? 'none' : maxHeight,
		overflow: maxHeight === 'none' ? 'visible' : 'hidden',
		alignItems: 'flex-start',
		alignContent: 'flex-start',
	};

	return (
		<div className="flex flex-wrap gap-1" style={containerStyle}>
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
				<Tooltip
					title={tooltipContent}
					color="white"
					overlayInnerStyle={{ color: '#000' }}
				>
					<Tag
						className="text-xs border-dashed cursor-pointer"
						style={{
							backgroundColor: '#f5f5f5',
							borderColor: '#d9d9d9',
							margin: '1px',
						}}
					>
						+{remainingCount}
					</Tag>
				</Tooltip>
			)}
		</div>
	);
}
