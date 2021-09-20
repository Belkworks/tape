PRELUDE = """
-- tape: require polyfill
local package = package or { }
package.preload = package.preload or { }
package.loaded = package.loaded or { }
package.loading = package.loading or { }
package.oldrequire = require
local require
require = function(mod)
  local _exp_0 = type(mod)
  if 'string' == _exp_0 then
    local R = package.loaded[mod]
    if R ~= nil then
      return R
    end
    local F = package.preload[mod]
    assert(F, "couldnt find bundled module: " .. tostring(mod))
    if package.loading[mod] then
      error("modules cant reference themselves: " .. tostring(mod))
    end
    package.loading[mod] = true
    local S, E = pcall(F)
    package.loading[mod] = false
    assert(S, "error loading module " .. tostring(mod) .. ": " .. tostring(E))
    package.loaded[mod] = E
    return E
  elseif 'userdata' == _exp_0 or 'number' == _exp_0 then
    return package.oldrequire(mod)
  else
    return error('bad arg to require!')
  end
end

"""

MODULE_TEMPLATE = """

-- module: {{{name}}}
package.preload["{{{name}}}"]=function()
{{{content}}}
end

"""

module.exports = {
  prelude: PRELUDE
  template: MODULE_TEMPLATE
}