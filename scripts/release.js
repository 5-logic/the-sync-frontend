#!/usr/bin/env node

/**
 * Release script for the-sync-frontend
 *
 * This script:
 * 1. Reads the current version from package.json
 * 2. Creates a git tag with the version
 * 3. Pushes the tag to the remote repository
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { exit } = require('process');

// ANSI color codes for terminal output
const COLORS = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	red: '\x1b[31m',
};

// Get the root directory of the project
const rootDir = path.resolve(__dirname, '..');

// Read package.json to get the current version
try {
	console.log(`${COLORS.blue}Reading package.json...${COLORS.reset}`);
	const packageJsonPath = path.join(rootDir, 'package.json');
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
	const currentVersion = packageJson.version;

	if (!currentVersion) {
		console.error(
			`${COLORS.red}Error: Could not find version in package.json${COLORS.reset}`,
		);
		exit(1);
	}

	console.log(
		`${COLORS.green}Current version: ${currentVersion}${COLORS.reset}`,
	);

	// Confirm with the user
	console.log(
		`${COLORS.yellow}Creating tag ${currentVersion} and pushing to remote...${COLORS.reset}`,
	);

	try {
		// Create a git tag with the current version
		execSync(`git tag -a ${currentVersion} -m "Release ${currentVersion}"`, {
			stdio: 'inherit',
			cwd: rootDir,
		});

		// Push the tag to the remote repository
		execSync('git push origin --tags', {
			stdio: 'inherit',
			cwd: rootDir,
		});

		console.log(
			`${COLORS.green}✅ Successfully created and pushed tag ${currentVersion}${COLORS.reset}`,
		);
	} catch (error) {
		console.error(
			`${COLORS.red}Error creating or pushing tag: ${error.message}${COLORS.reset}`,
		);
		console.log(
			'Make sure you have committed all changes before running this script.',
		);
		exit(1);
	}
} catch (error) {
	console.error(
		`${COLORS.red}Error reading package.json: ${error.message}${COLORS.reset}`,
	);
	exit(1);
}
