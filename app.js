var express = require("express");
var app = express();
var url = require("url");
var fs = require("fs");
var mongoose = require("mongoose");
var formidable = require("formidable");
var path = require("path");
var gm = require('gm');
var _ = require("underscore");
var crypto = require("crypto");
var session = require('express-session')


//链接数据库
mongoose.connect("mongodb://127.0.0.1:27017/erp");


var User = mongoose.model("User" , {
    username : String,
    password : String,
    nickname : String,
    avatar : String,
    mobile : String,
    role: String
});

//配置session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false
}));



// //登陆
app.post("/login" , (req,res)=>{
    //处理post请求
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

        //判定是否正确登陆
        User.find({
            "username" : fields.username ,
            "password" : fields.password
        }).exec((err,docs)=>{

            if(docs.length){
                //登陆成功
                req.session.login = true;
                req.session.username = fields.username;

                var token = crypto.createHash("sha256").update(fields.username + fields.username).digest('hex');
                res.json({"result" : 1 , "token": token});
            }else{
                res.json({"result" : -1});
            }
        });
    });
});


// //登陆
app.get("/login" , (req,res)=>{
    //处理post请求
    if(
        !url.parse(req.url,true).query.username
        ||
        ! url.parse(req.url,true).query.password
    ){
        res.send("这是一个GET请求的测试登录接口，请传入username和password");
        return;
    }

        //判定是否正确登陆
        User.find({
            "username" : url.parse(req.url,true).query.username ,
            "password" : url.parse(req.url,true).query.password
        }).exec((err,docs)=>{

            if(docs.length){
                //登陆成功
                req.session.login = true;
                req.session.username = url.parse(req.url,true).query.username;

                var token = crypto.createHash("sha256").update(url.parse(req.url,true).query.username + url.parse(req.url,true).query.username).digest('hex');
                res.json({"result" : 1 , "token": token});
            }else{
                res.json({"result" : -1});
            }
        });

});




const Purchitem = mongoose.model("Purchitem", {
    "pname": String,
    "belonginPurchlist": Number,
    "pfactory": String,
    "pprice": Number,
    "pnumber": Number,
    "ptotal": Number,
    "shop": String,
    "storage": String,
    "time": String
});

const Purchlist = mongoose.model("Purchlist", {
    "id": Number,
    "thingamount": Number,
    // "things": Array,
    "shop": String,
    "storage": String,
    "time": String
});



//静态化
app.use(express.static("./images"));
app.use("/uploads", express.static("./uploads"));


// 列出所有收货单
app.get("/purchlist" , (req,res)=>{
 
    //页码
    var page = Number(url.parse(req.url , true).query.page) || 1;
    //每页条数
    var pagesize = Number(url.parse(req.url , true).query.pagesize) || 10;

    if(page < 0 || pagesize < 0){
        res.send("错误的参数！！");
        return;
    }

    //查询对象
    var CHAXUNDUIXIANG = {};

    //得到查询条件
    if(url.parse(req.url , true).query.shop){
        CHAXUNDUIXIANG.shop = url.parse(req.url , true).query.shop;
    }

    //统计数量
    Purchlist.count(CHAXUNDUIXIANG , (err , count) => {
        //exec表示执行
        Purchlist.find(CHAXUNDUIXIANG).skip(pagesize * (page - 1)).limit(pagesize).exec((err , docs) => {
            res.json({
                "total" : count,
                "results" : docs
            });
        });
    });
});


// 列出所有指定id的收货条目
// 列出所有收货单
app.get("/purchitem" , (req,res)=>{
   
    // listid
    var listid = Number(url.parse(req.url , true).query.listid);



    if(!listid){
        res.send("必须传入listid！");
        return;
    }

    //exec表示执行
    Purchitem.find({"belonginPurchlist": listid}).exec((err , docs) => {
        res.json({

            "results" : docs
        });
    });

});



// 当收到POST请求增加收货单时
app.post('/addpurchlist', (req,res)=>{
    
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
        // 得到用户传入的参数
        var shop = fields["shop"];
        var storage = fields["storage"];
        var things = fields["things"];

        if(typeof things !== 'object'){
            things = JSON.parse(things);
        }

        // 随机一个id
        var id = _.random(100000000000, 999999999999);
        var time = Date.parse(new Date());

        // 增加
        Purchlist.create({
            "id": id,
            "thingamount": things.length,
            // "thingamount": things,
            "shop": shop,
            "storage": storage,
            "time": time
        });

        // 遍历增加
        for(let i = 0 ; i < things.length ; i++){
            Purchitem.create({
                "pname": things[i].pname,
                "belonginPurchlist": id,
                "pfactory": things[i].pfactory,
                "pprice": things[i].pprice,
                "pnumber": things[i].pnumber,
                "ptotal": things[i].pnumber * things[i].pprice,
                "shop": shop,
                "storage": storage,
                "time": time
            });
        }
        res.end('ok');
    });
});


// 列出所有产品
app.get('/product', (req, res) =>{
    
    fs.readFile('./产品.txt', function(err, o){
        res.json({
            'products': JSON.parse(o.toString())
        })
    });
});

// shoptop10
app.get('/shoptop10', (req, res) =>{
    if(!req.session.login){
         res.status(401);
         res.send("请登录");
         return;
    }
    res.json({
        '京东': _.random(10,1000),
        '天猫': _.random(10,1000),
        '一号店': _.random(10,1000),
        '淘宝': _.random(10,1000)
    })
});


// 列出所有电商
app.get('/shops', (req, res) =>{
     
    fs.readFile('./shops.txt', function(err, o){
        res.json({
            'shops': JSON.parse(o.toString())
        })
    });
});


// 查询某一个电商的仓库清单
app.get('/storehouse', (req, res) => {
    
    var shop = url.parse(req.url, true).query.shop;

    fs.readFile('./仓库地址清单.txt', function(err, o){
        var oo = JSON.parse(o.toString());

        if(oo.hasOwnProperty(shop)){
            res.json({
                'storehouse': oo[shop]
            })
        }else{
            res.send('没有这个商店')
        }

    });
});


// 上传图片
app.post("/uppic" , (req,res)=>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    var form = new formidable.IncomingForm();
    //上传文件夹
    form.uploadDir = path.resolve(__dirname , "./uploads");
    //保留扩展名
    form.keepExtensions = true;
    //处理post请求
    form.parse(req, function(err, fields, files) {
        if(!files.file){
            res.send("没有成功哦，请加file");
            return;
        }

        // 尺寸
        gm(files.file.path).size(function(err, size){
            if(err){
                res.send("尝试读取图片尺寸时错误");
                return;
            }
            res.send({
                "result" : 200,
                "filename" : path.basename(files.file.path),
                "width": size.width,
                "height": size.height
            });
        });
    });
});

// 上传图片
app.post("/upfile" , (req,res)=>{
    var form = new formidable.IncomingForm();
    //上传文件夹
    form.uploadDir = path.resolve(__dirname , "./uploads");
    //保留扩展名
    form.keepExtensions = true;
    //处理post请求
    form.parse(req, function(err, fields, files) {
        if(!files.file){
            res.send("没有成功哦，请加file");
            return;
        };

        var hash = crypto.createHash('md5');

        fs.readFile("./uploads/" + path.basename(files.file.path), (err, content) => {
            // 尺寸
            // 读取它
            res.send({
                "result" : 200,
                "filename" : path.basename(files.file.path),
                "md5": hash.update(content).digest('hex')
            });
        });
    });
});

app.get("/userinfo" , (req,res)=>{

    

    //算token
    var suantoken = crypto.createHash("sha256").update(req.session.username + req.session.username).digest('hex');

    if(suantoken != url.parse(req.url,true).query.token){
        res.json({"result": -1,"info":"token不正确"});
        return ;
    }


    User.find({
        "username" : req.session.username
    } , (err , docs)=>{
        res.json({
            username:docs[0].username,
            nickname :docs[0].nickname,
            avatar : docs[0].avatar,
            mobile : docs[0].mobile,
            sex : docs[0].sex,
            role : docs[0].role
        })

    });
});




app.listen(3500);