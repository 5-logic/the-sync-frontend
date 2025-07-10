/**
 * List of available thesis domains
 * Used for filtering and categorizing thesis topics
 */
export const THESIS_DOMAINS = [
	'Artificial Intelligence',
	'Machine Learning',
	'Data Science',
	'Web Development',
	'Mobile Development',
	'Blockchain',
	'Cybersecurity',
	'Cloud Computing',
	'Internet of Things (IoT)',
	'Software Engineering',
	'Database Management',
	'Network Security',
	'Game Development',
	'DevOps',
	'UI/UX Design',
	'Computer Vision',
	'Natural Language Processing',
	'Big Data Analytics',
	'Robotics',
	'Virtual Reality',
	'Augmented Reality',
	'E-commerce',
	'Fintech',
	'Healthcare Technology',
	'Education Technology',
	'Green Technology',
	'Smart City',
	'Supply Chain Management',
	'Digital Marketing',
	'Business Intelligence',
] as const;

export type ThesisDomain = (typeof THESIS_DOMAINS)[number];

/**
 * Get sorted list of domains for dropdown/select components
 */
export const getSortedDomains = (): string[] => {
	return [...THESIS_DOMAINS].sort((a, b) => a.localeCompare(b));
};

/**
 * Check if a domain is valid
 */
export const isValidDomain = (domain: string): domain is ThesisDomain => {
	return THESIS_DOMAINS.includes(domain as ThesisDomain);
};

/**
 * Create domain color mapping with better coverage for all thesis domains
 */
const createDomainColorMap = (): Record<string, string> => {
	const colorOptions = [
		'blue',
		'geekblue',
		'purple',
		'magenta',
		'red',
		'volcano',
		'orange',
		'gold',
		'lime',
		'green',
		'cyan',
	];

	const map: Record<string, string> = {};

	THESIS_DOMAINS.forEach((domain, index) => {
		map[domain] = colorOptions[index % colorOptions.length];
	});

	// Specific mappings for all domains
	map['Artificial Intelligence'] = 'geekblue';
	map['Machine Learning'] = 'purple';
	map['Data Science'] = 'purple';
	map['Web Development'] = 'blue';
	map['Mobile Development'] = 'green';
	map['Blockchain'] = 'cyan';
	map['Cybersecurity'] = 'red';
	map['Cloud Computing'] = 'volcano';
	map['Internet of Things (IoT)'] = 'gold';
	map['Software Engineering'] = 'blue';
	map['Database Management'] = 'geekblue';
	map['Network Security'] = 'red';
	map['Game Development'] = 'magenta';
	map['DevOps'] = 'orange';
	map['UI/UX Design'] = 'lime';
	map['Computer Vision'] = 'geekblue';
	map['Natural Language Processing'] = 'purple';
	map['Big Data Analytics'] = 'volcano';
	map['Robotics'] = 'cyan';
	map['Virtual Reality'] = 'magenta';
	map['Augmented Reality'] = 'magenta';
	map['E-commerce'] = 'green';
	map['Fintech'] = 'gold';
	map['Healthcare Technology'] = 'red';
	map['Education Technology'] = 'blue';
	map['Green Technology'] = 'green';
	map['Smart City'] = 'cyan';
	map['Supply Chain Management'] = 'orange';
	map['Digital Marketing'] = 'lime';
	map['Business Intelligence'] = 'volcano';

	return map;
};

/**
 * Domain color mapping for tags and UI elements
 */
export const DOMAIN_COLOR_MAP: Readonly<Record<string, string>> =
	createDomainColorMap();
