
# Tape
*A bundler for Lua supporting MoonScript, TOML, and more.*


## Installation
1. Install coffeescript with `npm i -g coffeescript`
2. Clone this repository and enter it.
3. Run `npm install`
4. Use `coffee tape ...` to bundle your project

## Usage
```sh
coffee tape [targets...]
```

## Options
- `-d, --dir <path = '.'>`: Specify the base directory. All targets are relative to this.
- `-o, --output <path = 'dist.lua'>`: Specify the output file (overwritten each time, not relative to base directory)
- `-s, --separator <char = '/'>`: Specify the module separator.
- `-p, --prelude <path>`: Specify a file to put before all modules (not relative to base directory)
- `-m, --main <name = "main">`: Specify the main file
- `-v, --verbose`: Display debug information during bundling

## Common Setups
If you have a directory called **src**, with two folders **a** and **b** in it, you can bundle them like so:
```
coffee tape -d src a b
```

If you just want to bundle a single directory called **src**, use a `.` as the only target.
```
coffee tape -d src .
```
I suggest putting whatever command works for your setup in a `build.bat` script.

## Supported Filetypes
**Tape** automatically converts all files to Lua during bundling.
- `.lua`
- `.moon` (requires `moonc` in path)
- `.toml`
- `.csv`
- `.txt`
- `.json`

