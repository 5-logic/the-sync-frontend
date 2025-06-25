'use client';

import ExcelImportForm from '@/components/features/admin/CreateNewUser/ExcelImportForm';
import {
	STUDENT_FIELDS,
	createImportHandler,
} from '@/lib/constants/excelImport';
import { Student } from '@/schemas/student';

export default function StudentExcelImport() {
	return (
		<ExcelImportForm<Student>
			note="Please fill the template including Student ID, Full Name, Email, Phone Number, and Gender."
			fields={STUDENT_FIELDS}
			onImport={createImportHandler('student')}
			templateFileName="Create List Students Template.xlsx"
			requireSemester={true}
			requireMajor={true}
		/>
	);
}
