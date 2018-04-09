import { mapMutations } from 'vuex'
import { worker } from 'api/worker'
import { host } from 'config/index'
import { setStore, getStore, createHexRandom } from 'utils/index'
import PlayerConstructor from 'byted-toutiao-player'
import weixin from '../weixin/index'

export default {
	...mapMutations(['SET_COMPONENT', 'SET_VIDEO_ID']),

	setComponent (component) {
		this.SET_COMPONENT({component: component})
	},

	setVideoId (videoId = '') {
		console.log('setVideoId videoId', videoId)
		this.SET_VIDEO_ID({videoId: videoId})
	},

	fetch (url = '', data = {}) {
		return worker.work(url, data)
	},

	getPlayer (criteria) {
		return new PlayerConstructor(criteria)
	},

	weixinInit () {
		weixin.init()
	},

	getId (type) {
		let key = '',
			id = '',
			bit = 0
		switch (type) {
			case 'uuid':
				key = 'GAME_MASTER_UUID'
				bit = 32
				break;
			case 'aid':
				key = 'GAME_MASTER_AID'
				bit = 16
				break;
		}
		id = getStore(key)
		id == '' && (id = createHexRandom(bit), setStore(key, id))
		console.log('in getId id', id)
		return id
	},

	addHttp (url) {
		if(url){
			return !~url.indexOf('http')? 'http:'+url : url
		}
	}
}