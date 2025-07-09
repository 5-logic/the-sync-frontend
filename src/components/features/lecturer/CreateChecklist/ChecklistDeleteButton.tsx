'use client';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

interface Props {
	onDelete: () => void;
}

export default function ChecklistDeleteButton({ onDelete }: Readonly<Props>) {
	return (
		<Tooltip title="Delete">
			<Button icon={<DeleteOutlined />} danger type="text" onClick={onDelete} />
		</Tooltip>
	);
}
