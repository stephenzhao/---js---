/**
 A data model representing a user on app

 @class User
 @namespace app
 @module 
 **/
define(function(require,exports,module){
	/*user 数据*/
	var $ = require("jquery");
	var User = function(attr){
		this.records = attr||{};
	}

	User.prototype.fetchRemote = function(){
		$.get("user",success);
	};

	User.prototype.destroy = function(){
		//清除user信息
	};
	User.prototype.login = function(params){
		$.post("login",{"userName":params.userName,"psw":params.password},success);
	};
});