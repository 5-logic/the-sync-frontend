import { Collapse, Typography } from "antd";

interface AIReasoningCollapseProps {
	readonly reason: string;
	readonly style?: React.CSSProperties;
}

export default function AIReasoningCollapse({
	reason,
	style,
}: AIReasoningCollapseProps) {
	return (
		<Collapse
			size="small"
			style={{
				borderColor: "#1890ff",
				backgroundColor: "#f6ffed",
				...style,
			}}
			items={[
				{
					key: "ai-analysis",
					label: (
						<Typography.Text strong style={{ color: "#1890ff" }}>
							🤖 AI Analysis & Reasoning
						</Typography.Text>
					),
					children: (
						<Typography.Paragraph
							style={{
								margin: 0,
								lineHeight: "1.6",
							}}
						>
							{reason
								.replace(/\n{2,}/g, "\n")
								.split("\n")
								.map((line, index, array) => {
									// Process line to format:
									// 1. Single quotes (excluding possessive 's)
									// 2. Markdown bold (**text**)

									// First, handle markdown bold formatting (**text**)
									const parts: (string | JSX.Element)[] = [];
									let lastIndex = 0;
									const boldPattern = /\*\*([^*]+)\*\*/g;
									let match;

									// Extract bold patterns
									while ((match = boldPattern.exec(line)) !== null) {
										// Add text before the match
										if (match.index > lastIndex) {
											parts.push(line.substring(lastIndex, match.index));
										}

										// Add the bold text
										parts.push(
											<strong key={`bold-${index}-${match.index}`}>
												{match[1]}
											</strong>,
										);

										lastIndex = match.index + match[0].length;
									}

									// Add remaining text
									if (lastIndex < line.length) {
										parts.push(line.substring(lastIndex));
									}

									// Now process each string part for single quotes
									// but exclude possessive 's patterns
									const processedLine = parts.map((part, partIndex) => {
										if (typeof part !== "string") {
											return part; // Already a JSX element
										}

										// Handle single quotes, but exclude possessive 's
										// Look for pattern: 'text' but not word's or students' etc.
										const quoteFragments: (string | JSX.Element)[] = [];
										const quotePattern =
											/'((?:[^']|(?<=\w)'(?=s\b)|(?<=s)'(?=\s|$))+)'/g;
										let quoteMatch;
										let quoteLastIndex = 0;

										while ((quoteMatch = quotePattern.exec(part)) !== null) {
											// Check if this is a possessive 's or pluralized possessive
											const isPossessive =
												/\w's\b/.test(quoteMatch[0]) || // word's
												/\ws'\s/.test(quoteMatch[0]) || // words'
												/\ws'$/.test(quoteMatch[0]); // words' at end of string

											if (isPossessive) {
												// This is a possessive form, not a quote
												if (quoteMatch.index > quoteLastIndex) {
													quoteFragments.push(
														part.substring(
															quoteLastIndex,
															quoteMatch.index + quoteMatch[0].length,
														),
													);
												}
											} else {
												// Add text before the quote
												if (quoteMatch.index > quoteLastIndex) {
													quoteFragments.push(
														part.substring(quoteLastIndex, quoteMatch.index),
													);
												}

												// Add the quoted text as bold
												quoteFragments.push(
													<strong
														key={`quote-${index}-${partIndex}-${quoteMatch.index}`}
													>
														{quoteMatch[1]}
													</strong>,
												);
											}

											quoteLastIndex = quoteMatch.index + quoteMatch[0].length;
										}

										// Add remaining text
										if (quoteLastIndex < part.length) {
											quoteFragments.push(part.substring(quoteLastIndex));
										}

										return quoteFragments.length > 0 ? quoteFragments : part;
									});

									return (
										<span key={`line-${index}-${line.slice(0, 20)}`}>
											{processedLine}
											{index < array.length - 1 && <br />}
										</span>
									);
								})}
						</Typography.Paragraph>
					),
				},
			]}
		/>
	);
}
