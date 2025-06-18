'use client';

import BaseFormLayout from '@/components/features/admin/CreateNewUser/BaseFormLayout';
import StudentForm from '@/components/features/admin/CreateNewUser/StudentForm';
import { mockStudents } from '@/data/student';
import { Student } from '@/schemas/student';

import ExcelImportForm from './ExcelImportForm';

export default function CreateNewStudent() {
	return (
		<BaseFormLayout
			pageTitle="Create New Student"
			description="Add new students to the capstone ecosystem"
			ManualForm={<StudentForm />}
			ExcelPlaceholder={
				<ExcelImportForm<Student>
					note="Please fill the template with correct user info including Name, Email, Student ID, and Gender (Male/Female)"
					fields={[
						{ title: 'Full Name', key: 'fullName', type: 'text' },
						{ title: 'Email', key: 'email', type: 'text' },
						{ title: 'Student ID', key: 'studentId', type: 'text' },
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
					mockData={mockStudents}
					onImport={(data) => {
						console.log('Imported students:', data);
						// TODO: Gửi lên backend nếu cần
					}}
				/>
			}
		/>
	);
}
