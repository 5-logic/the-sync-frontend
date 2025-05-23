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

// Check if the current branch is main
try {
	// Use spawn with full path to git and shell: false for security
	const gitPath =
		process.platform === 'win32'
			? 'C:\\Program Files\\Git\\cmd\\git.exe'
			: '/usr/bin/git';
	const gitResult = execSync(`"${gitPath}" rev-parse --abbrev-ref HEAD`, {
		encoding: 'utf8',
		cwd: rootDir,
		shell: false,
	}).trim();

	const currentBranch = gitResult;

	if (currentBranch !== 'main') {
		console.error(
			`${COLORS.red}Error: You must be on the 'main' branch to create a release. Current branch: ${currentBranch}${COLORS.reset}`,
		);
		exit(1);
	}
	console.log(`${COLORS.green}✓ Current branch is main${COLORS.reset}`);
} catch (error) {
	console.error(
		`${COLORS.red}Error checking git branch: ${error.message}${COLORS.reset}`,
	);
	exit(1);
}

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
		// Use full path to git and shell: false for security
		const gitPath =
			process.platform === 'win32'
				? 'C:\\Program Files\\Git\\cmd\\git.exe'
				: '/usr/bin/git';

		// Create a git tag with the current version
		console.log(
			`${COLORS.blue}Creating tag ${currentVersion}...${COLORS.reset}`,
		);
		execSync(
			`"${gitPath}" tag -a ${currentVersion} -m "Release ${currentVersion}"`,
			{
				stdio: 'inherit',
				cwd: rootDir,
				shell: false,
			},
		);

		// Push the tag to the remote repository
		console.log(`${COLORS.blue}Pushing tag to remote...${COLORS.reset}`);
		execSync(`"${gitPath}" push origin --tags`, {
			stdio: 'inherit',
			cwd: rootDir,
			shell: false,
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
