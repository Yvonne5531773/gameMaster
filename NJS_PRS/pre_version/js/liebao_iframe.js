window.setInterval(function(){
	try {
		var bHeight = document.body.scrollHeight;
		var dHeight = document.documentElement.scrollHeight;
		var height = Math.max(bHeight, dHeight);
		window.location.hash = "#height=" + height;
	} catch(ex){

	}
},200);