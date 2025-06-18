'use client';

import BaseFormLayout from '@/components/features/admin/CreateNewUser/BaseFormLayout';
import StudentForm from '@/components/features/admin/CreateNewUser/StudentForm';

export default function CreateNewStudent() {
	return (
		<BaseFormLayout
			pageTitle="Create New Student"
			description="Add new students to the capstone ecosystem"
			ManualForm={<StudentForm />}
		/>
	);
}
