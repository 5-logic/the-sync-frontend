'use client';

import UserForm from './UserForm';

const StudentForm = () => {
	const handleSubmit = (values: Record<string, unknown>) => {
		console.log(values);
	};

	return <UserForm formType="student" onSubmit={handleSubmit} />;
};

export default StudentForm;
