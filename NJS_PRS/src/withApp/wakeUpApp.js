import ua from '../ua/index'
import { app } from 'config/index'

export default class wakeUpApp {

	vm = null

	constructor (criteria) {
		this.vm = criteria
		if (this.vm.skipWakeUpApp) return
		this.init()
	}

	init () {
		!ua.os.ios && this.androidToNative()
	}

	androidToNative () {
		console.log('in androidToNative')
		this.removeIframe()
		const ele = this.getIframe()
		window.document.body.appendChild(ele)
	}

	removeIframe () {
		const iframe = window.document.getElementById('app_iframe')
		iframe && window.document.body.removeChild(iframe)
	}

	getIframe () {
		let ele = window.document.createElement('iframe')
		ele.id = 'app_iframe'
		ele.src = app.gmNativeLink
		ele.style.display = 'none'
		return ele
	}
}