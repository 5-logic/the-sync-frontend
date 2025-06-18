'use client';

import BaseFormLayout from '@/components/features/admin/CreateNewUser/BaseFormLayout';
import LecturerForm from '@/components/features/admin/CreateNewUser/LecturerForm';

export default function CreateNewLecturer() {
	return (
		<BaseFormLayout
			pageTitle="Create New Lecturer"
			description="Add new lecturer to the capstone ecosystem"
			ManualForm={<LecturerForm />}
		/>
	);
}
