function Menu4(){
    this.Ask_Msg = function(){
        let msg = {
            "type": "template",
            "altText": "this is a image carousel template",
            "template": {
                "type": "image_carousel",
                "columns": [
                    {
                        "imageUrl": "https://i.imgur.com/LqU9cdA_d.webp?maxwidth=760&fidelity=grand",
                        "action": {
                            "type": "postback",
                            "label": "點選測試(黃斑部)",
                            "data": 'type=1&menu=4'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/cWhz9oc_d.webp?maxwidth=760&fidelity=grand",
                        "action": {
                            "type": "postback",
                            "label": "點選測試(青光眼)",
                            "data": 'type=2&menu=4'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/Aieyt0D_d.webp?maxwidth=760&fidelity=grand",
                        "action": {
                            "type": "postback",
                            "label": "點選測試(近視)",
                            "data": 'type=3&menu=4'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/efmgoeB_d.webp?maxwidth=760&fidelity=grand",
                        "action": {
                            "type": "postback",
                            "label": "點選測試(色盲)",
                            "data": 'type=4&menu=4'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/owPW3pr_d.webp?maxwidth=760&fidelity=grand",
                        "action": {
                            "type": "postback",
                            "label": "點選測試(散光)",
                            "data": 'type=5&menu=4'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/6JLceCx_d.webp?maxwidth=760&fidelity=grand",
                        "action": {
                            "type": "postback",
                            "label": "點選測試(老花眼)",
                            "data": 'type=6&menu=4'
                        }
                    }
                ]
            }
        }
        return msg;
    }
    // 回傳的圖片測試
    this.Test_Msg = function(client, event, type){
        if(type == 1){
            // 黃斑部
            let img_echo = { 
                type: 'image', 
                originalContentUrl: 'https://i.imgur.com/XJTaw4a_d.webp?maxwidth=760&fidelity=grand',
                previewImageUrl: 'https://i.imgur.com/XJTaw4a_d.webp?maxwidth=760&fidelity=grand' 
            };
            let text2 = { type: 'text', text: '將手機平舉30公分' };
            let text3 = { type: 'text', text: '蓋上一隻眼睛\n一直注視方格表的中央點\n兩眼分別檢查' };
            let text4 = { type: 'text', text: '如果看到網格模糊、變形、缺損、或顏色異常\n請盡快到眼底疾病專科就診\n以免延誤病情' };
            client.replyMessage(event.replyToken, [img_echo, text2, text3, text4]);
        }
        else if(type == 2){
            // 青光眼
            //連接環境變量指定的數據庫
            const { Pool } = require('pg');
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            });
            // 使用者狀態更改為3
            pool.connect(async function(err, pp, done){
                let sql = `UPDATE user_status SET status = 3 WHERE userid = '${event.source.userId}'`;
                pp.query(sql, function(err, result){
                    let img_echo = { 
                        type: 'image', 
                        originalContentUrl: 'https://i.imgur.com/3XaIa3t_d.webp?maxwidth=760&fidelity=grand',
                        previewImageUrl: 'https://i.imgur.com/3XaIa3t_d.webp?maxwidth=760&fidelity=grand' 
                    };
                    let text2 = { type: 'text', text: '從這張圖看到了什麼數字？' };
                    let text3 = { type: 'text', text: '如果看不到數字，或是只能看到少少幾個\n請注意這有可能是「青光眼」的前兆哦！' };
                    pp.release();
                    client.replyMessage(event.replyToken, [img_echo, text2, text3]);
                });
            });
        }
        else if(type == 3){
            // 近視 有兩個圖案所以*2
            let ran = Math.floor(Math.random() * 2);
            let img_echo = [];
            if(ran == 0){
                img_echo[0] = { 
                    type: 'image', 
                    originalContentUrl: 'https://i.imgur.com/F0FUwen_d.webp?maxwidth=760&fidelity=grand',
                    previewImageUrl: 'https://i.imgur.com/F0FUwen_d.webp?maxwidth=760&fidelity=grand' 
                };
                img_echo[1] = { 
                    type: 'text', 
                    text: '近視的人能看到類似於人面部頭像\n視力正常的人可看出豎條和陰影哦！' 
                }
                client.replyMessage(event.replyToken, [img_echo[0], img_echo[1]]);
            }
            else if(ran == 1){
                img_echo[0] = { 
                    type: 'image', 
                    originalContentUrl: 'https://i.imgur.com/f7Xk7Mc_d.webp?maxwidth=760&fidelity=grand',
                    previewImageUrl: 'https://i.imgur.com/f7Xk7Mc_d.webp?maxwidth=760&fidelity=grand' 
                };
                img_echo[1] = { 
                    type: 'text', 
                    text: '視力正常的人看圖應該是愛因斯坦\n近視的人脫掉眼鏡看圖應該是瑪麗蓮·夢露' 
                }
                client.replyMessage(event.replyToken, [img_echo[0], img_echo[1]]);
            }
        }
        else if(type == 4){
            // 色盲
            // 色盲有五張
            let ran = Math.floor(Math.random() * 5);
            let img_echo = [];
            let mark = [];
            if(ran == 0){
                img_echo[0] = { 
                    type: 'image', 
                    originalContentUrl: 'https://i.imgur.com/3XaIa3t_d.webp?maxwidth=760&fidelity=grand',
                    previewImageUrl: 'https://i.imgur.com/3XaIa3t_d.webp?maxwidth=760&fidelity=grand' 
                };
                img_echo[1] = { type: 'text', text: '從這張圖看到了什麼數字？' };
                mark[0] = 6;
            }
            else if(ran == 1){
                img_echo[0] = { 
                    type: 'image', 
                    originalContentUrl: 'https://i.imgur.com/AUyHUvW_d.webp?maxwidth=760&fidelity=grand',
                    previewImageUrl: 'https://i.imgur.com/AUyHUvW_d.webp?maxwidth=760&fidelity=grand' 
                };
                img_echo[1] = { type: 'text', text: '從這張圖看到了什麼數字？' };
                mark[0] = 26;
            }
            else if(ran == 2){
                img_echo[0] = { 
                    type: 'image', 
                    originalContentUrl: 'https://i.imgur.com/OG08nfc_d.webp?maxwidth=760&fidelity=grand',
                    previewImageUrl: 'https://i.imgur.com/OG08nfc_d.webp?maxwidth=760&fidelity=grand' 
                };
                img_echo[1] = { type: 'text', text: '從這張圖看到了什麼數字？' };
                mark[0] = 74;
            }
            else if(ran == 3){
                img_echo[0] = { 
                    type: 'image', 
                    originalContentUrl: 'https://i.imgur.com/KUoKWXZ_d.webp?maxwidth=760&fidelity=grand',
                    previewImageUrl: 'https://i.imgur.com/KUoKWXZ_d.webp?maxwidth=760&fidelity=grand' 
                };
                img_echo[1] = { type: 'text', text: '從這張圖看到了什麼數字？' };
                mark[0] = 45;
            }
            else if(ran == 4){
                img_echo[0] = { 
                    type: 'image', 
                    originalContentUrl: 'https://i.imgur.com/uTWADiy_d.webp?maxwidth=760&fidelity=grand',
                    previewImageUrl: 'https://i.imgur.com/uTWADiy_d.webp?maxwidth=760&fidelity=grand' 
                };
                img_echo[1] = { type: 'text', text: '從這張圖看到了什麼數字？' };
                mark[0] = 5;
            }
            //連接環境變量指定的數據庫
            const { Pool } = require('pg');
            const pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            });
            // 使用者狀態更改為4
            pool.connect(async function(err, pp, done){
                let sql = `UPDATE user_status SET status = 4, mark = ${mark[0]} WHERE userid = '${event.source.userId}'`;
                pp.query(sql, function(err, result){
                    pp.release();
                    client.replyMessage(event.replyToken, [img_echo[0], img_echo[1]]);
                });
            });
        }
        else if(type == 5){
            // 散光
            let img_echo = { 
                type: 'image', 
                originalContentUrl: 'https://i.imgur.com/6QfGVaS_d.webp?maxwidth=760&fidelity=grand',
                previewImageUrl: 'https://i.imgur.com/6QfGVaS_d.webp?maxwidth=760&fidelity=grand' 
            };
            let text2 = { type: 'text', text: '不戴眼鏡看散光表，如果所有線條都粗細均勻，證明眼睛無散光' }
            let text3 = { type: 'text', text: '如果某條或多條線粗細不均而清晰，其他線條模糊，則有散光的可能' }
            client.replyMessage(event.replyToken, [img_echo, text2, text3]);
        }
        else if(type == 6){
            // 老花眼
            let img_echo = { 
                type: 'image', 
                originalContentUrl: 'https://i.imgur.com/4xqT1Cz_d.webp?maxwidth=760&fidelity=grand',
                previewImageUrl: 'https://i.imgur.com/4xqT1Cz_d.webp?maxwidth=760&fidelity=grand' 
            };
            let text2 = { type: 'text', text: '用手遮住一邊眼睛\n正常情況下，紅綠背景字母一樣黑' }
            let text3 = { type: 'text', text: '若紅底字母更清晰，可能度數過低或是近視' }
            let text4 = { type: 'text', text: '若綠底字母更清晰，可能有老花眼' }
            client.replyMessage(event.replyToken, [img_echo, text2, text3, text4]);
            
        }
        else{
            let test_echo = { type: 'text', text: '還沒有測試圖哦~' };
            client.replyMessage(event.replyToken, test_echo);
        }
    }
};
module.exports = Menu4;