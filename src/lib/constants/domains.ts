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
	return [...THESIS_DOMAINS].sort();
};

/**
 * Check if a domain is valid
 */
export const isValidDomain = (domain: string): domain is ThesisDomain => {
	return THESIS_DOMAINS.includes(domain as ThesisDomain);
};
