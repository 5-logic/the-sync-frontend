import { Tag } from 'antd';

interface RequestStatusTagProps {
	readonly status: string;
}

export default function RequestStatusTag({ status }: RequestStatusTagProps) {
	return (
		<Tag
			color={
				status === 'Pending'
					? 'orange'
					: status === 'Approved'
						? 'green'
						: 'red'
			}
		>
			{status}
		</Tag>
	);
}
