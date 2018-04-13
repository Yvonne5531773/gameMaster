import App from '../App'

const player = r => require.ensure([], () => r(require('../views/index/VIndex')), 'player')

export default [{
	path: '/',
	component: App,
	children: [
		{
			path: '',
			redirect: '/player'
		},
		{
			path: '/player',
			component: player,
		},
	]
}]