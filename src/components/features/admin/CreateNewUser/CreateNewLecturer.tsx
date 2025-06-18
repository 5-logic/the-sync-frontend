'use client';

import BaseFormLayout from '@/components/features/admin/CreateNewUser/BaseFormLayout';
import ExcelImportForm from '@/components/features/admin/CreateNewUser/ExcelImportForm';
import LecturerForm from '@/components/features/admin/CreateNewUser/LecturerForm';
import { mockLecturers } from '@/data/lecturers';
import { Lecturer } from '@/schemas/lecturer';

export default function CreateNewLecturer() {
	return (
		<BaseFormLayout
			pageTitle="Create New Lecturer"
			description="Add new lecturer to the capstone ecosystem"
			ManualForm={<LecturerForm />}
			ExcelPlaceholder={
				<ExcelImportForm<Lecturer>
					note="Please fill the template with correct user info including Name, Email, Phone Number, and Gender"
					fields={[
						{ title: 'Full Name', key: 'fullName', type: 'text' },
						{ title: 'Email', key: 'email', type: 'text' },
						{ title: 'Phone Number', key: 'phoneNumber', type: 'text' },
						{
							title: 'Gender',
							key: 'gender',
							type: 'select',
							options: [
								{ label: 'Male', value: 'Male' },
								{ label: 'Female', value: 'Female' },
							],
						},
					]}
					mockData={mockLecturers}
					onImport={(data) => {
						console.log('Imported lecturers:', data);
						// TODO: Gửi lên backend
					}}
				/>
			}
		/>
	);
}
