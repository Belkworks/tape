
print('hello world')
print(script, script.folder)

script.Parent = workspace

local add = require(script.util).add
assert(add(1,2) == 3, 'add(1,2) == 3')

local key = require('key.txt')
assert(key == 'value', 'key.txt is not value')
