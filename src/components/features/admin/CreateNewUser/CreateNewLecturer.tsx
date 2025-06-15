'use client';

import BaseFormLayout from './BaseFormLayout';
import LecturerForm from './LecturerForm';

export default function CreateNewLecturer() {
	return (
		<BaseFormLayout
			pageTitle="Create New Lecturer"
			description="Add new lecturer to the capstone ecosystem"
			ManualForm={<LecturerForm />}
		/>
	);
}
