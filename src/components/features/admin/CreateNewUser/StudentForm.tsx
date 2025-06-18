'use client';

import UserForm from '@/components/features/admin/CreateNewUser/UserForm';

const StudentForm = () => {
	const handleSubmit = (values: Record<string, unknown>) => {
		console.log(values);
	};

	return <UserForm formType="student" onSubmit={handleSubmit} />;
};

export default StudentForm;
