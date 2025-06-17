'use client';

import { Divider, Form, Space, Typography } from 'antd';
import { useCallback, useRef, useState } from 'react';

import SearchFilterBar from '@/components/features/admin/SemesterSetting/SearchFilterBar';
import SemesterForm from '@/components/features/admin/SemesterSetting/SemesterForm';
import SemesterTable, {
	SemesterTableRef,
} from '@/components/features/admin/SemesterSetting/SemesterTable';
import { SemesterStatus } from '@/schemas/_enums';

const { Title, Paragraph } = Typography;

export default function SemesterSettings() {
	const [form] = Form.useForm();
	const [statusFilter, setStatusFilter] = useState<SemesterStatus | 'All'>(
		'All',
	);
	const [searchText, setSearchText] = useState('');
	const [refreshLoading, setRefreshLoading] = useState(false);
	const semesterTableRef = useRef<SemesterTableRef>(null);

	const handleRefresh = useCallback(async () => {
		if (!semesterTableRef.current) return;

		setRefreshLoading(true);
		try {
			await semesterTableRef.current.refresh();
		} finally {
			setRefreshLoading(false);
		}
	}, []);

	const handleSemesterCreated = useCallback(async () => {
		await handleRefresh();
	}, [handleRefresh]);

	return (
		<div style={{ padding: '24px' }}>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<div>
					<Title level={2} style={{ marginBottom: '4px' }}>
						Semester Settings
					</Title>
					<Paragraph type="secondary" style={{ marginBottom: 0 }}>
						Create and manage semesters, registration windows, and
						capstone-specific rules
					</Paragraph>
				</div>

				<SemesterForm form={form} onSuccess={handleSemesterCreated} />

				<Divider />

				<SearchFilterBar
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					searchText={searchText}
					setSearchText={setSearchText}
					onRefresh={handleRefresh}
					loading={refreshLoading}
				/>

				<SemesterTable
					ref={semesterTableRef}
					statusFilter={statusFilter}
					searchText={searchText}
				/>
			</Space>
		</div>
	);
}
