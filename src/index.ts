#!/usr/bin/env node

import { Command } from 'commander';

import { bundle } from './bundler';

const program = new Command('tape');

program
	.argument('[target]', 'target folder to bundle')
	.option('-v --verbose', 'enable verbose output', false)
	.option('-o --output <path>', 'output file', 'dist.lua')
	.helpOption('-h --help', 'display help for tape');

program.parse();

(async () => {
	try {
		await bundle(program.args[0] as string, program.opts());
	} catch (error) {
		if (error instanceof Error)
			console.error('Bundle error:', error.message);
	}
})().catch(console.error);
