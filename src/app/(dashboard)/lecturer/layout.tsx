export default function LecturerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Lecturer Dashboard</h2>
			{children}
		</div>
	);
}
