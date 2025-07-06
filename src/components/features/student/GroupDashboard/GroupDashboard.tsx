import { Alert, Col, Empty, Row, Space, Spin, Typography } from 'antd';
import { useEffect } from 'react';

import GroupDashboardHeader from '@/components/features/student/GroupDashboard/GroupDashboardHeader';
import GroupInfoCard from '@/components/features/student/GroupDashboard/GroupInfoCard';
import GroupMembersCard from '@/components/features/student/GroupDashboard/GroupMembersCard';
import GroupResponsibilitiesCard from '@/components/features/student/GroupDashboard/GroupResponsibilitiesCard';
import GroupSkillsCard from '@/components/features/student/GroupDashboard/GroupSkillsCard';
import NoThesisCard from '@/components/features/student/GroupDashboard/NoThesisCard';
import ProjectDirectionCard from '@/components/features/student/GroupDashboard/ProjectDirectionCard';
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
		// TODO: Implement thesis view
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
			<GroupDashboardHeader />

			<GroupInfoCard group={group} />

			{/* Group Details Grid */}
			<Row gutter={[16, 16]}>
				<Col xs={24} lg={12}>
					<ProjectDirectionCard group={group} />
				</Col>

				<Col xs={24} lg={12}>
					<GroupMembersCard group={group} />
				</Col>

				<Col xs={24} lg={12}>
					<GroupSkillsCard group={group} />
				</Col>

				<Col xs={24} lg={12}>
					<GroupResponsibilitiesCard group={group} />
				</Col>
			</Row>

			<NoThesisCard />
		</Space>
	);
}
