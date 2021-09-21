# utils

_ = require 'lodash'
{ log } = console

unwrap = (str) -> str.substring 1, str.length - 1

toLuaKey = (str) ->
	s = JSON.stringify str
	if parseInt str
		"[#{s}]"
	else if str == unwrap s
		str
	else s

toLua = (obj) ->
	return 'nil' if _.isNil obj
	return (JSON.stringify obj) or 'nil' unless typeof obj == 'object'

	isArray = _.isArray obj
	content = _.chain(obj).map((v, k) ->
		v = toLua v
		if isArray
			v
		else
			k = toLuaKey k
			"#{k}=#{v}" 
	).join(',').value()

	"{#{content}}"

retLua = (obj) ->
	"return #{toLua obj}"

module.exports = {
	toLua
	retLua
}
