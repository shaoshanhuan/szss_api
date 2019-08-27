var mock = require('mockjs');

var Random = mock.Random;

var shops = [
    {
        'name': '爱奇艺商城',
        'pic': 'aiqiyi.jpg'
    },
    {
        'name': '京东商城'
    },
    {
        'name': '阿里巴巴',
        'pic': 'alibaba.jpg'
    },
    {
        'name': '百度商城',
        'pic': 'baidu.png'
    },
    {
        'name': '贝贝网',
        'pic': 'beibeiwang.png'
    },
    {
        'name': '楚楚街',
        'pic': 'chuchujie.jpg'
    },
    {
        'name': '当当网',
        'pic': 'dangdangwang.jpg'
    },
    {
        'name': '易贝',
        'pic': 'ebay.png'
    },
    {
        'name': '凡客诚品',
        'pic': 'fankechengpin.jpg'
    },
    {
        'name': '飞牛',
        'pic': 'feiniu.jpg'
    },
    {
        'name': '国美',
        'pic': 'gome.png'
    },
    {
        'name': '工行融e购',
        'pic': 'jinrong.png'
    },
    {
        'name': '聚美优品',
        'pic': 'jumeiyoupin.png'
    },
    {
        'name': '乐蜂网',
        'pic': 'lefengwang.png'
    },
    {
        'name': '美丽说',
        'pic': 'meilishuo.png'
    },
    {
        'name': '蘑菇街',
        'pic': 'mogujie.png'
    },
    {
        'name': '苏宁易购',
        'pic': 'suningyigou.png'
    },
    {
        'name': '淘宝网',
        'pic': 'taobao.jpg'
    },
    {
        'name': '唯品会',
        'pic': 'weipinhui.png'
    },
    {
        'name': '亚马逊',
        'pic': 'yamaxun.png'
    },
    {
        'name': '一号店',
        'pic': 'yihaodian.png'
    },
    {
        'name': '有赞',
        'pic': 'youzan.png'
    },
    {
        'name': '折八百',
        'pic': 'zhebabai.png'
    }
];

var obj = {};

for(var i = 0 ; i < shops.length ; i++){
    let arr = [];

    var count = Random.integer(8, 122);

    while(count --){

        let city = Random.city(true);

        arr.push({
            'name': (city + Random.cword(2, 4) + '仓库').replace(/\s+/g, ''),
            'address': (city + Random.cword(2, 3) + '路' + Random.integer(10,3000) + '号').replace(/\s+/g, ''),
            'manager': Random.cname(),
            'tel': Random.integer(13300000000,13900000000)
        });
    
    }

    obj[shops[i].name] = arr;
}

var fs = require("fs");

fs.writeFile('./oo.txt', JSON.stringify(obj));