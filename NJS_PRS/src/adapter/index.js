export default class adapter {

	constructor () {
		this.init(window, document)
	}

	init (win, doc) {
		let docEl = document.documentElement
		this.setRemUnit()
		this.initEvents()
		if (win.devicePixelRatio && win.devicePixelRatio >= 2) {
			let testEl = doc.createElement('div')
			let fakeBody = doc.createElement('body')
			testEl.style.border = '0.5px solid transparent'
			fakeBody.appendChild(testEl)
			docEl.appendChild(fakeBody)
			if (testEl.offsetHeight === 1) {
				docEl.classList.add('hairlines')
			}
			docEl.removeChild(fakeBody)
		}
	}

	initEvents () {
		window.addEventListener('resize', function () {
			this.setRemUnit()
		}.bind(this), false)
		window.addEventListener('pageshow', function (e) {
			if (e.persisted) {
				this.setRemUnit()
			}
		}.bind(this), false)
	}

	setRemUnit () {
		let docWidth = document.documentElement.clientWidth
		let rem = docWidth / 10
		document.documentElement.style.fontSize = rem + 'px'
	}
}