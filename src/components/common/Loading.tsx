import { Spin } from 'antd';

interface LoadingProps {
	message?: string;
	description?: string;
	type?: 'default' | 'error' | 'warning';
	size?: 'small' | 'default' | 'large';
}

export default function Loading({
	message = 'Loading...',
	description,
	type = 'default',
	size = 'large',
}: LoadingProps) {
	const textColors = {
		default: 'text-gray-600',
		error: 'text-red-600',
		warning: 'text-orange-600',
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<div className="text-center max-w-md mx-4">
				{/* ✅ SINGLE ANT DESIGN SPINNER */}
				<Spin size={size} />
				<h3 className={`mt-4 text-lg font-medium ${textColors[type]}`}>
					{message}
				</h3>
				{description && (
					<p className={`mt-2 text-sm ${textColors[type]} opacity-75`}>
						{description}
					</p>
				)}
			</div>
		</div>
	);
}
