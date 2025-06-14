import Image from 'next/image';
import React from 'react';

const Logo: React.FC = () => (
	<div className="flex items-center space-x-2">
		<Image
			src="/images/TheSync_logo.png"
			alt="TheSync Logo"
			width={32}
			height={32}
			className="w-8 h-8 object-contain"
			priority
		/>
		<span className="text-2xl font-bold text-blue-700">TheSync</span>
	</div>
);

export default Logo;
