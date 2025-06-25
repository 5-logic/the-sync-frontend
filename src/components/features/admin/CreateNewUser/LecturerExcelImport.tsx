'use client';

import ExcelImportForm from '@/components/features/admin/CreateNewUser/ExcelImportForm';
import {
	LECTURER_FIELDS,
	createImportHandler,
} from '@/lib/constants/excelImport';
import { Lecturer } from '@/schemas/lecturer';

export default function LecturerExcelImport() {
	return (
		<ExcelImportForm<Lecturer>
			note="Please fill the template including Full Name, Email, Phone Number, and Gender."
			fields={LECTURER_FIELDS}
			onImport={createImportHandler('lecturer')}
			templateFileName="Create List Lecturers Template.xlsx"
			requireSemester={false} // Lecturers don't need semester
			requireMajor={false} // Lecturers don't need major
			userType="lecturer" // Specify this is for lecturers
		/>
	);
}
