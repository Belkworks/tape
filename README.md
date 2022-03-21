# Tape

_A Lua bundler supporting JSON, TOML, MoonScript, and more._

## Installation

With npm:

```
npm install -g tape
```

with pnpm:

```
pnpm add -g tape
```

## Usage

```
tape [options] [target...]
```

## Options

```
-V, --version          output the version number
-d --dir <dir>         target directory (default: "src")
-v --verbose           enable verbose output (default: false)
--main <name>          lua entrypoint (default: "init")
-o --output <path>     output file (default: "dist.lua")
-s --separator <char>  module separator (default: "/")
-h, --help             display help for tape
```

## Supported filetypes

-   `.lua`
-   `.moon` (requires `moonc` in path)
-   `.json`
-   `.toml`
-   `.csv`
-   `.env`
