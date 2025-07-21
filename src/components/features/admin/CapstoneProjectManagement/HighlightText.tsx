import React from 'react';

export const highlightText = (text: string, searchTerm: string) => {
	if (!searchTerm) return text;
	const regex = new RegExp(`(${searchTerm})`, 'gi');
	const parts = text.split(regex);
	return parts.map((part, index) =>
		regex.test(part) ? (
			<mark
				key={`${part}-${index}`}
				style={{ backgroundColor: '#fff2b8', padding: 0 }}
			>
				{part}
			</mark>
		) : (
			part
		),
	);
};
