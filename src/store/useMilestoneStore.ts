import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import milestoneService from '@/lib/services/milestones.service';
import { showNotification } from '@/lib/utils/notification';
import {
	Milestone,
	MilestoneCreate,
	MilestoneUpdate,
} from '@/schemas/milestone';

interface MilestoneState {
	// Data
	milestones: Milestone[];
	currentMilestone: Milestone | null;
	filteredMilestones: Milestone[];
	// Loading states
	loading: boolean;
	creating: boolean;
	updating: boolean;

	// UI states
	selectedSemesterId: string | null;
	searchText: string;
	// Actions
	fetchMilestones: () => Promise<void>;
	fetchCurrentMilestone: () => Promise<void>;
	createMilestone: (data: MilestoneCreate) => Promise<boolean>;
	updateMilestone: (id: string, data: MilestoneUpdate) => Promise<boolean>;

	// Filters
	setSelectedSemesterId: (semesterId: string | null) => void;
	setSearchText: (text: string) => void;
	filterMilestones: () => void;

	// Utilities
	reset: () => void;
	getMilestoneById: (id: string) => Milestone | undefined;
}

export const useMilestoneStore = create<MilestoneState>()(
	devtools(
		(set, get) => ({
			// Initial state
			milestones: [],
			currentMilestone: null,
			filteredMilestones: [],
			loading: false,
			creating: false,
			updating: false,
			selectedSemesterId: null,
			searchText: '',

			// Actions
			fetchMilestones: async () => {
				set({ loading: true });
				try {
					const response = await milestoneService.findAll();
					if (response.success) {
						set({
							milestones: response.data,
							filteredMilestones: response.data,
						});
						get().filterMilestones();
					} else {
						showNotification.error(
							'Error',
							response.error || 'Failed to fetch milestones',
						);
					}
				} catch (error) {
					console.error('Error fetching milestones:', error);
					showNotification.error(
						'Error',
						'An unexpected error occurred while fetching milestones',
					);
				} finally {
					set({ loading: false });
				}
			},

			fetchCurrentMilestone: async () => {
				try {
					const response = await milestoneService.getCurrentMilestone();
					if (response.success) {
						set({ currentMilestone: response.data });
					}
				} catch (error) {
					console.error('Error fetching current milestone:', error);
				}
			},

			createMilestone: async (data: MilestoneCreate) => {
				set({ creating: true });
				try {
					const response = await milestoneService.create(data);
					if (response.success) {
						showNotification.success(
							'Success',
							'Milestone created successfully',
						);

						// Add to milestones array
						const newMilestone = response.data;
						set((state) => ({
							milestones: [...state.milestones, newMilestone],
						}));

						// Update filtered milestones
						get().filterMilestones();

						return true;
					} else {
						showNotification.error(
							'Error',
							response.error || 'Failed to create milestone',
						);
						return false;
					}
				} catch (error) {
					console.error('Error creating milestone:', error);
					showNotification.error(
						'Error',
						'An unexpected error occurred while creating milestone',
					);
					return false;
				} finally {
					set({ creating: false });
				}
			},

			updateMilestone: async (id: string, data: MilestoneUpdate) => {
				set({ updating: true });
				try {
					const response = await milestoneService.update(id, data);
					if (response.success) {
						showNotification.success(
							'Success',
							'Milestone updated successfully',
						);

						// Update milestone in array
						set((state) => ({
							milestones: state.milestones.map((milestone) =>
								milestone.id === id ? response.data : milestone,
							),
						}));

						// Update filtered milestones
						get().filterMilestones();

						return true;
					} else {
						showNotification.error(
							'Error',
							response.error || 'Failed to update milestone',
						);
						return false;
					}
				} catch (error) {
					console.error('Error updating milestone:', error);
					showNotification.error(
						'Error',
						'An unexpected error occurred while updating milestone',
					);
					return false;
				} finally {
					set({ updating: false });
				}
			},

			// Filters
			setSelectedSemesterId: (semesterId: string | null) => {
				set({ selectedSemesterId: semesterId });
				get().filterMilestones();
			},

			setSearchText: (text: string) => {
				set({ searchText: text });
				get().filterMilestones();
			},

			filterMilestones: () => {
				const { milestones, selectedSemesterId, searchText } = get();

				let filtered = milestones;

				// Filter by semester
				if (selectedSemesterId) {
					filtered = filtered.filter(
						(milestone) => milestone.semesterId === selectedSemesterId,
					);
				}

				// Filter by search text
				if (searchText) {
					const lowercaseSearch = searchText.toLowerCase();
					filtered = filtered.filter((milestone) =>
						milestone.name.toLowerCase().includes(lowercaseSearch),
					);
				}

				set({ filteredMilestones: filtered });
			},

			// Utilities
			reset: () => {
				set({
					milestones: [],
					currentMilestone: null,
					filteredMilestones: [],
					loading: false,
					creating: false,
					updating: false,
					selectedSemesterId: null,
					searchText: '',
				});
			},

			getMilestoneById: (id: string) => {
				return get().milestones.find((milestone) => milestone.id === id);
			},
		}),
		{
			name: 'milestone-store',
		},
	),
);
