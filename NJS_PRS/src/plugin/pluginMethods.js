import { mapMutations } from 'vuex'
import { worker } from 'api/worker'
import { host } from 'config/index'
import { setStore, getStore, createHexRandom } from 'utils/index'
import PlayerConstructor from 'byted-toutiao-player'
import weixin from '../weixin/index'
import withApp from '../withApp/index'
import ua from '../ua/index'

export default {
	...mapMutations(['SET_COMPONENT', 'SET_VIDEO_ID']),

	setComponent (component) {
		this.SET_COMPONENT({component: component})
	},

	setVideoId (videoId = '') {
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

	isIOS () {
		return ua.os.ios
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
		return id
	},

	activate (criteria = {}) {
		if (ua.os.ios) {
			new withApp.downloadApp(criteria)
		} else {
			if (ua.browser.qqbrowser) {
				// QQ浏览器
				// 根据时间戳判断用户是否安装了app，若安装了app，将直接打开app，下载逻辑将不执行
				const loadDateTime = new Date();
				setTimeout( () => {
					const timeOutDateTime = new Date();
					if (!loadDateTime || timeOutDateTime - loadDateTime < 510) {
						new withApp.downloadApp(criteria)
					}
				}, 500)
				// new withApp.wakeUpApp()
			} else {
				// new withApp.wakeUpApp()
				new withApp.downloadApp(criteria)
			}
		}
	},

	addHttp (url) {
		if(url){
			return !~url.indexOf('http')? 'http:'+url : url
		}
	}
}