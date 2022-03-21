import { Command } from 'commander';

const program = new Command('tape');

program
	.version('0.0.1')
	.argument('[target...]', 'targets to bundle')
	.option('-d --dir <dir>', 'target directory', 'src')
	.option('-v --verbose', 'enable verbose output', false)
	.option('--main <name>', 'lua entrypoint', 'init')
	.option('-o --output <path>', 'output file', 'dist.lua')
	.option('-s --separator <char>', 'module separator', '/')
	.helpOption('-h --help', 'display help for tape');

program.parse();
