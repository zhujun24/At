//返回@位置
function getXY(obj) {
	var rect = obj.getBoundingClientRect(),
	scrollTop = Math.max(obj.ownerDocument.documentElement.scrollTop,obj.ownerDocument.body.scrollTop),
	scrollLeft = Math.max(obj.ownerDocument.documentElement.scrollLeft,obj.ownerDocument.body.scrollLeft),
	isIE = window.ActiveXObject ? 2 : 0;
	var position ={};
	position.left = rect.left - isIE + scrollLeft;
	position.top = rect.top - isIE + scrollTop;
	return position;
}

function getById (obj) {
	return document.getElementById(obj);
}

// 统计光标之前的字符串
function posCursor (obj){
    var isIE = !(!document.all);
    var end=0;
    if(isIE){
        var sTextRange= document.selection.createRange();
        if(sTextRange.parentElement()== obj){
            var oTextRange = document.body.createTextRange();
            oTextRange.moveToElementText(obj);
            for (end = 0; oTextRange.compareEndPoints('StartToEnd', sTextRange) < 0; end ++){
                oTextRange.moveStart('character', 1);
            }
            for (var i = 0; i <= end; i ++){
                if (obj.value.charAt(i) == '\n'){
                    end++;
                }
            }
        }
    } else{
        end = obj.selectionEnd;
    }
    return end;
}

// 统计字符串总长度中文字符为2，英文字符及数字为1
function getLength (obj){
    var realLength = 0, len = obj.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = obj.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
}

// 统计字符串出现的次数
function tongJi (string, char){
    var index = 0 , index1 = 0 , count = 0;
    for(var i = 0; i < string.length && ( index1 != -1 ); i++ ){
        index1 = string.indexOf(char, index);
        index = index1 + 1;
        count = i;
    }
    return count;
}

function objChange (textarea){
    //取值
    var objString =  textarea.value;
    //记录光标当前位置
    var cursorPosition = posCursor(textarea);
    //光标之前的字符串
    var beforeCursorString = objString.substr(0,cursorPosition);
    //记录@在光表前出现的最近的位置
    var atLocation = beforeCursorString.lastIndexOf('@');
    //记录光标和光标前最近的@之间的字符串，记为标识符，判断其是否含有空格
    var indexString = objString.substr(atLocation,cursorPosition-atLocation);
    //记录从开始到光标前最近的@之间的字符串，用来定位
    var positionString = objString.substr(0,atLocation);

    if (beforeCursorString.indexOf('@')!=-1&&indexString.indexOf(' ')==-1&&indexString.indexOf('\n')==-1) {
        //@开始
        getById("info").style.display = 'block';
		getById("div").innerHTML = positionString.replace(/\n/g,"<br/>") + '<span id="at">@</span>';
		getById("info").style.left = getXY(getById("at")).left + 2 + 'px';
		getById("info").style.top = getXY(getById("at")).top + 18 + 'px';
    } else{
        getById("info").style.display = 'none';
    }
}

function at (obj) {
	if(obj.addEventListener){
        obj.addEventListener("keyup",function(){objChange(obj)},false);
        obj.addEventListener("mouseup",function(){objChange(obj)},false);
    }else if(obj.attachEvent){
        obj.attachEvent("onkeyup",function(){objChange(obj)});
        obj.attachEvent("onmouseup",function(){objChange(obj)});
    }
}