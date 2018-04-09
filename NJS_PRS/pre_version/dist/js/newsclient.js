
if (typeof faultylabs == 'undefined') {
    faultylabs = {}
}


function md5(data) {

    // convert number to (unsigned) 32 bit hex, zero filled string
    function to_zerofilled_hex(n) {     
        var t1 = (n >>> 0).toString(16)
        return "00000000".substr(0, 8 - t1.length) + t1
    }

    // convert array of chars to array of bytes 
    function chars_to_bytes(ac) {
        var retval = []
        for (var i = 0; i < ac.length; i++) {
            retval = retval.concat(str_to_bytes(ac[i]))
        }
        return retval
    }


    // convert a 64 bit unsigned number to array of bytes. Little endian
    function int64_to_bytes(num) {
        var retval = []
        for (var i = 0; i < 8; i++) {
            retval.push(num & 0xFF)
            num = num >>> 8
        }
        return retval
    }

    //  32 bit left-rotation
    function rol(num, places) {
        return ((num << places) & 0xFFFFFFFF) | (num >>> (32 - places))
    }

    // The 4 MD5 functions
    function fF(b, c, d) {
        return (b & c) | (~b & d)
    }

    function fG(b, c, d) {
        return (d & b) | (~d & c)
    }

    function fH(b, c, d) {
        return b ^ c ^ d
    }

    function fI(b, c, d) {
        return c ^ (b | ~d)
    }

    // pick 4 bytes at specified offset. Little-endian is assumed
    function bytes_to_int32(arr, off) {
        return (arr[off + 3] << 24) | (arr[off + 2] << 16) | (arr[off + 1] << 8) | (arr[off])
    }

    /*
    Conver string to array of bytes in UTF-8 encoding
    See: 
    http://www.dangrossman.info/2007/05/25/handling-utf-8-in-javascript-php-and-non-utf8-databases/
    http://stackoverflow.com/questions/1240408/reading-bytes-from-a-javascript-string
    How about a String.getBytes(<ENCODING>) for Javascript!? Isn't it time to add it?
    */
    function str_to_bytes(str) {
        var retval = [ ]
        for (var i = 0; i < str.length; i++)
            if (str.charCodeAt(i) <= 0x7F) {
                retval.push(str.charCodeAt(i))
            } else {
                var tmp = encodeURIComponent(str.charAt(i)).substr(1).split('%')
                for (var j = 0; j < tmp.length; j++) {
                    retval.push(parseInt(tmp[j], 0x10))
                }
            }
        return retval
    }


    // convert the 4 32-bit buffers to a 128 bit hex string. (Little-endian is assumed)
    function int128le_to_hex(a, b, c, d) {
        var ra = ""
        var t = 0
        var ta = 0
        for (var i = 3; i >= 0; i--) {
            ta = arguments[i]
            t = (ta & 0xFF)
            ta = ta >>> 8
            t = t << 8
            t = t | (ta & 0xFF)
            ta = ta >>> 8
            t = t << 8
            t = t | (ta & 0xFF)
            ta = ta >>> 8
            t = t << 8
            t = t | ta
            ra = ra + to_zerofilled_hex(t)
        }
        return ra
    }

    // conversion from typed byte array to plain javascript array 
    function typed_to_plain(tarr) {
        var retval = new Array(tarr.length)
        for (var i = 0; i < tarr.length; i++) {
            retval[i] = tarr[i]
        }
        return retval
    }

    // check input data type and perform conversions if needed
    var databytes = null
    // String
    var type_mismatch = null
    if (typeof data == 'string') {
        // convert string to array bytes
        databytes = str_to_bytes(data)
    } else if (data.constructor == Array) {
        if (data.length === 0) {
            // if it's empty, just assume array of bytes
            databytes = data
        } else if (typeof data[0] == 'string') {
            databytes = chars_to_bytes(data)
        } else if (typeof data[0] == 'number') {
            databytes = data
        } else {
            type_mismatch = typeof data[0]
        }
    } else if (typeof ArrayBuffer != 'undefined') {
        if (data instanceof ArrayBuffer) {
            databytes = typed_to_plain(new Uint8Array(data))
        } else if ((data instanceof Uint8Array) || (data instanceof Int8Array)) {
            databytes = typed_to_plain(data)
        } else if ((data instanceof Uint32Array) || (data instanceof Int32Array) || 
               (data instanceof Uint16Array) || (data instanceof Int16Array) || 
               (data instanceof Float32Array) || (data instanceof Float64Array)
         ) {
            databytes = typed_to_plain(new Uint8Array(data.buffer))
        } else {
            type_mismatch = typeof data
        }   
    } else {
        type_mismatch = typeof data
    }

    if (type_mismatch) {
        alert('MD5 type mismatch, cannot process ' + type_mismatch)
    }

    function _add(n1, n2) {
        return 0x0FFFFFFFF & (n1 + n2)
    }


    return do_digest()

    function do_digest() {

        // function update partial state for each run
        function updateRun(nf, sin32, dw32, b32) {
            var temp = d
            d = c
            c = b
            //b = b + rol(a + (nf + (sin32 + dw32)), b32)
            b = _add(b, 
                rol( 
                    _add(a, 
                        _add(nf, _add(sin32, dw32))
                    ), b32
                )
            )
            a = temp
        }

        // save original length
        var org_len = databytes.length

        // first append the "1" + 7x "0"
        databytes.push(0x80)

        // determine required amount of padding
        var tail = databytes.length % 64
        // no room for msg length?
        if (tail > 56) {
            // pad to next 512 bit block
            for (var i = 0; i < (64 - tail); i++) {
                databytes.push(0x0)
            }
            tail = databytes.length % 64
        }
        for (i = 0; i < (56 - tail); i++) {
            databytes.push(0x0)
        }
        // message length in bits mod 512 should now be 448
        // append 64 bit, little-endian original msg length (in *bits*!)
        databytes = databytes.concat(int64_to_bytes(org_len * 8))

        // initialize 4x32 bit state
        var h0 = 0x67452301
        var h1 = 0xEFCDAB89
        var h2 = 0x98BADCFE
        var h3 = 0x10325476

        // temp buffers
        var a = 0, b = 0, c = 0, d = 0

        // Digest message
        for (i = 0; i < databytes.length / 64; i++) {
            // initialize run
            a = h0
            b = h1
            c = h2
            d = h3

            var ptr = i * 64

            // do 64 runs
            updateRun(fF(b, c, d), 0xd76aa478, bytes_to_int32(databytes, ptr), 7)
            updateRun(fF(b, c, d), 0xe8c7b756, bytes_to_int32(databytes, ptr + 4), 12)
            updateRun(fF(b, c, d), 0x242070db, bytes_to_int32(databytes, ptr + 8), 17)
            updateRun(fF(b, c, d), 0xc1bdceee, bytes_to_int32(databytes, ptr + 12), 22)
            updateRun(fF(b, c, d), 0xf57c0faf, bytes_to_int32(databytes, ptr + 16), 7)
            updateRun(fF(b, c, d), 0x4787c62a, bytes_to_int32(databytes, ptr + 20), 12)
            updateRun(fF(b, c, d), 0xa8304613, bytes_to_int32(databytes, ptr + 24), 17)
            updateRun(fF(b, c, d), 0xfd469501, bytes_to_int32(databytes, ptr + 28), 22)
            updateRun(fF(b, c, d), 0x698098d8, bytes_to_int32(databytes, ptr + 32), 7)
            updateRun(fF(b, c, d), 0x8b44f7af, bytes_to_int32(databytes, ptr + 36), 12)
            updateRun(fF(b, c, d), 0xffff5bb1, bytes_to_int32(databytes, ptr + 40), 17)
            updateRun(fF(b, c, d), 0x895cd7be, bytes_to_int32(databytes, ptr + 44), 22)
            updateRun(fF(b, c, d), 0x6b901122, bytes_to_int32(databytes, ptr + 48), 7)
            updateRun(fF(b, c, d), 0xfd987193, bytes_to_int32(databytes, ptr + 52), 12)
            updateRun(fF(b, c, d), 0xa679438e, bytes_to_int32(databytes, ptr + 56), 17)
            updateRun(fF(b, c, d), 0x49b40821, bytes_to_int32(databytes, ptr + 60), 22)
            updateRun(fG(b, c, d), 0xf61e2562, bytes_to_int32(databytes, ptr + 4), 5)
            updateRun(fG(b, c, d), 0xc040b340, bytes_to_int32(databytes, ptr + 24), 9)
            updateRun(fG(b, c, d), 0x265e5a51, bytes_to_int32(databytes, ptr + 44), 14)
            updateRun(fG(b, c, d), 0xe9b6c7aa, bytes_to_int32(databytes, ptr), 20)
            updateRun(fG(b, c, d), 0xd62f105d, bytes_to_int32(databytes, ptr + 20), 5)
            updateRun(fG(b, c, d), 0x2441453, bytes_to_int32(databytes, ptr + 40), 9)
            updateRun(fG(b, c, d), 0xd8a1e681, bytes_to_int32(databytes, ptr + 60), 14)
            updateRun(fG(b, c, d), 0xe7d3fbc8, bytes_to_int32(databytes, ptr + 16), 20)
            updateRun(fG(b, c, d), 0x21e1cde6, bytes_to_int32(databytes, ptr + 36), 5)
            updateRun(fG(b, c, d), 0xc33707d6, bytes_to_int32(databytes, ptr + 56), 9)
            updateRun(fG(b, c, d), 0xf4d50d87, bytes_to_int32(databytes, ptr + 12), 14)
            updateRun(fG(b, c, d), 0x455a14ed, bytes_to_int32(databytes, ptr + 32), 20)
            updateRun(fG(b, c, d), 0xa9e3e905, bytes_to_int32(databytes, ptr + 52), 5)
            updateRun(fG(b, c, d), 0xfcefa3f8, bytes_to_int32(databytes, ptr + 8), 9)
            updateRun(fG(b, c, d), 0x676f02d9, bytes_to_int32(databytes, ptr + 28), 14)
            updateRun(fG(b, c, d), 0x8d2a4c8a, bytes_to_int32(databytes, ptr + 48), 20)
            updateRun(fH(b, c, d), 0xfffa3942, bytes_to_int32(databytes, ptr + 20), 4)
            updateRun(fH(b, c, d), 0x8771f681, bytes_to_int32(databytes, ptr + 32), 11)
            updateRun(fH(b, c, d), 0x6d9d6122, bytes_to_int32(databytes, ptr + 44), 16)
            updateRun(fH(b, c, d), 0xfde5380c, bytes_to_int32(databytes, ptr + 56), 23)
            updateRun(fH(b, c, d), 0xa4beea44, bytes_to_int32(databytes, ptr + 4), 4)
            updateRun(fH(b, c, d), 0x4bdecfa9, bytes_to_int32(databytes, ptr + 16), 11)
            updateRun(fH(b, c, d), 0xf6bb4b60, bytes_to_int32(databytes, ptr + 28), 16)
            updateRun(fH(b, c, d), 0xbebfbc70, bytes_to_int32(databytes, ptr + 40), 23)
            updateRun(fH(b, c, d), 0x289b7ec6, bytes_to_int32(databytes, ptr + 52), 4)
            updateRun(fH(b, c, d), 0xeaa127fa, bytes_to_int32(databytes, ptr), 11)
            updateRun(fH(b, c, d), 0xd4ef3085, bytes_to_int32(databytes, ptr + 12), 16)
            updateRun(fH(b, c, d), 0x4881d05, bytes_to_int32(databytes, ptr + 24), 23)
            updateRun(fH(b, c, d), 0xd9d4d039, bytes_to_int32(databytes, ptr + 36), 4)
            updateRun(fH(b, c, d), 0xe6db99e5, bytes_to_int32(databytes, ptr + 48), 11)
            updateRun(fH(b, c, d), 0x1fa27cf8, bytes_to_int32(databytes, ptr + 60), 16)
            updateRun(fH(b, c, d), 0xc4ac5665, bytes_to_int32(databytes, ptr + 8), 23)
            updateRun(fI(b, c, d), 0xf4292244, bytes_to_int32(databytes, ptr), 6)
            updateRun(fI(b, c, d), 0x432aff97, bytes_to_int32(databytes, ptr + 28), 10)
            updateRun(fI(b, c, d), 0xab9423a7, bytes_to_int32(databytes, ptr + 56), 15)
            updateRun(fI(b, c, d), 0xfc93a039, bytes_to_int32(databytes, ptr + 20), 21)
            updateRun(fI(b, c, d), 0x655b59c3, bytes_to_int32(databytes, ptr + 48), 6)
            updateRun(fI(b, c, d), 0x8f0ccc92, bytes_to_int32(databytes, ptr + 12), 10)
            updateRun(fI(b, c, d), 0xffeff47d, bytes_to_int32(databytes, ptr + 40), 15)
            updateRun(fI(b, c, d), 0x85845dd1, bytes_to_int32(databytes, ptr + 4), 21)
            updateRun(fI(b, c, d), 0x6fa87e4f, bytes_to_int32(databytes, ptr + 32), 6)
            updateRun(fI(b, c, d), 0xfe2ce6e0, bytes_to_int32(databytes, ptr + 60), 10)
            updateRun(fI(b, c, d), 0xa3014314, bytes_to_int32(databytes, ptr + 24), 15)
            updateRun(fI(b, c, d), 0x4e0811a1, bytes_to_int32(databytes, ptr + 52), 21)
            updateRun(fI(b, c, d), 0xf7537e82, bytes_to_int32(databytes, ptr + 16), 6)
            updateRun(fI(b, c, d), 0xbd3af235, bytes_to_int32(databytes, ptr + 44), 10)
            updateRun(fI(b, c, d), 0x2ad7d2bb, bytes_to_int32(databytes, ptr + 8), 15)
            updateRun(fI(b, c, d), 0xeb86d391, bytes_to_int32(databytes, ptr + 36), 21)

            // update buffers
            h0 = _add(h0, a)
            h1 = _add(h1, b)
            h2 = _add(h2, c)
            h3 = _add(h3, d)
        }
        return int128le_to_hex(h3, h2, h1, h0).toUpperCase()
    }    
}

var WIN = window,
	DOC = document,
	URL = location.href,
	PN = location.pathname,
	UA = WIN.navigator.userAgent
	IsAndroid = (/Android|HTC/i.test(UA) || (WIN.navigator['platform'] + '').match(/Linux/i)), /* HTC Flyer平板的UA字符串中不包含Android关键词 */
	IsIPad = !IsAndroid && /iPad/i.test(UA),
	IsIPhone = !IsAndroid && /iPod|iPhone/i.test(UA),
	IsIOS =  IsIPad || IsIPhone,
	IsLiebaoFast = /LieBaoFast/i.test(UA) || /LieBao/i.test(UA),
	IsWeixin = /MicroMessenger/i.test(UA),
	IsWeibo = /weibo/i.test(UA),
	IsQQ = /QQ/i.test(UA),
	IsCM = false,
	CMObj = null;

	if(typeof cm_web_app != 'undefined'){
		
		IsCM = true;
		
		CMObj = cm_web_app;

	}else if(typeof android != 'undefined'){

		IsCM = true;
		
		CMObj = cm_web_app;
	}

/* 日期对象扩展 */
Date.prototype.format = function(format) {
	format = format || "yyyy-MM-dd";
	var o = {
		"M+": this.getMonth() + 1, //month
		"d+": this.getDate(), //day
		"h+": this.getHours(), //hour
		"m+": this.getMinutes(), //minute
		"s+": this.getSeconds(), //second
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter
		"S": this.getMilliseconds() //millisecond
	};

	if (/(y+)/i.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};

//新闻客户端
var NewsClient = {
	//模块类型
	modeType: 0,
	//模块名称
	modeName: '',
	//刷新设置
	freshConfig:{},
	//当前分类：[0]分类[1]索引
	curCategory : [],
	//分类数组：[0,0,0]分类id,容器index,导航index
	categoryItem : {"news":[0,0,0], "amusement":[3,1,2], "duanzi":[27,2,3], "international":[15,3,4], "history":[18,4,5], "jianfei":[22,5,6], "game":[16,6,7], "sociology":[2,7,8], "health":[12,8,9], "science":[6,9,10], "military":[5,10,11], "sports":[4,11,12], "interest":[26,12,13], "finance":[7,13,14], "fashion":[10,14,15], "politics":[1,15,16], "video":[28,16,17]},
	//初始Max值
	oMax: 0,
	//随机用户ID
	uuid: 0,
	//下拉刷新开关
	isSwiper: true,
	//坐标初始化
	sPageY : 0,
	//来源
	from : '',
	//广告数组
	adList : [],
	//初始化
	init: function(){
	
		//设置传递来源排除#channel=分类传递
		if(NewsClient.getQueryValue('f', '&')){
			Cookie.set('Lb_from', NewsClient.getQueryValue('f', '&').replace(/([a-z]+)#[a-z]+=[a-z]+/,'$1').split('?')[0], 1);
			NewsClient.from = Cookie.get('Lb_from');
		}else{
			if(Cookie.get('Lb_from')){
				NewsClient.from = Cookie.get('Lb_from');
			}else{
				NewsClient.from = 'self';
				Cookie.set('Lb_from', 'self', 1);
			}
		}
		
		//今日快报上报
		if(NewsClient.getQueryValue('f', '&').replace(/([a-z]+)#[a-z]+=[a-z]+/,'$1').split('?')[0] == 'kxw'){
			_czc.push(['_trackEvent', '今日快报', '分享回流量', '', '', '']);
		}		
	
		//导航加载
		//获取用户浏览来源
		if($('.news-nav').length){
			var index = '', top = '';
			
			(PN == '/' || PN == '/index.html' ? index = 'on' : top = 'on');
			
			$('.news-nav-inner ul')[0].innerHTML = '<li class="'+index+'"><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=news" rel="0">推荐</a></li><li class="'+top+'" style="display:none"><a href="/top.html?f='+encodeURIComponent(NewsClient.from)+'">榜单</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=amusement" rel="3">娱乐</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=duanzi" rel="27">段子</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=international" rel="15">国际</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=history" rel="18">历史</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=jianfei" rel="22">减肥</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=game" rel="16">游戏</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=sociology" rel="2">社会</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=health" rel="12">健康</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=science" rel="6">科技</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=military" rel="5">军事</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=sports" rel="4">体育</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=interest" rel="26">趣味</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=finance" rel="7">财经</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=fashion" rel="10">时尚</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=politics" rel="1">时政</a></li><li><a href="/index.html?f='+encodeURIComponent(NewsClient.from)+'#channel=video" rel="20">视频</a></li>';
		}
	
		//设置用户UID
		if(Cookie.get('Lb_uuid')){
			NewsClient.uuid = Cookie.get('Lb_uuid');
		}else{
			NewsClient.uuid = NewsClient.createHexRandom();
			Cookie.set('Lb_uuid', NewsClient.uuid);
		}

		var _this = this;
		var UrlPara = NewsClient.getQueryValue('channel', '#').split('?')[0];
		var _index = !!NewsClient.categoryItem[UrlPara] ? NewsClient.categoryItem[UrlPara][1] : 0;
		var _channel = !!NewsClient.categoryItem[UrlPara] ? NewsClient.categoryItem[UrlPara][2] : 0;
		
		//判断url,channel传的是否为非法字符
		if(URL.indexOf('channel') >= 0 && UrlPara != 'top' && !NewsClient.categoryItem[UrlPara]){
			NewsClient.toast('参数不正确，请确认后重试');
			return;
		}
		
		//获取模块类型
		if(PN == '/' || PN == '/index.html'){
			NewsClient.modeType = 0;
			NewsClient.modeName = 'index';
		}else if(PN == '/top.html'){
			NewsClient.modeType = 1;
			NewsClient.modeName = 'top';
		}else if(PN == '/group.html'){
			NewsClient.modeType = 2;
			NewsClient.modeName = 'group';
		}

		//获取当前分类max,min信息
		NewsClient.freshConfig = !!Cookie.get('newsClientFresh') ? JSON.parse(Cookie.get('newsClientFresh')) : {};
		
		//初始化index加载
		if(NewsClient.modeType == 0){
		
			NewsClient.urlChangeDataAjax(UrlPara);
		
		//初始化top加载
		}else if(NewsClient.modeType == 1){
			
			var curTab = $('.news-tab li.on');
			var rankid = curTab.attr('rel');

			curTab.attr('mark', 'true').attr('page', 0);
			NewsClient.getDataAjax(rankid, 0, false, false, 'top', 0);
			NewsClient.curCategory = [rankid, 0];
			
			$('.news-tab').delegate('li', 'click', function(){
				$(this).addClass('on').siblings().removeClass('on');
				
				$('.news-alist').eq($(this).index()).css('display', 'block').siblings('.news-alist').css('display', 'none');
				
				//如果已经标记不在初始化加载
				if($(this).attr('mark')){ return; }	

				$('.sync').css('display','block');
				rankid = $(this).attr('rel');
				$(this).attr('mark', 'true').attr('page', 0);
				NewsClient.getDataAjax(rankid, $(this).index(), false, false, 'top', 0);
				NewsClient.curCategory = [rankid, $(this).index()];
				
			});
		//初始化group加载
		}else if(NewsClient.modeType == 2){
			var albumid = NewsClient.getQueryValue('albumid', '&');
			NewsClient.getDataAjax(albumid, 0, false, false, 'group');
			NewsClient.curCategory = [albumid, 0];
		}
		
		//初始化导航定位
		NewsClient.navPos(_channel);		
		
		//导航分类数据加载
		$('.news-nav').delegate('li','click', function(){
			setTimeout(function(){
			
				UrlPara = NewsClient.getQueryValue('channel', '#').split('?')[0];
				
				_rankid = NewsClient.categoryItem[UrlPara][0];
				_index = NewsClient.categoryItem[UrlPara][1];
				_navIndex = NewsClient.categoryItem[UrlPara][2];
				
				NewsClient.curCategory = [_rankid, _index];
				
				$(this).addClass('on').siblings().removeClass('on');
				$('.news-alist').eq(_index).css('display', 'block').siblings('.news-alist').css('display', 'none');
				
				if($('.news-nav').hasClass('news-nav-showicon')){
					$('.news-nav').removeClass('news-nav-showicon');
					$('.news-mask').css('display','none');
				}
				
				//导航定位
				NewsClient.navPos(_navIndex);
				
				//如果已经标记不在初始化加载
				if($(this).attr('mark')){ return; }
				$('.sync').css('display','block');
				//数据加载
				NewsClient.urlChangeDataAjax(UrlPara);

			}.bind(this),150);
		});
		
		//导航分类展开
		$('.nav-mores').size() && $('.nav-mores').on('click', function(){
			if(!$('.news-nav').hasClass('news-nav-showicon')){
				$('.news-nav').addClass('news-nav-showicon');
				$('.news-mask').css('display','block');
			}else{
				$('.news-nav').removeClass('news-nav-showicon');
				$('.news-mask').css('display','none');
			}
		});
		
		$('.news-mask').on('click', function(){
			$('.news-nav').removeClass('news-nav-showicon');
			$('.news-mask').css('display','none');
		});

		//页面上拉数据请求
		document.addEventListener('scroll', function(e){
			if((document.body.clientHeight - document.documentElement.clientHeight) <= (document.documentElement.scrollTop || document.body.scrollTop)){
				if($('body').hasClass('loading')){ return; }
				if(document.body.scrollTop > 0 ){
					$('body').addClass('loading');
					if(NewsClient.modeType == 0){
						NewsClient.getDataAjax(NewsClient.curCategory[0], NewsClient.curCategory[1], NewsClient.freshConfig[NewsClient.curCategory[0]]['min'], false);
					}else if(NewsClient.modeType == 1){
					
						var page = parseInt($('.news-tab li.on').attr('page'))+1;
						
						NewsClient.getDataAjax(NewsClient.curCategory[0], NewsClient.curCategory[1], false, false, 'top', page, function(){
							$('.news-tab li.on').attr('page', page);
						});
					}else if(NewsClient.modeType == 2){				
						NewsClient.getDataAjax(NewsClient.curCategory[0], NewsClient.curCategory[1], NewsClient.freshConfig['albumid']['min'], false, 'group');
					}
				}
			}
			if(document.body.scrollTop > 0){
				NewsClient.isSwiper = false;
			}else{
				NewsClient.isSwiper = true;
			}
		}, false);
		
		//刷新按钮数据请求
		$('.news-title').on('click', function(){
			if(!$(this).find('.news-fresh').length){
				return;
			}
			if($('.news-fresh').hasClass('news-fresh-ref')){ return; }
			$('.news-fresh').addClass('news-fresh-ref');
			if(NewsClient.modeType == 0){
				NewsClient.getDataAjax(NewsClient.curCategory[0], NewsClient.curCategory[1], false, NewsClient.freshConfig[NewsClient.curCategory[0]]['max']);
			}
		});
		
		$('.news-fresh').on("webkitTransitionEnd", function(){
			$('.news-fresh').removeClass('news-fresh-ref');
		}, false);		

		//回到顶部
		NewsClient.backTop();
		
		//项目来源
		var f = !!NewsClient.getQueryValue('f', '&') ? NewsClient.getQueryValue('f', '&').split('#')[0] : 'self';
		
		//设置埋点
		//SetStat.init(Cookie.get('Lb_uuid'), location.href, NewsClient.modeName, f, getFrom());
		
		//万年历
		if(NewsClient.from == 'calendar'){
			//$('body').addClass('modify-calendar');
			if(IsIOS){
				if(UA.split('wnl').length > 1 && parseInt(UA.split(' ').pop().replace(/\./g,'')) >= 426){
					location.href = 'protocol://requestInjectedAd#1103821819#5090501664975621#3#ad2callback';
				}
			}else if(IsAndroid){
				if(UA.split('wnl').length > 1 && parseInt(UA.split(' ').pop().replace(/\./g,'')) >= 433){
					//广告集合
					if(UA.split('wnlver/73').length > 1){
						location.href = 'protocol://requestInjectedAd#1105#1105110#3#ad2callback';
					}else{
						location.href = 'protocol://requestInjectedAd#1103948728#9040308634574663#3#ad2callback';	
					}
				}
			}
		}

		//金立手机
		if(NewsClient.from == 'jinli'){
			//猎户广告请求
			$.ajax({
				//url:'http://m.news.liebao.cn/js/lh.json',
				url:'http://rtb.mobad.ijinshan.com/b/?',
				dataType: 'json',
				type:'GET',
				data:{
					version : '1.0',
					publisherid: '111',
					bundle: 'm.news.liebao.cn',
					bver:'',
					app_id:'1258',
					slotid: '1258109',
					lang: 'cn',
					adtype: '6',
					timestamp: new Date().getTime(),
					platform: !!IsIOS ? 'ios' : 'android',
					osv: !!IsIOS ? UA.substr(UA.indexOf('Version')+8, 3) : UA.substr(UA.indexOf('Android')+8, 5),
					w: '',
					h: '',
					resolution: document.documentElement.clientHeight+'*'+document.documentElement.clientWidth,
					dpi: '2.0',
					tzone: encodeURIComponent('UTC+0800'),
					aid: '',
					gaid: '',
					client_ip: '',
					nt: '',
					model: '',
					brand: '',
					mcc: '',
					mnc: '',
					client_ua: encodeURIComponent(UA),
					adn: '3',
					format: 'json'
				},
				success: function(result) {
					if(result.ads.length){
						NewsClient.adList = result.ads;
					}
				}
			});
		}		

		//魔秀
		if(NewsClient.from == 'mxdetail'){
			var tempAdList = [];
			//$('body').addClass('modify-moxiu');
			if(typeof window['protocol'] != 'undefined' && typeof window['protocol'].requestInjectedAd != 'undefined'){
				tempAdList = JSON.parse(window.protocol.requestInjectedAd(3)).ads;
				if(tempAdList.length){
					NewsClient.adList = tempAdList;
				}
			}
		}

		

		// //下拉刷新数据请求
		// if($('.down-loading').length){
		// 	$('.news-content')[0].addEventListener('touchstart',NewsClient.swiperTouch, false);
		// 	$('.news-content')[0].addEventListener('touchend',NewsClient.swiperTouch, false);
		// }
	},
	
	//根据参数获取分类初始化数据
	urlChangeDataAjax: function(UrlPara){
		if(UrlPara){
			$('.news-nav li').eq(NewsClient.categoryItem[UrlPara][2]).addClass('on').siblings().removeClass('on');
			$('.news-nav li').eq(NewsClient.categoryItem[UrlPara][2]).attr('mark', 'true');
			NewsClient.curCategory = [NewsClient.categoryItem[UrlPara][0], NewsClient.categoryItem[UrlPara][1]];
			NewsClient.getDataAjax(NewsClient.curCategory[0], NewsClient.curCategory[1], false, false);
		}else{
			NewsClient.curCategory = [0, 0];
			NewsClient.getDataAjax(0, 0, false, false);
			$('.news-nav li').eq(0).attr('mark', 'true');
		}
	},
	
	//导航定位
	navPos: function(index){
		if(!$('.news-nav').length){ return; }
		var curNav = $('.news-nav li').eq(index);
		if(curNav.position().left > $('.news-nav-inner').width() - 60){
			$('.news-nav-inner')[0].scrollLeft = curNav.position().left;
		}
	},
	
	//下拉刷新
	swiperTouch: function(event){
		
		if(!NewsClient.isSwiper){ return; }
	
		var e = event || window.event;
		var mpageY = 0;
		var loading = $('.down-loading');
 
        switch(e.type){
            case "touchstart":
                NewsClient.sPageY = e.targetTouches[0].pageY;
				$('.news-content')[0].addEventListener("touchmove", NewsClient.swiperTouch, false); 
                break;
            case "touchmove":
				mpageY = e.targetTouches[0].pageY;
				
				if(mpageY > NewsClient.sPageY){
					var b = mpageY - NewsClient.sPageY;
					loading.css('display','block')
					loading.css('height', b/4+'px');
				}else{
					return;
				}
				
				e.preventDefault();
				
				if(loading.height() >= 60){
					loading.find('span').html('<i>↑</i>松开立即刷新');
					loading.find('i').css()
				}else{
					loading.find('span').html('<i>↓</i>下拉刷新');
				}    
                break;
            case "touchend":
				if(loading.height() < 60){
					loading.css({'height':'0','-webkit-transition':'height 0.3s'});
					setTimeout(function(){
						$('.down-loading').css('display','none');
						$('.down-loading').removeAttr('style');
					},300);
					return;
				}
				loading.css({'height':'60px','-webkit-transition':'height 0.3s'});
				loading.find('span').html('刷新中…');
				$('.news-fresh').trigger('click');
				$('.news-content')[0].removeEventListener("touchmove", NewsClient.swiperTouch, false);
				NewsClient.isSwiper = false;
                break;				
        }	
	},

	//获取数据
	getDataAjax: function(id, index, min, max, types, page, callback){
		var html = [],
			isOpen = false,
			dataContentList = [],
			contentWrap,
			flag = {1:'i-hot', 2:'i-tuijian', 3:'i-local', 5:'i-new'},
			url,
			defaultImg = '/images/default.gif',
			jumpUrl = 'detail.html?cid='+id+'&newsid=',
			jumpUrlVideo = 'video.html?newsid=',
			channel = '',
			oNum = 15*page,
			tempStyle = 'margin-bottom:0;',
			timeFlag = '刚刚',
			newDate = new Date().getTime(),
			tempTime = 0;
			
			//设置详情页来源
			if(NewsClient.getQueryValue('channel', '#')){
				channel = NewsClient.getQueryValue('channel', '#').split('?')[0];
			}else if(PN == '/top.html'){
				channel = 'top';
				jumpUrl = 'detail.html?cid=-1&newsid=';
			}else if(PN == '/group.html'){
				var albumid = NewsClient.getQueryValue('albumid', '&');
				channel = 'group&albumid='+albumid;
			}
			
		if(id == '0' && !min && !max && !types){ //要闻
			url = 'http://n.m.liebao.cn/news/index?pf=web&cid='+id;
		}else if(min && !types){ //下拉刷新
			url = 'http://n.m.liebao.cn/news/fresh?pf=web&cid='+id+'&mintime='+min;
		}else if(max && !types){ //上拉刷新
			url = 'http://n.m.liebao.cn/news/fresh?pf=web&cid='+id+'&maxtime='+max;
		}else if(types == 'top'){ //排行榜
			url = 'http://n.m.liebao.cn/news/rank?pf=web&rankid='+id+'&page='+page;		
		}else if(types == 'group'){ //专题
			if(min){
				url = 'http://n.m.liebao.cn/news/card?albumid='+id+'&pf=web&mintime='+min;
			}else{
				url = 'http://n.m.liebao.cn/news/card?albumid='+id+'&pf=web';
			}
		}else if(id == 28){ //视频
			url = 'http://n.m.liebao.cn/news/fresh/index?cid='+id+'&pf=web';
		}else{ //分类
			url = 'http://n.m.liebao.cn/news/fresh?pf=web&cid='+id;
		}
	
		$.ajax({
			url:url,
			dataType: 'json',
			type:'GET',
			data:{'uuid':Cookie.get('Lb_uuid')},
			success: function(result) {
			
				if(!result.data.length && !max){
					$('.sync').css('display','none');
					NewsClient.toast('到底了，没有更多新闻了');
					return;
				}
				
				//专题页获取标题
				$(".news-subtitle").length && $(".news-subtitle").html(result.album_title);
			
				$('.news-alist').eq(index).css('display', 'block').siblings('.news-alist').css('display', 'none');
				contentWrap = $('.news-alist').eq(index);
				
				if(result.maxtime){ //如果没有max值取最初值
					NewsClient.oMax = result.maxtime;
				}				
				
				if(result.cid){//分类
					NewsClient.freshConfig[result.cid] = {"min":(!!result.mintime ? result.mintime : 0), "max":(!!result.maxtime ? result.maxtime : NewsClient.oMax)};
					Cookie.set('newsClientFresh', JSON.stringify(NewsClient.freshConfig), 0.5);
				}else if(result.mintime && result.data[0] && result.data[0].albumid){//专题		
					NewsClient.freshConfig['albumid'] = {"min":(!!result.mintime ? result.mintime : 0), "max":(!!result.maxtime ? result.maxtime : NewsClient.oMax)};
					Cookie.set('newsClientFresh', JSON.stringify(NewsClient.freshConfig), 0.5);
				}//排行榜无min,max

				//保存推荐频道的maxtime
				//Cookie.set('Lb_cid0', NewsClient.freshConfig[0].max ,1);
				
				//有min max type值不清空容器，数据做累加
				if(!min && !max && !types){
					contentWrap.html('');
				}
				
				//获取用户浏览来源
				var from = !!Cookie.get('Lb_from') ? Cookie.get('Lb_from') : 'self';
				//广点通索引
				var _index = 0;
				//广点通列表插入位置
				var adPos = [3,10,16];
				
				for(var i=0,l=result.data.length; i<l; i++){
				
					if(result.data[i]['group_id']){
					
						html.push('<div class="i-group" style="'+((i+1) < l && result.data[i+1]['group_id'] ? tempStyle : '')+'"><h3><span>'+new Date(parseInt(result.data[i].behot_time) * 1000).format("MM-dd hh:mm")+'</span>'+result.data[i].group_title+'</h3>');
						
						dataContentList = result.data[i].content;
						
						tempTime = parseInt((parseInt(newDate/1000) - parseInt(dataContentList.behot_time))/60);
						
						if(tempTime > 1 && tempTime < 60){
							timeFlag = tempTime+'分钟前';
						}else if(tempTime >= 60 && tempTime <= 60*24){
							timeFlag = parseInt(tempTime/60)+'小时前';
						}else if(parseInt(tempTime/60) >= 24){
							timeFlag = new Date(parseInt(dataContentList.behot_time * 1000)).format("MM/dd hh:mm");
						}
						
						for(var k=0,j=dataContentList.length; k<j; k++){
						
							if(dataContentList[k].display_type == 1){
								html.push('<div class="i-topic"><a href="'+(dataContentList[k].ju_type == 1 ? dataContentList[k].source_url : jumpUrl+dataContentList[k].aid )+'&source='+channel+'&f='+from+'"><img osrc="'+dataContentList[k].image_list[0]+'" class="imgbox" src="'+defaultImg+'" /><p>'+dataContentList[k].title+'</p></a></div>');
								continue;
							}
							if(dataContentList[k].image_list.length == 1){
								html.push('<dl class="i-style01'+(dataContentList[k].more_info.type == 1 ? ' i-style01-comt' : '' )+'"><a href="'+(dataContentList[k].ju_type == 1 ? dataContentList[k].source_url : jumpUrl+dataContentList[k].aid )+'&source='+channel+'&f='+from+'"><dt><img osrc="'+dataContentList[k].image_list[0]+'" class="imgbox"  src="'+defaultImg+'" /></dt><dd><p>'+dataContentList[k].title+'</p><p class="i-infos"><span class="i-source">'+dataContentList[k].source+'</span><span class="'+flag[dataContentList[k].flagid]+'"></span></p></dd></a>'+(dataContentList[k].more_info.type == 1 ? '<a href="'+jumpUrl+dataContentList.aid+'&source='+channel+'&j=1&f='+from+'" class="i-god"><span>'+dataContentList[k].more_info.lt+'</span>'+dataContentList[k].more_info.rt+'</a>' : '' )+'</dl>');
							}else{
								html.push('<dl class="i-style02"><a href="'+(dataContentList[k].ju_type == 1 ? dataContentList[k].source_url : jumpUrl+dataContentList[k].aid )+'&source='+channel+'&f='+from+'"><dt>'+dataContentList[k].title+'</dt><dd>'+ (dataContentList[k].image_list.length>=3 ? '<ul class="clearfix"><li><img osrc="'+dataContentList[k].image_list[0]+'" class="imgbox"  src="'+defaultImg+'" /></li><li><img osrc="'+dataContentList[k].image_list[1]+'" class="imgbox"  src="'+defaultImg+'" /></li><li><img osrc="'+dataContentList[k].image_list[2]+'" class="imgbox"  src="'+defaultImg+'" /></li></ul>' : '') +'<p class="i-infos"><span class="i-source">'+dataContentList[k].source+'</span><span class="'+flag[dataContentList[k].flagid]+'"></span></p></dd></a>'+(dataContentList[k].more_info.type == 1 ? '<a href="'+jumpUrl+dataContentList.aid+'&source='+channel+'&j=1&f='+from+'" class="i-god"><span>'+dataContentList[k].more_info.lt+'</span>'+dataContentList[k].more_info.rt+'</a>' : '' )+'</dl>');
							}
						}
						
						if(result.data[i]['has_more'] == 1){
							html.push('<a href="group.html?albumid='+result.data[i].albumid+'" class="i-more">'+result.data[i].more_title+'</a>');
						}						

						html.push('</div>');						

					}else if(id == 28){ //视频列表
						dataContentList = result.data[i];
						
						html.push('<dl class="i-style01 i-video"><a href="'+dataContentList.source_url+'" class="clearfix"><dd><p>'+dataContentList.title+'</p><p class="i-infos"><span class="i-view">'+dataContentList.reads+'看过</span><span class="'+flag[dataContentList.flagid]+'"></span></p></dd><dt><i></i><img osrc="'+dataContentList.image_list[0]+'" class="imgbox"  src="'+defaultImg+'" /></dt></a></dl>');					
					}else{
						
						dataContentList = result.data[i];
						oNum = ++oNum;
						
						tempTime = parseInt((parseInt(newDate/1000) - parseInt(dataContentList.behot_time))/60);
						
						if(tempTime > 1 && tempTime < 60){
							timeFlag = tempTime+'分钟前';
						}else if(tempTime >= 60 && tempTime <= 60*24){
							timeFlag = parseInt(tempTime/60)+'小时前';
						}else if(parseInt(tempTime/60) >= 24){
							timeFlag = new Date(parseInt(dataContentList.behot_time * 1000)).format("MM/dd hh:mm");
						}
						
						if(dataContentList.image_list.length == 1){
							html.push('<dl class="i-style01'+(dataContentList.more_info.type == 1 ? ' i-style01-comt' : '' )+'"><a href="'+(dataContentList.ju_type == 1 ? dataContentList.source_url : jumpUrl+dataContentList.aid )+'&source='+channel+'&f='+from+'" class="clearfix"><dd><p>'+dataContentList.title+'</p><p class="i-infos"><span class="i-source">'+dataContentList.source+'</span><span class="'+flag[dataContentList.flagid]+'"></span></p></dd><dt>'+( types == 'top' ? '<i class="num'+oNum+'">'+oNum+'</i>' : '')+'<img osrc="'+dataContentList.image_list[0]+'" class="imgbox"  src="'+defaultImg+'" /></dt></a>'+(dataContentList.more_info.type == 1 ? '<a href="'+jumpUrl+dataContentList.aid+'&source='+channel+'&j=1&f='+from+'" class="i-god"><span>'+dataContentList.more_info.lt+'</span>'+dataContentList.more_info.rt+'</a>' : '' )+'</dl>');
						}else{
							html.push('<dl class="i-style02'+(result.cid == 27 ? ' i-style02-duazi' : '')+'">'+(result.cid == 27 ? '<span' : '<a')+' href="'+(dataContentList.ju_type == 1 ? dataContentList.source_url : jumpUrl+dataContentList.aid )+'&source='+channel+'&f='+from+'"><dt>'+( types == 'top' ? '<i class="num'+oNum+'">'+oNum+'</i>' : '')+''+dataContentList.title+'</dt><dd>'+ (dataContentList.image_list.length>=3 ? '<ul class="clearfix"><li><img osrc="'+dataContentList.image_list[0]+'" class="imgbox"  src="'+defaultImg+'" /></li><li><img osrc="'+dataContentList.image_list[1]+'" class="imgbox"  src="'+defaultImg+'" /></li><li><img osrc="'+dataContentList.image_list[2]+'" class="imgbox"  src="'+defaultImg+'" /></li></ul>' : '') +'<p class="i-infos"><span class="i-source">'+dataContentList.source+'</span><span class="'+flag[dataContentList.flagid]+'"></span></p></dd></a>'+(result.cid == 27 ? '</span>' : '</a>')+(dataContentList.more_info.type == 1 ? '<a href="'+jumpUrl+dataContentList.aid+'&source='+channel+'&j=1&f='+from+'" class="i-god"><span>'+dataContentList.more_info.lt+'</span>'+dataContentList.more_info.rt+'</a>' : '' )+'</dl>');
						}						
					}
				}
				
				//下拉显示新闻更新条数
				if(max){
					NewsClient.tips(result.data.length);
					if(!result.data.length){ return; }
				}				
				
				//下拉顶部加载，上拉底部加载
				if(max){
					contentWrap.prepend(html.join(''));
					//contentWrap.prepend('<h3 class="actiontime"><span>'+new Date(parseInt(result.actiontime) * 1000).format("MM-dd hh:mm")+'</span></h3>');
				}else{
					contentWrap.append(html.join(''))
					//contentWrap.append('<h3 class="actiontime"><span>'+new Date(parseInt(result.actiontime) * 1000).format("MM-dd hh:mm")+'</span></h3>');
					//加载广点通广告,段子不加载广点通
					if(id != 27){
						setTimeout(function(){
							if(NewsClient.adList.length){
								contentWrap.attr('page',(!!contentWrap.attr('page') ? parseInt(contentWrap.attr('page'))+1 : 0 ));
								_index = parseInt(contentWrap.attr('page'));
								if(adPos[_index]){
									if(NewsClient.from == 'calendar'){
										contentWrap.find('dl:eq('+adPos[_index]+')').after('<dl class="i-style01"><a href="protocol://clickinjectedadat#'+_index+'" class="clearfix"><dt><img class="imgbox" osrc="'+NewsClient.adList[_index].img+'" src="'+defaultImg+'"></dt><dd><p>'+NewsClient.adList[_index].desc+'</p><p class="i-infos"><span class="i-ad">推广</span></p></dd></a></dl>');	
									}else if(NewsClient.from == 'mxdetail'){
										contentWrap.find('dl:eq('+adPos[_index]+')').after('<dl class="i-style01"><a href="javascript:window.protocol.clickInjectedAd('+_index+');" class="clearfix"><dt><img class="imgbox" osrc="'+NewsClient.adList[_index].coverUrl+'" src="'+defaultImg+'"></dt><dd><p>'+NewsClient.adList[_index].body+'</p><p class="i-infos"><span class="i-ad">广告</span><span class="i-source">'+NewsClient.adList[_index].title+'</span></p></dd></a></dl>');
									}else if(NewsClient.from == 'jinli'){
										if(NewsClient.adList[_index]){
											contentWrap.find('dl:eq('+adPos[_index]+')').after('<dl class="i-style01 lh_ads" data-view-url="'+NewsClient.adList[_index].impr_tracking_url+'" data-click-url="'+NewsClient.adList[_index].click_tracking_url+'"><a href="'+NewsClient.adList[_index].click_url+'" class="clearfix"><dt><img class="imgbox" osrc="'+NewsClient.adList[_index].background+'" src="'+defaultImg+'"></dt><dd><p>'+NewsClient.adList[_index].desc+'</p><p class="i-infos"><span class="i-ad">广告</span><span class="i-source">'+NewsClient.adList[_index].title+'</span></p></dd></a></dl>');
											//展示上报
											NewsClient.lhAdsReport();
											//点击上报
											$('.lh_ads').live('click', function(){
												$.get($(this).attr('data-click-url'), function(){});
											});
										}
									}
								}
							}
						},500);
					}
				}

				$('body').removeClass('loading');
				
				//图片懒加载
				NewsClient.loadImage();
				
				//回调函数
				callback && callback();
	
			},
			error: function(){
				NewsClient.toast('数据加载失败，请稍后重试！');
				$('.down-loading').css({'height':'0','-webkit-transition':'height 0.3s'});
				setTimeout(function(){
					$('.down-loading').css('display','none').removeAttr('style');
					NewsClient.isSwiper = true;
				},300);
			}
		});
	},

	//猎户广告上报
	lhAdsReport: function(){
		var adList = document.querySelectorAll('.lh_ads');
		window.addEventListener('scroll', function() {
		 	for(var i=0, l=adList.length; i<l ; i++){		
				var pos = adList[i].getBoundingClientRect();
				if (pos['top'] <= document.documentElement.clientHeight) {
					if($(adList[i]).hasClass('_loaded')) continue;

					//展示上报
					$.get($(adList[i]).attr('data-view-url'), function(){});
					$(adList[i]).addClass('_loaded');
				}
		 	}
		}, false);
	},
	
	//提示
	tips: function(len){
		if($('.news-tips').length){
			$('.news-tips').remove();
		}
		if(len){
			$('.news-nav').prepend('<div class="news-tips">更新了'+len+'条新闻</div>');
		}else{
			$('.news-nav').prepend('<div class="news-tips">请休息一下，暂时没有最新新闻了</div>');
		}
		setTimeout(function(){
			$('.news-tips').remove();
			$('.down-loading').css({'height':'0','-webkit-transition':'height 0.3s'});
			setTimeout(function(){
				$('.down-loading').css('display','none').removeAttr('style');
				NewsClient.isSwiper = true;
			},300);
		},1000);
	},

	//随机生成16进制
	createHexRandom: function(){ 
		var num = '', tmp = 0;
		for (i = 0; i <= 31; i++){
			tmp = Math.ceil(Math.random()*15);
			if(tmp > 9){
				switch(tmp){ 
				   case(10):
					   num+='a';
					   break;
				   case(11):
					   num+='b';
					   break;
				   case(12):
					   num+='c';
					   break;
				   case(13):
					   num+='d';
					   break;
				   case(14):
					   num+='e';
					   break;
				   case(15):
					   num+='f';
					   break;
				}
			}else{
				num+=tmp;
			}
		}
		return num;
	},	
	
	//toast
	toast: function(text, ms){
		if (!text) {
			return false;
		}
		var dom = $('<div class="public_toast">' + text + '</div>');
		var ms = ms || 1500;
		$('body').append(dom);
		setTimeout(function() {
			dom.addClass('public_toast_show');
		}, 10);
		setTimeout(function() {
			dom.removeClass('public_toast_show');
			dom.on('webkitTransitionEnd', function() {
				dom.remove();
			});
		}, ms);
	},	
	
	//回到顶部
	backTop: function() {
		var html = '<a href="javascript:;" class="backtop"></a>';
		$('body').append(html);

		$(window).scroll(function() {
			if (document.body.scrollTop > 100) {
				$('.backtop').css('display', 'block');
			} else {
				$('.backtop').css('display', 'none');
			}
		});

		$('.backtop').live('click', function() {
			window.scrollTo(0, 0);
		});
	},
	
	//图片懒加载
	loadImage: function() {
		ImageLazyload.init();
		WIN.addEventListener('scroll', function() {
			ImageLazyload.lazyLoadImage();
		}, false);
	},	
	
	//URL查询
	getQueryValue: function(key, style){
		var match=location.href.match(new RegExp(key+'=([^'+style+']*)'));
		return match&&match[1]||'';
	}
}

//新闻客户端详情页
var NewsDetail = {
	//字体大小
	fontsize:0,
	//新闻ID
	newsid:0,
	//滚动原始坐标
	oPageY:0,
	//用户标识
	uuid:0,
	//初始化
	init:function(){
	
		//URL UUID
		if(NewsDetail.getQueryValue('uuid','&')){
			NewsDetail.uuid = NewsDetail.getQueryValue('uuid','&');
			Cookie.set('Lb_uuid', NewsDetail.uuid);
		}	
		//设置用户UID
		if(Cookie.get('Lb_uuid')){
			NewsDetail.uuid = Cookie.get('Lb_uuid');
		}else{
			NewsDetail.uuid = NewsClient.createHexRandom();
			Cookie.set('Lb_uuid', NewsDetail.uuid);
		}	
	
		//根据id加载新闻
		NewsDetail.newsid = !!NewsDetail.getQueryValue('nid','&') ? NewsDetail.getQueryValue('nid','&') : NewsDetail.getQueryValue('newsid','&');
		
		if(NewsDetail.getQueryValue('f','&') == 'cmcleanresult' || NewsDetail.getQueryValue('f','&') == 'cmold'){
			NewsDetail.getDataContent(NewsDetail.newsid, 1);
		}else if(NewsDetail.getQueryValue('f','&') == 'mxdetail'){
			NewsDetail.getDataContent(NewsDetail.newsid, 8);
		}else if(NewsDetail.getQueryValue('f','&') == 'cms'){
			NewsDetail.getDataContent(NewsDetail.newsid, 9);
		}else{
			NewsDetail.getDataContent(NewsDetail.newsid);
		}
		
		//设置传递来源排除#channel=分类传递
		if(NewsClient.getQueryValue('f', '&')){
			Cookie.set('Lb_from', NewsClient.getQueryValue('f', '&').replace(/([a-z]+)#[a-z]+=[a-z]+/,'$1').split('?')[0], 1);
			NewsClient.from = Cookie.get('Lb_from');
		}else{
			if(Cookie.get('Lb_from')){
				NewsClient.from = Cookie.get('Lb_from');
			}else{
				NewsClient.from = 'self';
				Cookie.set('Lb_from', 'self', 1);
			}
		}
		
		//今日快报上报
		if(NewsClient.getQueryValue('f', '&').replace(/([a-z]+)#[a-z]+=[a-z]+/,'$1').split('?')[0] == 'kxw'){
			_czc.push(['_trackEvent', '今日快报', '分享回流量', '', '', '']);
		}	
		
		//万年历来源
		if(NewsClient.from == 'calendar'){
			$('#baiduHotword,.detail-adbanner').css('display','none');
			if(IsIOS){
				if(UA.split('wnl').length > 1 && parseInt(UA.split(' ').pop().replace(/\./g,'')) >= 426){
					location.href = 'protocol://requestInjectedAd#1103821819#3030804535234237#1#adcallback';
				}
			}else if(IsAndroid){
				$('.detail-blink').css('margin-bottom','45px');
				if(UA.split('wnl').length > 1 && parseInt(UA.split(' ').pop().replace(/\./g,'')) >= 433){
					//广告集合
					if(UA.split('wnlver/73').length > 1){
						location.href = 'protocol://requestInjectedAd#1105#1105109#1#adcallback';
					}else{
						location.href = 'protocol://requestInjectedAd#1103948728#8090505569232602#1#adcallback';
					}
				}
			}
		}

		//金立手机
		if(NewsClient.from == 'jinli'){

			//APPid是MID
			//PID=USERID=publisherid
			//slotid是POSID

			//猎户广告请求
			$.ajax({
				//url:'http://m.news.liebao.cn/js/lh2.json',
				url:'http://rtb.mobad.ijinshan.com/b/?',
				dataType: 'json',
				type:'GET',
				data:{
					version : '1.0',
					publisherid: '111',
					bundle: 'm.news.liebao.cn',
					bver:'',
					app_id:'1258',
					slotid: '1258100',
					lang: 'cn',
					adtype: '4',
					timestamp: new Date().getTime(),
					platform: !!IsIOS ? 'ios' : 'android',
					osv: !!IsIOS ? UA.substr(UA.indexOf('Version')+8, 3) : UA.substr(UA.indexOf('Android')+8, 5),
					w: '',
					h: '',
					resolution: document.documentElement.clientHeight+'*'+document.documentElement.clientWidth,
					dpi: '2.0',
					tzone: encodeURIComponent('UTC+0800'),
					aid: '',
					gaid: '',
					client_ip: '',
					nt: '',
					model: '',
					brand: '',
					mcc: '',
					mnc: '',
					client_ua: encodeURIComponent(UA),
					adn: '1',
					format: 'json'
				},
				success: function(result) {
					if(result.ads.length){
						NewsClient.adList = result.ads;

						//点击上报
						$('#gdtSection').html('<a href="'+NewsClient.adList[0].click_url+'" class="lh_ads" data-view-url="'+NewsClient.adList[0].impr_tracking_url+'" data-click-url="'+NewsClient.adList[0].click_tracking_url+'"><img src="'+NewsClient.adList[0].background+'" /><span><i>推广</i>'+NewsClient.adList[0].desc+'</span><em></em></a>').click(function(){
							$.get($('.lh_ads').attr('data-click-url'), function(){});
						});

						//展示上报
						NewsClient.lhAdsReport();
					}
				}
			});
		}		
		
		//设置默认字体大小
		if(Cookie.get('newFontSize')){
			NewsDetail.fontsize = parseInt(Cookie.get('newFontSize'));
			NewsDetail.setFontSize(Cookie.get('newFontSize'), true);
		}else{
			NewsDetail.fontsize = 2;
			NewsDetail.setFontSize(2, true);
		}
		
		//改变字体大小
		$('.font-size').on('click', function(){
			if(NewsDetail.fontsize < 4){
				NewsDetail.fontsize = NewsDetail.fontsize+1;
				NewsDetail.setFontSize(NewsDetail.fontsize);			
			}else{
				NewsDetail.fontsize = 1;
				NewsDetail.setFontSize(NewsDetail.fontsize);			
			}
		});
		
		//顶
		$('.news-digg').on('click', function(){
			if($(this).hasClass('actived')){
				NewsClient.toast('已赞过');
				return; 
			}
			$(this).addClass('actived');
			$('.news-digg span').html(parseInt($('.news-digg span').html())+1);
			WIN['share']&&WIN['share'].setShare('mores');
			$.get('http://n.m.liebao.cn/stat/praise?pf=web&newsid='+NewsDetail.newsid, function(result){});
		});

		//项目来源
		var f = !!NewsClient.getQueryValue('f', '&') ? NewsClient.getQueryValue('f', '&').split('#')[0] : 'self';
		
		//设置埋点
		//SetStat.init(Cookie.get('Lb_uuid'), location.href, 'detail', f, getFrom());		
		
	},
	
	//获取数据
	getDataContent: function(id, productid){
		$.ajax({
			//url:'http://n.m.liebao.cn/news/detail?pf=web&aid='+id+'&columnid='+(!!NewsDetail.getQueryValue('cid','&') ? NewsDetail.getQueryValue('cid','&') : '0')+',
			url:'http://cr.m.liebao.cn/news/detail?scenario=0x00000101&lan=zh_CN&osv=5.1.1&appv=3.29.0&app_lan=zh_CN&ch=10000000&pid=3&action=0x3af&uuid='+Cookie.get('Lb_uuid')+'&pf=android&net=wifi&v=4&mnc=&ctype=0x26B&display=0xCF&contentid='+id+'&brand=google&mcc=&nmnc=&nmcc=&aid=f3e439a8082bd706&model=Nexus+5',
			dataType: 'json',
			type:'GET',
			success: function(result) {
				if(result && result.data.length){
					NewsDetail.renderHtml(result.data[0]);
				}else{
					$('#sync').addClass('none');
					$(".news_404").css({"display":"block"})
				}
				$('img').removeAttr('width').removeAttr('height');			
			},
			error: function(){
				return false;
			}
		});
	},
	
	//设置字体
	setFontSize:function(tempSize, init){
		var fontText = {1:"小号字", 2:"中号字", 3:"大号字", 4:"特大号字"};
		Cookie.set('newFontSize', tempSize, 1);
		switch(parseInt(tempSize)){
			case 1:
				$(".detail-content").css("font-size","0.875rem");//14pixel
				break;
			case 2:
				$(".detail-content").css("font-size","1.14rem");//16pixel
				break;
			case 3:
				$(".detail-content").css("font-size","1.29rem");//18pixel
				break;
			case 4:
				$(".detail-content").css("font-size","1.42rem");//20pixel
				break;			
			default:
				break;
		}
		if(!init){
			NewsDetail.toast('已调整为'+fontText[tempSize]);
		}
	},	

	//HTML转义
	HTMLDecode: function(str){
		var s ="";  
		if(str.length == 0) return"";
		s= str;
		s= s.replace(/src/ig,'class="imglazyload" src');

		//非wifi情况下
		if(NewsDetail.getQueryValue('iswifi','&') == '0'){
			console.log('Small graph model');
			s= s.replace(/_w685/ig, '_w200');
			s= s.replace(/.gif/ig, '.jpg');
			s= s.replace(/imglazyload/ig, 'imglazyload smallimg');
		}

		s= s.replace(/(^\s+)|(\s+$)/g,"");
		s= s.replace(/　/g,"");
		return s; 
	},
	safetyChain:function(str){//视频加密
      var timestamp=new Date().getTime();//时间戳
    	var signs=md5("" + "|"+ str + "|" + "" + "|" + "" + "|"+ "" + "|"+ "" + "|"  + "h5" + "|" +timestamp + "|" + "ds&dsjkVK");
    	var _this =this;
    	$.ajax({
    		url:"http://url.v.cmcm.com/q",
    		dataType:"json",
    		type:"GET",
    		async: false,//同步
    		data:{
    			vid:str,
					time:timestamp,
					cryptchannel:"h5",
					appver:"",
					osver:"",
					cryptver:"",
					channel:"",
					os:"",
					model:"",
					url:"",
					sign: signs.toLowerCase()
    		},
    		success:function(json){
    			if(json.ret=="0"){
    				clickUrl=json.data.play_url;
    				console.log("-------------视频源"+clickUrl)
    				//alert(clickUrl);
    				return clickUrl;
    			}
    		},
    		error: function(xhr, status, err) {
    			
        },
    	})
   	},
	//渲染数据
	renderHtml: function(data){

		//内容为空404
		if(data.body == ''){
			$('.detail-error404').css('display','block');
			$("#sync").addClass("none");
			return;
		}

		//目标来源
		var channel = NewsDetail.getQueryValue('source','&');
		//渠道来源
		var formApp = NewsDetail.getQueryValue('f','&');
		if((formApp == 'mxdetail' || formApp == 'calendar') && data.action && data.action == '0x08'){
			$('.detail-info,.detail-content,.news-blink').css('display','none');
			NewsDetail.iframeView(data.originalurl);
			$('title').html(data.title+' - 猎豹资讯');
		}else{
			//数据DOM渲染
			$('title').html(data.title+' - 猎豹资讯');
			if(data.ctype!="0x08"){
				$(".data-title").html(data.title);
			}
			
			$(".data-source").html(data.source);
			$(".data-date").html(new Date(parseInt(data.pubtime) * 1000).format("MM-dd hh:mm"));
			$(".data-content").html(NewsDetail.HTMLDecode(data.body));
			
			if(data.originalurl != ''){
				$(".detail-slink").css('display','none');
				$(".detail-slink").attr('href',data.originalurl);
			}
			$('.news-digg span').html(data.praisesum);		
		}		
		
		$("#sync").addClass("none");
		$(".detail-wrapper").removeClass("none");
		$('#SOHUCS').attr('sid', data.contentid);
		if(!IsLiebaoFast){
			for(var i=0;i<=$(".detail-content p,.detail-content center").length-1;i++){
				 if($(".detail-content p,.detail-content center").eq(i).html().replace(/(^\s*)|(\s*$)/g, "").substr(0,4)=="<img"){
				    $(".detail-content p img,.detail-content center img").css({"margin-bottom":"0px"})
				//    $(".detail-content p,.detail-content center").eq(i).append("<p class='openPic'>打开猎豹浏览器，查看更多<span class='PicName'></span>图集<span class='openPicImg'></span></p>")
				    if(data.categories[0].indexOf("/")>0){
				    	var categories=data.categories[0].split("/");
				    	categorie=categories[0];
				    }else{
				    	categorie=data.categories[0];
				    }
				    var categorieCN=""
				    var json={
				    	cate:[{english:"politics",chinese:"时政"},
				    	{english:"society",chinese:"社会"},
				    	{english:"entertainment",chinese:"娱乐"},
				    	{english:"sports",chinese:"体育"},
				    	{english:"military",chinese:"军事"},
				    	{english:"tech",chinese:"科技"},
				    	{english:"finance",chinese:"财经"},
				    	{english:"car",chinese:"汽车"},
				    	{english:"house",chinese:"房产"},
				    	{english:"fashion",chinese:"时尚"},
				    	{english:"relationship",chinese:"两性"},
				    	{english:"health",chinese:"健康"},
				    	{english:"education",chinese:"教育"},
				    	{english:"travel",chinese:"旅游"},
				    	{english:"world",chinese:"国际"},
				    	{english:"game",chinese:"游戏"},
				    	{english:"baby",chinese:"育儿"},
				    	{english:"history",chinese:"历史"},
				    	{english:"emotion",chinese:"情感"},
				    	{english:"culture",chinese:"文化"},
				    	{english:"horoscopes",chinese:"星座"},
				    	{english:"fitness",chinese:"减肥"},
				    	{english:"regimen",chinese:"养生"},
				    	{english:"food",chinese:"美食"},
				    	{english:"funny",chinese:"搞笑"},
				    	{english:"pet",chinese:"趣味"},
				    	{english:"humor",chinese:"段子"},
				    	{english:"video",chinese:"视频"},
				    	{english:"trending",chinese:"热点"},
				    	{english:"business",chinese:"商业"},
				    	{english:"lifestyle",chinese:"生活"},
				    	{english:"cricket",chinese:"板球"},
				    	{english:"science",chinese:"科学"},
				    	{english:"study_abroad",chinese:"留学"},
				    	{english:"gadgets",chinese:"数码"},
				    	{english:"anime",chinese:"动漫"},
				    	{english:"NBA",chinese:"NBA"},
				    	{english:"internet",chinese:"互联网"},
				    	{english:"anecdotes",chinese:"奇闻"},
				    	{english:"decoration",chinese:"家居"},
				    	{english:"knowledge",chinese:"涨姿势"},
				    	{english:"business",chinese:"商业"},
				    	{english:"beauty",chinese:"美容"},
				    	{english:"movie",chinese:"电影"},
				    	{english:"local",chinese:"地域"},
				    	{english:"photos",chinese:"图片"}
				    	]
				    }
				    for(var i=0;i<=json.cate.length-1;i++){
				    	if(categorie==json.cate[i].english){
				    		categorieCN=json.cate[i].chinese;
				    		break;
				    	}
				    }
				    $(".PicName").html(categorieCN);
				    break;
				}	
			}
		}
		//alert(data.bodyvideos);
		if(data.bodyvideos){
			if(data.bodyvideos!=""){
				//alert("afas")
	    		//alert(data.bodyvideos[0][0].url)
	    		NewsDetail.safetyChain(data.bodyvideos[0][0].url)
	    	}
		}
		$(".openPic").on("click",function(){
			if(IsWeixin){
				window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.ijinshan.browser_fast"
				return;
			}else if(IsAndroid){
				window.location.href="cmbrwsr://cmblocal/"				
			}else if(IsLiebaoFast){
				window.location.href="local://"
			}else if(IsIOS){
				window.location.href="https://itunes.apple.com/cn/app/id641522896";
				return;
			}
			
			setTimeout("window.location.href='http://dl.liebao.cn/android/tg/cheetah_cm_share.apk';",500);
		})
		//iframe过渡
//		IsAndroid && $(window).scroll(function(){
//			if(window.scrollY > 0){
//				!$('#iframeMask').length && $('body').append('<div id="iframeMask" style="position:absolute; top:0; left:0; width:100%; height:'+document.documentElement.clientHeight+'px; z-index:1; background:rgba(255,255,255,0.01); -webkit-scrollbar:none;"></div>');
//				document.addEventListener('touchmove', function(e){
//					e.stopPropagation();
//				}, true);
//			}else{
//				$('#iframeMask').remove();
//			}
//		});

		//CMS上报
		typeof window.NativeCall != 'undefined' && window.NativeCall.onPageFinish();

		//电池医生知否支持localStorage
		if(typeof localStorage == 'undefined'){
			if(NewsDetail.getQueryValue('f','&') == 'doctor'){
				$('#SOHUCS').addClass('i-doctor');
			}
		}

		//判断内容是否超高
		if($('.data-content').height() > 1500000){
			$('.data-content').css({'height':'1000px', 'overflow':'hidden'});
			//展示更多内容
			$('.detail-mores').css('display', 'block').on('click', function(){
				$(this).css('display', 'none');
				$(".detail-slink").css({'display':'block',"height":"32px"});
				$('.data-content').css('height', 'auto');
				_czc.push(['_trackEvent', (formApp == 'lbfx' ? '浏览器全文内容' : '全文内容'), '点击量', '', '', '']);
				//CMS
				typeof window.NativeCall != 'undefined' && window.NativeCall.setClickUnFold();
			});
			//CMS
			typeof window.NativeCall != 'undefined' && window.NativeCall.setIsFold('{isFold:true}');
		}else{
			//CMS
			typeof window.NativeCall != 'undefined' && window.NativeCall.setIsFold('{isFold:false}');
		}

		//阻止图片链接跳转行为
		$('img').on('click', function(e){
			e.preventDefault();
		});
		
		//获取用户浏览来源
		var from = !!Cookie.get('Lb_from') ? Cookie.get('Lb_from') : 'self';
		
		//更多按钮
//		if(channel == ''){
//			$(".detail-read").attr('href','http://m.news.liebao.cn/?f='+from+'#channel=news');
//		}else if(channel == 'top'){
//			$(".detail-read").attr('href','http://m.news.liebao.cn/top.html?f='+from);
//		}else if(channel.indexOf('group') >= 0){
//			var albumid = NewsDetail.getQueryValue('albumid','&');
//			$(".detail-read").attr('href','http://m.news.liebao.cn/group.html?albumid='+albumid+'&f='+from);
//		}else{
//			$(".detail-read").attr('href','http://m.news.liebao.cn/?f='+from+'#channel='+channel);
//		}

		if(formApp == 'cmshare'){
			_czc.push(['_trackEvent', 'CM分享', '浏览量', '', '', '']);
			$('.news-alist').attr('isPull','true').attr('isPush','true');
		}
		if(formApp == 'cms' || formApp == 'cmsnotification'){
			_czc.push(['_trackEvent', 'cms新闻结果页', '浏览量', '', '', '']);
		}	
		if(formApp == 'cmcleanresult' || formApp == 'cmhometab' || formApp == 'cmscreensaver' || formApp == 'cmold'){
			_czc.push(['_trackEvent', 'CM结果页', '浏览量', '', '', '']);
			$('.news-alist').attr('isPull','true').attr('isPush','true');
		}
		if(formApp == 'mxdetail'){
			_czc.push(['_trackEvent', '魔秀结果页', '浏览量', '', '', '']);
			$('.news-alist').attr('isPull','true').attr('isPush','true');
		}
		if(formApp == 'jinli'){
			_czc.push(['_trackEvent', '金立结果页', '浏览量', '', '', '']);
		}
		if(formApp == 'calendar'){
			_czc.push(['_trackEvent', '万年历新闻', '浏览量', '', '', '']);
		}

		//热门推荐第一屏
		NewsDetail.hotNews(1, data.contentid);
		$(window).scroll(function(){
			if($('.news-alist').attr('isPull')){ return; }
			if($('.news-alist-detail')[0].getBoundingClientRect().top <= document.documentElement.clientHeight){
				NewsDetail.hotNews(1, data.contentid);
			}
		});		
		var appCover = 'http://m.news.liebao.cn/images/jrkb.png';

		//CM5105前老版本 && 电池医生老版本兼容
		if(URL.indexOf('cmold') != -1){
			$('.news-digg,.detail-blink,.detail-adbanner,.news-related,.detail-hotword,.detail-read,.news-tuiapp,.i-code2,.detail-mores').css('display','none');
			$('.data-content').css('height','auto');
		}
		//CM推APP CM分享落地页
		if(URL.indexOf('cmcleanresult') != -1 || URL.indexOf('cmshare') != -1 || URL.indexOf('cmhometab') != -1 || URL.indexOf('cmscreensaver') != -1){
			var textArray = ['下载猎豹浏览器','下载猎豹浏览器深入体验','轻松一点，立刻拥有猎豹浏览器','下载猎豹浏览器看新鲜的世界'];
			var cmshare = (URL.indexOf('cmshare') != -1);
			var pos1 = true;
		
			//$('#tuiApp').css('display', 'block').append('<img src="/images/newsapp'+Math.round(Math.random()*3)+'.jpg" />');
			//$('.detail-title').after($('.detail-info').remove());
			$('.news-related-hot').css('display', 'none');
			$('.detail-read').html(textArray[Math.round(Math.random()*3)]).attr('href', 'javascript:;');
			
			if(!cmshare){
		
				//图片广告
				$('#tuiApp').on('click', function(){
					NewsDetail.cmDownLoad('com.ijinshan.browser_fast', 'http://dl.liebao.cn/android/tg/kbrowser_cm_toutiao.apk', '猎豹浏览器', 'http://m.news.liebao.cn/images/cmb_cover.png');
					_czc.push(['_trackEvent', 'CM新闻底部图片下载', '下载量', '', '', '']);
				});
				
				//按钮广告
				$('.detail-read').on('click', function(){
					NewsDetail.cmDownLoad('com.ijinshan.browser_fast', 'http://dl.liebao.cn/android/tg/kbrowser_cm_toutiao.apk', '猎豹浏览器', 'http://m.news.liebao.cn/images/cmb_cover.png');
					_czc.push(['_trackEvent', 'CM新闻底部下载', '下载量', '', '', '']);
				});

				if(URL.indexOf('cmcleanresult') != -1){
					if (!IsLiebaoFast) {
					//猎豹CM推送
						NewsDetail.tuiApp(['http://m.news.liebao.cn/images/cmb_cover.png','猎豹浏览器','独家新闻，个性呈现','打开', '猎豹浏览器：专属于你的头条新闻','http://dl.liebao.cn/android/cm/cheetah_cm_share1.apk', 'http://a.app.qq.com/o/simple.jsp?pkgname=com.ijinshan.browser_fast', '猎豹浏览器CM清理结果顶部下载', '猎豹浏览器CM清理结果底部下载']);
							_czc.push(['_trackEvent', '猎豹浏览器CM推送', '展现量', '', '', '']);
					}
				}else{
					//顶部广告
					if (!IsLiebaoFast) {
						NewsDetail.tuiTopApp([appCover, '猎豹浏览器', '随时看新闻，事事早知道。', '立即下载', function(){
							NewsDetail.cmDownLoad('com.ijinshan.browser_fast', 'http://dl.liebao.cn/android/tg/kbrowser_cm_toutiao.apk', '猎豹浏览器', 'http://m.news.liebao.cn/images/cmb_cover.png');
							_czc.push(['_trackEvent', 'CM新闻顶部下载', '下载量', '', '', '']);
						}]);
					}
				}

				//CM监听已经安装
				if(IsCM && CMObj.hasOwnProperty('checkInstall')) {
					var isInstall = JSON.parse(CMObj.checkInstall('["com.ijinshan.browser_fast"]'));
					if(isInstall['com.ijinshan.browser_fast']){
						$('#tuiApp,.detail-mores,.detail-read,.topad').css('display', 'none');
						$('.data-content').css('height', 'auto');
					}else{
						//CM广告展现量
						_czc.push(['_trackEvent', 'CM结果页顶部广告', '展现量', '', '', '']);
					}
				}
				// if(typeof cm_web_app != 'undefined' && cm_web_app.hasOwnProperty('checkInstall')) {
				// 	var isInstall = JSON.parse(cm_web_app.checkInstall('["com.ijinshan.news"]'));
				// 	if(isInstall['com.ijinshan.news']){
				// 		$('#tuiApp,.detail-mores,.detail-read,.topad').css('display', 'none');
				// 		$('.data-content').css('height', 'auto');
				// 	}else{
				// 		//CM广告展现量
				// 		_czc.push(['_trackEvent', 'CM结果页顶部广告', '展现量', '', '', '']);
				// 	}
				// }else if(typeof android != 'undefined' && android.hasOwnProperty('checkInstall')) {
				// 	var isInstall = JSON.parse(android.checkInstall('["com.ijinshan.news"]'));
				// 	if(isInstall['com.ijinshan.news']){
				// 		$('#tuiApp,.detail-mores,.detail-read,.topad').css('display', 'none');
				// 		$('.data-content').css('height', 'auto');
				// 	}else{
				// 		//CM广告展现量
				// 		_czc.push(['_trackEvent', ' CM结果页顶部广告', '展现量', '', '', '']);
				// 	}
				// }

				//CM新闻底部下载展现上报
				window.addEventListener('scroll', function(){
					if(document.getElementsByClassName('detail-read')[0].getBoundingClientRect().top <= 0){
						pos1 = false;
						return;
					}
					if(pos1 && (document.getElementsByClassName('detail-read')[0].getBoundingClientRect().top <= document.documentElement.clientHeight)){
						_czc.push(['_trackEvent', 'CM结果页底部广告', '展现量', '', '', '']);
						pos1 = false;
					}
				},false);

				//CM分享
				$('.news-share').append('<a href="javascript:;" class="i-more"><i></i></a>');
				$('.i-more').on('click', function(){		
					if(typeof android != 'undefined' && android.hasOwnProperty('share')) {
						android.share(6,'http://m.news.liebao.cn/detail.html?f=cmshare&newsid='+NewsDetail.newsid, '', '', 'http://m.news.liebao.cn/images/jrkb.png');
					}
					_czc.push(['_trackEvent', 'CM新闻分享', '分享量', '', '', '']);
				});
				$('.i-weibo').attr('data-cmd', '').on('click', function(){
					if(typeof android != 'undefined' && android.hasOwnProperty('share')) {
						android.share(4,'http://m.news.liebao.cn/detail.html?f=cmshare&newsid='+NewsDetail.newsid, '', '', '');
					}
					_czc.push(['_trackEvent', 'CM新闻分享', '分享量', '', '', '']);
				});
				$('.i-qzone').attr('data-cmd', '').on('click', function(e){
					e.preventDefault();
					if(typeof android != 'undefined' && android.hasOwnProperty('share')) {
						android.share(7,'http://m.news.liebao.cn/detail.html?f=cmshare&newsid='+NewsDetail.newsid, '', '', '');
					}
					_czc.push(['_trackEvent', 'CM新闻分享', '分享量', '', '', '']);
				});
			
			}else{
				$('#tuiApp,.detail-read').on('click', function(){
					location.href = 'http://dl.cm.ksmobile.com/static/res/2f/3e/ijinshannews.apk';
					_czc.push(['_trackEvent', 'CM新闻下载', '下载量', '', '', '']);
				});			
			}
		}
		
		//CMS
		if(formApp == 'cms' || formApp == 'cmsnotification'){
			var cms_version = 0;
			var cms_apkjson = '{"pkgName":"com.ijinshan.browser_fast","verCode":"30000666","size":"1965305","url":"http://dl.liebao.cn/android/tg/kbrowser_cm_toutiao.apk","appName":"猎豹浏览器"}';
			var textArray = ['下载猎豹浏览器拯救迷茫','下载猎豹浏览器深入体验','轻松一点，立刻拥有猎豹浏览器','下载猎豹浏览器看新鲜的世界'];
			var cms_gdtads = {};
			var adState = false;
			var urlJump = {gdt:'http://e.qq.com/',bd:'http://madv.baidu.com/',cm:'http://ad.cmcm.com/'};
		
			$('body').addClass('modify-cms');
			$('.detail-read').html(textArray[Math.round(Math.random()*3)]).attr('href', 'javascript:;');

			//cmsnotification渠道文章内容不折叠
			if(formApp == 'cmsnotification'){
				$('.detail-mores,.detail-blink,.detail-read').css('display', 'none');
				$('.data-content').css('height', 'auto');
			}
			
			//嵌入广点通
			if(typeof window.NativeCall != 'undefined'){
				
				cms_gdtads = window.NativeCall.getAdJson();
				if(cms_gdtads){
					cms_gdtads = JSON.parse(cms_gdtads);
					$('#tuiApp').css('display', 'block').append('<div class="news-adplus"><img src="'+cms_gdtads.coverUrl+'"><p><span class="i-appname">'+cms_gdtads.title+'<em class="adtype-'+cms_gdtads.adName+'"></em></span><span>'+cms_gdtads.body+'</span></p></div>');
					$('#tuiApp').on('click', function(){
						window.NativeCall.adClick();
						_czc.push(['_trackEvent', 'CMS广点通广告', '点击量', '', '', '']);
					});
					//广告展示上报
					$(window).scroll(function(){
						if(adState){
							return; 
						}
						if($('#tuiApp')[0].getBoundingClientRect().top <= document.documentElement.clientHeight){
							window.NativeCall.onAdShow();
							_czc.push(['_trackEvent', 'CMS广点通广告', '展现量', '', '', '']);
							adState = true;
						}
					});
				}
			}

			//判断是否安装并调起
			if(typeof window.NativeCall != 'undefined'){
				var isInstall = JSON.parse(window.NativeCall.checkInstall('["com.ijinshan.browser_fast"]'))['com.ijinshan.browser_fast'];
				if(isInstall){
					//调起APP
					$('.detail-read').html('打开猎豹浏览器').on('click', function(){
						window.NativeCall.openInstallApp();
					});
					NewsDetail.tuiTopApp([appCover, '猎豹浏览器', '随手刷新闻，事事早知道。', '立即打开', function(){
						window.NativeCall.openInstallApp();
					}]);
				}else{
					//判断cms版本下载
					cms_version = JSON.parse(window.NativeCall.getVerJson()).version;
					cms_version && $('.detail-read').on('click', function(){
						NewsDetail.cmsDownLoad(cms_apkjson);
						_czc.push(['_trackEvent', 'CMS新闻下载', '下载量', '', '', '']);
					});
					NewsDetail.tuiTopApp([appCover, '猎豹浏览器', '随手刷新闻，事事早知道。', '立即下载', function(){
						NewsDetail.cmsDownLoad(cms_apkjson);
						_czc.push(['_trackEvent', 'CMS顶部新闻下载', '下载量', '', '', '']);
					}]);
					//CMS广告展现量
					_czc.push(['_trackEvent', 'CMS结果页广告', '展现量', '', '', '']);
				}
			}
		}

		//魔秀
		if(formApp == 'mxdetail'){

			var gdtads;

			$('body').addClass('modify-moxiu');
			if(typeof window.MX_NativeCall != 'undefined'){
				gdtads = window.MX_NativeCall.getAdJson_MX();
				if(gdtads){
					gdtads = JSON.parse(gdtads);
					$('#tuiApp').css('display', 'block').append('<div class="news-adplus"><img src="'+gdtads.coverUrl+'"><p><span class="i-appname">'+gdtads.title+'<em class="adtype-gdt"></em></span><span>'+gdtads.body+'</span></p></div>');
					$('#tuiApp').on('click', function(){
						window.MX_NativeCall.adClick_MX();
					});
				}
			}else if(typeof window.protocol != 'undefined'){
				gdtads = window.protocol.requestDetailAd();
				if(gdtads){
					gdtads = JSON.parse(gdtads);
					$('#tuiApp').css('display', 'block').append('<div class="news-adplus"><img src="'+gdtads.coverUrl+'"><p><span class="i-appname">'+gdtads.title+'<em class="adtype-gdt"></em></span><span>'+gdtads.body+'</span></p></div>');
					$('#tuiApp').on('click', function(){
						window.protocol.clickDetailAd();
					});
				}
			}
		}

		//猎豹分享
		if(formApp == 'lbfx'){
			$('body').addClass('modify-lbfx');

			//分享点击上报
			$('.detail-blink').on('click', function(){
				_czc.push(['_trackEvent', '浏览器分享', '分享点击量', '', '', '']);
			});			
		}

		//猎豹CM推送
		if(formApp == 'lbcm'){
			if (!IsLiebaoFast) {
				NewsDetail.tuiApp(['http://m.news.liebao.cn/images/cmb_cover.png','猎豹浏览器','独家新闻，个性呈现','', '猎豹浏览器：专属于你的头条新闻','http://dl.liebao.cn/android/cm/cheetah_cm_share1.apk', 'http://a.app.qq.com/o/simple.jsp?pkgname=com.ijinshan.browser_fast', '猎豹浏览器CM推送顶部下载', '猎豹浏览器CM推送底部下载']);
				_czc.push(['_trackEvent', '猎豹浏览器CM推送', '展现量', '', '', '']);
			}
		}		

		//电池医生Push
		if(formApp == 'cmbdpush'){
			$('body').addClass('modify-cleanall');
		}

		//电池医生
		if(formApp == 'cmbdold'){
			$('.detail-read').css('display', 'none');	
		}

		//小图模式iswifi=0
		if(NewsDetail.getQueryValue('iswifi','&') == '0'){
			NewsDetail.imgClickZoom();
		}
		
		//删除分享标示
		if(URL.indexOf('cmcleanresult') != -1){
			$('.i-weibo,.i-qzone,.i-more').attr('data-cmd','');
		}
		
		//传统渠道推送APP
//		if(IsAndroid){
			if(formApp == 'topic' || formApp == 'cmbdpush' || formApp == 'cmcleanresult' || formApp == 'mxdetail' || formApp == 'cms' || formApp == 'cmold' || formApp == 'calendar' || formApp == 'cmbdold' || formApp == 'cmweather' || formApp == 'cmhometab' || formApp == 'cmscreensaver' || formApp == 'cmsnotification' || formApp == 'jinli' || formApp == 'lbls' || formApp == 'weimi' || formApp == 'lbsc' || formApp == 'lbcm'){
				return;
			}

			if(formApp == 'lbfx'){
				if (!IsLiebaoFast) {
					NewsDetail.tuiApp(['http://m.news.liebao.cn/images/cmb_cover.png','游戏超人','玩游戏必备利器，游戏超人带你飞','', '猎豹浏览器：专属于你的头条新闻','http://dl.liebao.cn/android/tg/cheetah_cm_share.apk', 'http://a.app.qq.com/o/simple.jsp?pkgname=com.ijinshan.browser_fast', '浏览器顶部下载', '浏览器底部下载']);
					_czc.push(['_trackEvent', '猎豹浏览器分享', '展现量', '', '', '']);
					_czc.push(['_trackEvent', '浏览器顶部下载', '展现量', '', '', '']);
					_czc.push(['_trackEvent', '浏览器底部下载', '展现量', '', '', '']);
				}
			}else{
				//非定制下载
				if (!IsLiebaoFast) {
					NewsDetail.tuiApp(['http://m.news.liebao.cn/images/cmb_cover.png','游戏超人','玩游戏必备利器，游戏超人带你飞','', '猎豹浏览器：专属于你的头条新闻','http://dl.liebao.cn/android/tg/cheetah_cm_share.apk', 'http://a.app.qq.com/o/simple.jsp?pkgname=com.ijinshan.browser_fast', '非定制顶部下载','非定制底部下载']);
					_czc.push(['_trackEvent', '非定制结果页', '浏览量', '', '', '']);
					_czc.push(['_trackEvent', '非定制下载', '展现量', '', '', '']);
				}
			}

			//评论加载
//			NewsDetail.commentsList();
			NewsDetail.initCommentCMCM();


//		}
//		else if(IsIOS){
//			//评论加载
//			NewsDetail.commentsList();
//			_czc.push(['_trackEvent', '非定制结果页', '浏览量', '', '', '']);
//		}
		if(IsLiebaoFast){
			$(".detail-read").css({"display":"none"})
		}
		if(data.bodyvideos){
			if(data.bodyvideos!=""){
	//    		alert(data.bodyvideos[0][0].thumbnail[0])
	//    		alert(clickUrl);
		      	$("video").attr({"src":clickUrl,"type":"audio/mpeg","controls":"controls","poster":data.bodyvideos[0][0].thumbnail[0]})
		      	//$("video").css({"background-image":"url("+JSON.parse(data.bodyvideos)[0][0].thumbnail[0]+")"});
		    }
		}
	},
	
	//CM客户端下载方法
	cmDownLoad: function(pkg,apk,title,icon){
		if(IsCM && CMObj.hasOwnProperty('downloadapp')) {
			CMObj.downloadapp(pkg,apk,title,icon);
		}

		// if(typeof cm_web_app != 'undefined' && cm_web_app.hasOwnProperty('downloadapp')) {
		// 	cm_web_app.downloadapp(pkg,apk,title,icon);
		// }else if(typeof android != 'undefined' && android.hasOwnProperty('downloadapp')) {
		// 	android.downloadapp(pkg,apk,title,icon);
		// }
	},
	
	//CMS客户端下载方法
	cmsDownLoad: function(str){
		if(typeof window.NativeCall != 'undefined'){
			window.NativeCall.downloadFile(str);
		}
	},
	
	//推送APP arguments[顶部推送图标, 顶部推送标题, 顶部推送描述, 顶部按钮文案, 底部推送描述, APP下载链接, 应用宝下载链接, 顶部渠道名称, 底部渠道名称]
	tuiApp: function(arg){
		var tempUrl = '';
		!!IsWeixin ? (tempUrl = arg[6]) : (tempUrl = arg[5]);
	
		$('.topad .i-icon').attr('src', arg[0]);
		$('.topad .i-title').html(arg[1]);
		$('.topad .i-desc').html(arg[2]);
		$('.topad .i-open').html(arg[3]);
		$('.topad a').attr('href', tempUrl).attr('onclick', "_czc.push(['_trackEvent', '"+(!!arg[7] ? arg[7] : '非定制顶部下载' )+"', '点击量', '', '', '']);");
//		$('.detail-read').html(arg[4]).attr('href', tempUrl).addClass('detail-read-download').attr('onclick', "_czc.push(['_trackEvent', '"+(!!arg[8] ? arg[8] : '非定制底部下载' )+"', '点击量', '', '', '']);");
		//$('.detail-read').html(arg[4]).addClass('detail-read-download');
		!Cookie.get('Lb_detailad') && $('.topad').css('display', 'block');
		$('.i-close').on('click', function(){
			$('.topad').css('display', 'none');
//			Cookie.set('Lb_detailad',168);
		});	
		
	},

	//单独推送APP[元素, 应用宝下载链接, APP下载链接, 渠道名称, 渠道事件]
	tuiApps: function(arg){
		var tempUrl = '';
		var pos1 = true;
		!!IsWeixin ? (tempUrl = arg[1]) : (tempUrl = arg[2]);
		$('.changyan-mores').attr('href', tempUrl);

        //展示上报
        window.addEventListener('scroll', function(){
            if(pos1 && (document.getElementsByClassName('changyan-mores')[0].getBoundingClientRect().top <= document.documentElement.clientHeight)){
                _czc.push(['_trackEvent', arg[3], arg[4], '', '', '']);
                pos1 = false;
            }            
        },false);
	},
	
	//推送TOP arguments[顶部推送图标, 顶部推送标题, 顶部推送描述, 顶部按钮文案, 回调函数]
	tuiTopApp: function(arg){
		$('.topad .i-icon').attr('src', arg[0]);
		$('.topad .i-title').html(arg[1]);
		$('.topad .i-desc').html(arg[2]);
		$('.topad .i-open').html(arg[3]);
		!Cookie.get('Lb_detailad') && $('.topad').css('display', 'block');
		$('.i-close').on('click', function(){
			$('.topad').css('display', 'none');
//			Cookie.set('Lb_detailad',1);
		});;
		$('.topad a').on('click', function(){
			arg[4] && arg[4]();
		});	},
	
	//创建iframe
	iframeView: function(url){
		var frame = document.createElement('iframe');
		frame.id= "iframeView";
		frame.width = "100%";
		frame.height = document.documentElement.clientHeight;
		frame.seamless = "seamless";
		frame.border = "0";
		frame.frameborder = "no";
		frame.marginwidth = "0";
		frame.marginheight = "0";
		frame.style.border = "none";
		frame.src = url;
		document.getElementsByTagName('body')[0].insertBefore(frame, document.getElementById('sync'));
	},
	getQueryString:function(name){
	    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	    var r = window.location.search.substr(1).match(reg);
	    if(r!=null)return  unescape(r[2]); return null;
	},
	putTime:function(pubtime){
		var now = Math.ceil(Date.now() / 1000);
        var diff = now - pubtime;
        if( diff > 0 && diff < 60 ){
          _pubtime = '刚刚';
        }else if( diff > 0 && diff < 60 * 60){
          _pubtime = Math.ceil(diff / 60) + '分钟前';
        }else if ( diff > 0 && diff < 24 * 60 * 60){
          _pubtime = Math.ceil(diff / 60 / 60) + '小时前';
        }else{
          var date = new Date(pubtime * 1000);
          _pubtime = date.format('yyyy-MM-dd hh:mm:ss');
        }
        return _pubtime;
	},
	initCommentCMCM: function(){
		var resid=NewsDetail.getQueryString("newsid");
        $.ajax({
          url:'http://svcn.cm.ksmobile.net/comment/get?app=cmb&source=common&st=1487745556&sg=b1d88c176901757969348620c171ac66&resid='+resid,
          success: function(text){
          	console.log("------获取评论数据-------")          	
            try{
             text = JSON.parse(text);
            }catch(e){}
            console.log(text)
            var a="";
            if(text.data.length>0){
            	$("#comments-cmcm").css({"display":"block","margin-bottom":"35px;"});
            	var dataLen=1;
            	if(text.data.length==1){
            		dataLen=0;
            	}
            	for(var i=0;i<=dataLen;i++){
	            	a+='<li class="comment-top">'+
					'<img src="'+text.data[i].user_avatar+'">'+
					'<address>'+text.data[i].user_name+'</address>'+
					'<time>'+NewsDetail.putTime(text.data[0].pubtime)+'</time>'+
					'<p>'+text.data[i].content+'</p>'+
					'<div class="comment-likes">'+text.data[i].is_like+'</div>'+
				'</li>';
	            }
				$(".comments-top").html(a);
				$(".comment_num").html(text.data.length);
				if(IsLiebaoFast){
					$(".open_liebao").css({"display":"none"})
				}
            }
            
          },
          error: function(){
			console.log("error")
          },
        })

     
      

      
    },
	//畅言
	commentsList: function(){
		var ss = document.createElement('script'), 
			hh = document.getElementsByTagName('head')[0];
			ss.type = 'text/javascript';
			ss.id = "changyan_mobile_js";
			ss.async = true;
			ss.charset = 'utf-8';
			ss.src = 'http://changyan.sohu.com/upload/mobile/wap-js/changyan_mobile.js?client_id=cyruNjvn2&conf=prod_23b5217d21b24a866c841a26ba1763b9';
			hh.appendChild(ss);	

		//渠道来源
		var formApp = NewsDetail.getQueryValue('f','&');

		if(IsAndroid){
			window._config = {
				isNewVersion: true,
				page_size: 2,
				hot_size: 0
			}
		}else{
			window._config = {
				isNewVersion: true
			}
		}

		var isFlag = false;
		var timer = setInterval(function(){
			if($('#cy-latest-list-wrapper').length && !isFlag){
				$('.changyan-wrapper').css('display', 'block');
				if(IsIOS){
					$('#cy-page').css('display','block');
				}else{
					if($('#cy-latest-list-wrapper article').length >= 2){
						//获取评论数
						NewsDetail.getCommentsNum($('#SOHUCS').attr('sid'));

						$('.changyan-mores').css('display', 'block').on('click', function(){
							_czc.push(['_trackEvent', (formApp == 'lbfx' ? '浏览器评论' : '评论'), '查看更多点击', '', '', '']);
						});
						NewsDetail.tuiApps(['.changyan-mores', 'http://a.app.qq.com/o/simple.jsp?pkgname=com.ijinshan.browser_fast', 'http://dl.liebao.cn/android/tg/cheetah_cm_share.apk', (formApp == 'lbfx' ? '浏览器评论' : '评论'), '查看更多展现']);
					}				
				}
				isFlag = true;
				timer && clearInterval(timer);
			}
		},200);
	},

	//获取评论数
	getCommentsNum: function(str){
		$.ajax({
			url: 'http://changyan.sohu.com/api/2/topic/count.php',
			dataType: 'jsonp',
			type:'GET',
			jsonpCallback:"callback",
			data:{
				client_id: 'cyruNjvn2',
				topic_source_id: str
			},
			success: function(res){
				if(res.result){
					if(parseInt(res.result[str].comments) > 2){
						document.querySelector('.changyan-mores').innerHTML = '下载客户端，查看全部'+res.result[str].comments+'条评论';
					}
				}
			},
			error: function(){
				
			}
		});
	},
	//热门推荐
	hotNews:function(type, contentid){

		var statType = (type == 1 ? '一' : '二');
		var renderStyle = (type == 1 ? 'isPull' : 'isPush');
		var	timeFlag = '刚刚',
			newDate = new Date().getTime(),
			tempTime = 0;

		//渠道来源
		var formApp = NewsDetail.getQueryValue('f','&') == 'lbfx' ? '浏览器' : '';			
		
		//标记已经填充数据
		$('.news-alist').attr(renderStyle, 'true');
	
		$.ajax({
			//url:'http://n.m.liebao.cn/news/fresh?pf=web&cid=0&maxtime='+parseInt(new Date().getTime()/1000)+'&uuid='+Cookie.get('Lb_uuid')+'&source=detailpage_relative',
			url:'http://cr.m.liebao.cn/news/recommend?scenario=0x00000505&lan=zh_CN&osv=5.1.1&appv=3.29.0&app_lan=zh_CN&ch=10000000&pid=3&action=0x3af&uuid='+Cookie.get('Lb_uuid')+'&pf=android&net=wifi&v=4&mnc=&ctype=0x01&display=0xCF&contentid='+contentid+'&brand=google&mcc=&nmnc=&nmcc=&aid=f3e439a8082bd706&model=Nexus+5',
			dataType: 'json',
			type:'GET',
			success: function(result) {
				if(result.data.length){
				var html = [],
				    topHtml=[],
					isOpen = false,
					dataContentList = [],
					contentWrap,
					flag = {1:'i-hot', 2:'i-tuijian', 3:'i-local', 5:'i-new'},
					url,
					defaultImg = '/images/default.gif',
					jumpUrl = 'detail.html?cid=0&newsid=',
					jumpUrlVideo = 'video.html?newsid=',
					channel = 'news',
					from = !!Cookie.get('Lb_from') ? Cookie.get('Lb_from') : 'self';
					
					for(var k=0,j=result.data.length; k<j; k++){
						
						tempTime = parseInt((parseInt(newDate/1000) - parseInt(result.data[k].pubtime))/60);
						
						if(tempTime > 1 && tempTime < 60){
							timeFlag = tempTime+'分钟前';
						}else if(tempTime >= 60 && tempTime <= 60*24){
							timeFlag = parseInt(tempTime/60)+'小时前';
						}else if(parseInt(tempTime/60) >= 24){
							timeFlag = new Date(parseInt(result.data[k].pubtime*1000)).format("MM/dd hh:mm");
						}			
					
						if(result.data[k].display == '0x02'){
							if(k<=1 && !IsLiebaoFast){
								html.push('<dl class="swiper-slideNews i-style01" data-contentid="'+result.data[k].contentid+'" data-href="'+(result.data[k].action == '0x01' ? result.data[k].originalurl : jumpUrl+result.data[k].contentid )+'&source='+channel+'&f='+from+'"><dd><p>'+result.data[k].title+'</p><p class="i-infos"><img src="../images/h5_mark.png" style="position: relative;top: 2px;width:70px;height:13px;margin-right:6px"><span class="i-source">'+result.data[k].source+'</span></p></dd><dt><img osrc="'+result.data[k].images[0]+'" class="imgbox"  src="'+defaultImg+'" /></dt></a></dl>');								
							}else{
								html.push('<dl class="i-style01"><a href="'+(result.data[k].action == '0x01' ? result.data[k].originalurl : jumpUrl+result.data[k].contentid )+'&source='+channel+'&f='+from+'" onclick="_czc.push([\'_trackEvent\', \''+formApp+'推荐新闻第'+statType+'屏\', \'点击量\', '+result.data[k].contentid+', \'\', \'\']);"><dd><p>'+result.data[k].title+'</p><p class="i-infos"><span class="i-source">'+result.data[k].source+'</span></p></dd><dt><img osrc="'+result.data[k].images[0]+'" class="imgbox"  src="'+defaultImg+'" /></dt></a></dl>');								
							}
						}else if(result.data[k].display == '0x01' || result.data[k].display == '0x04'){
							if(k<=1 && !IsLiebaoFast){
								html.push('<dl class="swiper-slideNews i-style02" data-contentid="'+result.data[k].contentid+'" data-href="'+(result.data[k].action == '0x01' ? result.data[k].originalurl : jumpUrl+result.data[k].contentid )+'&source='+channel+'&f='+from+'"><dt>'+result.data[k].title+'</dt><dd>'+ (result.data[k].images.length>=3 ? '<ul class="clearfix"><li><img osrc="'+result.data[k].images[0]+'" class="imgbox"  src="'+defaultImg+'" /></li><li><img osrc="'+result.data[k].images[1]+'" class="imgbox"  src="'+defaultImg+'" /></li><li><img osrc="'+result.data[k].images[2]+'" class="imgbox"  src="'+defaultImg+'" /></li></ul>' : '') +'<p class="i-infos"><img src="../images/h5_mark.png" style="position: relative;top: 2px;width:70px;height:13px;margin-right:6px"><span class="i-source">'+result.data[k].source+'</span></p></dd></dl>');								
							}else{
								html.push('<dl class="i-style02"><a href="'+(result.data[k].action == '0x01' ? result.data[k].originalurl : jumpUrl+result.data[k].contentid )+'&source='+channel+'&f='+from+'" onclick="_czc.push([\'_trackEvent\', \''+formApp+'推荐新闻第'+statType+'屏\', \'点击量\', '+result.data[k].contentid+', \'\', \'\']);"><dt>'+result.data[k].title+'</dt><dd>'+ (result.data[k].images.length>=3 ? '<ul class="clearfix"><li><img osrc="'+result.data[k].images[0]+'" class="imgbox"  src="'+defaultImg+'" /></li><li><img osrc="'+result.data[k].images[1]+'" class="imgbox"  src="'+defaultImg+'" /></li><li><img osrc="'+result.data[k].images[2]+'" class="imgbox"  src="'+defaultImg+'" /></li></ul>' : '') +'<p class="i-infos"><span class="i-source">'+result.data[k].source+'</span></p></dd></dl>');								
							}
						}
						if(k<=2){
							if(result.data[k].images[0]){
								topHtml.push('<div class="swiper-slideNews swiper-slide" data-contentid="'+result.data[k].contentid+'" data-href="'+(result.data[k].action == '0x01' ? result.data[k].originalurl : jumpUrl+result.data[k].contentid )+'&source='+channel+'&f='+from+'"><img class="topbar_img" src="'+result.data[k].images[0]+'"><p class="topbar_info">'+result.data[k].title+'</p><span class="i-openApp"></span><span class="i-close"></span></div>')
							}else{
								topHtml.push('<div class="swiper-slideNews swiper-slide" data-contentid="'+result.data[k].contentid+'" data-href="'+(result.data[k].action == '0x01' ? result.data[k].originalurl : jumpUrl+result.data[k].contentid )+'&source='+channel+'&f='+from+'"><p style="margin-left:17px;margin-right:30px;color:#fff;margin-top:6px;text-overflow: ellipsis;display: -webkit-box;-webkit-line-clamp: 2;-webkit-box-orient: vertical;overflow: hidden;max-width: 56%;">'+result.data[k].title+'</p><span class="i-openApp"></span><span class="i-close"></span></div>')
							}
						}
					}
					$('.news-alist').css('display','block').append(html.join(''));
					$(".swiper-pagination").css({"display":"block"});
					$(".topad").css({"height":"60px"});
					$('.swiper-wrapper').append(topHtml.join(''));
					if(IsAndroid){
						$(".openAPP").css({"line-height":"18px"});
					}
					$(".i-close").on("click",function(e){
						e.stopPropagation();
						$(".topad").css({"display":"none"});
					})
					$(".swiper-slideNews,.open_liebao").on("click",function(){
						var contentid=$(this).attr("data-contentid") || NewsDetail.getQueryString("newsid");
						if(IsWeixin){
							window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.ijinshan.browser_fast"
							return;
						}else if(IsAndroid){
							window.location.href="cmbrwsr://cmblocal/news/"+contentid;
						}else if(IsLiebaoFast){
							window.location.href="local://news/"+contentid;		
						}else if(IsIOS){
							window.location.href="https://itunes.apple.com/cn/app/id641522896"
							return;
						}
						var href="http://dl.liebao.cn/android/tg/cheetah_cm_share.apk"
						setTimeout("window.location.href='"+href+"';",500);
					})
					_czc.push(['_trackEvent', (formApp == 'lbfx' ? '浏览器热门推荐第'+statType+'屏' : '热门推荐第'+statType+'屏'), '展现量', NewsDetail.getQueryValue('newsid','&'), '', '']);
				}else{
					$(".swiper-pagination").remove()
					$(".topad").css({"height":"55px"});
						if(NewsClient.from == 'gamehelper'){
							$(".topad,.tc,.detail-info,.news-related").css({"display":"none"});							
						}
					$('.news-related-hot').css('display', 'none');
				}

				//图片懒加载
				NewsClient.loadImage();

			},
			error: function(){
				URL.indexOf('cmcleanresult') != -1 && $('.news-related-hot,.detail-read').css('display', 'none');
			}
		});
	},

	//小图放大
	imgClickZoom: function(){
		var imageEls = document.getElementsByClassName('imglazyload');
		var tempUrl = '';
		for (var i = 0, l = imageEls.length; i < l; i++) {
			tempUrl = imageEls[i].src;
			$(imageEls[i]).before('<span class="imgloads"></span>').remove();
			$('.imgloads').eq(i).html('<img class="imglazyload smallimg" src="'+tempUrl+'" />');
		}

		$("img").live('click',function(e){
			e.preventDefault();
			var _this = $(this);
			//2G下只触发一次加载
			if(_this.hasClass('smallimg') && !_this.attr('isflag')){
				newUrl = _this.attr('src').replace(/_w200/ig,'_w685');

				if(_this.attr('type')){
					newUrl = newUrl.replace(/.jpg/ig, '.gif');
				}
				
				_this.parent().addClass('imgloads-show');
				_this.removeClass('smallimg');
				_this.attr('src', newUrl);
				_this.attr('isflag', 'true');

				/* 预加载图片，在图片load成功成功之后 */
				var preLoader = new Image();
				preLoader['src'] = newUrl;
				preLoader.onload = function() {
					_this.parent().removeClass('imgloads-show');
				}
			}
		});
	},
	
	//详情页向上滑动事件
	touchEvent: function(event){
		var e = event || window.event;
        switch(e.type){
            case "touchstart":
				NewsDetail.oPageY = e.targetTouches[0].pageY;
                break;
            case "touchmove":
				if(e.changedTouches[0].pageY > NewsDetail.oPageY){
					$('.bottomad').css('display','block');
				}else{
					$('.bottomad').css('display','none');
				}
                break;			
        }	
	},	

	//toast
	toast: function(text, ms){
		if (!text) {
			return false;
		}
		var dom = $('<div class="public_toast">' + text + '</div>');
		var ms = ms || 1500;
		$('body').append(dom);
		setTimeout(function() {
			dom.addClass('public_toast_show');
		}, 10);
		setTimeout(function() {
			dom.removeClass('public_toast_show');
			dom.on('webkitTransitionEnd', function() {
				dom.remove();
			});
		}, ms);
	},
	
	//获取对象长度
	objectSize: function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	},	
	
	//URL查询
	getQueryValue: function(key, style){
		var match=location.href.match(new RegExp(key+'=([^'+style+']*)'));
		return match&&match[1]||'';
	}
}

//视频详情页
var NewsVideo = {
	//新闻ID
	newsid:0,
	//初始化
	init:function(){
		//根据id加载新闻
		NewsVideo.newsid = NewsVideo.getQueryValue('newsid','&');		
		NewsVideo.getDataContent(NewsVideo.newsid);
	},
	
	//获取数据
	getDataContent: function(id){
		$.ajax({
			url:'http://n.m.liebao.cn/news/detailVideo?aid='+id+'&pf=web',
			dataType: 'json',
			type:'GET',
			success: function(result) {
				if(result && result.data && result.data.aid){
					NewsVideo.renderHtml(result.data);
				}		
			},
			error: function(){
				return false;
			}
		});
	},	
	
	//渲染数据
	renderHtml: function(data){

		var item = 6; //分组数量
		var page = 2; //加载数
	
		if(typeof data === 'string'){
			data = JSON.parse(data);
		}
		if(data.content == ''){
			$('.error404').css('display','block');
			$("#sync").addClass("none");
			return;
		}
		
		//目标来源
		var channel = NewsDetail.getQueryValue('source','&');	
		
		//数据渲染
		if(data.ctype!="0x08"){
			$(".data-title").html(data.title);
		}
		$(".data-source").html(data.source);
		$(".data-date").html(new Date(parseInt(data.publish_time) * 1000).format("yyyy-MM-dd hh:mm"));
		$(".data-video-pic").attr('src', data.big_img);
		$('.news-digg span').html();

		//视频播放
		$('.i-video').on('click', function(){
			$(this).addClass('active');
			setTimeout(function(){
				$(this).removeClass('active');
			}.bind(this), 100)
		});
		
		//热门视频
		if(data.videos.length){
			var html = [];

			for(var i=0; i<item; i++){
				html.push('<li><a href="http://m.news.liebao.cn/video.html?newsid='+data.videos[i].aid+'"><span><img src="'+data.videos[i].img+'"/><i>'+new Date(parseInt(data.videos[i].duration) * 1000).format("mm:ss")+'<em>'+data.videos[i].reads+'</em></i></span><p>'+data.videos[i].title+'</p></a></li>');
			}
			$('.video-related ul').html('');
			$('.video-related ul').append(html.join(''));
			$('.video-related').css('display','block');
		}
		
		//加载更多
		$(".i-mores").on('click', function(){
			var html = [];
			if(item*page < data.videos.length){
				for(var i=item*(page-1); i<item*page; i++){
					html.push('<li><a href="http://m.news.liebao.cn/video.html?newsid='+data.videos[i].aid+'"><span><img src="'+data.videos[i].img+'"/><i>'+new Date(parseInt(data.videos[i].duration) * 1000).format("mm:ss")+'<em>'+data.videos[i].reads+'</em></i></span><p>'+data.videos[i].title+'</p></a></li>');
				}
				page = page+1;
			}else{
				for(var i=item*(page-1); i<data.videos.length; i++){
					html.push('<li><a href="http://m.news.liebao.cn/video.html?newsid='+data.videos[i].aid+'"><span><img src="'+data.videos[i].img+'"/><i>'+new Date(parseInt(data.videos[i].duration) * 1000).format("mm:ss")+'<em>'+data.videos[i].reads+'</em></i></span><p>'+data.videos[i].title+'</p></a></li>');
					$(".i-mores").css('display', 'none');
				}
			}
			$('.video-related ul').append(html.join(''));
		});
		
		//获取用户浏览来源
		var from = !!Cookie.get('Lb_from') ? Cookie.get('Lb_from') : 'self';
		
		//更多按钮
//		if(channel == ''){
//			$(".detail-read").attr('href','http://m.news.liebao.cn/?f='+from+'#channel=news');
//		}else if(channel == 'top'){
//			$(".detail-read").attr('href','http://m.news.liebao.cn/top.html?f='+from);
//		}else if(channel.indexOf('group') >= 0){
//			var albumid = NewsDetail.getQueryValue('albumid','&');
//			$(".detail-read").attr('href','http://m.news.liebao.cn/group.html?albumid='+albumid+'&f='+from);
//		}else{
//			$(".detail-read").attr('href','http://m.news.liebao.cn/?f='+from+'#channel='+channel);
//		}

		//显示内容
		$("#sync").addClass("none");
		$(".video-wrapper").removeClass("none");
	},
	
	//URL查询
	getQueryValue: function(key, style){
		var match=location.href.match(new RegExp(key+'=([^'+style+']*)'));
		return match&&match[1]||'';
	}	
}

//专题详情页
var NewsTopic = {
	//专辑ID
	topicid:0,
	//初始化
	init:function(){
		//根据id加载新闻
		NewsTopic.topicid = NewsVideo.getQueryValue('topicid','&');		
		NewsTopic.getDataContent(NewsTopic.topicid);
	},
	
	//获取数据
	getDataContent: function(id){
		$.ajax({
			url:'http://cr.m.liebao.cn/news/album?contentid='+id+'&model=MI+3W&mcc=460&osv=4.4.4&ctype=0x1EB&pid=3&display=0xCF&aid=53b9b52f336c1023&net=wifi&nmnc=00&mode=2&appv=3.27.2&v=3&pf=web&scenario=0x00000101&lan=en_US&action=0x0f&brand=Xiaomi&nmcc=460&mnc=00&ch=10000000&lastupdatetime=0&offset=',
			dataType: 'json',
			type:'GET',
			jsonpCallback:"callback",
			success: function(result){
				if(result.data.length){
					NewsTopic.renderHTML(result);
				}else{
					NewsTopic.toast('专题新闻为空，请稍后重试！');
				}
			},
			error: function(){
				return false;
			}
		});
	},
	
	//数据渲染
	renderHTML: function(dataList){

		//格式转换
		if(typeof dataList === 'string'){
			dataList = JSON.parse(dataList);
		}

		//加载专题列表
		NewsTopic.renderListHTML(dataList.data);

		//显示内容
		$('#sync').addClass('none');
		$('#container').removeClass('none');

		//图片懒加载
		ImageLazyload.init();
		WIN.addEventListener('scroll', function() {
			ImageLazyload.lazyLoadImage();
		}, false);
	},

	//专题列表
	renderListHTML: function(result){
		var html = [];
		var defaultImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAHAQMAAAALYk4gAAAABGdBTUEAALGPC/xhBQAAAANQTFRF7+/v7Je6jQAAAAtJREFUCNdjYMACAAAVAAEyHTlgAAAAAElFTkSuQmCC';
		var dataList = result;

		for(var i=0, l=dataList.length; i<l; i++){
			switch(dataList[i].display){
				case '0x01':
					//无图模式
					html.push('<dl class="i-style02"><a href="http://m.news.liebao.cn/detail.html?newsid='+dataList[i].contentid+'&f=topic"><dt>'+dataList[i].title+'</dt><dd><p class="i-infos"><span class="i-source">'+dataList[i].source+'</span></p></dd></a></dl>');
					break;
				case '0x02':
				case '0x04':
					//小图模式
					html.push('<dl class="i-style01"><a href="http://m.news.liebao.cn/detail.html?newsid='+dataList[i].contentid+'&f=topic" class="clearfix"><dt><span class="imgbox-wrap"><img class="imglazyload imgbox" src="'+defaultImg+'" osrc="'+dataList[i].images[0]+'"></span></dt><dd><p>'+dataList[i].title+'</p><p class="i-infos"><span class="i-source">'+dataList[i].source+'</span></p></dd></a></dl>');
					break;
				case '0x08':
					//大图模式
					html.push('<dl class="i-style00"><a href="http://m.news.liebao.cn/detail.html?newsid='+dataList[i].contentid+'&f=topic"><dd><span class="imgbox-wrap"><img class="imglazyload imgbox" src="'+defaultImg+'" osrc="'+dataList[i].images[0]+'"><i>'+dataList[i].title+'</i></span></dd></a></dl>');
					break;
				default:
					break;
			}
		}
		$('#topicList').html(html.join(''));
	},

	//toast
	toast: function(text, ms){
		if (!text) {
			return false;
		}
		var dom = $('<div class="public_toast">' + text + '</div>');
		var ms = ms || 1500;
		$('body').append(dom);
		setTimeout(function() {
			dom.addClass('public_toast_show');
		}, 10);
		setTimeout(function() {
			dom.removeClass('public_toast_show');
			dom.on('webkitTransitionEnd', function() {
				dom.remove();
			});
		}, ms);
	},	
	
	//URL查询
	getQueryValue: function(key, style){
		var match=location.href.match(new RegExp(key+'=([^'+style+']*)'));
		return match&&match[1]||'';
	}	
}

//广点通广告
function adcallback(data){
	var string = typeof data == 'string' ? data : JSON.stringify(data);
	var arr = typeof data == 'string' ? JSON.parse(data) : data;
	for (var i = 0; i < arr.length; i++) {
		document.getElementById('gdtSection').innerHTML = '<a href="protocol://clickinjectedadat#'+i+'"><img src="'+arr[i].img+'" /><span><i>推广</i>'+arr[i].desc+'</span><em></em></a>';
		//展示上报
		(function(arg){
			setTimeout(function(){
				location.href = 'protocol://reportinjectedadim#'+arg;
			}, 500*arg);
		})(i);
	};
}

function ad2callback(data){
	var string = typeof data == 'string' ? data : JSON.stringify(data);
	var arr = typeof data == 'string' ? JSON.parse(data) : data;
	NewsClient.adList = arr;

	for (var i = 0; i < arr.length; i++) {
		//展示上报
		(function(arg){
			setTimeout(function(){
				location.href = 'protocol://reportinjectedadim#'+arg;
			}, 500*arg);
		})(i);
	};
}

//上报埋点
var SetStat = {
	init: function(uuid, url, module, channel, from){
		$.ajax({
			url:'http://m.news.liebao.cn/api/proxy.php',
			dataType: 'json',
			type:'POST',
			data:{"uuid":uuid, "url":url, "module":module, "channel":channel, "from":from}
		});
	}
}

//图片懒加载
var ImageLazyload = {
	init: function(type) {
		setTimeout(function() {
			ImageLazyload.lazyLoadImage(type);
		}, 100);
	},
	lazyLoadImage: function(type,wrap) {
		var imageEls = document.querySelectorAll('.imgbox'),
			i,
			l = imageEls.length;
		for (i = 0; i < l; i++) {
			/*直接进行加载当页全部图片，而不进行滚动加载*/
			if (type && type == 'all') {
				ImageLazyload.imageReplace(imageEls[i]);
			} else {
				ImageLazyload.imageVisiable(imageEls[i]);
			}
			
		}
	},
	/**
	 * 判断元素是否在可视区域
	 * @param {DOM} imageEl 指定的图片
	 * @param {DOM} imageEl 图片容器
	 */
	 imageVisiable: function(imageEl, imageWrapEl) {
		var pos = imageEl.getBoundingClientRect(),
			imageWrapEl = $(imageEl);
		if ((pos['top'] > 0 && WIN['innerHeight'] - pos['top'] > 0) || (pos['top'] <= 0 && pos['bottom'] >= 0)) {
			if (imageWrapEl.hasClass('_loaded')) return;
			ImageLazyload.imageReplace(imageEl);
		} else {
			return;
		}
	},
	/**
	 * 给img元素赋予新的src地址
	 * @param {DOM} imageEl 指定的图片
	 */
	imageReplace: function(imageEl) {
		if (!imageEl) return;
		var imageWrapEl = $(imageEl),
			imageSrc;
		if (!imageSrc) {
			imageSrc = $(imageEl).attr('osrc').replace('{new}', '');
		}
		/* 预加载图片，在图片load成功成功之后 */
		var preLoader = new Image();
		preLoader['src'] = imageSrc;
		preLoader.onload = function() {
			$(imageEl).attr('src', preLoader['src']);
			imageWrapEl.removeClass('_loaderror');
			imageWrapEl.addClass('_loaded');
			$(imageEl).removeAttr('osrc');
		}
		preLoader.onerror = function() {
			imageWrapEl.addClass('_loaderror');
		}
	}
};

//Cookie
var Cookie = {

	isEnabled: false,
	
	set: function(name, value, expire, domain) {
		var expires = '';
		if (0 !== expire) {
			var t = new Date();
			t.setTime(t.getTime() + (expire || 24) * 3600000);
			expires = ';expires=' + t.toGMTString();
		}
		var s = escape(name) + '=' + escape(value) + expires + ';path=/' + (domain ? (';domain=' + domain) : '');
		DOC.cookie = s;
	},
	
	get: function(name) {
		var arrCookie = DOC.cookie.split(';'), arrS;
		for (var i = 0; i < arrCookie.length; i++) {
			arrS = arrCookie[i].split('=');
			if (arrS[0].trim() == name) {
				return unescape(arrS[1]);
			}
		}
		return null;
	},
	
	remove: function(name) {
		Cookie.set(name, '', -1000);
	},
	
	test: function() {
		var testKey = '_c_t_';
		Cookie.set(testKey, '1');
		Cookie.isEnabled = ('1' === Cookie.get(testKey));
		Cookie.remove(testKey);
	}
};

//判断页面来源
function getFrom(){
	var name = '';
	if(document.referrer.indexOf('index') >= 0){
		name = 'index';
	}else if(document.referrer.indexOf('top') >= 0){
		name = 'top';
	}else if(document.referrer.indexOf('group') >= 0){
		name = 'group';
	}else if(document.referrer.indexOf('detail') >= 0){
		name = 'detail';
	}else if(document.referrer.indexOf('share') >= 0){
		name = 'share';
	}else{
		name = 'index';
	}
	return name;
}
$(".i-open,.detail-read").on("click",function(){
	if(IsWeixin){
		window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.ijinshan.browser_fast"
		return;
	}else if(IsAndroid){
		window.location.href="cmbrwsr://cmblocal/"				
	}else if(IsLiebaoFast){
		window.location.href="local://"
	}else if(IsIOS){
		window.location.href="https://itunes.apple.com/cn/app/id641522896";
		return;
	}
	
	setTimeout("window.location.href='http://dl.liebao.cn/android/tg/cheetah_cm_share.apk';",500);
})
//页面初始化执行
$().ready(function() {
	if(PN == '/' || PN == '/index.html' || PN == '/top.html' || PN == '/group.html'){
		NewsClient.init();
	}else if(PN == '/video.html'){
		NewsVideo.init();
	}else if(PN == '/topic.html'){
		NewsTopic.init();
	}else if(PN == '/detail.html'){
		NewsDetail.init();
	}
});