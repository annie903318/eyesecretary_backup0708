//web server與line notify驗證的套件
'use strict';
//引用request
const request = require('request');
//引用@line/bot-sdk
const line = require('@line/bot-sdk');
//引用express
const express = require('express');
//引用NLP訓練模型
const nlpManager = require('./ai-nlp');
// create LINE SDK config from env variables
const config = {
  //channelId: process.env.CHANNEL_ID,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

//連接環境變量指定的數據庫
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
// 今天的日期
const date = new Date();
const today = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate();
// create LINE SDK client
const client = new line.Client(config);

const line_notify = require('./line-notify');
const path = require('path');
const session = require('express-session'); //使用express-session作為middleware
const moment= require('moment'); //處理時間運算
const { exportDefaultSpecifier } = require('babel-types');
const { initParams } = require('request');
const e = require('express');

//頁面渲染引擎設定、靜態檔案存取設定、session參數、line notify參數
//設定session參數
const session_options = {
    secret:process.env.LINE_NOTIFY_CHANNEL_SECRET,
    resave:false, //false表示不強制儲存沒有修改過的session內容
    saveUninitialized: false //false表示只儲存有修改過的session內容節省記憶體
};
//設定line notify參數
const notifyConfig = {
    channel_id: process.env.LINE_NOTIFY_CHANNEL_ID, //line notify編號
    channel_secret: process.env.LINE_NOTIFY_CHANNEL_SECRET, //line notify密鑰
    callback_url:process.env.LINE_NOTIFY_CALLBACK_URL, //line notify授權成功時跳轉的網址，一定要跟LIFF網頁的伺服器網址相同
};
const lineNotify = new line_notify(notifyConfig);
const app = express();
app.set('views', path.join(__dirname, 'views'));  //設定Template目錄，畫面樣板
app.set('view engine', 'pug');  //設定Template引擎，用於產生畫面
app.use(session(session_options));  //設定使用Session
app.use(express.static(path.join(__dirname, 'public'))); //設定可以取得的檔案

//自訂兩個登入畫面(尚未登入、成功登入)
//自訂的畫面路由，檢查session是否已完成line notify授權
app.get('/', (req, res) => {
  if (req.session.authPass) {
    const name = req.session.notify_info.target;
    const schNotify = req.session.schNotify;
    res.render('success', { name, schNotify }); //自訂成功登入頁面LINE Notify功能
  } else if (req.session.errMsg) {
    res.render('login', {  //自訂尚未登入頁面，顯示錯誤訊息
      ErrMsg: req.session.errMsg
    });
  } else {
    res.render('login');  //自訂尚未登入頁面，沒有錯誤訊息
  }
});
//LINE Notify相關的API
app.get('/auth/notify', lineNotify.authDirect()); //產生跳轉到LINE Notify的授權網址
app.get('/auth/notify/cb', lineNotify.authcb( //Notify API端點接收授權訊息
  (req, res) => { //登入成功
    req.session.authPass = true;  
    res.redirect('/');
  }, (req, res, error) => {  //登入失敗
    req.session.authPass = false;
    req.session.errMsg = error.message;
    res.redirect('/');
  }
));

//提醒事項功能
//預定通知Notify API
app.get('/auth/notify/me', (req, res) => {
  const notifySeconds = req.query.n_s || 5;
  const scheduleTime = moment().utc().add(8,'h').add(notifySeconds, 's').format('LTS'); //時區增加8小時
  const msg = `${scheduleTime} 通知訊息`;
  setTimeout(() => {  //設定一個延遲的訊息推播
    lineNotify.sendMsg(req.session.access_token, msg);
    delete req.session.schNotify;
  }, notifySeconds * 1000);
  req.session.schNotify = scheduleTime;  //儲存推播的時間
  res.redirect('/');
});

//清除session API
app.get('/auth/notify/logout', (req, res) => { //登出帳號清除session
  req.session.destroy();
  res.redirect('/');
});

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
  
});
// event handler
function handleEvent(event) {
  //判斷使用者目前狀態
  pool.connect(async function(err, pp, done){
    if(err){
      let pool_connect_error = { type: 'text', text: "connect error" };
      return client.replyMessage(event.replyToken, pool_connect_error);
    }
    //取得目前使用者的狀態 狀態表請參考status.txt
    let sql = `SELECT status, mark FROM user_status WHERE userid = '${event.source.userId}'`;
    pp.query(sql, function(err, result){
      if(err){
        let pp_query_error = { type: 'text', text: "query error" };
        return client.replyMessage(event.replyToken, pp_query_error);
      }
      // 存取資料用，將資料轉換成JSON
      let results = { 'results': (result) ? result.rows : null};
      // 拆解JSON資料
      let s = JSON.parse(JSON.stringify(results));
      //沒有資料就新增
      if(s.results[0] == undefined){
        let sql = `INSERT INTO user_status(userid, status) VALUES('${event.source.userId}', 0)`;
        pp.query(sql, function(err, result){
          if(err){
            let pp_query_error = { type: 'text', text: "insert error" };
            return client.replyMessage(event.replyToken, pp_query_error);
          }
          else{
            // 新增完畢之後再去判斷使用者說什麼
            pp.release();
            type_reply();
          }
        });  
      }
      // 狀態為0才執行判斷說話
      else if(s.results[0].status == 0){
        pp.release();
        type_reply();
      }
      else if(s.results[0].status == 1){
        // 將輸入的資料新增至今天的日誌
        let sql = `INSERT INTO health_diary(userid, description, create_date, update_date) VALUES('${event.source.userId}', '${event.message.text}', '${today}', '${today}')`;
        pp.query(sql, function(err, result){
          // 使用者狀態初始化
          let sql = `UPDATE user_status SET status = 0 WHERE userid = '${event.source.userId}'`;
          pp.query(sql, function(err, result){
            let health_ok = { type: 'text', text: '記錄成功！' };
            pp.release();
            client.replyMessage(event.replyToken, health_ok);
          });
        });
      }
      else if(s.results[0].status == 2){
        // 修改要修改的日誌
        let sql = `UPDATE health_diary SET description = '${event.message.text}', update_date = '${today}' WHERE userid = '${event.source.userId}' and create_date = '${s.results[0].mark}'`;
        pp.query(sql, function(err, result){
          // 使用者狀態初始化
          let sql = `UPDATE user_status SET status = 0 WHERE userid = '${event.source.userId}'`;
          pp.query(sql, function(err, result){
            let health_ok = { type: 'text', text: '記錄成功！' };
            pp.release();
            client.replyMessage(event.replyToken, health_ok);
          });
        });
      }
      else if(s.results[0].status == 3){
        // 使用者狀態初始化
        let sql = `UPDATE user_status SET status = 0 WHERE userid = '${event.source.userId}'`;
        pp.query(sql, function(err, result){
          let text = { type: 'text', text: '正確答案為：3452839' };
          let text2 = { type: 'text', text: '沒有看到全部的數字不用太擔心' };
          let text3 = { type: 'text', text: '許多人都看不到最旁邊的3和9\n最多人看到' };
          let text4 = { type: 'text', text: '45283、4528、15283' }
          pp.release();
          client.replyMessage(event.replyToken, [text, text2, text3, text4]);
        });
      }
      else if(s.results[0].status == 4){
        // 使用者狀態初始化
        let sql = `UPDATE user_status SET status = 0 WHERE userid = '${event.source.userId}'`;
        pp.query(sql, function(err, result){
          let text = { type: 'text', text: `正確答案為：${s.results[0].mark}` };
          let text2 = { type: 'text', text: '如果答錯可能有色弱或是色盲哦~' }
          pp.release();
          client.replyMessage(event.replyToken, [text, text2]);
        });
      }
      else if(s.results[0].status == 5){
        // 優先判斷使用者是否取消紀錄
        if(event.type === 'postback'){
          return handlePostEvent(event);
        }
        // 將輸入的資料新增至事項中
        let now_datetime = s.results[0].mark.split('T');
        let now_date = now_datetime[0];
        let now_time = now_datetime[1];
        let sql = `INSERT INTO notes(userid, description, m_date, m_time) VALUES('${event.source.userId}', '${event.message.text}', '${now_date}', '${now_time}')`;
        pp.query(sql, function(err, result){
          // 使用者狀態初始化
          let sql = `UPDATE user_status SET status = 0 WHERE userid = '${event.source.userId}'`;
          pp.query(sql, function(err, result){
            let record_ok = { type: 'text', text: `記錄成功！` };
            pp.release();
            client.replyMessage(event.replyToken, record_ok);
          });
        });
      }
    });
  });
  function type_reply(){
    if(event.type === 'postback'){
      return handlePostEvent(event);
    }
    else if(event.type === 'message'){
      if(event.message.text == '健康日誌'){
        const eye_function1 = require('./eye_menu/menu_1');
        const ef1 = new eye_function1();
        return client.replyMessage(event.replyToken, ef1.Ask_Msg());
      }
      else if(event.message.text == '瞭解眼部疾病'){
        const eye_function2 = require('./eye_menu/menu_2');
        const ef2 = new eye_function2();
        return client.replyMessage(event.replyToken, ef2.Ask_Msg());
      }
      else if(event.message.text == '提醒事項'){
        const eye_function3 = require('./eye_menu/menu_3');
        const ef3 = new eye_function3();
        return client.replyMessage(event.replyToken, ef3.Ask_Msg());
      }
      else if(event.message.text == '貼心叮嚀'){
        //連接imgur api
        let options = { method: 'GET',
        url: 'https://api.imgur.com/3/album/xmJXFMT/images',
        headers:
        { 'access-token': `${process.env.IMGUR_ACCESS_TOKEN}`,
        'cache-control': 'no-cache',
        authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}` } };
        //取得imgur相簿的所有內容，隨機回覆圖片
        request(options, function (error, response, body) {
          if (error) {
            let img_error = { type: 'text', text: 'img_error' };
            return client.replyMessage(event.replyToken, img_error);
          }
          //取得相簿裡隨機位置的圖片link
          let pic_url= 'https://imgur.com/' + JSON.parse(body).data[Math.floor(Math.random()*JSON.parse(body).data.length)].id + '.jpg';
          // 透過client.replyMessage(event.replyToken, 要回傳的訊息)方法將訊息回傳給使用者
          const img_echo = { 
            type: 'image', 
            originalContentUrl: pic_url,
            previewImageUrl: pic_url 
          };
          // use reply API
          return client.replyMessage(event.replyToken, img_echo);
        });
      }
      else if(event.message.text == '簡易測驗'){
        const eye_function4 = require('./eye_menu/menu_4');
        const ef4 = new eye_function4();
        return client.replyMessage(event.replyToken, ef4.Ask_Msg());
      }
      else if(event.message.text == '問題諮詢'){
        let text = {type: 'text', text: '有什麼問題都可以詢問'};
        let text2 = {type: 'text', text: '我會盡力回答您的問題!!'};
        client.replyMessage(event.replyToken, [text, text2]);
      }
      else{
        nlpManager.process(event.message.text).then(result => {
          let searchReply = {
            type: 'text',
            text: '我不太懂'
          };
          if (result.intent !== 'None') {
            searchReply.text = result.answer;
          }
          return client.replyMessage(event.replyToken, searchReply)
        });
      }
    }
    else{
      const qqq = { type: 'text', text: 'error' };
      return client.replyMessage(event.replyToken, qqq);
    }
  }
};
function handlePostEvent(event){
  //引用querystring
  let { parse } = require('querystring');
  //抓postback的data值
  let data = event.postback.data;
  //拆解data值
  let _data = parse(data);
  // 圖文選單1
  if(_data.menu == 1){
    // 日誌紀錄功能
    if(_data.type == 1){
      pool.connect(async function(err, pp, done){
        let sql = `SELECT * FROM health_diary WHERE userid = '${event.source.userId}' AND create_date = '${today}'`;
        pp.query(sql, function(err, result){
          // 存取資料用，將資料轉換成JSON
          let results = { 'results': (result) ? result.rows : null};
          // 拆解JSON資料
          let s = JSON.parse(JSON.stringify(results));
          if(s.results[0] == undefined){
            // 將使用者目前狀態更改為1
            let sql = `UPDATE user_status SET status = 1 WHERE userid = '${event.source.userId}'`;
            pp.query(sql, function(err, result){
              let start = { type: 'text', text: `開始記錄${today}的日誌！` };
              pp.release();
              client.replyMessage(event.replyToken, start); 
            });
          }
          else{
            let end = { type: 'text', text: '今天已經記錄過了，要修改請用日誌修改功能喔！' };
            pp.release();
            client.replyMessage(event.replyToken, end);
          }
        });
        
      });
    }
    // 日誌修改&回顧功能
    else if(_data.type == 2 || _data.type == 3){
      const eye_function1 = require('./eye_menu/menu_1');
      const ef1 = new eye_function1();
      return ef1.Review(client, event);
    }
    // 日誌修改修改功能
    else if(_data.type == 4){
      pool.connect(async function(err, pp, done){
        // 將使用者目前狀態更改為2，並將要修改日誌的日期丟進去mark
        let sql = `UPDATE user_status SET status = 2, mark = '${_data.show}' WHERE userid = '${event.source.userId}'`;
        pp.query(sql, function(err, result){
          let start = { type: 'text', text: `開始修改${_data.show}的日誌！` };
          pp.release();
          client.replyMessage(event.replyToken, start);
        });
      });
    }
    else if(_data.type == 5){
      // 日誌回顧查看功能
      pool.connect(async function(err, pp, done){
        let sql = `SELECT * FROM health_diary WHERE userid = '${event.source.userId}' AND create_date = '${_data.show}'`;
        pp.query(sql, function(err, result){
          // 存取資料用，將資料轉換成JSON
          let results = { 'results': (result) ? result.rows : null};
          // 拆解JSON資料
          let s = JSON.parse(JSON.stringify(results));
          let pp_date = { type: 'text', text: `${s.results[0].create_date.substring(0,10)}日誌` };
          let pp_description = { type: 'text', text: s.results[0].description };
          let pp_update = { type: 'text', text: `最後更新日期：${s.results[0].update_date.substring(0,10)}` };
          pp.release();
          client.replyMessage(event.replyToken, [pp_date, pp_description, pp_update]);
        });
      });
    }
  }
  // 圖文選單2
  else if(_data.menu == 2){
    // 以下連結資料庫資料
    pool.connect(async function(err, pp, done){
      if(err){
        let a = { type: 'text', text: "connect error" };
        return client.replyMessage(event.replyToken, a);
      }
      //取得各疾病的最大筆數
      let sql = `SELECT count(number) AS count FROM disease WHERE type = ${_data.type}`;
      pp.query(sql, function(err, result){
        if(err){
          let b = { type: 'text', text: "query error" };
          return client.replyMessage(event.replyToken, b);
        }
        const results = { 'results': (result) ? result.rows : null};
        let s = JSON.parse(JSON.stringify(results));
        //取得各疾病內容的隨機一筆
        let re_num = Math.floor(Math.random() * s.results[0].count + 1);
        let sql2 = `SELECT description FROM disease WHERE type = ${_data.type} AND number = ${re_num}`;
        pp.query(sql2, function(err2, result2){
          if(err2){
            let b = { type: 'text', text: "query2 error" };
            return client.replyMessage(event.replyToken, b);
          }
          const results2 = { 'results': (result2) ? result2.rows : null};
          let ss = JSON.parse(JSON.stringify(results2));
          //將資料依照%D切割開來，不知道為什麼ss印出\n會直接印出來
          let ppds = ss.results[0].description.split("%D");
          let str = "";
          //結尾不換行w
          for (let i in ppds){
            if(i == ppds.length-1){
              str += ppds[i];
            }else{
              str += ppds[i] + '\n';
            }   
          }
          let postback_echo = { type: 'text', text: str };
          pp.release();
          client.replyMessage(event.replyToken, postback_echo);
        });
      });
    });
  }
  else if(_data.menu == 3){
    // 提醒事項功能選擇
    const eye_function3 = require('./eye_menu/menu_3');
    const ef3 = new eye_function3();
    if(_data.type == 0){
      // 取消記錄事項
      ef3.Cancel_Msg(client, event, pool);
    }
    else if(_data.type == 1){
      // 紀錄
      ef3.Record_Msg(client, event, pool);
      //更新排程通知
      setTimeout(function(){
        ef3.Schedule_Msg(client, event, pool);
      }, 25000);      
    }
    else if(_data.type == 2){
      // 查看
      ef3.Check_Msg(client, event, pool);
    }
    else if(_data.type == 3){
      // 完成、刪除提醒事項
      ef3.Delete_Msg(client, event, pool, _data.m_id, _data.status);
      //更新排程通知
      setTimeout(function(){
        ef3.Schedule_Msg(client, event, pool);
      }, 10000); 
    }
    
  }
  else if(_data.menu == 4){
    const eye_function4 = require('./eye_menu/menu_4');
    const ef4 = new eye_function4();
    ef4.Test_Msg(client, event, _data.type);
  }
  else{
    let postback_error = { type: 'text', text: 'none' };
    return client.replyMessage(event.replyToken, postback_error);
  }
};
// Bot 所監聽的 webhook 路徑與 port，heroku 會動態存取 port 所以不能用固定的 port，沒有的話用預設的 port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
