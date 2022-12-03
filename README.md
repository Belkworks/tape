# Tape

_A bundler for Lua._

## Installation

with **[pnpm](https://pnpm.io/)**:
```sh
pnpm add -g tape-lua
```

with npm:
```sh
npm install -g tape-lua
```

# Usage

```sh
tape [directory] [options]
```

### Options
```
-v --verbose        enable verbose output (default: false)
-o --output <path>  output file (default: "dist.lua")
-h --help           display help for tape
```

# Project Structure

Your target directory **MUST** have a file named `init.lua`.

# Supported Extensions
- `.lua`
- `.luau`
- `.txt`
- `.json`
