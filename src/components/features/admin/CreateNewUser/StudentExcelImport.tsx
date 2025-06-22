'use client';

import ExcelImportForm from '@/components/features/admin/CreateNewUser/ExcelImportForm';
import { mockStudents } from '@/data/student';
import { Student } from '@/schemas/student';

export default function StudentExcelImport() {
	return (
		<ExcelImportForm<Student>
			note="Please fill the template including Student ID, Full Name, Email, Phone Number, and Gender."
			fields={[
				{ title: 'Student ID', key: 'studentId', type: 'text' },
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
			mockData={mockStudents}
			onImport={(data) => {
				console.log('Imported students:', data);
			}}
			templateFileName="Create List Students Template.xlsx"
			requireSemester={true}
			requireMajor={true}
		/>
	);
}
