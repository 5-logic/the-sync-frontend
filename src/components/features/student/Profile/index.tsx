export default function StudentProfile() {
	const data = {
		fullName: 'Alexander Thompson',
		studentCode: 'ST2023001',
		email: 'alexander.t@university.edu',
		gender: 'Male',
		phoneNumber: '+1 (555) 123-4567',
		major: 'Computer Science',
		roles: ['Researcher', 'Developer'],
		skills: [
			'Python',
			'React',
			'Java',
			'Machine Learning',
			'Data Analysis',
			'UX Design',
		],
		academicInterests: [
			'Artificial Intelligence and Machine Learning',
			'Human-Computer Interaction',
			'Data Visualization and Analytics',
			'Cloud Computing and Distributed Systems',
		],
		group: {
			name: 'AI Research Team',
			role: 'Team Leader',
		},
	};

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="bg-white shadow p-6 rounded-md">
				<h2 className="text-xl font-bold mb-2">{data.fullName}</h2>
				<p className="text-sm">ID: {data.studentCode}</p>
				<p className="text-sm">Major: {data.major}</p>
				<p className="text-sm">Email: {data.email}</p>
				<p className="text-sm">Phone: {data.phoneNumber}</p>
				<p className="text-sm">Gender: {data.gender}</p>
				<p className="text-sm">Roles: {data.roles.join(', ')}</p>
			</div>

			{/* Skills */}
			<div className="bg-white shadow p-6 rounded-md">
				<h3 className="text-lg font-semibold mb-2">Skills</h3>
				<div className="flex flex-wrap gap-2">
					{data.skills.map((skill) => (
						<span
							key={skill}
							className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
						>
							{skill}
						</span>
					))}
				</div>
			</div>

			{/* Academic Interests */}
			<div className="bg-white shadow p-6 rounded-md">
				<h3 className="text-lg font-semibold mb-2">Academic Interests</h3>
				<ul className="list-disc pl-6 space-y-1">
					{data.academicInterests.map((interest) => (
						<li key={interest}>{interest}</li>
					))}
				</ul>
			</div>

			{/* Group */}
			<div className="bg-white shadow p-6 rounded-md">
				<h3 className="text-lg font-semibold mb-2">Group Membership</h3>
				<p className="mb-1">{data.group.name}</p>
				<p className="text-sm text-gray-600">Role: {data.group.role}</p>
				<a
					href="#"
					className="text-blue-600 hover:underline text-sm mt-2 inline-block"
				>
					View Group Details
				</a>
			</div>
		</div>
	);
}
