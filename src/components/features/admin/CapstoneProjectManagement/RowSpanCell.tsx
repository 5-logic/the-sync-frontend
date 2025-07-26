import React from 'react';

// Helper function to get rowSpan for onCell
export const getRowSpan = (rowSpan: number) => ({ rowSpan });

// Content renderer for cells with rowSpan
export const RowSpanCell = (content: React.ReactNode) => content;
