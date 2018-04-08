'use strict'

// let host = 'http://10.12.129.46:8081'; //test
let host = 'http://lburlshare.liebao.cn'; //prod
const routerMode = 'history', //history | hash
	restoreOnStartup = 4,
	appid = 'wxe295c6faa48c17d5'

if (process.env.NODE_ENV === 'development') {

}else if(process.env.NODE_ENV === 'production'){

}

export {
	host,
	routerMode,
	restoreOnStartup,
	appid
}