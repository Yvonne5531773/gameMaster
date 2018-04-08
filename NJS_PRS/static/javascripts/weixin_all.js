import weixin_jssdk from './weixin_jssdk'
import config from '../../src/config/index'

window.weixin = typeof weixin == 'undefined'? {} : weixin;
window.wx = typeof weixin_jssdk == "undefined" ? {}:weixin_jssdk;

function getAppid() {
	return config.appid
}

wx.onReady = weixin.onReady = function(cb, opts){
	opts = $.extend({}, opts, {
		debug: false
	});
	let nonceStr = opts.nonceStr || "Wm3WZYTPz0wzccnW";
	let timestamp = Date.now();
	let appid = opts.appId || getAppid()
	let debug = opts.debug || false;

	let success = function(response){
		if(response.code == 1){
			wx.config({
				debug: debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: appid, // 必填，公众号的唯一标识
				timestamp: timestamp, // 必填，生成签名的时间戳
				nonceStr: nonceStr, // 必填，生成签名的随机串
				signature: response.signature,// 必填，签名，见附录1
				jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});
		} else {
		}
		wx.ready(function(){
			cb && cb.apply(wx, arguments);
		});
		wx.error(function(res){
		});

		if(opts.always) {
			opts.always(response);
		}
	};

	$.ajax({
		type: "GET",
		dataType: "jsonp",
		jsonp: "callback",
		data: {
			appid: appid,
			noncestr: nonceStr,
			timestamp: timestamp,
			url: window.location.href//encodeURIComponent(window.location.href)
		},
		url: "//open.snssdk.com/jssdk_signature/",
		success: success
	});
};
