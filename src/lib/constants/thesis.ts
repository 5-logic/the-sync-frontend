// Thesis Status Constants
export const THESIS_STATUS = {
	NEW: "New",
	PENDING: "Pending",
	APPROVED: "Approved",
	REJECTED: "Rejected",
} as const;

// Timing Constants
export const TIMING = {
	EXIT_DELAY: 300,
	REDIRECT_DELAY: 1000,
	NOTIFICATION_DELAY: 1000,
} as const;

// UI Constants
export const UI_CONSTANTS = {
	TABLE_WIDTHS: {
		TITLE: "36%",
		OWNER: "12%",
		DOMAIN: "12%",
		STATUS: "10%",
		DATE: "14%",
		ACTIONS: "16%",
	},
	TEXT_DISPLAY: {
		MAX_LINES: 3,
		LINE_HEIGHT: "1.5",
		MAX_HEIGHT: "4.5em", // 3 lines * 1.5 line-height
	},
} as const;

// Error Messages
export const ERROR_MESSAGES = {
	FETCH_FAILED: "Failed to load data. Please try again.",
	SUBMIT_FAILED: "Failed to submit thesis. Please try again.",
	DELETE_FAILED: "Failed to delete thesis. Please try again.",
	UPDATE_FAILED: "Failed to update thesis. Please try again.",
	APPROVE_FAILED: "Failed to approve thesis. Please try again.",
	REJECT_FAILED: "Failed to reject thesis. Please try again.",
	THESIS_NOT_FOUND: "The requested thesis could not be found.",
	GENERIC_ERROR: "An error occurred. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
	SUBMIT_SUCCESS: "Thesis submitted successfully for review.",
	DELETE_SUCCESS: "Thesis deleted successfully!",
	UPDATE_SUCCESS: "Thesis updated successfully!",
	APPROVE_SUCCESS: "The thesis has been approved successfully.",
	REJECT_SUCCESS: "The thesis has been rejected successfully.",
	CREATE_SUCCESS: "Thesis created successfully!",
} as const;

// Modal Titles
export const MODAL_TITLES = {
	DELETE_THESIS: "Delete Thesis",
	SUBMIT_THESIS: "Submit Thesis for Review",
	APPROVE_THESIS: "Approve Thesis",
	REJECT_THESIS: "Reject Thesis",
} as const;

// Status Colors
export const STATUS_COLORS = {
	[THESIS_STATUS.NEW]: "cyan",
	[THESIS_STATUS.PENDING]: "gold",
	[THESIS_STATUS.APPROVED]: "green",
	[THESIS_STATUS.REJECTED]: "red",
} as const;

// Action Button Props
export const BUTTON_STATES = {
	NOT_YOUR_THESIS: "Not Your Thesis",
	REGISTER_SUBMIT: "Register Submit",
	ALREADY_SUBMITTED: "Already Submitted",
	CANNOT_SUBMIT: "Cannot Submit",
} as const;

export type ThesisStatus = (typeof THESIS_STATUS)[keyof typeof THESIS_STATUS];
