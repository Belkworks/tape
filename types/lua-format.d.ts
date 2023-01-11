declare module 'lua-format'{
	type MinifyOptions = {
		RenameVariables: boolean,
		RenameGlobals: boolean,
		SolveMath: boolean
	}

	export const Minify: (code: string, opts: MinifyOptions) => string;
}