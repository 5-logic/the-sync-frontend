import { Typography } from 'antd';

import type { GroupRequest } from '@/lib/services/requests.service';

const { Text } = Typography;

interface StudentInfoProps {
	readonly student: GroupRequest['student'];
}

export default function StudentInfo({ student }: StudentInfoProps) {
	return (
		<div>
			<div className="font-medium">{student.user.fullName}</div>
			<Text type="secondary" className="text-sm">
				{student.studentCode} • {student.user.email}
			</Text>
		</div>
	);
}
