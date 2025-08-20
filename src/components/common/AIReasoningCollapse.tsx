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
									// Process each line to handle text formatting
									const processedLine = line
										.split(/'([^']*)'/)
										.map((part, partIndex) => {
											// If index is odd, it's text within single quotes - make it bold
											if (partIndex % 2 === 1) {
												return (
													<strong key={`${index}-${partIndex}`}>{part}</strong>
												);
											}
											return part;
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
