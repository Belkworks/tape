import { Command } from 'commander';

const program = new Command('tape');

program
	.version('0.0.1')
	.option('-d --dir <dir>', 'target directory', 'src')
	.option('-v --verbose', 'enable verbose output')
	.option('--main', 'lua entrypoint', 'init.lua');

program.parse();
