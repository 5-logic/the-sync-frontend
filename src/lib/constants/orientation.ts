import { ThesisOrientation } from "@/schemas/_enums";

export const ORIENTATION_LABELS: Record<ThesisOrientation, string> = {
	SE: "Software Engineering Focus",
	AI: "Artificial Intelligence Focus",
	Neutral: "SE + AI (Neutral)",
};

export const ORIENTATION_DESCRIPTIONS: Record<ThesisOrientation, string> = {
	SE: "Focus on software development, system design, and engineering practices",
	AI: "Focus on machine learning, data science, and artificial intelligence",
	Neutral:
		"Combined focus on both Software Engineering and Artificial Intelligence",
};

export const ORIENTATION_COLORS: Record<ThesisOrientation, string> = {
	SE: "blue",
	AI: "purple",
	Neutral: "green",
};

export const getOrientationDisplay = (
	orientation?: ThesisOrientation | null,
) => {
	if (!orientation) return null;

	return {
		label: ORIENTATION_LABELS[orientation],
		description: ORIENTATION_DESCRIPTIONS[orientation],
		color: ORIENTATION_COLORS[orientation],
		value: orientation,
	};
};
