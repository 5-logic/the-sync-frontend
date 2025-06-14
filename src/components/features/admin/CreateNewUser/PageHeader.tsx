const PageHeader = ({
	title,
	subtitle,
}: {
	title: string;
	subtitle: string;
}) => (
	<div className="mb-8 -ml-8 text-left">
		<h1 className="text-3xl font-bold">{title}</h1>
		<p className="text-gray-500">{subtitle}</p>
	</div>
);

export default PageHeader;
