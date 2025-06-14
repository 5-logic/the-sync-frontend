'use client';

import BaseFormLayout from './BaseFormLayout';
import StudentForm from './StudentForm';

export default function CreateNewStudent() {
	return (
		<BaseFormLayout
			pageTitle="Create New Student"
			description="Add new students to the capstone ecosystem"
			ManualForm={<StudentForm />}
		/>
	);
}
