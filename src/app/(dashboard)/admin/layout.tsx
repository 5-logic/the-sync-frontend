export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
			{children}
		</div>
	);
}
