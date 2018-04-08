import {cookie, request, getStore} from '../utils/index'
import ua from '../ua/index'
require('static/javascripts/weixin_all')

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
	let articleImg = document.querySelector('article .article__content img');
	let videoBox = document.querySelector('.tt-video');
	let imgUrl = videoBox ? $(videoBox).find('video').attr('poster') : null;
	if (!imgUrl) {
		imgUrl = articleImg ? articleImg.src : 'https://s3.pstatp.com/site/promotion/landing_page/img/icon-hd%20_38d77c65bfaa5d015089238d89dc41f9.png'
	}
	return imgUrl
}

function getDescription () {
	return videoData.description || ''
}

function init () {
	if (ua.browser.weixin && 'weixin' in window) {
		window.weixin.onReady(
			function () {
				let title = getShareTitle(),
					imgUrl = getShareImage(),
					url = getShareLink(),
					description = getDescription();
				// 朋友圈
				if (window.wx.onMenuShareTimeline) {
					window.wx.onMenuShareTimeline({
						title: title, // 分享标题
						desc: description,
						link: url, // 分享链接
						imgUrl: imgUrl, // 分享图标
						success: function () {
							window.gaevent('share_success', 'share', location.hostname + location.pathname);
						},
						cancel: function () {
						},
					});
				}
				if (window.wx.onMenuShareAppMessage) {
					window.wx.onMenuShareAppMessage({
						title: title,
						desc: description,
						link: url,
						imgUrl: imgUrl,
						success: function () {
							window.gaevent('share_success', 'share', location.hostname + location.pathname);
						},
					});
				}
			}
		)
	}
}

module.exports = {
	init: init,
}
