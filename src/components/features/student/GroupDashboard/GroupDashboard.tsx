import { Alert, Col, Empty, Row, Space, Spin } from 'antd';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { ProgressOverviewCard } from '@/components/common/ProgressOverview';
import GroupDashboardHeader from '@/components/features/student/GroupDashboard/GroupDashboardHeader';
import GroupInfoCard from '@/components/features/student/GroupDashboard/GroupInfoCard';
import NoThesisCard from '@/components/features/student/GroupDashboard/NoThesisCard';
import SupervisorInfoCard from '@/components/features/student/GroupDashboard/SupervisorInfoCard';
import ThesisStatusCard from '@/components/features/student/GroupDashboard/ThesisStatusCard';
import { useGroupDashboardStore } from '@/store/useGroupDashboardStore';

export default function GroupDashboard() {
	const { group, loading, error, fetchStudentGroup } = useGroupDashboardStore();
	const { data: session } = useSession();

	// Check if current user is the leader by comparing user IDs
	const currentUserId = session?.user?.id;
	const isLeader = group?.leader?.user?.id === currentUserId;

	useEffect(() => {
		fetchStudentGroup();
		// ESLint is disabled here because including store functions in dependencies
		// would cause infinite re-renders as Zustand functions get new references
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	if (hasThesis && group.thesis) {
		// Thesis view - show group info and thesis-related cards
		return (
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				{/* Header */}
				<GroupDashboardHeader group={group} />

				{/* 4 cards layout with responsive columns */}
				<Row gutter={[16, 16]}>
					{/* Left column - 60% desktop, 50% tablet, 100% mobile */}
					<Col xs={24} md={12} xl={14}>
						<Space direction="vertical" size="large" style={{ width: '100%' }}>
							<GroupInfoCard group={group} />
							<SupervisorInfoCard thesisId={group.thesis.id} />
						</Space>
					</Col>

					{/* Right column - 40% desktop, 50% tablet, 100% mobile */}
					<Col xs={24} md={12} xl={10}>
						<Space direction="vertical" size="large" style={{ width: '100%' }}>
							<ThesisStatusCard
								thesisId={group.thesis.id}
								isLeader={isLeader}
							/>
							<ProgressOverviewCard thesisId={group.thesis.id} />
						</Space>
					</Col>
				</Row>
			</Space>
		);
	}

	// No thesis view
	return (
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			{/* Header */}
			<GroupDashboardHeader group={group} />

			{/* Group Information Card */}
			<GroupInfoCard group={group} />

			{/* Choose Thesis Topic Section */}
			<NoThesisCard />
		</Space>
	);
}
