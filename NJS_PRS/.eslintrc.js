module.exports = {
	'env': {
		'browser': true,
		'es6': true,
		'node': true
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'sourceType': 'module'
	},
	'rules': {
		'indent': [0],
		'linebreak-style': [
			'error',
			'unix'
		],
		'semi': [0],
		'no-useless-escape': 'off',
		'no-cond-assign': 'off',
		'no-console': 'off',
		"no-unused-vars": 0,
		'no-mixed-spaces-and-tabs': [0],
	}
};