function Menu2() {
    this.Ask_Msg = function(){
        let msg = {
            "type": "template",
            "altText": "this is a image carousel template",
            "template": {
                "type": "image_carousel",
                "columns": [
                    {
                        "imageUrl": "https://i.imgur.com/seN96u4.jpeg",
                        "action": {
                            "type": "postback",
                            "label": "瞭解更多",
                            "data": 'type=1&number=1&menu=2'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/MDixFIU.jpeg",
                        "action": {
                            "type": "postback",
                            "label": "瞭解更多",
                            "data": 'type=2&number=1&menu=2'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/xtlsR3d.jpeg",
                        "action": {
                            "type": "postback",
                            "label": "瞭解更多",
                            "data": 'type=3&number=1&menu=2'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/aN5cFdD.jpeg",
                        "action": {
                            "type": "postback",
                            "label": "瞭解更多",
                            "data": 'type=4&number=1&menu=2'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/oimZta8.jpeg",
                        "action": {
                            "type": "postback",
                            "label": "瞭解更多",
                            "data": 'type=5&number=1&menu=2'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/ETThaqQ.jpeg",
                        "action": {
                            "type": "postback",
                            "label": "瞭解更多",
                            "data": 'type=6&number=1&menu=2'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/Wg0lCqH.jpeg",
                        "action": {
                            "type": "postback",
                            "label": "瞭解更多",
                            "data": 'type=7&number=1&menu=2'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/4FtpGkk.jpeg",
                        "action": {
                            "type": "postback",
                            "label": "瞭解更多",
                            "data": 'type=8&number=1&menu=2'
                        }
                    },
                    {
                        "imageUrl": "https://i.imgur.com/Yi5bFOr.jpeg",
                        "action": {
                            "type": "postback",
                            "label": "瞭解更多",
                            "data": 'type=9&number=1&menu=2'
                        }
                    }
                ]
            }
        }
        return msg;
    }
};
module.exports = Menu2;