import {cookie, request, getStore} from 'utils/index'
import { worker } from 'api/worker'
import { weixin } from '../config/index'
import ua from '../ua/index'

const webId = cookie('gm_webid') || '0'
let videoData = null

function getShareLink () {
	let domain = location.host;
	let pathname = location.pathname;
	let url = [
		location.protocol,
		'//',
		location.host,
		location.pathname,
		location.search,
		location.hash,
	].join('');

	// 统计微信上分享的次数
	// if (!location.hash) {
	// 	url = url + '?wxshare_count=2';
	// } else if (location.hash.indexOf('wxshare_count=') === -1) {
	// 	url = url.replace(location.hash, location.hash + '&wxshare_count=2');
	// } else {
	// 	let count = hash('wxshare_count') || '0';
	// 	count = count ? parseInt(count) + 1 : 0;
	// 	url = url.replace('wxshare_count=' + hash('wxshare_count'), 'wxshare_count=' + count);
	// }

	return url;
}

function getShareTitle () {
	return videoData.title || '游戏超人'
}

function getShareImage () {
	return videoData.poster || 'http://act.cmcmcdn.com/upload/201804/774db3d4b455119129f7d0587ca8a5ff.png'
}

function getDescription () {
	return videoData.description || '游戏超人邀请您'
}

function createNonceStr () {
	return Math.random().toString(36).substr(2, 15)
}

async function init (data) {
	videoData = data
	let wxconfig = {},
		appid = weixin.appid,
		nonceStr = createNonceStr(),
		timestamp = Date.now(),
		url = window.location.href,
		debug = weixin.debug,
		swapTitleInWX = weixin.swapTitleInWX,
		callback = (res) => {
			//success callback
			console.log('weixin success callback res', res)
		}
	if (ua.browser.weixin) {
		const signatureUrl = "",
			data = {
				appid: appid,
				nonceStr: nonceStr,
				timestamp: timestamp,
				url: url
			},
			res = await worker.work(signatureUrl, data)
		wxconfig = {
			debug: debug,                   // 开启调试模式,调用的所有api的返回值会在客户端alert出来
			appId: appid,                   // 必填，公众号的唯一标识
			timestamp: timestamp,           // 必填，生成签名的时间戳
			nonceStr: nonceStr,             // 必填，生成签名的随机串
			signature: res.signature,       // 必填，签名
			swapTitleInWX: swapTitleInWX,   // 针对朋友圈
		}
	}
	setShareInfo({
		title: getShareTitle(),
		summary: getDescription(),
		pic: getShareImage(),
		url: getShareLink(),
		WXconfig: wxconfig,
		// callback: callback
	})
}

module.exports = {
	init: init
}
