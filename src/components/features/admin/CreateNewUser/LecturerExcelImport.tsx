'use client';

import ExcelImportForm from '@/components/features/admin/CreateNewUser/ExcelImportForm';
import { Lecturer } from '@/schemas/lecturer';

export default function LecturerExcelImport() {
	return (
		<ExcelImportForm<Lecturer>
			note="Please fill the template including Full Name, Email, Phone Number, and Gender."
			fields={[
				{ title: 'Full Name', key: 'fullName', type: 'text', width: '30%' },
				{ title: 'Email', key: 'email', type: 'text', width: '35%' },
				{
					title: 'Phone Number',
					key: 'phoneNumber',
					type: 'text',
					width: '20%',
				},
				{
					title: 'Gender',
					key: 'gender',
					type: 'select',
					width: '15%',
					options: [
						{ label: 'Male', value: 'Male' },
						{ label: 'Female', value: 'Female' },
					],
				},
			]}
			onImport={(data) => {
				console.log('Imported lecturers:', data);
			}}
			templateFileName="Create List Lecturers Template.xlsx"
			requireSemester={false} // Lecturers don't need semester
			requireMajor={false} // Lecturers don't need major
			userType="lecturer" // Specify this is for lecturers
		/>
	);
}
