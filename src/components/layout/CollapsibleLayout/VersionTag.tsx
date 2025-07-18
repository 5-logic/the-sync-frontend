'use client';

import packageJson from '../../../../package.json';
import { Tag } from 'antd';
import React, { useEffect, useState } from 'react';

interface VersionTagProps {
	readonly collapsed?: boolean;
}

const borderColors = [
	{ color: '#ff6b6b', shadow: 'rgba(255, 107, 107, 0.6)' },
	{ color: '#4ecdc4', shadow: 'rgba(78, 205, 196, 0.6)' },
	{ color: '#45b7d1', shadow: 'rgba(69, 183, 209, 0.6)' },
	{ color: '#96ceb4', shadow: 'rgba(150, 206, 180, 0.6)' },
	{ color: '#feca57', shadow: 'rgba(254, 202, 87, 0.6)' },
	{ color: '#ff9ff3', shadow: 'rgba(255, 159, 243, 0.6)' },
];

export const VersionTag: React.FC<VersionTagProps> = ({ collapsed }) => {
	const [colorIndex, setColorIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setColorIndex((prev) => (prev + 1) % borderColors.length);
		}, 500); // Change color every 500ms

		return () => clearInterval(interval);
	}, []);

	if (collapsed) return null;

	const currentColor = borderColors[colorIndex];

	return (
		<>
			<style jsx>{`
				@keyframes rainbow-text {
					0% {
						background-position: 0% 50%;
					}
					25% {
						background-position: 100% 50%;
					}
					50% {
						background-position: 200% 50%;
					}
					75% {
						background-position: 100% 50%;
					}
					100% {
						background-position: 0% 50%;
					}
				}

				.version-text {
					animation: rainbow-text 4s ease-in-out infinite;
				}
			`}</style>
			<div
				style={{
					padding: '8px 12px',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					borderTop: '1px solid #f0f0f0',
					background: 'rgba(250, 250, 250, 0.8)',
				}}
			>
				<Tag
					style={{
						border: `1px solid ${currentColor.color}`,
						borderRadius: '8px',
						padding: '3px 10px',
						fontSize: '11px',
						fontWeight: '600',
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(10px)',
						position: 'relative',
						overflow: 'hidden',
						cursor: 'default',
						transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
						letterSpacing: '0.3px',
						boxShadow: `0 0 8px ${currentColor.shadow}, 0 1px 4px rgba(0, 0, 0, 0.06)`,
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)';
						e.currentTarget.style.boxShadow = `0 0 12px ${currentColor.shadow}, 0 3px 12px rgba(0, 0, 0, 0.1)`;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = 'scale(1) translateY(0)';
						e.currentTarget.style.boxShadow = `0 0 8px ${currentColor.shadow}, 0 1px 4px rgba(0, 0, 0, 0.06)`;
					}}
				>
					<span
						className="version-text"
						style={{
							background:
								'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #ff6b6b)',
							backgroundSize: '300% 300%',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
							display: 'inline-block',
							textAlign: 'center',
						}}
					>
						v{packageJson.version}
					</span>
				</Tag>
			</div>
		</>
	);
};
