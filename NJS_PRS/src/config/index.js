'use strict'

// let host = 'http://10.12.129.46:8081'; //test
let host = 'http://lburlshare.liebao.cn'; //prod
const routerMode = 'history', //history | hash
	restoreOnStartup = 4,
	weixin = {
		appid: 'wxe295c6faa48c17d5',
		debug: false,
		swapTitleInWX: true
	},
	urls = {
		detail: 'http://g.m.liebao.cn/news/detail?scenario=0x00000101&lan=zh_CN&osv=5.1.1&appv=3.29.0&app_lan=zh_CN&ch=10000000&pid=17&action=0x3af&net=wifi&v=4&ctype=0x26B&display=0xCF&brand=google&pf=android'
	}

if (process.env.NODE_ENV === 'development') {

}else if(process.env.NODE_ENV === 'production'){

}

export {
	host,
	routerMode,
	restoreOnStartup,
	weixin,
	urls
}