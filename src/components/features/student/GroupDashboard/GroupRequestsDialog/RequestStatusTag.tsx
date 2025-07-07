import { Tag } from 'antd';

interface RequestStatusTagProps {
	readonly status: string;
}

export default function RequestStatusTag({ status }: RequestStatusTagProps) {
	const getStatusColor = (status: string): string => {
		if (status === 'Pending') return 'orange';
		if (status === 'Approved') return 'green';
		return 'red';
	};

	return <Tag color={getStatusColor(status)}>{status}</Tag>;
}
