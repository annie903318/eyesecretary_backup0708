const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['zh'] });
// 在NLP模型值中增加例句跟意圖
manager.addNamedEntityText( //哈囉實體
    'hi',
    '嗨~',
    ['zh'],
    ['嗨','你好','您好','你們好','Hello','Hi','How are you']
)
manager.addNamedEntityText( //尾助詞
    'none',
    '~',
    ['zh'],
    ['~','!','#','@','?','%','.']
)
manager.addNamedEntityText( //眼睛實體
    'eye',
    '眼睛',
    ['zh'],
    ['eye','EYE','眼睛','眼珠','眼']
)
manager.addNamedEntityText( //症狀實體
    'symptom',
    '乾癢',
    ['zh'],
    ['乾乾癢癢','乾癢','乾澀','癢']
)
manager.addNamedEntityText( //嚴重實體
    'serious',
    '疼痛',
    ['zh'],
    ['疼痛','痛']
)
manager.addNamedEntityText( //介紹實體
    'intro',
    '介紹',
    ['zh'],
    ['你會做甚麼','功能','介紹']
)

//增加文字與意圖範例
// 哈囉意圖
manager.addDocument('zh','%hi%', 'greeting.hello');
manager.addDocument('zh','%hi%%hi%', 'greeting.hello');
manager.addDocument('zh','%hi%%none%', 'greeting.hello');
manager.addDocument('zh','%hi%%hi%%none%', 'greeting.hello');
// 介紹自己意圖
manager.addDocument('zh', '%intro%自己', 'greeting.intro');
manager.addDocument('zh', '功能', 'greeting.intro');
manager.addDocument('zh', '%intro%', 'greeting.intro');
manager.addDocument('zh', '有什麼%intro%', 'greeting.intro');
// 問題意圖
manager.addDocument('zh', '解決方法', 'greeting.question');
manager.addDocument('zh', '怎麼辦', 'greeting.question');
manager.addDocument('zh', '改善', 'greeting.question');
// 預防意圖
manager.addDocument('zh', '如何預防近視', 'eye.prevention');
manager.addDocument('zh', '如何預防近視加深', 'eye.prevention');
manager.addDocument('zh', '預防近視', 'eye.prevention');
manager.addDocument('zh', '預防近視加深', 'eye.prevention');
manager.addDocument('zh', '如何預防加深近視', 'eye.prevention');
manager.addDocument('zh', '預防加深近視', 'eye.prevention');
// 眼睛癢意圖
manager.addDocument('zh', '%eye%老是%symptom%該怎麼辦', 'eye.reply1.ans1');
manager.addDocument('zh', '%eye%%symptom%', 'eye.reply1.ans1');
manager.addDocument('zh', '為什麼覺得%eye%很%symptom%', 'eye.reply1.ans2');
manager.addDocument('zh', '%eye%好%symptom%', 'eye.reply1.ans2');
manager.addDocument('zh', '%eye%很%symptom%', 'eye.reply1.ans2');
manager.addDocument('zh', '最近%eye%%symptom%該怎麼舒緩', 'eye.reply1.ans3');
manager.addDocument('zh', '%eye%%symptom%該怎麼解決', 'eye.reply1.ans4');
manager.addDocument('zh', '%eye%%symptom%解決', 'eye.reply1.ans4');
manager.addDocument('zh', '%eye%%symptom%解決方法', 'eye.reply1.ans4');
manager.addDocument('zh', '%eye%好%symptom%怎麼辦', 'eye.reply1.ans4');
manager.addDocument('zh', '解決%eye%%symptom%', 'eye.reply1.ans4');
manager.addDocument('zh', '%eye%%symptom%怎麼改善', 'eye.reply1.ans5');
manager.addDocument('zh', '改善%eye%%symptom%', 'eye.reply1.ans5');
manager.addDocument('zh', '%eye%%symptom%要如何改善', 'eye.reply1.ans5');
manager.addDocument('zh', '人工淚液解決%eye%%symptom%', 'eye.reply1.ans6');
manager.addDocument('zh', '%eye%%symptom%人工淚液有用', 'eye.reply1.ans6');
// 眼睛痛意圖
manager.addDocument('zh', '%eye%好%serious%', 'eye.reply2.ans1');
manager.addDocument('zh', '%eye%%serious%', 'eye.reply2.ans1');
manager.addDocument('zh', '%eye%%serious%怎麼辦', 'eye.reply2.ans1');
manager.addDocument('zh', '%eye%非常%serious%', 'eye.reply2.ans2');
manager.addDocument('zh', '好%serious%哦我的%eye%', 'eye.reply2.ans2');


//將意圖轉換為文字訊息
// 乾癢意圖文字
manager.addAnswer('zh', 'eye.reply1.ans1', '可能3C產品用太久，讓眼睛休息一下吧~');
manager.addAnswer('zh', 'eye.reply1.ans2', '適度讓眼睛休息，用眼30分鐘，記得休息10分鐘哦');
manager.addAnswer('zh', 'eye.reply1.ans3', '若長期有眼睛乾癢問題，建議就醫檢查哦');
manager.addAnswer('zh', 'eye.reply1.ans4', '可以嘗試溫敷眼睛、使用加濕器改善室內乾燥問題');
manager.addAnswer('zh', 'eye.reply1.ans5', '建議補充Omega-3魚油、亞麻仁油等，減少淚液揮發，增加淚液分泌');
manager.addAnswer('zh', 'eye.reply1.ans6', '滴人工淚液無法真正改善乾眼問題，只有刺激淚腺，才能從根本解決');
// 眼睛痛意圖文字
manager.addAnswer('zh', 'eye.reply2.ans1', '讓眼睛休息一下，若沒改善，建議就醫檢查');
manager.addAnswer('zh', 'eye.reply2.ans2', '若有劇烈的疼痛，請盡快就醫');
// 介紹意圖文字
// manager.addAnswer('zh', 'greeting.intro', '我可以盡我所能回答您的問題哦!!');
manager.addAnswer('zh', 'greeting.intro', 'EYE眼小秘書主要提供眼部衛教與眼部疾病測驗，進行測驗與瞭解正確的眼部疾病知識，才有助於及早發現與預防疾病的發生哦！有關於眼部的問題，都可以詢問小秘書，若眼睛已經出現了異常或是疼痛，有可能是眼疾的前兆哦，請盡快就醫治療，以免拖延太久，導致病情惡化。\n\n\n"健康日誌"：可以將你的健康狀況記錄在這裡哦~\n\n"瞭解眼部疾病"：可以瞭解常見的眼部疾病。\n\n"提醒事項"：可以將需要提醒的事情記錄在這裡。\n\n"簡易測驗"：可以初步瞭解眼睛目前有無異常\n\n"問題諮詢"：有關於眼部的問題，小秘書會盡力回答！\n\n"貼心叮嚀"：這些都是小秘書親自製作的叮嚀圖哦~\n\n\n 以上功能都是免費的哦，小秘書祝大家都有雙健康的好眼睛！');
manager.addAnswer('zh', 'greeting.hello', '嗨~也可以使用圖文選單與我互動哦!');
manager.addAnswer('zh', 'greeting.question', '需要什麼幫助嗎?');
// 預防意圖文字
manager.addAnswer('zh', 'eye.prevention', '1.保持良好的閱讀習慣\n2.充足的戶外運動\n3.適度的使用3C產品\n4.均衡的營養\n5.尋求正確的治療');
// 訓練NLP的模型，並儲存NLP模型的參數
(async () => {
    await manager.train();  //訓練模型
    manager.save('bot-train.nlp');  //儲存模型參數
    const response = await manager.process('zh', '眼睛好癢'); //處理訊息
    console.log(JSON.stringify(response)); //印出處理結果
})();


