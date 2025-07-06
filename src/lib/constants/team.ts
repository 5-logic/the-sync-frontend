// Team configuration constants
export const TEAM_CONFIG = {
	MAX_MEMBERS: 5,
	MIN_MEMBERS: 4,
	SEARCH_DEBOUNCE_MS: 300,
} as const;

// Team UI styling constants
export const TEAM_STYLES = {
	searchResultsContainer: {
		border: '1px solid #d9d9d9',
		borderRadius: 6,
		marginTop: 4,
		maxHeight: 200,
		overflowY: 'auto' as const,
		backgroundColor: '#fff',
		zIndex: 1000,
	},
	searchResultItem: {
		padding: '8px 12px',
		cursor: 'pointer' as const,
		borderBottom: '1px solid #f0f0f0',
	},
	noResultsContainer: {
		padding: '12px',
		textAlign: 'center' as const,
		color: '#999',
		backgroundColor: '#f9f9f9',
		borderRadius: 6,
		marginTop: 4,
	},
	infoContainer: {
		color: '#1890ff',
		marginBottom: 24,
		padding: '8px 12px',
		background: '#f0f8ff',
		borderRadius: '4px',
		fontSize: '14px',
	},
} as const;
