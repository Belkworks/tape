import { basename } from 'path';

export enum NodeType {
	Folder,
	Module,
}

export class Node {
	readonly children = new Set<Node>();

	basename = basename(this.path);

	constructor(public readonly type: NodeType, readonly path: string) {}

	addChild(node: Node) {
		this.children.add(node);
		return node;
	}

	getChildNode(type: NodeType, path: string) {
		const node = new Node(type, path);
		return this.addChild(node);
	}

	hasChildren() {
		return this.children.size > 0;
	}

	toString() {
		return this.basename + (this.type == NodeType.Folder ? ' (dir)' : '');
	}

	private find(predicate: (node: Node) => boolean) {
		for (const child of this.children) {
			if (predicate(child)) return child;
		}

		return undefined;
	}

	findFirstChild(basename: string) {
		return this.find((node) => node.basename == basename);
	}

	flatten() {
		const nodes: Node[] = [this];
		for (const child of this.children) {
			const children = child.flatten();
			for (const child of children) nodes.push(child);
		}
		return nodes;
	}
}
