export default function StudentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Student Dashboard</h2>
			{children}
		</div>
	);
}
