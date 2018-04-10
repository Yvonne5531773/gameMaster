import {cookie, request, getStore} from 'utils/index'
import { worker } from 'api/worker'
import { weixin } from '../config/index'
import ua from '../ua/index'

const webId = cookie('gm_webid') || '0',
	videoData = getStore('VIDEO_DATA')

function getShareLink () {
	let domain = location.host;
	let pathname = location.pathname;
	let url = [
		location.protocol,
		'//',
		domain,
		pathname,
		location.search,
		location.hash,
	].join('');

	if (!location.search) {
		url = url + '?wxshare_count=2';
	} else if (location.search.indexOf('wxshare_count=') === -1) {
		url = url.replace(location.search, location.search + '&wxshare_count=2');
	} else {
		let count = request('wxshare_count') || '0';
		count = count ? parseInt(count) + 1 : 0;
		url = url.replace('wxshare_count=' + request('wxshare_count'), 'wxshare_count=' + count);
	}
	url = url.replace('__tt_rbl=1&', '').replace('__tt_rbl=1', '');
	let pbid = webId;
	if (url.indexOf('pbid=') === -1) {
		url += ('&pbid=' + pbid);
	} else {
		url = url.replace(/pbid=(\d+)/ig, 'pbid=' + pbid);
	}
	return url;
}

function getShareTitle () {
	return videoData.title || ''
}

function getShareImage () {
	return videoData.poster || ''
}

function getDescription () {
	return videoData.description || ''
}

function createNonceStr () {
	return Math.random().toString(36).substr(2, 15)
}

async function init () {
	let wxconfig = {},
		appid = weixin.appid,
		nonceStr = createNonceStr(),
		timestamp = Date.now(),
		url = window.location.href,
		debug = weixin.debug,
		swapTitleInWX = weixin.swapTitleInWX,
		callback = () => {
			//success callback
			// console.log('success callback')
		}
	if (ua.browser.weixin) {
		const signatureUrl = "//open.snssdk.com/jssdk_signature/",
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
		callback: callback
	})
}

module.exports = {
	init: init
}
