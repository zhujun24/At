//返回obj位置
function getXY(obj) {
    var rect = obj.getBoundingClientRect(),
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop,
        scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft,
        isIE = !(!document.all) ? 2 : 0;
    var position = {};
    position.left = rect.left - isIE + scrollLeft;
    position.top = rect.top - isIE + scrollTop;
    return position;
}

//你懂的
function getById(obj) {
    return document.getElementById(obj);
}

// 统计光标之前的字符串
function posCursor(obj) {
    var isIE = !(!document.all);
    var end = 0;
    if (isIE) {
        var sTextRange = document.selection.createRange();
        if (sTextRange.parentElement() == obj) {
            var oTextRange = document.body.createTextRange();
            oTextRange.moveToElementText(obj);
            for (end = 0; oTextRange.compareEndPoints('StartToEnd', sTextRange) < 0; end++) {
                oTextRange.moveStart('character', 1);
            }
            for (var i = 0; i <= end; i++) {
                if (obj.value.charAt(i) == '\n') {
                    end++;
                }
            }
        }
    } else {
        end = obj.selectionEnd;
    }
    return end;
}

// 统计字符串总长度中文字符为2，英文字符及数字为1
function getLength(obj) {
    var realLength = 0, len = obj.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = obj.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {
            realLength += 1
        } else {
            realLength += 2
        }
    }
    return realLength;
}

//class操作
function hasClass(ele, cls) {
    return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}
function addClass(ele, cls) {
    if (!this.hasClass(ele, cls)) {
        ele.className += " " + cls;
    }
}
function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        ele.className = ele.className.replace(reg, ' ');
    }
}

//根据class获取当前激活的li的索引
function getLiIndex(arr, cls) {
    for (var i = 1; i < arr.length; i++) {
        if (hasClass(arr[i], cls)) {
            return i;
        }
    }
    return false;
}

//定位光标位置
function cursorHandle(obj, pos) {
    if (navigator.appName == "Microsoft Internet Explorer") {
        var range = obj.createTextRange();
        range.move("character", pos);
        range.select();
    } else {
        obj.setSelectionRange(pos, pos);
        obj.focus();
    }
}

//处理选中之后的字符串
function handleString(index, textarea, listClick, atList, objString, atLocation, cursorPosition) {
    //将textarea分成三块，@之前的area1、@+联系人+' '的area2、光标之后的area3
    var area1 = objString.substr(0, atLocation);
    var area2 = '@' + listClick[index].innerHTML + ' ';
    var area3 = objString.substr(cursorPosition, getLength(objString) - cursorPosition);

    textarea.value = area1 + area2 + area3;
    atList.innerHTML = '';
    atList.style.display = 'none';

    //定位光标
    var position = area1.length + area2.length;
    cursorHandle(textarea, position);
}

function objChange(textarea, hiddenObj, atList, rest, event) {
    //取值
    var objString = textarea.value;
    //记录光标当前位置
    var cursorPosition = posCursor(textarea);
    //光标之前的字符串
    var beforeCursorString = objString.substr(0, cursorPosition);
    //记录@在光表前出现的最近的位置
    var atLocation = beforeCursorString.lastIndexOf('@');
    //记录光标和光标前最近的@之间的字符串，记为标识符，判断其是否含有空格
    var indexString = objString.substr(atLocation, cursorPosition - atLocation);
    //记录从开始到光标前最近的@之间的字符串，用来定位
    var positionString = objString.substr(0, atLocation);

    if (atList.style.display == "block") {
        var key = event.keyCode;
        var listClick = atList.getElementsByTagName("li");
        var len = listClick.length;

        if (key == 40) {
            cursorHandle(textarea, getById("cursor").value);
            var next = getLiIndex(listClick, "list-active") == len - 1 ? 0 : getLiIndex(listClick, "list-active");
            for (var i = 1; i < len; i++) {
                removeClass(listClick[i], "list-active");
            }
            addClass(listClick[next + 1], "list-active");
            return false;
        } else if (key == 38) {
            cursorHandle(textarea, getById("cursor").value);
            var prev = getLiIndex(listClick, "list-active") == 1 ? len : getLiIndex(listClick, "list-active");
            for (var i = 1; i < len; i++) {
                removeClass(listClick[i], "list-active");
            }
            addClass(listClick[prev - 1], "list-active");
            return false;
        } else if (key == 13) {
            handleString(getLiIndex(listClick, "list-active"), textarea, listClick, atList, objString, atLocation, cursorPosition);
            return false;
        }
    }

    if (beforeCursorString.indexOf('@') != -1 && indexString.indexOf(' ') == -1 && indexString.indexOf('\n') == -1) {
        //@开始
        console.log(indexString);

        getById("cursor").value = posCursor(textarea);
        var list = ["选择昵称6666666", "某某2某某某某", "某某33某某", "某444某某某", "某某某55某某某", "某6某某", "某某某某7某某", "某某88某某某", "某某99某某999"];
        var dom = indexString.length > 1 ? '<li class="list-title">选择最近@的人或直接输入</li>' : '<li class="list-title">选择昵称或轻敲空格完成输入</li>';
        for (var i = 0, len = list.length; i < len; i++) {
            dom += '<li class="list-content">' + list[i] + '</li>';
        }
        atList.innerHTML = dom;

        var listClick = atList.getElementsByTagName("li");
        listClick[1].className = 'list-content list-active';
        for (var i = 1, len = listClick.length; i < len; i++) {
            listClick[i].onmouseover = (function (i) {
                return function () {
                    for (var l = 1; l < len; l++) {
                        removeClass(listClick[l], "list-active");
                    }
                    addClass(listClick[i], "list-active");
                }
            })(i);

            listClick[i].onclick = (function (i) {
                return function () {
                    handleString(i, textarea, listClick, atList, objString, atLocation, cursorPosition);
                }
            })(i);
        }

        atList.style.display = 'block';
        hiddenObj.innerHTML = positionString.replace(/\n/g, "<br/>") + '<span id="at">@</span>';
        var at = getById("at");
        atList.style.left = getXY(at).left + 2 + 'px';
        atList.style.top = getXY(at).top + 18 + 'px';
    } else {
        atList.innerHTML = '';
        atList.style.display = 'none';
    }


    //统计输入字符数，汉字1，数字字母0.5
    var stringNum = Math.ceil(getLength(objString) / 2);
    if (stringNum <= 140) {
        rest.innerHTML = '还可以输入<span>' + (140 - stringNum) + '</span>字';
    } else {
        rest.innerHTML = '已超出<span>' + (stringNum - 140) + '</span>字';
    }
}

function at(textarea, hiddenObj, atList, rest) {
    if (textarea.addEventListener) {
        textarea.addEventListener("keyup", function (event) {
            objChange(textarea, hiddenObj, atList, rest, event)
        }, false);
        textarea.addEventListener("mouseup", function (event) {
            objChange(textarea, hiddenObj, atList, rest, event)
        }, false);
    } else if (textarea.attachEvent) {
        textarea.attachEvent("onkeyup", function (event) {
            objChange(textarea, hiddenObj, atList, rest, event)
        });
        textarea.attachEvent("onmouseup", function (event) {
            objChange(textarea, hiddenObj, atList, rest, event)
        });
    }
}