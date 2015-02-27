//basic functions

function setItem(key, value) {
  localStorage[key] = value;
}

// Gets item from local storage with specified key.
function getItem(key) {
  if (localStorage[key])
    return localStorage[key];
  else return "";
}

// Clears all key/value pairs in local storage.
function clearStrg() {
  log('about to clear local storage');
  window.localStorage.clear(); // <-- Local storage!
  log('cleared');
}

//save dom element value to localstorage
function saveChanges(id) {
  localStorage[id] = $("#" + id).val();
}
// storage to input
function setlocalStorageToValue(id) {
  document.getElementById(id).value = localStorage[id];
}
//show current connection status
function changeBtStatus(op) {
  if (op == 0) {
    $('#cinfo').html("connected 已连接 ");
    if (localStorage['globalssl']) {
      if (localStorage['globalssl'] > 0) {
        $('#cinfo').html("connected 已连接(全局) ");
      }
    }
    $('#connectbtn').attr("disabled", true);
    $('#disconnect').attr("disabled", false);

    $('#connectbtn').addClass("disabled");
    $('#disconnect').removeClass("disabled");
    chrome.browserAction.setIcon({
      path: "icon-ok.png"
    });
  }
  if (op == 1) {
    $('#connectbtn').attr("disabled", false);
    $('#disconnect').attr("disabled", true);
    $('#cinfo').html("disconnected 已断开 ");
    $('#connectbtn').removeClass("disabled");
    $('#disconnect').addClass("disabled");
    chrome.browserAction.setIcon({
      path: "icon.png"
    });
  }
}


//init job

var localbldomain = getItem("localbldomain");
isReconnect = 1;

function init() {
  //check if current domain through ssl or not
  checkdomainisSSL();
  if (localStorage.getItem("username") != null) {
    setlocalStorageToValue("username");
    setlocalStorageToValue("password");
  }

  if (localStorage['connected'] > 0) {
    changeBtStatus(0);
  } else {
    changeBtStatus(1);
  }
  if (localStorage.getItem("serverlistcache") == null) {
    reloadServers();
  } else {
    loadServerlist(localStorage['serverlistcache']);
    $('#reloadhint').hide();
    if (localStorage.getItem("serverdomain") != null) {
      setlocalStorageToValue("serverdomain");
      $('tr').each(function () {
        if ($(this).attr("rel") == localStorage['serverdomain']) $(this).addClass("sel");
      });

    }
  }


}

//chrome.runtime.onStartup.addListener(function(){ init();});
// bind event for connectbtn
if ($("#connectbtn").length) {
  document.getElementById('connectbtn').addEventListener('click', function () {
    if ((  $("#username").val().length < 2 ) || $("#password").val().length < 2) {
      $("#logdiv").addClass("warning");
      return false;
    }
    $("#logdiv").removeClass("warning");
    saveChanges("username");
    saveChanges("password");
    connect();
  });
}


//bind action for disconnect button
if ($("#disconnect").length) {
  document.getElementById('disconnect').addEventListener('click', function () {
    removeProxy();
    localStorage['connected'] = 0;
    changeBtStatus(1);
  });
}

//connect will didsconnect if username changed
if ($("#username").length) {
  init();
  //init popup pages
  document.getElementById('username').addEventListener('keyup', function () {
    changeBtStatus(1);
    saveChanges("username");
    removeProxy();
  });
}


if ($("#password").length) {
  document.getElementById('password').addEventListener('blur', function () {
    changeBtStatus(1);
    removeProxy();
  });
}


$('#reloadbt').bind('click', function () {
  $('#reloadbt').attr("disabled", true);
  reloadServers();
});


function saveBlackDomainList() {
  //get all domains from blackdomain form
  var domains_tmp = localStorage['localbldomain'].replace(/\n/g, ',').trim();
  domains_tmp = domains_tmp.replace(/ /g, '');
  domains_tmp = domains_tmp.split("do-not-delete-this-line-----.com,");
  domains = domains_tmp[1];
  var url = "https://sslauth.5bird.com/RPC/index.php?action=saveBlackDomainList&username=" + localStorage['username'] + "&password=" + localStorage['password'] + "&domains=" + domains;
  $.getScript(url);

}
function reloadServers() {
  $.getScript("https://sslauth.5bird.com/RPC/index.php?action=serverlistjson&callback=loadServerlist");
}
function loadServerlist(result) {

  $('#disconnect').attr("disabled", false);
  $('#serverlist').attr("disabled", false);
  var serverCache = '';
  var serverlisthtml = $('#serverdiv').html();
  if (typeof(result) != "string") {
    $.each(result, function (val, text) {
      serverCache = serverCache + text + "|" + val + ";";
      if (serverlisthtml.indexOf(val) == -1) {
        $('#serverlist').append($('<tr rel="' + val + '"><td>' + text + '<small></small></td> </tr>'));

      } else {

      }
    });
    localStorage['serverlistcache'] = serverCache;

  } else {
    result = result + "  ";
    var tmp = result.split(";");
    for (i = 0; i < tmp.length; i++) {
      op = tmp[i].split("|");
      if (tmp[i].length < 3)continue;
      if (serverlisthtml.indexOf(op[1]) != -1) continue;
      var val = op[1];
      var text = op[0];
      $('#serverlist').append($('<tr rel="' + val + '"><td>' + text + '<small></small></td> </tr>'));
    }
  }
  $('#reloadbt').attr("disabled", false);
  $("#serverlist  tr ").bind("click", function () {
    $("#serverlist tr ").removeClass("sel");
    $(this).addClass("sel");
    removeProxy();
    $("#serverdomain").val($(this).attr("rel"));
    saveChanges("serverdomain");
  });
}


function removeProxy() {

  var config = {
    mode: "system"
  };
  changeBtStatus(1);
  chrome.proxy.settings.set(
    {value: config, scope: 'regular'},
    function () {
    });
  localStorage['connected'] = 0;

}


function webvpninfo(result) {
  // just show system info onto panel

}

function connect() {
  isReconnect = 0;
  changeBtStatus(0);
  chrome.browserAction.setIcon({
    path: "icon.png"
  });
  var sslserver = $("#serverdomain").val();
  if ($("#serverdomain").val().length < 6) {
    $("#cinfo").html("请选择服务器");
    return false;
  }
  if (localStorage['authport']) {
    var authport = localStorage['authport'];
  } else {
    var authport = "80";
  }

  $("#cinfo").html("connecting...");
  // quickSetProxy();
  url = ("https://sslauth.5bird.com/sslspeedy.php?login=1&callback=setproxy&user=" + $('#username').val() + "&pass=" + $('#password').val());
  $.getScript(url);

}

function quickSetProxy() {
  //quick set proxy click and the connect
  var blackdomains = '';
  var httpsserver = $("#serverdomain").val();
  if (localStorage['localbldomain']) {
    localStorage['localbldomain'] = localStorage['localbldomain'].replace(/\n\s*\n/g, '\n').trim();
    if (localStorage['localbldomain'].length > 4) {
      var localbldomain = localStorage['localbldomain'].split("\n");
      var length = localbldomain.length, element = null;
      for (var i = 0; i < length; i++) {
        element = localbldomain[i].replace("*", "");
        if (element.lenth < 3) continue;
        blackdomains += "'" + element + "',";
      }
    }
    setChromeProxy(blackdomains, '', httpsserver);

    changeBtStatus(0);
  }


}


function setproxy(result) {
  var defaultbypassdomains = "ip.cn";
  console.log(result);
  if (isReconnect == 0) {
    httpsserver = $("#serverdomain").val();
    localStorage['httpsserver'] = httpsserver;
    if (result['webinfo']) {
      $('#info').html(result['webinfo']);
      if (result['webinfo'].length > 3)$('#info').show();
      else  $('#info').hide();

    }
    if (result['login'] < 1) {
      $("#logdiv").addClass("warning");
      changeBtStatus(1);
      $("#cinfo").html($("#cinfo").html() + "login fail,check your password.");
      return false;
    }

    //set blacklistdomains here
    //gloabllocalbldomain ==>system default blackdomains split by do-not-delete-this-line-----.com

    if (result['blkdomains']) {
      if (localStorage['localbldomain']) {
        //if localbldomain already exists 
        // load domains from server ,and append domains to localbldomain
        var tmp = result['blkdomains'].split(",");
        for (var i = 0; i < tmp.length; i++) {
          if (tmp[i].length < 2) continue;
          if (localStorage['localbldomain'].indexOf(tmp[i]) < 0) {
            localStorage['localbldomain'] = localStorage['localbldomain'] + "\n" + tmp[i].trim();
          }
        }

      } else {

        localStorage['localbldomain'] = result['blkdomains'].replace(/,/g, '\n').trim();
      }
      localStorage['localbldomain'] = localStorage['localbldomain'].trim();
      // the two lines bellow is used for future 
      var tmparray = localStorage['localbldomain'].split("do-not-delete-this-line-----.com,");
      localStorage['gloabllocalbldomain'] = tmparray[0];
    }

    if (httpsserver.length < 3) {
      $('#cinfo').html("请选择线路 ");
      changeBtStatus(1);
      return false;
    }
    localStorage['connected'] = 1;
    $("#logdiv").removeClass("warning");
    changeBtStatus(0);

  } else {
    // reconnect , skip authencate here
    httpsserver = localStorage['httpsserver'];
    if ($("#localbldomain").length) {
      //just renew value for  localbldomain
      localStorage['localbldomain'] = $("#localbldomain").val();
    }

  }

// convert blackdomain lines which spited with "\n"
// to one line splited with ","
  var blackdomains = "'blackdomains.com',";
  if (localStorage['localbldomain']) {
    localStorage['localbldomain'] = localStorage['localbldomain'].replace(/\n\s*\n/g, '\n').trim();
    if (localStorage['localbldomain'].length > 4) {
      var localbldomain = localStorage['localbldomain'].split("\n");
      var length = localbldomain.length, element = null;
      for (var i = 0; i < length; i++) {
        element = localbldomain[i].replace("*", "");
        if (element.lenth < 3) continue;
        blackdomains += "'" + element + "',";
      }
    }
  }


  //blackdomains is for temp usage
  var pacwlist = '';
  if (localStorage['wlist']) {
    var tmp_array = localStorage['wlist'].split(",");
    for (var i = 0; i < tmp_array.length; i++) {
      var element = tmp_array[i].replace("*", "");
      if (element.lenth < 3) continue;
      pacwlist += "'" + element + "',";
    }

  }
  setChromeProxy(blackdomains, pacwlist, httpsserver);


// set pac


}


function setChromeProxy(blkdomains, wlistdomains, httpsserver) {

  var config = {
    mode: "pac_script",
    pacScript: {
      data: "function dnsDomainIs(host, pattern) {return host.length >= pattern.length && (host === pattern || host.substring(host.length - pattern.length - 1) === '.' + pattern);};\n" +
      "function FindProxyForURL(url, host) {\n" +
      "var PROXY = 'HTTPS  " + httpsserver + "'\n" +
      "var DEFAULT = 'DIRECT';\n" +

      "if (dnsDomainIs(host, \".cn\")||dnsDomainIs(host,\".local\")||/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i.test(host)){ return DEFAULT; }\n" +

      "var direct_domains=[" + wlistdomains + "'directdomainssslspeedy.com'];\n" +
      "for(i = 0; i < direct_domains.length; i++) {\n" +
      "  if( dnsDomainIs(host,direct_domains[i] ) ) { \n" +
      "    return DEFAULT; \n" +
      "  }\n" +
      " }\n" +

      "var proxy_domains=[" + blkdomains + "'googleusercontent.com'];\n" +
      "for(i = 0; i < proxy_domains.length; i++) {\n" +
      "  if(dnsDomainIs(host,proxy_domains[i]) ) { \n" +
      "    return PROXY; \n" +
      "  }\n" +
      " }\n" +

      " return DEFAULT;\n" +
      "}\n"
    }
  };


  if (localStorage['globalssl']) {
    if (localStorage['globalssl'] > 0) {
      var config = {
        mode: "pac_script",
        pacScript: {
          data: "function dnsDomainIs(host, pattern) {return host.length >= pattern.length && (host === pattern || host.substring(host.length - pattern.length - 1) === '.' + pattern);};\n" +
          "function FindProxyForURL(url, host) {\n" +
          "var PROXY = 'HTTPS  " + httpsserver + "'\n" +
          " return PROXY;\n" +
          "}\n"
        }
      };
    }
  }


  chrome.proxy.settings.set({value: config, scope: 'regular'}, function () {

  });

}


function checklogin(res) {
  if (res['status'] < 1) {
    chrome.browserAction.setIcon({
      path: "icon.png"
    });
  }
}
function refreshconnection() {
  isReconnect = 1;
  setproxy();
}


function dnsDomainIs(host, pattern) {
  return host.length >= pattern.length && (host === pattern || host.substring(host.length - pattern.length - 1) === '.' + pattern);
}


function removeSSLdomain() {

  var dm = $("#currentBrowsingDomain").val().replace("Bypass:", "").replace("SSL:", "");

  if (dm.indexOf("www.") == 0) dm = dm.replace("www.", "");
  if (localStorage.getItem("localbldomain") != null) {
    localStorage['localbldomain'] = localStorage['localbldomain'].replace("\n" + dm, "");
    localStorage['localbldomain'] = localStorage['localbldomain'].replace(dm, "");
    localStorage['localbldomain'] = localStorage['localbldomain'].replace("undefined", "");
  }
  if (localStorage['wlist']) {
    if (localStorage['wlist'].indexOf(dm) == -1) {
      localStorage['wlist'] = localStorage['wlist'] + dm + ",";
    }
  } else {
    localStorage['wlist'] = dm + ",";

  }

  refreshconnection();
  saveBlackDomainList();


}

function addSSLdomain() {

  var dm = $("#currentBrowsingDomain").val().replace("Bypass:", "").replace("SSL:", "");

  if (dm.indexOf("www.") == 0) dm = dm.replace("www.", "");
  if (localStorage.getItem("localbldomain") != null) {
    if (localStorage['localbldomain'].indexOf("\n" + dm) == -1)
      localStorage['localbldomain'] = localStorage.getItem('localbldomain') + "\n" + dm;


  } else {
    localStorage['localbldomain'] = dm;
  }
  localStorage['localbldomain'] = localStorage['localbldomain'].replace("undefined", "");


  if (localStorage['wlist']) {
    localStorage['wlist'] = localStorage['wlist'].replace(dm + ",", "");

  }

  refreshconnection();
  saveBlackDomainList();
}


function checkdomainisSSL() {
//if global ssl 
  if (localStorage['globalssl']) {
    if (localStorage['globalssl'] > 0) {
      $("#showcurrentdomainstatusform").hide();
      return false;
    }

  }
  if (localStorage['connected'] > 0) {
    var blackdomains = "'googleusercontent.com'";
    if (localStorage['localbldomain']) {
      blackdomains += "\n" + localStorage['localbldomain'];

    }

    var auto_black = getItem('localbldomain').split("\n");
    var pageurl = null;
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
      function (tabs) {
        pageurl = tabs[0].url.split("/");
        var currentdomain = pageurl[2];

        if (currentdomain.indexOf(".") > 0) {
          var wlist_hit = 0;
          //check if in bypasslist
          if (localStorage['wlist']) {
            if (localStorage['wlist'].indexOf(currentdomain) != -1) {
              $("#currentBrowsingDomain").val("Bypass:" + currentdomain);
              $("#sslremovebt").hide();
              $("#ssladdbt").show();
              wlist_hit = 1;

            }
          }

          if (wlist_hit < 1) {
            for (i = 0; i < auto_black.length; i++) {

              if (auto_black[i].length < 3) continue;

              auto_black[i] = auto_black[i].replace(/'/g, "");
              auto_black[i] = auto_black[i].replace(/ /g, "");
              //if( currentdomain.indexOf( auto_black[i]) !=-1 )
              if (dnsDomainIs(currentdomain, auto_black[i])) {
                $("#currentBrowsingDomain").val("SSL:" + currentdomain);
                $("#sslremovebt").show();
                $("#ssladdbt").hide();
                chrome.browserAction.setIcon({
                  path: "icon-ok-go.png"
                });
                break;
              }
              else {
                $("#currentBrowsingDomain").val("Bypass:" + currentdomain);
                $("#sslremovebt").hide();
                $("#ssladdbt").show();

              }
            }
          }


          $('#sslremovebt').bind('click', function () {
            $("#ssladdbt").show();
            $("#sslremovebt").hide();
            $("#currentBrowsingDomain").val($("#currentBrowsingDomain").val().replace("SSL:", "Bypass:"));
            removeSSLdomain();
          });

          $('#ssladdbt').bind('click', function () {
            $("#ssladdbt").hide();
            $("#sslremovebt").show();
            $("#currentBrowsingDomain").val($("#currentBrowsingDomain").val().replace("Bypass:", "SSL:"));
            addSSLdomain();
          });

          $("#showcurrentdomainstatusform").show();

        } else {
          $("#showcurrentdomainstatusform").hide();
        }
      }
    );

  } else {
    $("#showcurrentdomainstatusform").hide();
  }
}


/*
 *
 * javascripts for  settings page
 *
 *
 */

if ($("#wtform").length) {

  // load default domain 

  $('#localbldomain').val(localStorage['localbldomain']);

  document.getElementById('localbldomain').addEventListener('keyup', function (event) {
    event.preventDefault();
    localStorage['localbldomain'] = $('#localbldomain').val();
    $('#domainslistchangebutton').attr("disabled", false);
  });
  document.getElementById('domainslistchangebutton').addEventListener('click', function (event) {
    $('#domainslistchangebutton').attr("disabled", true);
    localStorage['localbldomain'] = $('#localbldomain').val();
    refreshconnection();
    saveBlackDomainList();
  });


  document.getElementById('globalssl').addEventListener('change', function (event) {
    if ($('#globalssl').val() > 0) {
      $('#blkdmsetingdiv').hide();
    } else {
      $('#blkdmsetingdiv').show();
    }
    localStorage['globalssl'] = $('#globalssl').val();

    $('#domainslistchangebutton').attr("disabled", false);

  });

  if (localStorage['globalssl']) {
    if (localStorage['globalssl'] > 0) {
      $('#globalssl').val(1);
      $('#blkdmsetingdiv').hide();
    } else {
      localStorage['globalssl'] = 0;
      $('#globalssl').val(0);
      $('#blkdmsetingdiv').show();
    }
  }


  $('#localbldomain').scrollTop($('#localbldomain')[0].scrollHeight);


} 



