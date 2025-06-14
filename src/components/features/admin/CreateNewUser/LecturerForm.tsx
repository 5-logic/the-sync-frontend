'use client';

import UserForm from './UserForm';

const LecturerForm = () => {
	const handleSubmit = (values: Record<string, unknown>) => {
		console.log(values);
	};

	return <UserForm formType="lecturer" onSubmit={handleSubmit} />;
};

export default LecturerForm;
