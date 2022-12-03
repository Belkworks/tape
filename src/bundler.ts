import { readdir, readFile, stat, writeFile } from 'fs/promises';
import { basename, extname, relative, resolve } from 'path';

import { Node, NodeType } from './node';
import {
	footerString,
	headerString,
	polyfillString,
	stringifyJSON,
	stringifyModule,
	stringifyTree,
} from './strings';

type TransformerEntry = {
	ext: string | string[];
	transform: (content: string, name: string, relative: string) => string;
};

const TRANSFORMERS: TransformerEntry[] = [
	{
		ext: ['.lua', '.luau'],
		transform: (content, name, rel) => stringifyModule(name, rel, content),
	},
	{
		ext: '.json',
		transform: (content, name, rel) => stringifyJSON(name, rel, content),
	},
	{
		ext: '.txt',
		transform: (content, name, rel) => stringifyJSON(name, rel, JSON.stringify(content)),
	}
];

const getTransformer = (extension: string) => {
	return TRANSFORMERS.find(({ ext }) => {
		if (Array.isArray(ext)) return ext.includes(extension);
		return ext == extension;
	});
}

const shouldBundle = (basename: string) => {
	const extension = extname(basename);
	return getTransformer(extension) != undefined;
};

const explore2 = async (directory: string, verbose: boolean, node?: Node) => {
	if (!node) node = new Node(NodeType.Folder, directory);

	const entries = await readdir(directory, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isFile()) continue;

		if (!shouldBundle(entry.name)) {
			if (verbose) console.log(`IGNORE '${entry.name}'`);
			continue;
		}

		if (verbose) console.log(`ADD '${entry.name}'`);
		const path = resolve(directory, entry.name);
		node.getChildNode(NodeType.Module, path);
	}

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;

		if (verbose) console.log(`EXPLORE '${entry.name}'`);
		const path = resolve(directory, entry.name);
		const child = node.getChildNode(NodeType.Folder, path);
		await explore2(path, verbose, child);
		if (!child.hasChildren()) {
			if (verbose) console.log(`CULL '${entry.name}'`);
			node.children.delete(child);
		}
	}

	return node;
};

const initify = (node: Node) => {
	const init = node.findFirstChild('init.lua');
	if (init && init.type == NodeType.Module) {
		// move node's children to init
		for (const child of node.children) {
			if (child == init) continue;
			init.addChild(child);
		}

		init.basename = node.basename;

		// remove node's children
		node.children.clear();
		node = init;
	}

	const children = [...node.children].map(initify);

	node.children.clear();
	for (const child of children) node.addChild(child);

	return node;
};

const printTree = (node: Node, indent = 0) => {
	const prefix = ' '.repeat(indent * 4);
	console.log(`${prefix}${node.toString()}`);
	for (const child of node.children) printTree(child, indent + 1);
	if (indent == 0) console.log();
};

type BundleOptions = {
	verbose: boolean;
	output: string;
};

type TreeEntry = [string, string | undefined];

type Tree = [TreeEntry, Tree[]];

export const bundle = async (path: string, options: BundleOptions) => {
	// resolve path
	const resolved = resolve(path);

	// make sure path is a directory
	const stats = await stat(path);
	if (!stats.isDirectory()) throw new Error('target is not a directory!');

	// traverse directory
	console.log('Exploring...');
	const root = await explore2(resolved, options.verbose);

	// print tree
	if (options.verbose) {
		console.log('\nbase tree:');
		printTree(root);
	}

	// initify
	console.log('Initifying...');
	const initified = initify(root);

	// print initified tree
	if (options.verbose) {
		console.log('\ninitified tree:');
		printTree(initified);
	}

	// ensure root is a module
	if (initified.type != NodeType.Module)
		throw new Error('bundle has no entrypoint!');

	// bundle
	const entries = initified.flatten();
	const modules = entries.filter((node) => node.type == NodeType.Module);

	const output = [headerString, polyfillString.trim()];

	const names = new Map<Node, string>();

	for (const module of modules) {
		const rel = relative(resolved, module.path);
		const ext = extname(rel);
		const name = JSON.stringify(rel.replace(/\\/g, '/'));
		names.set(module, name.substring(1, name.length - 1));
		const content = await readFile(module.path, 'utf-8');

		const transformer = getTransformer(ext);
		if (!transformer) {
			console.warn(`No transformer for '${ext}'`);
			continue;
		}

		const chunk = transformer.transform(content, name, rel);
		output.push(chunk);
	}

	const makeTree = (node: Node): Tree => {
		const children = [...node.children].map(makeTree);
		const name = basename(node.basename, extname(node.basename));
		return [[name, names.get(node)], children];
	};

	// assemble tree
	const tree = makeTree(initified);
	output.push(stringifyTree(tree));

	// append footer
	output.push(footerString);

	// write output
	const dest = resolve(options.output);
	await writeFile(
		dest,
		output.map((s) => s.trim()).join('\n\n') + '\n',
		'utf-8',
	);

	console.log('Done!'); // TODO: show time, summary
};
