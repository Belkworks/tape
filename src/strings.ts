
export const headerString = `-- bundled with tape`;

export const polyfillString = `
local __tape = {
	http = game:GetService('HttpService'),
	import = require,
	chunks = {}, -- string -> function
	cache = {}, -- string -> any
	scripts = {} -- script -> instance -> script
}

local function require(module)
	local import = __tape.import
	if typeof(module) == 'Instance' then
		local name = __tape.scripts[module]
		if name then module = name end
	end

	if typeof(module) ~= 'string' then
		return import(module)
	end

	local fn = __tape.chunks[module]
	if not fn then
		error(('tape: module %s not found'):format(module))
	end

	local cache = __tape.cache[module]
	if cache then
		return cache.value
	end

	local s, e = pcall(fn, __tape.scripts[module])
	if not s then
		error(('tape: error executing %s: %s'):format(module, e))
	end

	__tape.cache[module] = { value = e }
	return e
end

__tape.json = function(str)
	return function()
		return __tape.http:JSONDecode(str)
	end
end

__tape.buildTree = function(str)
	local function recurse(t, parent)
		local pair, children = unpack(t)
		local name, link = unpack(pair)
		local proxy = Instance.new(link and 'ModuleScript' or 'Folder')
		proxy.Parent = parent
		proxy.Name = name
		if link then
			__tape.scripts[proxy] = link
			__tape.scripts[link] = proxy
		end
		for _, v in pairs(children) do recurse(v, proxy) end
		return proxy
	end
	recurse(__tape.http:JSONDecode(str))
end
`;

export const stringifyModule = (name: string, path: string, script: string) => {
	return `
-- module: ${path}
__tape.chunks[${name}] = function(script)
${script.trim()}
end
`;
};

export const stringifyJSON = (name: string, path: string, json: string) => {
	const str = JSON.stringify(JSON.stringify(JSON.parse(json)));
	return `
-- json: ${path}
__tape.chunks[${name}] = __tape.json(${str})	
`;
};

export const stringifyTree = (json: unknown) => {
	const str = JSON.stringify(JSON.stringify(json));
	return `
-- tree
__tape.buildTree(${str})
`;
};

export const footerString = 'return require("init.lua")';
