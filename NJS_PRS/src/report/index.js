/**
 * Created by lica4 on 4/11/2018.
 */
(function () {
	var browser = "other",
		system = "other",
		device = "PC";
	var pf = navigator.platform,
		ua = navigator.userAgent,
		href = window.location.href,
		locSearch = window.location.search;
	var root = "/";
	var WinMap = {
		"windows nt 5.0": "Win2000",
		"windows 2000": "Win2000",
		"windows nt 5.1": "WinXP",
		"windows xp": "WinXP",
		"windows nt 5.2": "Win2003",
		"windows 2003": "Win2003",
		"windows nt 6.0": "WinVista",
		"windows vista": "WinVista",
		"windows nt 6.1": "Win7",
		"windows 7": "Win7",
		"windows nt 6.2": "Win8",
		"windows 8": "Win8",
		"windows nt 6.3": "Win8.1",
		"windows 8.1": "Win8.1"
	};
	var sysMap = {
		"win32": WinMap,
		"windows": WinMap,
		"android": "Android",
		"ipad": "iOS",
		"iphone": "iOS",
		"macintosh": "Mac",
		"macIntel": "Mac",
		"mac": "Mac",
		"x11": "Unix",
		"linux": "Linux"
	};

	function createUUID(isClient) {
		var s = [],
			hexDigits = "0123456789abcdef",
			i, uuid;
		for (i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 16), 1)
		}
		s[14] = "4";
		s[19] = hexDigits.substr((s[19] & 3) | 8, 1);
		if (isClient) {
			uuid = s.join("").substr(0, 32)
		} else {
			s[8] = s[13] = s[18] = s[23] = "-";
			uuid = s.join("")
		}
		return uuid
	}
	function buildQuery(obj) {
		var i, arr = [];
		if (typeof obj === "object") {
			for (i in obj) {
				if (obj.hasOwnProperty(i)) {
					arr.push(i + "=" + encodeURIComponent(obj[i] == null ? "" : obj[i] + ""))
				}
			}
		}
		return arr.join("&")
	}
	function addnew(a1, a2, a3) {
		if (typeof a1 === "string") {
			var nod = document.createElement(a1);
			if (typeof a2 === "string") {
				var ar2 = a2.split(" ");
				for (var i = 0, n = ar2.length, ar3; i < n; i++) {
					ar3 = ar2[i].split("=");
					if (ar3.length === 2) {
						nod.setAttribute(ar3[0], ar3[1].replace(/\:\:/gi, " ").replace(/\"/gi, "").replace(/\'/gi, ""))
					}
				}
			} else {
				if (typeof a2 === "object") {
					for (var key in a2) {
						if (typeof (a2[key]) === "string") {
							nod.setAttribute(key, a2[key])
						}
					}
				}
			} if (typeof a3 === "string" || typeof a3 === "number") {
				nod.innerHTML = a3
			}
			return nod
		}
	}
	function create(url) {
		var el = addnew("img");
		el.style.display = "none";
		el.src = url;
		document.body.appendChild(el);
	}
	function initialize() {
		var lua = ua.toLowerCase(),
			match, version;
		for (i in sysMap) {
			if (sysMap.hasOwnProperty(i) && lua.indexOf(i) > -1) {
				if (typeof sysMap[i] === "object") {
					for (j in sysMap[i]) {
						if (sysMap[i].hasOwnProperty(j) && lua.indexOf(j) > -1) {
							system = sysMap[i][j];
							break
						}
					}
				} else {
					system = sysMap[i]
				}
				break
			}
		}
		if (system === "Mac") {
			device = "Mac"
		} else {
			if (system === "iOS") {
				match = /iPad|iPhone/.exec(ua);
				device = match && match[0] || device
			} else {
				if (system === "Android") {
					device = "Mobile"
				}
			}
		}
		match = /(chrome)[ \/]([\w.]+)/.exec(lua) || /(webkit)[ \/]([\w.]+)/.exec(lua) || /ms(ie)\s([\w.]+)/.exec(lua) ||
			/(firefox)[ \/]([\w.]+)/.exec(lua) || [];
		if (match && match[1]) {
			if (match[1] === "ie") {
				version = /msie\s([\d\.]+)/.exec(lua);
				browser = match[1] + (version && version[1] ? parseInt(version[1]) : "")
			} else {
				if (match[1] === "webkit") {
					browser = "Webkit";
					if (lua.indexOf("safari") > -1 && (system === "iOS" || system === "MAC")) {
						browser = "Safari"
					}
				} else {
					browser = match[1].substr(0, 1).toUpperCase() + match[1].substr(1)
				}
			}
		}
	}
	initialize();

	function Infoc(url, obj) {
		this.setRoot(url);
		this.params = {
			product_no: 0,
			public_index: 0,
			business_index: 0
		};
		this.addParams(obj);
		return this
	}
	Infoc.prototype = {
		root: "/",
		setRoot: function (url) {
			this.root = url;
			return this
		},
		addParams: function (obj) {
			if (typeof obj === "object") {
				for (i in obj) {
					if (obj.hasOwnProperty(i)) {
						if (typeof i === "string" || typeof i === "number") {
							this.params[i] = obj[i]
						}
					}
				}
			}
			return this
		},
		report: function (obj, async) {
			if (typeof obj !== "object") {
				return
			}
			var i, url;
			for (i in this.params) {
				if (this.params.hasOwnProperty(i)) {
					if (typeof obj[i] === "undefined") {
						obj[i] = this.params[i]
					}
				}
			}
			url = this.root + "?" + buildQuery(obj);
			async = async == null ? true : async;
			if (async) {
				setTimeout(function () {
					create(url)
				}, 0)
			} else {
				create(url)
			}
			return this
		}
	};
	Infoc.getDevice = function () {
		return {
			browser: browser,
			system: system,
			device: device
		}
	};
	Infoc.queryString = function (name) {
		var i = 0,
			params = {}, key, value, pos, search = locSearch ? locSearch.substr(1).split("&") : [];
		for (; i < search.length; i++) {
			pos = search[i].indexOf("=");
			if (pos > 0) {
				key = search[i].substring(0, pos);
				value = search[i].substring(pos + 1);
				params[key] = decodeURIComponent(value)
			}
		}
		return params[name] ? params[name] : undefined
	};
	Infoc.getUUID = function (isClient) {
		var key = isClient ? "infoc_client_uuid" : "infoc_uuid";
		uuid = Infoc.cookie(key);
		if (!uuid) {
			uuid = createUUID(isClient);
			Infoc.cookie(key, uuid, {
				path: "/",
				expires: 30 * 24 * 3600
			})
		}
		return uuid
	};
	window.Infoc = Infoc
})();
(function (undefined) {
	function cookie(name, value) {
		return name != null ? cookie[value === undefined ? "get" : "set"].apply(null, arguments) : undefined
	}
	cookie.get = function (name) {
		var ret, arr, i, len;
		if (document.cookie) {
			arr = document.cookie.split("; ");
			for (i = 0, len = arr.length; i < len; i++) {
				if (arr[i].indexOf(name + "=") === 0) {
					ret = decodeURIComponent(arr[i].substr(name.length + 1));
					break
				}
			}
		}
		return ret
	};
	cookie.set = function (name, value, options) {
		var arr = [],
			date;
		options = options || {};
		if (value == null) {
			value = "";
			options.expires = -1
		}
		if (typeof options.expires === "number") {
			date = new Date();
			date.setTime(date.getTime() + options.expires * 1000)
		} else {
			if (options.expires instanceof Date) {
				date = options.expires
			}
		}
		arr.push(name + "=" + encodeURIComponent(value));
		date && arr.push("expires=" + date.toUTCString());
		options.path && arr.push("path=" + options.path);
		options.domain && arr.push("domain=" + options.domain);
		options.secure && arr.push("secure");
		return document.cookie = arr.join("; ")
	};
	Infoc.cookie = cookie
})();
(function () {
	var infoc2 = "http://infoc2.duba.net/g/v1/",
		f = Infoc.queryString("f") || "",
		device = Infoc.getDevice(),
		uuid = Infoc.getUUID(true),
		isHttps = (window.location.protocol === "https:" ? true : false);
	Infoc.b = function (project, dat) {
		var map = projectMap[project];
		if (!map) {
			return false
		}
		if (isHttps && !map.httpsUrl) {
			return false
		}
		var obj = new Infoc((isHttps ? map.httpsUrl : map.url), map.params);
		if (dat) {
			if (typeof dat === "string") {
				var arr = dat.split(" "),
					i = 0,
					len = arr.length,
					params = {}, key, value;
				for (; i < len; i++) {
					key = arr[i].split(":")[0];
					value = arr[i].split(":")[1];
					if (i === 0) {
						params.business_index = value
					} else {
						if (value === "string" || value === "uuid") {
							params[key] = ""
						} else {
							params[key] = 0
						}
					}
				}
				obj.addParams(params)
			} else {
				if (typeof dat === "object") {
					obj.addParams(dat)
				}
			}
		}
		return obj
	};
	var dubaMap = {
		url: infoc2,
		httpsUrl: "https://helpduba1.ksmobile.com/g/v1/",
		params: {
			product_no: 1,
			public_index: 6,
			uuid: uuid,
			tid1: 0,
			tid2: 0,
			tod1: 0,
			tod2: 0,
			type: 0,
			tryno: 0,
			iid: 0,
			collect_time: 0,
			lastver: 0,
			svrid: "",
			wtod2: "",
			usertype_public: 0
		}
	};
	var daohangMap = {
		url: infoc2,
		httpsUrl: "https://helpdhsite2.ksmobile.com/g/v1/",
		params: {
			product_no: 131,
			public_index: 1,
			uuid: uuid,
			dbid: "",
			lbid: "",
			url: window.location.href,
			channel: f,
			br: device.browser || "",
			brv: "",
			os: device.system || "",
			referer: document.referrer || ""
		}
	};
	var cmMap = {
		url: infoc2,
		httpsUrl: "https://helpf.ksmobile.com/g/v1/",
		params: {
			product_no: 11,
			public_index: 14,
			uuid: uuid,
			ver: 0,
			mcc: 0,
			mnc: 0,
			cl: "",
			cn: 0,
			prodid: 0,
			xaid: "",
			uptime: 0,
			root2: 0,
			capi: 0,
			brand2: "",
			model2: "",
			serial2: "",
			cn2: "",
			rom: "",
			rom_ver: "",
			host_ver: 0,
			plugin_vers: "",
			built_chnelid: "",
			utc: 0,
			iid: 0,
			accountid: ""
		}
	};
	var liebaoMap = {
		url: infoc2,
		httpsUrl: "http://helpliebao1.ksmobile.com/g/v1/",
		params: {
			product_no: 106,
			public_index: 2,
			uuid: uuid,
			duba_uuid: uuid,
			pid: "",
			spid: "",
			tid1: 0,
			tid2: 0,
			tod1: 0,
			tod2: 0,
			lbver: "",
			tryno: 0,
			iid: 0,
			svrid: "",
			os: 0,
			ie: 0,
			wtod2: "",
			usertype_public: 0
		}
	};
	var projectMap = {
		db: dubaMap,
		duba: dubaMap,
		daohang: daohangMap,
		dh: daohangMap,
		cm: cmMap,
		liebao: liebaoMap,
		lb: liebaoMap
	}
})();