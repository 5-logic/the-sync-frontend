'use client';

import { BookOutlined, FlagOutlined } from '@ant-design/icons';
import { Tag, Typography } from 'antd';

interface Props {
	readonly semester: string;
	readonly milestone: string;
	readonly fontSize?: number;
}

export default function ChecklistContextTitle({
	semester,
	milestone,
	fontSize = 16,
}: Props) {
	return (
		<div>
			<Typography.Text strong style={{ fontSize }}>
				Create checklist for{' '}
				<Tag
					icon={<BookOutlined />}
					color="blue"
					style={{ fontWeight: 600, marginInline: 4 }}
				>
					{semester}
				</Tag>
				<Tag
					icon={<FlagOutlined />}
					color="volcano"
					style={{ fontWeight: 600, marginInline: 4 }}
				>
					{milestone}
				</Tag>
			</Typography.Text>
		</div>
	);
}
