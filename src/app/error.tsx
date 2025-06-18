'use client';

import { Button, Result } from 'antd';
import { useEffect } from 'react';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error, reset }: Readonly<ErrorProps>) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error('Application error:', error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<Result
				status="500"
				title="500"
				subTitle="Sorry, something went wrong."
				extra={
					<Button type="primary" onClick={reset}>
						Try again
					</Button>
				}
			/>
		</div>
	);
}
