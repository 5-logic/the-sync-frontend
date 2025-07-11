import { TEAM_CONFIG } from '@/lib/constants';
import type { Student } from '@/schemas/student';

interface ValidationResult {
	isValid: boolean;
	errorMessage?: string;
}

export class MemberManagementUtils {
	/**
	 * SIMPLE validation for CREATE GROUP mode - no complex logic
	 */
	static validateAddMemberCreateGroup(
		targetStudent: Student,
		members: Student[],
		currentUserId?: string,
	): ValidationResult {
		// Check if trying to add self
		if (currentUserId && targetStudent.id === currentUserId) {
			return {
				isValid: false,
				errorMessage: 'You cannot add yourself to the team.',
			};
		}

		// Check if already in selected members
		const isAlreadySelected = members.some(
			(member) => member.id === targetStudent.id,
		);
		if (isAlreadySelected) {
			return {
				isValid: false,
				errorMessage: 'This student is already selected.',
			};
		}

		// Check member limit for create group (simple: members + leader + new one)
		const totalMembersAfterAdd = members.length + 1 + 1; // +1 leader, +1 new
		if (totalMembersAfterAdd > TEAM_CONFIG.MAX_MEMBERS) {
			return {
				isValid: false,
				errorMessage: `Group can have maximum ${TEAM_CONFIG.MAX_MEMBERS} members`,
			};
		}

		return { isValid: true };
	}

	/**
	 * COMPLEX validation for EXISTING GROUP mode - with exclude logic
	 */
	static validateAddMemberExistingGroup(
		targetStudent: Student,
		members: Student[],
		currentMemberCount: number,
		excludeUserIds: Set<string>,
		currentUserId?: string,
	): ValidationResult {
		// Check if trying to add self
		if (currentUserId && targetStudent.id === currentUserId) {
			return {
				isValid: false,
				errorMessage: 'You cannot add yourself to the team.',
			};
		}

		// Check if student is already a group member
		if (excludeUserIds.has(targetStudent.id)) {
			return {
				isValid: false,
				errorMessage: 'This student is already a group member.',
			};
		}

		// Check if already in selected members to invite
		const isAlreadySelected = members.some(
			(member) => member.id === targetStudent.id,
		);
		if (isAlreadySelected) {
			return {
				isValid: false,
				errorMessage: 'This student is already selected.',
			};
		}

		// Check member limit for existing group
		const totalMembersAfterAdd = currentMemberCount + members.length + 1;
		if (totalMembersAfterAdd > TEAM_CONFIG.MAX_MEMBERS) {
			return {
				isValid: false,
				errorMessage: `Group would have ${totalMembersAfterAdd} members, exceeding limit of ${TEAM_CONFIG.MAX_MEMBERS}`,
			};
		}

		return { isValid: true };
	}

	/**
	 * SIMPLE info text for CREATE GROUP mode
	 */
	static generateInfoTextCreateGroup(members: Student[]): string {
		const totalWithLeader = members.length + 1;
		if (totalWithLeader >= TEAM_CONFIG.MAX_MEMBERS) {
			return `Team is full (${TEAM_CONFIG.MAX_MEMBERS}/${TEAM_CONFIG.MAX_MEMBERS} members)`;
		}

		const remaining = TEAM_CONFIG.MAX_MEMBERS - totalWithLeader;
		return `You can add ${remaining} more member${remaining !== 1 ? 's' : ''} (${totalWithLeader}/${TEAM_CONFIG.MAX_MEMBERS} members)`;
	}

	/**
	 * COMPLEX info text for EXISTING GROUP mode
	 */
	static generateInfoTextExistingGroup(
		members: Student[],
		currentMemberCount: number,
	): string {
		return `💡 Current group has ${currentMemberCount} members. Select students to invite (Selected: ${members.length} to invite)`;
	}
}
