function Menu1() {
  this.Ask_Msg = function(){
      let msg = {
          "type": "template",
          "altText": "This is a buttons template",
          "template": {
              "type": "buttons",
              "text": "健康日誌",
              "actions": [
                  {
                    "type": "postback",
                    "label": "日誌紀錄",
                    "data": "type=1&menu=1"
                  },
                  {
                    "type": "postback",
                    "label": "日誌修改",
                    "data": "type=2&menu=1"
                  },
                  {
                    "type": "postback",
                    "label": "日誌回顧",
                    "data": "type=3&menu=1"
                  }
              ]
          }
        }
      return msg;
  };
  // 日誌修改&回顧選單
  this.Review = function(client, event){
    //連接環境變量指定的數據庫
    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    pool.connect(async function(err, pp, done){
      if(err){
        let pool_connect_error = { type: 'text', text: "connect error" };
        return client.replyMessage(event.replyToken, pool_connect_error);
      }
      let sql = `SELECT COUNT(userid) AS count FROM health_diary WHERE userid = '${event.source.userId}'`;
      pp.query(sql, function(err, result){
        // 存取資料用，將資料轉換成JSON
        let count_results = { 'results': (result) ? result.rows : null};
        // 拆解JSON資料
        let count_s = JSON.parse(JSON.stringify(count_results));
        // 抓取使用者目前日誌總共幾筆
        let sum = count_s.results[0].count;
        // 抓取使用者過往10筆日誌
        let sql = `SELECT SUBSTRING(description, 1, 58) AS description, create_date FROM health_diary WHERE userid = '${event.source.userId}' ORDER BY create_date DESC LIMIT 10`;
        pp.query(sql, function(err, result){
          // 存取資料用，將資料轉換成JSON
          let results = { 'results': (result) ? result.rows : null};
          // 拆解JSON資料
          let s = JSON.parse(JSON.stringify(results));
          // 如果使用者沒有日誌要顯示沒有日誌
          if(s.results[0] == undefined){
            let no_diary = { type: 'text', text: "沒有寫過的日誌哦！" };
            return client.replyMessage(event.replyToken, no_diary);
          }
          else{
            let columns = []
            for(i = 0; i < sum; i++){
              let description = s.results[i].description;
              let add_date = s.results[i].create_date.substring(0,10);
              columns[i] = {
                "title": `${add_date}日誌`,
                "text": `${description}`,
                "actions": [
                    {
                      "type": "postback",
                      "label": "修改",
                      "data": `type=4&menu=1&show=${add_date}`
                    },
                    {
                      "type": "postback",
                      "label": "查看",
                      "data": `type=5&menu=1&show=${add_date}`
                    }
                ]
              };
            }
            let msg = {
              "type": "template",
              "altText": "日誌回顧",
              "template": {
                  "type": "carousel",
                  "columns": columns
              }
            };
            pp.release();
            return client.replyMessage(event.replyToken, msg);
          }      
        });
      });
    });
  }
};
module.exports = Menu1;