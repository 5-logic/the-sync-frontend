export default function AuthLayout({
	children,
}: {
	readonly children: React.ReactNode;
}) {
	return <div className="min-h-screen bg-gray-50">{children}</div>;
}
