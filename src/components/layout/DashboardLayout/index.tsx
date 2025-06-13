'use client';

import DashboardHeader from '../Header';
import AdminSidebar from '../Sidebar/AdminSidebar';
import LecturerSidebar from '../Sidebar/LecturerSidebar';
import StudentSidebar from '../Sidebar/StudentSidebar';
import { Layout } from 'antd';

import { usePermissions } from '@/hooks/usePermissions';

const { Content, Sider } = Layout;

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const { canAccessStudentPages, canAccessLecturerPages, canAccessAdminPages } =
		usePermissions();

	const renderSidebar = () => {
		if (canAccessAdminPages) {
			return <AdminSidebar />;
		}
		if (canAccessLecturerPages) {
			return <LecturerSidebar />;
		}
		if (canAccessStudentPages) {
			return <StudentSidebar />;
		}
		return null;
	};
	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Sider
				width={250}
				style={{
					overflow: 'auto',
					height: '100vh',
					position: 'fixed',
					left: 0,
					top: 0,
					bottom: 0,
				}}
				theme="light"
			>
				{renderSidebar()}
			</Sider>
			<Layout style={{ marginLeft: 250 }}>
				<DashboardHeader />
				<Content
					style={{
						margin: '24px 16px',
						padding: 24,
						background: '#fff',
						minHeight: 'calc(100vh - 112px)', // Adjusted for header height
					}}
				>
					{children}
				</Content>
			</Layout>
		</Layout>
	);
}
