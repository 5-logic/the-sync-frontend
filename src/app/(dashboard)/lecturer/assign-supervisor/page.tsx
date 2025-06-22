'use client';

import AssignSupervisors from '@/components/features/lecturer/AssignSupervisor';

export default function LecturerAssignSupervisorPage() {
	return (
		<div className="p-6 max-w-6xl mx-auto">
			{/* <div className="flex justify-between items-center mb-6">
				<div>
					<Row align="middle" gutter={12} className="mb-2">
						<Col>
							<Title level={2} style={{ marginBottom: 0 }}>
								Assign Supervisor
							</Title>
						</Col>
						<Col>
							<Badge count="Moderator Only" color="gold" />
						</Col>
					</Row>
					<Text type="secondary">
						Manage supervisor assignments for thesis groups
					</Text>
				</div>
				<Link href="/lecturer">
					<Text className="cursor-pointer hover:text-blue-600">
						← Back to Dashboard
					</Text>
				</Link>
			</div> */}

			<AssignSupervisors />
		</div>
	);
}
