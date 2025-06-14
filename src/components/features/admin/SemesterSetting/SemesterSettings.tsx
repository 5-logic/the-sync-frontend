'use client';

import { Form } from 'antd';
import { useState } from 'react';

import SearchFilterBar from '@/components/features/admin/SemesterSetting/SearchFilterBar';
import SemesterForm from '@/components/features/admin/SemesterSetting/SemesterForm';
import SemesterTable from '@/components/features/admin/SemesterSetting/SemesterTable';

type SemesterStatus = 'Not yet' | 'On-going' | 'End';

export default function SemesterSettings() {
	const [form] = Form.useForm();
	const [statusFilter, setStatusFilter] = useState<SemesterStatus | 'All'>(
		'All',
	);
	const [searchText, setSearchText] = useState('');

	return (
		<div className="p-6">
			<h1 className="text-2xl font-semibold mb-1">
				Semester & Academic Settings
			</h1>
			<p className="text-gray-500 mb-6">
				Create and manage semesters, registration windows, and capstone-specific
				rules
			</p>

			<SemesterForm form={form} />

			<SearchFilterBar
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				searchText={searchText}
				setSearchText={setSearchText}
			/>

			<SemesterTable statusFilter={statusFilter} searchText={searchText} />
		</div>
	);
}
