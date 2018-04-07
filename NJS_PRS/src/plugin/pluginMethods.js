import { mapMutations } from 'vuex'
import { worker } from 'api/worker'
import { host, categoryPath } from 'config/index'
import { getOperationFullTime } from 'utils/index'
import PlayerConstructor from 'byted-toutiao-player'

export default {
	...mapMutations(['SET_COMPONENT']),

	setComponent(component) {
		this.SET_COMPONENT({component: component})
	},

	fetch(path) {
		const url = host + path
		return worker.work(url)
	},

	getPlayer (criteria) {
		return new PlayerConstructor(criteria)
	},

	addHttp(url) {
		if(url){
			return !~url.indexOf('http')? 'http:'+url : url
		}
	}
}