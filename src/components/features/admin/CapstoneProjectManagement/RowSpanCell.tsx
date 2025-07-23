import React from 'react';

export const RowSpanCell = (content: React.ReactNode, rowSpan: number) => ({
	children: content,
	props: { rowSpan },
});
