import { Alert, Empty, Space, Spin, Typography } from 'antd';
import { useEffect } from 'react';

import GroupDashboardHeader from '@/components/features/student/GroupDashboard/GroupDashboardHeader';
import GroupInfoCard from '@/components/features/student/GroupDashboard/GroupInfoCard';
import NoThesisCard from '@/components/features/student/GroupDashboard/NoThesisCard';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

const { Title, Text } = Typography;

export default function GroupDashboard() {
	const { group, loading, error, fetchStudentGroup } = useGroupDashboardStore();

	useEffect(() => {
		fetchStudentGroup();
	}, [fetchStudentGroup]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[400px]">
				<Spin size="large" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert
				message="Error"
				description={error}
				type="error"
				showIcon
				className="mb-6"
			/>
		);
	}

	if (!group) {
		return (
			<Empty
				description="You are not in any group yet"
				image={Empty.PRESENTED_IMAGE_SIMPLE}
			/>
		);
	}

	// Check if group has thesis
	const hasThesis = group.thesis !== null;

	if (hasThesis) {
		// Implement thesis view
		return (
			<div className="p-6">
				<Title level={2}>Group Dashboard - With Thesis</Title>
				<Text type="secondary">This view will be implemented later</Text>
			</div>
		);
	}

	// No thesis view
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Header */}
			<GroupDashboardHeader />

			{/* Group Information Card */}
			<GroupInfoCard group={group} />

			{/* Choose Thesis Topic Section */}
			<NoThesisCard />
		</Space>
	);
}
