define(function(require, exports, module) {
  var $ = require("jquery"),
    Events = require("../../utils/EventBus"),
    me = null;

  var SportLineChartView = function(el) {
    me = this;
    me.el = $(el);
    //me.el.on('click', '$sports-trends-container .day', me._handleClick);
  };
  SportLineChartView.prototype.render = function(data) {
    //利用chartjs引擎渲染
  }
  // 渲染图标
  SportLineChartView.prototype.flotChartRender = function(nodeId, sportData, dateType,sleepStatusData) {
    seajs.use("flot", function() {
      //调用第三方类库，渲染2维线性图表，以dateType来判断不同类型。
      seajs.use("flot.time", function() {
        switch (dateType) {
          case "hour":
            $.plot(nodeId, [sportData], {
              xaxis: {
                mode: "time",
                minTickSize: [1, 'hour'],
                timeformat: "%H"
              },
              yaxis: { min:0 },
              series: {
                lines: {
                  show: true
                },
                points: {
                  show: true
                }
              }
            });
            break;
          case "day":
            $.plot("#sports-trends", [sportData], {
              xaxis: {
                mode: "time",
                minTickSize: [1, 'day'],
                timeformat: "%Y/%m/%d"
              },
              yaxis: { min:0 },
              series: {
                lines: {
                  show: true
                },
                points: {
                  show: true
                }
              }
            });
            break;
          case "month":
            $.plot("#sports-trends", [sportData], {
              xaxis: {
                mode: "time",
                minTickSize: [1, 'month'],
                timeformat: "%Y/%m"
              },
              yaxis: { min:0 },
              series: {
                lines: {
                  show: true
                },
                points: {
                  show: true
                }
              }
            });
            break;
        };
      });
      //调用第三方类库，渲染2维饼图。数据参数是数组hash格式
      seajs.use("flot.pie", function() {
        $.plot('#sleep-record', sleepStatusData, {
          series: {
            pie: {
              show: true
            }
          }
        });
      });
    });
  };

  SportLineChartView.prototype._handleClick = function(event) {
    event.preventDefault();
    /* Act on the event */
  }

  module.exports = SportLineChartView;
});