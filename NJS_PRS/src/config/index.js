'use strict'

// let host = 'http://10.12.129.46:8081'; //test
let host = ''; //prod
const routerMode = 'hash', //history | hash
	restoreOnStartup = 4,
	weixin = {
		appid: 'wxe295c6faa48c17d5',
		debug: true,
		swapTitleInWX: true
	},
	urls = {
		fresh: 'http://g.m.liebao.cn/news/fresh?act=3&scenario=0x00000101&lan=zh_CN&osv=7.1.1&appv=1.1.2&app_lan=zh_CN&ch=0&pid=17&action=0x1b&offset=&pf=web&net=wifi&v=4&mnc=00&ctype=0x267&display=0x07&mode=1&brand=OPPO&mcc=460&nmnc=00&nmcc=460',
		detail: 'http://g.m.liebao.cn/news/detail?scenario=0x00000101&lan=zh_CN&osv=5.1.1&appv=3.29.0&app_lan=zh_CN&ch=10000000&pid=17&action=0x3af&net=wifi&v=4&ctype=0x26B&display=0xCF&brand=google&pf=android',
		recommend: 'http://g.m.liebao.cn/news/recommend?scenario=0x00000505&lan=zh_CN&osv=5.1.1&appv=3.29.0&app_lan=zh_CN&ch=10000000&pid=17&action=0x3af&pf=android&net=wifi&v=4&ctype=0x01&display=0xCF&brand=google'
	},
	app = {
		gm: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.cmcm.gamemaster',
		myapp: 'tmast://appdetails?r=0.27985643851570785&pname=com.cmcm.gamemaster&oplist=1%3B2&via=ANDROIDWXZ.YYB.OTHERBROWSER&channelid=000116083232363434363139&appid=213141',
		downloadLink: 'http://imtt.dd.qq.com/16891/FA3FC96AD4B50FA556C77AB04D3371DD.apk?fsname=com.cmcm.gamemaster_1.1.7_10170008.apk&csr=1bbd',
		gmNativeLink: 'gamemaster://mainactivity/jump',
	},
	report = {
		key: 'gameMaster',
		name: 'gamemaster_share_web:192 action:byte system:byte source:byte download:byte network:byte uptime2:int',
	}

if (process.env.NODE_ENV === 'development') {

}else if(process.env.NODE_ENV === 'production'){

}

export {
	host,
	routerMode,
	restoreOnStartup,
	weixin,
	urls,
	app,
	report
}