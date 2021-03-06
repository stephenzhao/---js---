define(function(require, exports, module) {
	/*app 用户信息展示*/
	var Handlebars = require("handlebars"),
		$ = require("jquery"),
		Events = require("../../utils/EventBus"),
		me = null;
	var UserView = function(el) {
		this.el = $(el);
		//处理 点击事件
		this.el.on("click","a",this._handleClick);
		me = this;
	}

	//渲染
	UserView.prototype.render = function(data) {
		var tpl = me.el.find("[data-tpl-name='user-info']").html();
		// me._populate(data, tpl);
		me._populate.apply(me,[data, tpl]);
		$("body").addClass("has-signin");
	};

	//处理点击事件
	UserView.prototype._handleClick = function(event) {
		event.preventDefault();
		if($(event.target).is("a#sign-out")){
			Events.trigger("logout");
		}
		//把自定义事件通知到外面
	};

	// 对模板渲染数据的封装
	UserView.prototype._populate = function(data, tpl) {
		// console.log("render-data start---", data);
		var template = Handlebars.compile(tpl);
		// this.dialogTemplate = Handlebars.compile(dialogTpl);
		var html = template(data);
		me.el.html(html);
	}
	module.exports = UserView;
});