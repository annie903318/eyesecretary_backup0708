function Menu3() {
  this.Ask_Msg = function(){
    let date = new Date();
    let s = '';
    date.getMonth()+1 < 10?s = '0'+(date.getMonth()+1):s = (date.getMonth()+1);
    let d = '';
    date.getDate() < 10?d = '0'+(date.getDate()):d = (date.getDate());
    let msg = {
        "type": "template",
        "altText": "This is a buttons template",
        "template": {
            "type": "buttons",
            "text": "提醒事項",
            "actions": [
                {
                  "type": "datetimepicker",
                  "label": "紀錄事項",
                  "data": "type=1&menu=3",
                  "mode":"datetime",
                  "initial":`${date.getFullYear()}-${s}-${d}t00:00`,
                  "max":`${date.getFullYear()+10}-${s}-${d}t23:59`,
                  "min":`${date.getFullYear()}-${s}-${d}t00:00`
                },
                {
                  "type": "postback",
                  "label": "查看事項",
                  "data": "type=2&menu=3"
                }
            ]
        }
    }
    return msg;
  };
  this.Record_Msg = function(client, event, pool){
      pool.connect(async function(err, pp, done){
        if(err){
            let text = {type: 'text', text: `error`};
            return client.replyMessage(event.replyToken, text);
        }
        let sql = `SELECT COUNT(userid) AS count FROM notes WHERE userid = '${event.source.userId}'`;
        pp.query(sql, function(err, result){
          // 存取資料用，將資料轉換成JSON
          let count_results = { 'results': (result) ? result.rows : null};
          // 拆解JSON資料
          let count_s = JSON.parse(JSON.stringify(count_results));
          // 抓取使用者目前事項總共幾筆提醒事項
          let sum = count_s.results[0].count;
          if(sum < 5){
            // 將使用者狀態更改為5，將日期資訊丟到mark
            let sql = `UPDATE user_status SET status = 5, mark = '${event.postback.params.datetime}' WHERE userid = '${event.source.userId}'`;
            pp.query(sql, function(err, result){
                let msg = {
                  "type": "text",
                  "text": "填寫要提醒的事項：",
                  "quickReply": {
                    "items": [
                      {
                        "type": "action",
                        "action": {
                          "type": "postback",
                          "label": "取消",
                          "data": "type=0&menu=3"
                        }
                      }
                      // 下面可以抓位置
                      // {
                      //   "type": "action", // ④
                      //   "action": {
                      //     "type": "location",
                      //     "label": "Send location"
                      //   }
                      // }
                    ]
                  }
                }
                pp.release();
                return client.replyMessage(event.replyToken, msg);
            });
          }
          else{
            let msg = { type: 'text', text: '提醒事項已達到上限了哦！' };
            pp.release();
            return client.replyMessage(event.replyToken, msg);
          }
        });
      });
  };
  this.Schedule_Msg = function(client, event, pool){
    client.pushMessage(event.source.userId, "msg");
    // pool.connect(async function(err, pp, done){
    //   let sql = `SELECT COUNT(userid) AS count FROM notes WHERE userid = '${event.source.userId}'`;
    //   pp.query(sql, function(err, result){
    //       // 存取資料用，將資料轉換成JSON
    //       let count_results = { 'results': (result) ? result.rows : null};
    //       // 拆解JSON資料
    //       let count_s = JSON.parse(JSON.stringify(count_results));
    //       // 抓取使用者全部的事項
          
    //         let sql = `SELECT id, description, m_date, m_time FROM notes WHERE userid = '${event.source.userId}'`;
    //         pp.query(sql, function(err, result){
    //           // 存取資料用，將資料轉換成JSON
    //           let results = { 'results': (result) ? result.rows : null};
    //           // 拆解JSON資料
    //           let s = JSON.parse(JSON.stringify(results));
    //           // 宣告星期陣列
    //           let today = new Array("日","一","二","三","四","五","六");
    //           // 用來存放用
    //           let columns = [];
    //           for(i = 0; i < sum; i++){
    //             // 描述
    //             let description = s.results[i].description;
    //             // 日期
    //             let now_date = s.results[i].m_date;
    //             // 將日期格式化，轉成當天日期星期幾
    //             let m_date = now_date.split('T')[0];
    //             let now_week = new Date(Date.parse(m_date.replace(/-/g, '/')));
    //             now_week = today[now_week.getDay()];
    //             // 時間，判斷上午或下午
    //             let now_time = s.results[i].m_time;
    //             let a = now_time.split(':');
    //             if(a[0] >= 0 && a[0] <= 11){
    //               now_time = '上午 ' + now_time;
    //             }
    //             else if(a[0] >= 12 && a[0] <= 23){
    //               now_time = '下午 ' + now_time;
    //             }

                
    //           }
              
    //           pp.release();
    //           return client.replyMessage(event.replyToken, msg);
    //         });
    //       }
    //   );
    // });
  };
  this.Cancel_Msg = function(client, event, pool){
    pool.connect(async function(err, pp, done){
      // 使用者狀態初始化
      let sql = `UPDATE user_status SET status = 0 WHERE userid = '${event.source.userId}'`;
      pp.query(sql, function(err, result){
        let cancel = { type: 'text', text: '已取消' };
        pp.release();
        client.replyMessage(event.replyToken, cancel);
      });
    });
  };
  this.Check_Msg = function(client, event, pool){
    pool.connect(async function(err, pp, done){
      let sql = `SELECT COUNT(userid) AS count FROM notes WHERE userid = '${event.source.userId}'`;
      pp.query(sql, function(err, result){
          // 存取資料用，將資料轉換成JSON
          let count_results = { 'results': (result) ? result.rows : null};
          // 拆解JSON資料
          let count_s = JSON.parse(JSON.stringify(count_results));
          // 抓取使用者目前事項總共幾筆
          let sum = count_s.results[0].count;
          if(sum == 0){
            let msg = { type: 'text', text: '查無提醒事項' };
            pp.release();
            client.replyMessage(event.replyToken, msg);
          }
          else{
            let sql = `SELECT id, description, m_date, m_time FROM notes WHERE userid = '${event.source.userId}'`;
            pp.query(sql, function(err, result){
              // 存取資料用，將資料轉換成JSON
              let results = { 'results': (result) ? result.rows : null};
              // 拆解JSON資料
              let s = JSON.parse(JSON.stringify(results));
              // 宣告星期陣列
              let today = new Array("日","一","二","三","四","五","六");
              // 用來存放用
              let columns = [];
              for(i = 0; i < sum; i++){
                // 描述
                let description = s.results[i].description;
                // 日期
                let now_date = s.results[i].m_date;
                // 將日期格式化，轉成當天日期星期幾
                let m_date = now_date.split('T')[0];
                let now_week = new Date(Date.parse(m_date.replace(/-/g, '/')));
                now_week = today[now_week.getDay()];
                // 時間，判斷上午或下午
                let now_time = s.results[i].m_time;
                let a = now_time.split(':');
                if(a[0] >= 0 && a[0] <= 11){
                  now_time = '上午 ' + now_time;
                }
                else if(a[0] >= 12 && a[0] <= 23){
                  now_time = '下午 ' + now_time;
                }
                // 將資訊放入陣列中
                columns[i] = {
                  "type": "bubble",
                  "header": {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "text",
                        "text": "待辦事項",
                        "weight": "bold",
                        "color": "#00ff00",
                        "gravity": "center"
                      },
                      {
                        "type": "button",
                        "action": {
                          "type": "uri",
                          "label": "設定提醒",
                          "uri": "https://eye-secretary.herokuapp.com/auth/notify"
                        },
                        "height": "sm"
                      }
                    ],
                    "justifyContent": "center"
                  },
                  "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                          {
                            "type": "text",
                            "text": `${m_date}(${now_week})`,
                            "weight": "bold",
                            "size": "lg"
                          },
                          {
                            "type": "text",
                            "text": `${now_time}`,
                            "weight": "bold",
                            "size": "lg"
                          }
                        ]
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                          {
                            "type": "text",
                            "text": `${description}`,
                            "weight": "bold",
                            "size": "lg",
                            "wrap": true
                          }
                        ],
                        "margin": "md"
                      }
                    ]
                  },
                  "footer": {
                    "type": "box",
                    "layout": "horizontal",
                    "spacing": "sm",
                    "contents": [
                      {
                        "type": "button",
                        "height": "sm",
                        "action": {
                          "type": "postback",
                          "label": "完成",
                          "data": `status=1&m_id=${s.results[i].id}&type=3&menu=3`
                        },
                        "color": "#32cd32",
                        "style": "primary"
                      },
                      {
                        "type": "button",
                        "height": "sm",
                        "action": {
                          "type": "postback",
                          "label": "刪除",
                          "data": `status=0&m_id=${s.results[i].id}&type=3&menu=3`
                        },
                        "color": "#ff0000"
                      }
                    ],
                    "flex": 0
                  }
                }
              }
              // 以下暫時儲存用
              // "type": "postback",
              // "data": "type=4&menu=3",
              // "label": "設定提醒"
              // 將陣列放入要回傳的訊息內
              let msg = {
                "type": "flex",
                "altText": "this is a flex message",
                "contents": {
                  "type": "carousel",
                  "contents": columns
                }
              }
              pp.release();
              return client.replyMessage(event.replyToken, msg);
            });
          }
      });
    });

  }
  this.Delete_Msg = function(client, event, pool, m_id, status){
    pool.connect(async function(err, pp, done){
      let sql = `DELETE FROM notes WHERE userid = '${event.source.userId}' AND id = ${m_id}`;
      pp.query(sql, function(err, result){
        if(status == 1){
          let msg = { type: 'text', text: '恭喜你，完成了一件事項' };
          pp.release();
          return client.replyMessage(event.replyToken, msg);
        }
        else if(status == 0){
          let msg = { type: 'text', text: '已刪除' };
          pp.release();
          return client.replyMessage(event.replyToken, msg);
        }
      });
    });
  }
};
module.exports = Menu3; 