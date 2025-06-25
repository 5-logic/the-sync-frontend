'use client';

import ExcelImportForm from '@/components/features/admin/CreateNewUser/ExcelImportForm';
import { Student } from '@/schemas/student';

export default function StudentExcelImport() {
	return (
		<ExcelImportForm<Student>
			note="Please fill the template including Student ID, Full Name, Email, Phone Number, and Gender."
			fields={[
				{ title: 'Student ID', key: 'studentId', type: 'text', width: '12%' },
				{ title: 'Full Name', key: 'fullName', type: 'text', width: '25%' },
				{ title: 'Email', key: 'email', type: 'text', width: '28%' },
				{
					title: 'Phone Number',
					key: 'phoneNumber',
					type: 'text',
					width: '15%',
				},
				{
					title: 'Gender',
					key: 'gender',
					type: 'select',
					width: '10%',
					options: [
						{ label: 'Male', value: 'Male' },
						{ label: 'Female', value: 'Female' },
					],
				},
			]}
			onImport={(data) => {
				console.log('Imported students:', data);
			}}
			templateFileName="Create List Students Template.xlsx"
			requireSemester={true}
			requireMajor={true}
		/>
	);
}
