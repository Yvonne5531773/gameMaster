/**
 * 存储localStorage
 */
export const setStore = (name, content) => {
	if (!name) return
	if (typeof content !== 'string') {
		content = JSON.stringify(content)
	}
	window.localStorage.setItem(name, content)
}

/**
 * 获取localStorage
 */
export const getStore = name => {
	if (!name) return
	return window.localStorage.getItem(name)?window.localStorage.getItem(name):''
}

/**
 * 删除localStorage
 */
export const removeStore = name => {
	if (!name) return
	window.localStorage.removeItem(name)
}

export const clipstring = (str, len) => {
	str && (str = str.replace(/(^\s*)|(\s*$)/g, ''))
	if(!str || !len) { return '' }
	let a = 0, i = 0, temp = ''
	for(i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) > 255)
			a += 2
		else
			a++
		if(a > len) { return temp + '..'}
		temp += str.charAt(i)
	}
	return str
}

export const cookie = (name, value, options) => {
	if( typeof value != "undefined"){
		options = options || {};
		if(value === null){
			value = "";
			options.expires = -1
		}
		var expires = "";
		if(options.expires && (typeof options.expires == "number" || options.expires.toUTCString)){
			var date;
			if(typeof options.expires == "number") {
				date = new Date();
				date.setTime(date.getTime() + (options.expires))
			} else {
				date = options.expires
			}
			expires = "; expires=" + date.toUTCString()
		}
		var path = options.path ? "; path=" + options.path : "";
		var domain = options.domain ? "; domain=" + options.domain : "";
		var secure = options.secure ? "; secure" : "";
		document.cookie = [
			name,
			"=",
			encodeURIComponent(value),
			expires,
			path,
			domain,
			secure
		].join("")
	} else {
		var cookieValue = null;
		if(document.cookie && document.cookie != ""){
			var cookies = document.cookie.split(";");
			for(var i=0; i<cookies.length; i++){
				var cookie = cookies[i].trim();
				if(cookie.substring(0, name.length+1) == (name + "=")){
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break
				}
			}
		}
		return cookieValue
	}
}

export const support = {
	vendor: function() {
		var _alternates = ['O', 'ms', 'Moz', 'Khtml', 'Webkit', 'webkit', ''];
		var _el = document.createElement('div');
		for ( var len = _alternates.length; len--; ) {

			var alter = _alternates[len];
			var attr  = alter ? alter + 'Transform' : 'transform';
			if ( attr in _el.style ) return alter;
		}
		return null;
	},
	prefix: function(prop, forStyle) {
		if ( support.vendor() === null ) return;

		var _prefix_style = support.vendor() ? ( '-' + support.vendor().toLowerCase() + '-' ) : '';
		var _prefix_attr  = support.vendor() || '';

		if ( forStyle ) {
			// return like this '-webkit-transform'
			var underlined = prop.replace(/([A-Z])/g, function(match, pos) {
				return '-' + match.toLowerCase();
			});
			return _prefix_style + underlined;
		}
		else {
			// return camecased like 'webkitTransform'
			var upperCasedProp = support.vendor() !== '' ? prop.charAt(0).toUpperCase() + prop.substr(1) : prop;
			var disUnderlined = upperCasedProp.replace(/(-[a-z])/g, function(match, pos) {
				return match.charAt(1).toUpperCase();
			});
			return _prefix_attr + disUnderlined;
		}
	},
	canRun2d: function() {
		return support.vendor() !== null ;
	},
	canRun3d: function() {
		var _el = document.createElement('div');
		if ( !this.canRun2d() || !window.getComputedStyle ) return false;
		var _t = support.prefix( 'transform' );
		document.body.appendChild( _el );
		_el.style[ _t ] = 'translate3d(1px,1px,1px)';
		var matrix = window.getComputedStyle( _el )[ _t ] || '';
		document.body.removeChild( _el );
		return !!/^matrix3d\((.*)\)$/.exec( matrix );
	},
	canRunCanvas: function() {
		var canvas;
		try {
			canvas = document.createElement( 'canvas' );
			canvas.getContext( '2d' );
			return true;
		}
		catch( e ) {
			return false;
		}
	},
	canRunWebgl: function() {
		var canvas, ctx, exts;
		try {
			canvas = document.createElement( 'canvas' );
			ctx = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' );
			exts = ctx.getSupportedExtensions();
			return true;
		}
		catch( e ) {
			return false;
		}
	},
	canUsePageVisibility: function() {
		return support.vendor() !== null && document[ support.prefix( 'hidden' ) ] !== undefined;
	}
}

export const pageVisible = () => {
	if (support.canUsePageVisibility()) return !document[support.prefix('hidden')] ? 'visible': 'hidden';
	else return 'unknown';
}

export const getCookieForLocal = (name) => {
	for(var key in localStorage){
		var split = key.split("___");
		if(split.length == 3 && split[0] == name){
			var startTime = parseInt( split[1] );
			var expires = parseInt(split[2]);

			if(Date.now() - startTime < expires){
				return localStorage[key];
			}
		}
	}
	return null;
}

export const setCookieForLocal = (name, value, expires) => {
	for(var n in localStorage){
		var split = n.split("__");
		if(split[0] == name){
			localStorage.removeItem(n);
		}
	}
	localStorage[name + "___" + Date.now() + "___" + expires] = value;
}

export const appendQuery = (url, query) => {
	if (!query) {
		return url;
	}
	var search;
	var a = document.createElement("a");
	a.href = url;
	if (a.search) {
		search = a.search + "&" + query;
	} else {
		search = "?" + query;
	}
	return a.protocol + "//" + a.host + a.pathname + search + a.hash;
}

//$.request; $.hash 针对hash结构
/**
 * [request description]
 * @param  参数可以为空，此时返回请求参数Map本身
 *         参数可以为请求key，以便返回querystring中key对应的value
 * @return 根据参数不同，要返回不同的结果，object或者字符串
 */
export const request = (paras) => {
	var url = location.search;
	var paraString = url.substring(1).split("&");
	var paraObj = {};
	for (var i = 0, len=paraString.length; i < len; i++) {
		var j = paraString[i];
		if(j) {
			paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length);
		}
	}
	if(!paras) return paraObj;
	var returnValue = paraObj[paras.toLowerCase()];
	return returnValue ? returnValue.trim() : "";
}

export const hash = () => {
	var s = location.hash.substr(1),
		hashQuery = {};
	if (s) {
		var arr = s.split("&");
		for (var i = 0; i < arr.length; i++) {
			var t = arr[i].split("=");
			hashQuery[t[0]] = t[1]
		}
	}
	if (typeof arguments[0] == "string") {
		return hashQuery[arguments[0]]
	}
	if (typeof arguments[0] == "object") {
		for (var k in arguments[0]) {
			hashQuery[k] = arguments[0][k]
		}
		var s2 = Object.keys(hashQuery).map(function(h) {
			return "h=" + hashQuery[h];
		}).join('&')
		location.href = "#" + s2.substring(0, s2.length - 1)
	}
}

export const getBrowserName = () => {
	var browserName = "Other";
	var ua = window.navigator.userAgent;
	var browserRegExp = {
		Wechat: /micromessenger/,
		QQBrowser: /qqbrowser/,
		UC: /ubrowser|ucbrowser|ucweb/,
		Shoujibaidu: /baiduboxapp|baiduhd|bidubrowser|baidubrowser/,
		SamsungBrowser: /samsungbrowser/,
		MiuiBrowser: /miuibrowser/,
		Sogou : /sogoumobilebrowser|sogousearch/,
		Explorer2345 : /2345explorer|2345chrome|mb2345browser/,
		Liebao : /lbbrowser/,
		Weibo: /__weibo__/,
		OPPO: /oppobrowser/,
		toutiao: /newsarticle/,
		MobileQQ: /mobile.*qq/,
		Firefox: /firefox/,
		Maxthon: /maxthon/,
		Se360: /360se/,
		Ee360: /360ee/,
		Safari: /(iphone|ipad).*version.*mobile.*safari/,
		Chrome: /chrome|crios/,
		AndroidBrowser: /android.*safari|android.*release.*browser/
	};
	for (var i in browserRegExp) {
		if (browserRegExp[i].exec(ua.toLowerCase())) {
			browserName = i;
			break;
		}
	}
	return browserName;
}

export const toQuery = (obj) => {
	return Object.keys(obj).map(function(k) {
		return [k, obj[k]].join('=');
	}).join('&');
}

export const capitalizeFirstLetter = (word) => {
	if(!word) return word;
	var wordStr = word.toString();
	return wordStr.charAt(0).toUpperCase() + wordStr.slice(1);
}

/**
 * 时间比较
 */
export const compareTime = (itemA, itemB) => {
	let timeA = itemA.updated,
		timeB = itemB.updated
	if(timeA && timeB){
		let beginTime = timeA
		let endTime = timeB
		let beginTimes = beginTime.substring(0, 10).split('-')
		let endTimes = endTime.substring(0, 10).split('-')
		beginTime = beginTimes[1] + '-' + beginTimes[2] + '-' + beginTimes[0] + ' ' + beginTime.substring(10, 19)
		endTime = endTimes[1] + '-' + endTimes[2] + '-' + endTimes[0] + ' ' + endTime.substring(10, 19)
		let a = (Date.parse(endTime) - Date.parse(beginTime)) / 3600 / 1000
		if (a > 0) {
			return 1
		} else if (a < 0) {
			return -1
		} else if (a === 0) {
			return 0
		}
	}else if(timeA && !timeB) return 1
	else if(!timeA && timeB) return -1
}

export const getOperationFullTime = date => {
	let updateDate = new Date(date)
	if (!updateDate) {
		return ''
	}
	let month = updateDate.getMonth()
	month ++
	month = month < 10? '0' + month : month
	let day = updateDate.getDate() < 10 ? '0' + updateDate.getDate() : updateDate.getDate()
	let hour = updateDate.getHours() < 10 ? '0' + updateDate.getHours() : updateDate.getHours()
	let minutes = updateDate.getMinutes() < 10 ? '0' + updateDate.getMinutes() : updateDate.getMinutes()
	let sceonds = updateDate.getSeconds() < 10 ? '0' + updateDate.getSeconds() : updateDate.getSeconds()
	return '' + updateDate.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + sceonds
}

//返回x位随机数
export const createHexRandom = (bit) => {
	let num = '',
		tmp = 0;
	for (let i = 0; i <= bit - 1; i++) {
		tmp = Math.ceil(Math.random() * 15);
		if (tmp > 9) {
			switch (tmp) {
				case(10):
					num += 'a';
					break;
				case(11):
					num += 'b';
					break;
				case(12):
					num += 'c';
					break;
				case(13):
					num += 'd';
					break;
				case(14):
					num += 'e';
					break;
				case(15):
					num += 'f';
					break;
			}
		} else {
			num += tmp
		}
	}
	return num
}
