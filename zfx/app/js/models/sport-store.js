define(function(require, exports, module) {
    var $ = require("jquery");
    var domain = require("domain");

    var SportStore = function() { me = this;};

    SportStore.prototype.fetchByIndex = function(index,startTime,endTime,num){
      return $.ajax(domain+"getSportDataByIndex",{data:{"index":index,"startTime":startTime,"endTime":endTime,"num":num},dataType:"json"}).then(function(data){
        if(data.ret == 1){
          return me._getTransData(data,index);
        }else{
            return data.msg;
        }
      });
    };
    //summary data 
    SportStore.prototype.fetchAllData = function() {
      return $.ajax(domain+"getSportData",{cache:false,dataType:"json"}).then(function(data){
        if(data.ret == 1){
          return data;
        }else{
            return data.msg;
        }
      });
    };
    // check bracelet
    SportStore.prototype.checkBracelet = function() {
      return $.ajax(domain+"haveBracelet",{cache:false,dataType:"json"}).then(function(data){
          return data;
      });
    };
    //处理数据库取来的运动数据，转化成数组格式。
    SportStore.prototype._getData = function(baseData,dataId,index) {
      var iData = new Array();
      var myArry = new Array();
      if(!baseData.length){
        var date = new Date().getTime();
         switch(index){
            case 1:
            var time = Math.floor(date/1000/60/60)*60*60*1000;
            myArry = [[time-1000*3600*23,0],[time-1000*3600*22,0],[time-1000*3600*21,0],[time-1000*3600*20,0],[time-1000*3600*19,0],
            [time-1000*3600*18,0],[time-1000*3600*17,0],[time-1000*3600*16,0],[time-1000*3600*15,0],[time-1000*3600*14,0],
            [time-1000*3600*13,0],[time-1000*3600*12,0],[time-1000*3600*11,0],[time-1000*3600*10,0],[time-1000*3600*9,0],
            [time-1000*3600*8,0],[time-1000*3600*7,0],[time-1000*3600*6,0],[time-1000*3600*5,0],[time-1000*3600*4,0],
            [time-1000*3600*3,0],[time-1000*3600*2,0],[time-1000*3600*1,0],[time,0]];
            break;
            case 2:
            var time = date;
            myArry = [[time-1000*3600*24*6,0],[time-1000*3600*24*5,0],
            [time-1000*3600*24*4,0],[time-1000*3600*24*3,0],[time-1000*3600*24*2,0],[time-1000*3600*24,0],[time,0]];
            break;
            case 4:
            var time = date;
            myArry = [[time-1000*3600*24*30*11,0],[time-1000*3600*24*30*10,0],[time-1000*3600*24*30*9,0],
            [time-1000*3600*24*30*8,0],[time-1000*3600*24*30*7,0],[time-1000*3600*24*30*6,0],
            [time-1000*3600*24*30*5,0],[time-1000*3600*24*30*4,0],[time-1000*3600*24*30*3,0],
            [time-1000*3600*24*30*2,0],[time-1000*3600*24*30,0],[time,0]]; 
            break;
          }
      }
      else{
          for (var i = baseData.length - 1; i >= 0; i--) {
          iData = [];
          iData.push(baseData[i]['time'], baseData[i][dataId]);
          myArry.push(iData);
        };
      }
    
      return myArry;
    };
    //处理数据库取来的睡眠数据，转化成数组hash格式。
    SportStore.prototype._getSleepStatusData = function(baseData) {
      var iData = new Array(),differTime= null,status = null;
      var myArry = new Array();
      if(!baseData.length){
          iData['data'] = 100,iData['label']="无数据";
      }
      else{
          for (var i = baseData.length - 1; i >= 0; i--) {
              iData = [];
              differTime = Math.floor((baseData[i]['endTime'] - baseData[i]['startTime'])/(1000*60));
              console.log(differTime,baseData[i]['state']);
              switch(baseData[i]['state']){
                  case 0:
                  status = "苏醒";
                  break;
                  case 1:
                  status = "深度睡眠";
                  break; 
                  case 2:
                  status = "浅睡";
                  break;              
              };
              iData['data'] = differTime,iData['label']=status;
         };
      
      };
      myArry.push(iData);
      return myArry;
    };
    //调用转化格式函数，得到总的数据json。
    SportStore.prototype._getTransData = function(data,index) {
      var allData = {};
      var sleepData = new Array(), stepsData = new Array(), distanceData = new Array(), calorieData = new Array(),sleepStasusData = new Array();
          sleepData = this._getData(data.sportDatas,'sleepHours',index);
          stepsData = this._getData(data.sportDatas,'steps',index);
          distanceData = this._getData(data.sportDatas,'distance',index);
          calorieData = this._getData(data.sportDatas,'calorie',index);
          sleepStasusData = this._getSleepStatusData(data.sleepDatas);
          allData["sleepData"] = sleepData;
          allData['stepsData'] = stepsData;
          allData['distanceData'] = distanceData;
          allData['calorieData'] = calorieData;
          allData['sleepStatusData'] = sleepStasusData;
      return allData;
    };

    module.exports = SportStore;
  });












