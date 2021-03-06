define(function(require) {
	var $ = require('jquery');
	var magicConfig = require('../MagicConfig');
	var url = magicConfig.magicBase;
	var is_login = false;
	var Cookie = require('../util/Cookie.js');
	var Md5 = require('../util/Md5.js');
	// var Days = 1 / 12;
	var Time = 60,
		t;
	var c = Time;
	var error_node = "#login_error_msg";
	var error_code = 0;
	var reg_error_code = 0;

	// FIXME: add onclicked event handler for nodes.
	var $signPanel = $("#sign-panel");
	var $signinPanel = $(".login-panel");
	var $signupPanel = $(".register-panel")
	var $signoutBtn = $("#loginout");
	var $loginBtn = $("#login");
	var $signinSub = $("#signin-sub");
	var $registerBtn = $("#register");
	var $signupSub = $("#signup-sub");
	var $closeBtn = $(".close");
	var $islogin = $("#islogin");
	var $nologin = $("#nologin");
	var $window = $(window);
	var $winHeight = $window.height();
	var $maskLayer = $('<div class="mask_layer"></div>').css({
		opacity: '0'
	});

	$signPanel.css({
		marginTop: $winHeight / 2 + 10
	});

	// 应用placeholder插件
	seajs.use('lib/jquery.placeholder.min.js', function() {
		$('input, textarea').placeholder();
	});
	
	$(function() {

		resetForm();
		var account = Cookie.getCookie("account");
		var passwd = Cookie.getCookie("token");
		if (account != null && passwd != null) {
			$.post(url + '/h/v2/user/login', {
				account: account,
				passwd: passwd
			}, function(data) {
				console.log(data);
				if (data.ret == 1) {
					is_login = true;
					$signPanel.hide();
					$nologin.hide();
					$islogin.show();
					$('#account_name').replaceWith("<a href='user-center.html'>" + account + "</a>");
				}
			}, "json");
		}
		validLoginAccount('[name="account"]');
		validLoginPasswd('#loginForm input[name="passwd"]');
		validRegisterAccount('#set-email');
		validRegitsterPasswd('#set-passward');
		validPasswdConf('#set-passward', "#confirm-password");
		// validPhone('#telephone_account');

		/*
		 *BI数据接口
		 */
		$.post(url + "/h/v2/user/browse");

		/*
		 *展示登录窗口
		 */
		$loginBtn.on("click", function() {
			// alert("dsd")
			showLoginWin();
			$signPanel.find('.tab-nav a').eq(0).click();
		});
		/*
		 *展示注册窗口
		 */
		$registerBtn.on("click", function() {
			showLoginWin();
			$signPanel.find('.tab-nav a').eq(1).click();
		})
		/*
		 *登录
		 */
		$signinSub.on("click", function() {
			login_submit();
		});
		/*
		 *注册
		 */
		$signupSub.on("click", function() {
			register_submit();
		})
		/*
		 *关闭窗口
		 */
		$closeBtn.click(function() {
			closeWin();
			resetForm();
		});

		$(".submit_code").on("click", function() {
			sendMsg();
		});
		$("#loginout").on("click", function() {
			loginout();
		});
		$(".my-order").on("click", function() {
			return false;
			if (is_login) {
				location.href = "my-order.html";
			} else {
				showLoginWin();
				return false;
			}
		});
		$(".buy-button").on("click", function() {
			if (is_login) {
				location.href = "pre-order.html";
			} else {
				showLoginWin();
				return false;
			}
		});
	});

	function loginout() {
		$.post(url + '/h/v2/user/logout', function(data) {
			if (data.ret == 1) {
				delCookie("account");
				delCookie("token");
				delCookie("sessionId");
				delCookie("JSESSIONID");
				location.reload();
			} else {
				alert(data.msg);
			}
		}, "json");
	}

	function resetForm() {
		$("form").each(function() {
			this.reset();
		});
	}

	/**
	 * register
	 * @param reg_type 1:phone, 2:email
	 */
	function register_submit() {
		// alert(reg_error_code);
		$("#email").find("input.required").blur();
		if (reg_error_code != 0) {
			return false;
		}
		if (!$("#agree").attr("checked")) {
			reg_error_code = -7;
			showRegErrorMsg(reg_error_code, $("#agree"));
			reg_error_code = 0;
			return false;
		}
		var email = $('#set-email').val();
		$.ajax({
			cache: false,
			type: "post",
			url: url + "/h/v2/user/register",
			data: $('#email').serialize(), // formid
			success: function(obj) {
				var data = eval('(' + obj + ')');
				var ret = data.ret;
				if (ret == 1) {
					Cookie.setCookie("account", $('#set-email').val());
					Cookie.setCookie("token", Md5.hex_md5($('#set-passward').val()));
					closeWin();
					alert("已发送验证邮件至您注册邮箱" + email + "，请前往邮箱点击邮件内链接完成注册。");
				} else {
					alert(data.msg);
				}
			}
		});

	}
	/**login*/

	function login_submit() {
		// console.log($('#loginForm').serialize());
		// console.log(error_code)	;
		var recDays = 0;
		$("#loginForm").find("input").blur();
		if (error_code != 0) {
			return false;
		}
		if ($("#autoLogin").attr("checked")) {
			recDays = 14;
		}
		if (error_code < 0) {
			return false;
		}
		var account = $('#login-account').val();
		var passwd = $('#login-psw').val();

		$.post(url + '/h/v2/user/login', {
				account: account,
				passwd: Md5.hex_md5(passwd)
			}, function(data) {
				var ret = data.ret;
				console.log("------------>")
				console.log(ret);

				if (ret == 1) {
					Cookie.setCookie("account", account, recDays);
					// console.log(Md5.hex_md5(passwd));
					Cookie.setCookie("token", Md5.hex_md5(passwd), recDays);
					location.reload();
				} else {
					// console.log(data);
					$(error_node).find("p").html(data.msg).show();
					$(error_node).show();
					// alert(data.msg);
				}
			}, "json");

	}
	//FIXME: add onclicked event handler for nodes.

	function setCookie(name, value, days) { //两个参数，一个是cookie的名子，一个是值
		//var Days = 30; // 此 cookie 将被保存 30 天
		var exp = new Date(); // new Date("December 31, 9998");
		var Days = days ? days : 1 / 12;
		exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	}

	function getCookie(name) { // 取cookies函数
		var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		if (arr != null)
			return (arr[2]);
		return null;

	}

	function delCookie(name) { // 删除cookie
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval = getCookie(name);
		if (cval != null)
			document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
	}

	function showRegisterWin() {
		resetForm();
		$('#bg').css('display', "block");
		$('#registerblock').css('display', "block");
		$('#loginblock').css('display', "none");
		$(document).off("keyup.login");

	}

	function showLoginWin() {
		resetForm();
		$signPanel.show().animate({
			marginTop: -$signPanel.height() / 2
		}, 300);
		$('body').append($maskLayer);
		$maskLayer.fadeTo(300, 0.5);
		$('#registerblock').hide();
		$(document).off("keyup.login");
		$(document).on("keyup.login", function(e) {
			if (e.which == '13') {
				login_submit();
			}
		});
	}

	function closeWin() {
		$maskLayer.fadeOut(300, function() {
			$(this).remove();
		})
		$signPanel.animate({
			marginTop: $winHeight / 2 + 10
		}, 300, function() {
			$(this).hide();
		})
		// $signinPanel.css('display',"none");
		// $signupPanel.css('display',"none");
		$(document).off("keyup.login");
	}

	function showEmail() {
		error_msg = "#error_msg1";
		$('#error_msg').hide();
		$('#error_msg1').show();
		$("#email input[name=reg_type]:eq(0)").attr("checked", true);
		$("#phone").css("display", "none");
		$("#email").css("display", "block");
		$("#email input[type=radio][name=reg_type].eq(1)").removeAttr("checked");
	}
	/*	
	function showPhone(){
		 error_msg="#error_msg";
		 $('#error_msg1').hide();
		 $('#error_msg').show();
		 $("#phone input[type=radio][name=reg_type]:eq(1)").attr("checked",true);
		 $("#email").css("display","none");
		 $("#phone").css("display","block");
		 $("#phone input[type=radio][name=reg_type]eq(0)").removeAttr("checked");
	}
*/
	function validLoginPasswd(passwd) {
		$(passwd).blur(function() {
			if ($(this).val() == '') {
				error_code = -10;
				// showErrorMsg(error_code);
				return false;
			}
			clearErrorMsg(-10);
			if (!($(this).val().search(/^[0-9a-zA-Z]+$/) != -1)) {
				//$(this).focus();
				error_code = -4;
				showErrorMsg(error_code);
				return false;
			}
			clearErrorMsg(-4);

			if ($(this).val().length < 8 || $(this).val().length > 12) {
				//$(this).focus();
				error_code = -5;
				showErrorMsg(error_code);
				return false;
			}
			clearErrorMsg(-5);
		})
	}

	function validLoginAccount(account) {
		// alert(account);
		$(account).blur(function() {
			if ($(this).val() == '') {
				error_code = -10;
				showErrorMsg(error_code);
				return false;
			}
			clearErrorMsg(-10);
			if (!(this.value.search(/^([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.(?:com|cn)$/) != -1)) {
				//this.focus();
				error_code = -2;
				showErrorMsg(error_code);
				return false;
			}
			clearErrorMsg(-2);
		});
	};



	/*function validPhone(phone) {
	 $(phone).focus(function () { 
		 if ($(this).val() == '输入11位手机号码') {
			this.style.color = '#000';
			this.value = '';
			return false;
		}
	 })

	 $(phone).blur(function () { 
		if ($(this).val() == '') {
			this.style.color = '#ccc';
			this.value = '输入11位手机号码';
			return false;
		}

		if (!(this.value.search(/^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/)!= -1)){
		  //this.focus();
		  error_code = -1;
		  showErrorMsg(error_code);
		  return false;   
		}
		clearErrorMsg(-1);
		

	    $.post(url+'/h/v2/user/isRegister', {account : $('#telephone_account').val()}, function(data) {
			var data = eval('('+data+')');																						 
			if (data.ret != 1){
				error_code = -8;
				showErrorMsg(-8);
				return false;
			}
			clearErrorMsg(-8);
		});		
	 })
	}*/
	function validRegitsterPasswd(passwd) {
		var $passwd = $(passwd);
		var $reg_error_node = $passwd.parent().next();
		$passwd.blur(function() {
			if ($(this).val() == '') {
				reg_error_code = -11;
				showRegErrorMsg(reg_error_code, $reg_error_node);
				return false;
			}
			if (!($(this).val().search(/^[0-9a-zA-Z]+$/) != -1)) {
				//$(this).focus();
				reg_error_code = -4;
				showRegErrorMsg(reg_error_code, $reg_error_node);
				return false;
			}
			clearRegErrorMsg(-4, $reg_error_node);

			if ($(this).val().length < 8 || $(this).val().length > 12) {
				//$(this).focus();
				reg_error_code = -5;
				showRegErrorMsg(reg_error_code, $passwd.parent().next());
				return false;
			}
			clearRegErrorMsg(-5, $reg_error_node);
		})
	};

	function validPasswdConf(passwd, passwd_conf) {
		var $passwdConf = $(passwd_conf);
		var $reg_error_node = $passwdConf.next();
		$passwdConf.blur(function() {
			if ($(this).val() != $(passwd).val()) {
				reg_error_code = -6;
				showRegErrorMsg(reg_error_code, $reg_error_node);
				return false;
			}
			//alert("22222222222222");
			clearRegErrorMsg(-6, $reg_error_node);
		})
	};

	function validRegisterAccount(email) {
		var $email = $(email);
		var $reg_error_node = $email.parent().next();
		$email.blur(function() {
			if ($(this).val() == '') {
				reg_error_code = -10;
				showRegErrorMsg(reg_error_code, $reg_error_node);
				return false;
			}

			if (!(this.value.search(/^([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.(?:com|cn)$/) != -1)) {
				//this.focus();
				reg_error_code = -2;
				showRegErrorMsg(reg_error_code, $reg_error_node);
				return false;
			}
			clearRegErrorMsg(-2, $email.next());

			$.post(url + '/h/v2/user/isRegister', {
				account: $email.val()
			}, function(data) {
				var data = eval('(' + data + ')');
				if (data.ret != 1) {
					reg_error_code = -9;
					showRegErrorMsg(-9, $reg_error_node);
					return false;
				}
				clearRegErrorMsg(-9, $reg_error_node);
			});
		});
	}



	//手机相关
	/*	function validCode(code) {
	 $(code).focus(function () { 
		 if ($(this).val() == '60秒重新获取') {
			this.style.color = '#000';
			this.value = '';
			return false;
		}
	 })

	 $(code).blur(function () { 
		 if ($(this).val() == '') {
			this.style.color = '#ccc';
			this.value = '60秒重新获取';
			return false;
		}

		if (!(this.value.search(/^([0-9]{6})$/)!= -1)){
		  error_code = -3;
		  showErrorMsg(error_code);
		  return ;   
		}
		clearErrorMsg(-3);
	 })
	}

	function sendMsg() {
		if(error_code != 0){
		 return false;
	   }

		$('#fsyzm').attr('disabled',1);
		timedCount();

		$.post(url+'/h/v2/user/sendTelCode', {telephone_account : $('#telephone_account').val()}, function(data) {
			var data = eval('('+data+')');																						 
			if (data.ret != 1){
				alert(data.msg);
			}
		});
	}

	function timedCount() {
		$('#fsyzm').css('color','#ccc');
		$('#fsyzm').val("请稍等(" + c + ")");
		c = c-1;
		t = setTimeout(function(){
			timedCount();
		}, 1000);
		if (c < 0) {
			c = Time;
			stopCount();
			$('#fsyzm').css('color','#000');
		    $('#fsyzm').val("获取验证码");
			$('#fsyzm').removeAttr('disabled');
		}
	}

	function stopCount() {
		clearTimeout(t);
	}
*/
	function clearErrorMsg(curr_code) {
		if (error_code == curr_code) {
			error_code = 0;
			$(error_node).find("p").html("");
			$(error_node).find("p").hide()
			$(error_node).hide();
		}
	}

	function clearRegErrorMsg(curr_code, error_node) {
		// console.log(curr_code);
		if (reg_error_code == curr_code) {
			reg_error_code = 0;
		}
		$(error_node).hide();
	}

	function showErrorMsg(code) {
		// alert(code);
		var msg = "";
		switch (code) {
			case -1:
				msg = "手机号码位数错误";
				break;
			case -2:
				msg = "邮箱格式错误";
				break;
			case -4:
				msg = "密码只能由数字或字母组成"
				break;
			case -5:
				msg = "密码长度8~12位";
				break;
			case -10:
				msg = "帐号不能为空！";
				break;
		}
		// alert(error_msg);
		$(error_node).find("p").html(msg).show();
		$(error_node).show();
	}

	function showRegErrorMsg(code, error_node) {

		// alert(code);
		var msg = "";
		switch (code) {
			case -1:
				msg = "手机号码位数错误";
				break;
			case -2:
				msg = "邮箱格式错误";
				break;
			case -3:
				msg = "验证码格式错误";
				break;
			case -4:
				msg = "密码只能由数字或字母组成"
				break;
			case -5:
				msg = "密码长度8~12位";
				break;
			case -6:
				msg = "两次输入密码不一致";
				break;
			case -7:
				msg = "请同意并遵守互爱用户协议和隐私政策";
				break;
			case -8:
				msg = "手机号已注册";
				break;
			case -9:
				msg = "邮箱已注册";
				break;
			case -10:
				msg = "帐号不能为空！";
				break;
			case -11:
				msg = "密码不能为空！";
				break;
		}
		// alert(error_msg);
		error_node.html(msg).show();
		// $(error_node).show();
	}

	// Tab
	$('.tab-container').each(function() {
		var $tabPanel = $('.tab-panel', this);
		var $tabButton = $('.tab-nav a', this);
		$tabButton.click(function() {
			$tabButton.removeClass('current');
			$(this).addClass('current');
			$tabPanel.hide().eq($(this).closest('li').index()).show();
			return false;
		}).filter(':first').click();
	})

	// 登录 注册里的输入框的keydown事件不冒泡
	$signPanel.find('input, textarea').keydown(function(event) {
		event.stopPropagation();
	})

});