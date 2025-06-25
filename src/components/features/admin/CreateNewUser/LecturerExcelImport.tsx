import ExcelImportForm from '@/components/features/admin/CreateNewUser/ExcelImportForm';
import { Lecturer } from '@/schemas/lecturer';

export default function LecturerExcelImport() {
	return (
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
			onImport={(data) => {
				console.log('Imported lecturers:', data);
			}}
			templateFileName="Create List Lecturers Template.xlsx"
		/>
	);
}
