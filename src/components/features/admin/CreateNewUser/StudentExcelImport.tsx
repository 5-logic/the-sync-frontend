'use client';

import ExcelImportForm from '@/components/features/admin/CreateNewUser/ExcelImportForm';
import { mockStudents } from '@/data/student';
import { Student } from '@/schemas/student';

export default function StudentExcelImport() {
	return (
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
			}}
			templateFileName="Create List Student Template.xlsx"
			requireSemester={true}
			requireMajor={true}
		/>
	);
}
