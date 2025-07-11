'use client';

import { Divider, Form, Space } from 'antd';
import { useCallback, useRef, useState } from 'react';

import { Header } from '@/components/common/Header';
import SearchFilterBar from '@/components/features/admin/SemesterSettings/SearchFilterBar';
import SemesterForm from '@/components/features/admin/SemesterSettings/SemesterForm';
import SemesterTable, {
	SemesterTableRef,
} from '@/components/features/admin/SemesterSettings/SemesterTable';
import { SemesterStatus } from '@/schemas/_enums';

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
		<Space direction="vertical" size="large" style={{ width: '100%' }}>
			<Header
				title="Semester Settings"
				description="Create and manage semesters, registration windows, and
					capstone-specific rules"
			/>

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
	);
}
