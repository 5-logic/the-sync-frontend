'use client';

import {
	ExclamationCircleOutlined,
	HomeOutlined,
	LoginOutlined,
} from '@ant-design/icons';
import { Button, Result } from 'antd';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const handleGoToDashboard = () => {
		console.log('🏠 Go to dashboard clicked. Session:', session);

		if (!session?.user?.role) {
			console.log('❌ No session or role, redirecting to login');
			router.push('/login');
			return;
		}

		const role = session.user.role;
		console.log('🎯 User role:', role);
		const dashboards = {
			student: '/student',
			lecturer: '/lecturer',
			moderator: '/lecturer', // Moderator uses lecturer dashboard
			admin: '/admin',
		};

		const dashboardRoute = dashboards[role as keyof typeof dashboards];
		console.log('🚀 Dashboard route:', dashboardRoute);

		if (dashboardRoute) {
			router.push(dashboardRoute);
		} else {
			console.log('❌ No dashboard route found for role:', role);
			router.push('/login');
		}
	};

	const handleLoginDifferent = () => {
		router.push('/login');
	};

	// Loading state
	if (status === 'loading') {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<div className="max-w-md w-full mx-4">
				<Result
					status="403"
					icon={<ExclamationCircleOutlined className="text-red-500" />}
					title="Access Denied"
					subTitle={
						<div className="text-center">
							<p className="text-gray-600 mb-2">
								Sorry, you don&apos;t have permission to access this page.
							</p>
							{session?.user && (
								<div className="bg-gray-100 p-3 rounded-lg mt-4">
									<p className="text-sm">
										<strong>Current user:</strong> {session.user.name}
									</p>
									<p className="text-sm">
										<strong>Role:</strong> {session.user.role}
									</p>
									<p className="text-sm">
										<strong>Email:</strong> {session.user.email}
									</p>
								</div>
							)}
						</div>
					}
					extra={[
						<Button
							type="primary"
							key="dashboard"
							onClick={handleGoToDashboard}
							icon={<HomeOutlined />}
						>
							Go to My Dashboard
						</Button>,
						<Button
							key="login"
							onClick={handleLoginDifferent}
							icon={<LoginOutlined />}
						>
							Login as Different User
						</Button>,
					]}
				/>
			</div>
		</div>
	);
}
