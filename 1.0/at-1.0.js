var at = function (textarea, contact, jsonurl, allLeft, allTop, textareaWidth) {
  // 统计光标之前的字符串
  var posCursor = function (obj) {
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
  };

  // 统计字符串总长度中文字符为2，英文字符及数字为1
  var getLength = function (obj) {
    var realLength = 0, len = obj.length, charCode = -1;
    for (var i = 0; i < len; i++) {
      charCode = obj.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128) realLength += 1;
      else realLength += 2;
    }
    return realLength;
  };

  // 统计字符串出现的次数
  var tongJi = function (string, char) {
    var index = 0, index1 = 0, count = 0;
    for (var i = 0; i < string.length && ( index1 != -1 ); i++) {
      index1 = string.indexOf(char, index);
      index = index1 + 1;
      count = i;
    }
    return count;
  };

  //封装Ajax
  var ajax = function (url, fnSucc, fnFaild) {
    if (window.XMLHttpRequest) {
      var oAjax = new XMLHttpRequest();
    } else {
      var oAjax = new ActiveXObject("Microsoft.XMLHTTP");
    }
    oAjax.open('GET', url, true);
    oAjax.send();
    oAjax.onreadystatechange = function () {
      if (oAjax.readyState == 4) {
        if (oAjax.status == 200) {
          fnSucc(oAjax.responseText);
        } else {
          fnFaild(oAjax.status);
        }
      }
    };
  };

  var objChange = function () {
    //取值
    var objString = textarea.value;

    //记录光标当前位置
    var cursorPosition = posCursor(textarea);

    //光标之前的字符串
    var beforeAtString = objString.substr(0, cursorPosition);

    //记录@在光表前出现的最近的位置
    var atLocation = beforeAtString.lastIndexOf('@');

    //记录回车在光表前出现的最近的位置
    var enterLocation = ('\n' + beforeAtString).lastIndexOf('\n');

    //记录光标和光标前最近的@之间的字符串，记为标识符，判断其是否含有空格
    var indexString = objString.substr(atLocation, cursorPosition - atLocation);

    //记录光标和光标前最近的enter之间的字符串
    var enterString = objString.substr(enterLocation, cursorPosition - enterLocation);

    if (beforeAtString.indexOf('@') != -1 && indexString.indexOf(' ') == -1 && indexString.indexOf('\n') == -1) {

      //Append contact list
      ajax(jsonurl, function (data) {
        var ajaxJson = JSON.parse(data);
        var searchString = indexString.substr(1, indexString.length);
        var json = [];

        if (ajaxJson.length > 0) {
          for (var i = 0; i < ajaxJson.length; i++) {
            if (ajaxJson[i].toLowerCase().indexOf(searchString.toLowerCase()) != -1) {
              json.push(ajaxJson[i]);
            }
          }
        }

        if (json.length == 0) {
          contact.innerHTML = '<li id="title" class="list-group-item active">No contact</li>';
        } else {
          contact.innerHTML = '<li id="title" class="list-group-item active">Select contact or input</li>';
          for (var i = 0; i < json.length; i++) {
            var newli = document.createElement("li");
            newli.className = 'list-group-item';
            newli.innerHTML = json[i];
            contact.appendChild(newli);
          }

          var contactLi = contact.getElementsByTagName('li');
          contactLi[1].className = 'list-group-item li-hover';

          for (var i = 1; i < contactLi.length; i++) {
            contactLi[i].onmouseover = (function (i) {
              return function () {
                for (var l = 1; l < contactLi.length; l++) {
                  contactLi[l].className = 'list-group-item';
                }
                contactLi[i].className = 'list-group-item li-hover';
              }
            })(i);

            contactLi[i].onclick = (function (i) {
              return function () {
                //将textarea分成三块，@之前的area1、@+联系人+' '的area2、光标之后的area3
                var area1 = objString.substr(0, atLocation);
                var area2 = '@' + contactLi[i].innerHTML + ' ';
                var area3 = objString.substr(cursorPosition, getLength(objString) - cursorPosition);

                textarea.value = area1 + area2 + area3;
                contact.style.display = 'none';

                //定位光标
                var position = area1.length + area2.length;
                if (navigator.appName == "Microsoft Internet Explorer") {
                  var range = textarea.createTextRange();
                  range.move("character", position);
                  range.select();
                }
                else {
                  textarea.setSelectionRange(position, position);
                  textarea.focus();
                }
              }
            })(i);
          }
        }
      }, function () {
        console.log('Ajax Error!');
        alert('Ajax Error!');
      });

      //Set position
      //Append span to save string
      var hiddenSpan = document.createElement('nobr');
      textarea.parentNode.appendChild(hiddenSpan);

      var enterAtString = '\n' + beforeAtString;
      var splitString = enterAtString.split('\n');
      var lastSplitString = splitString[splitString.length - 1];

      var powerTop = 0;

      for (var i = 0; i < splitString.length; i++) {
        hiddenSpan.innerHTML = splitString[i];
        powerTop += Math.floor((hiddenSpan.offsetWidth + (tongJi(lastSplitString, ' ') * 3.86)) / textareaWidth);
      }
      powerTop += tongJi(enterAtString, '\n');

      if (powerTop > textarea.rows) {
        powerTop = textarea.rows;
      }

      hiddenSpan.innerHTML = splitString[splitString.length - 1];

      contact.style.left = (hiddenSpan.offsetWidth + (tongJi(lastSplitString, ' ') * 3.86)) % textareaWidth + allLeft + 'px';
      contact.style.top = powerTop * 20 + allTop + 'px';
      contact.style.display = 'block';

      textarea.parentNode.removeChild(hiddenSpan);
    } else {
      contact.style.display = 'none';
    }
  };

  if (textarea.addEventListener) {
    textarea.addEventListener("keyup", objChange, false);
    textarea.addEventListener("mouseup", objChange, false);
  } else if (textarea.attachEvent) {
    textarea.attachEvent("onkeyup", objChange);
    textarea.attachEvent("onmouseup", objChange);
  }
};
