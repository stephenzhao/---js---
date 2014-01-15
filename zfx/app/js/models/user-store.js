/**
 A data model representing a user on app

 @class UserStore
 @namespace app
 @module 
 **/
define(function(require, exports, module) {
	/*user 数据*/
	var $ = require("jquery");
	domain = require("domain"),
	User = require("models/User");
	var UserStore = function(attr) {
		this.records = attr || {};
	}

	UserStore.prototype.fetchRemote = function() {
		//利用 promise模式简化回调
		return $.ajax({url: domain + "myAccount", cache: false,dataType: "json"}).then(function(data) {
			return User.init(data);
		});
	};

	UserStore.prototype.logout = function() {
		return $.ajax({url: domain + "logout", cache: false,dataType: "json"}).then(function(data) {
			return data;
		});
	};
	UserStore.prototype.login = function(params) {
		return $.ajax(domain + "login", {
			data: {
				"account": params.email,
				"passwd": params.password
			},
			dataType: "json",
			cache: false
		}).then(function(data) {
			return data;
		});
	};
	module.exports = UserStore;
});