// 这句的意思就是引入 `express` 模块，并将它赋予 `express` 这个变量等待使用。
var express = require('express');  //call express
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var session = require('express-session'); //npm install express-session to install seperately

var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mysql = require('mysql');
//var connection = require("express-myconnection"); 
//var myconn = require('./dbconn');

// 调用 express 实例，它是一个函数，不带参数调用时，会返回一个 express 实例，将这个变量赋予 app 变量。
var app = express();   // define our app using express
var port = process.env.PORT || 8080;        // set our port
var router = express.Router();       // get an instance of the express Router

//select user(); 查mySQL YLiu78@localhost 
var myconn = mysql.createPool({
	connectionLimit: 50,
	host:'localhost',
	user:'YLiu78',
	password:'',
	database:'hw17648'
});

/*
app.use(connection(mysql, {
host: "localhost",
user: "root",
password:"",
database:"hw17648"
},'request')); */

// "configure app to use bodyParser().this will let us get the data from a POST"
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
//app.use(cookieParser());
app.use(session({
		secret:'yyl',
		cookie:{
			maxAge:15*60*1000
		},
		resave:true,
		saveUninitialized: false
}));


router.post('/login', function(req, res) {

	//if (req.session.user) {
			// 	req.session.destroy(); //session object没有了，后面call req.sesson.user会出错 ”Cannot set property 'user' of undefined“ 但是logout那里销掉session就没事，因为新的request来就创建新的obj了
	//	req.session.user = null;
	//}

	if(!req.body.username || !req.body.password){
		return res.json({"message":"There seems to be an issue with the username/password combination that you entered"});

	}

	myconn.getConnection(function(error,tempCont){
		if(!!error) {
			tempCont.release();
			console.log('Error to connect DB');
		} else {
			//console.log('Connected to DB');
			
			tempCont.query("SELECT * FROM users WHERE username= ?", req.body.username, function(error, rows, fields){
				tempCont.release();
				if(!!error){
					console.log('Error in the query');
				} else if (!rows.length){  //if no match, rows = [], rows.length = 0
					console.log(rows.length);
					return res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
				} else {
					//写成res.json({rows[0].Password})会报错Error: Can't set headers after they are sent." means that you're already in the Body or Finished state, but some function tried to set a header or statusCode
					//req.session.user = user; //give user a session
					if(rows[0].Password===req.body.password){ //sql自动把field name首字母大写 "P"assword
						req.session.user = rows[0];
						return res.json({"message":"Welcome " + rows[0].Firstname});  //可以直接res.json(rows)  [{"Username":"hsmith","Password":"smith"}]
					} else{
						return res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
						}    				
				}
			})
		}

	});


})



router.post('/logout', function(req, res) {

	req.session.destroy();
	//res.send('Hello World'); 向浏览器输出字符串
    return res.json({"message":"You have been successfully logged out"});
});

/*
router.param('name', function(req, res, next, name) {
  // 在這裡驗證資料
  req.name = name;// 當驗證成功時，將其儲存至 req
  next(); // 繼續後續的處理流程
});
*/

router.post('/add', function(req, res) {
	var num1 = req.body.num1;
	var num2 = req.body.num2;
    res.json({"message":"The action was successful", "result": num1 + num2});  
});

router.post('/divide', function(req, res) {
	var num1 = req.body.num1;
	var num2 = req.body.num2;
	if (!num2) {  //if num2===0
		return res.json({"message":"The numbers you entered are not valid"}); 
	}
    res.json({"message":"The action was successful", "result": num1 / num2});  
});


router.post('/multiply', function(req, res) {
	var num1 = req.body.num1;
	var num2 = req.body.num2;
    res.json({"message":"The action was successful", "result": num1 * num2}); 
});

// or router.use
app.use(function (req, res, next) {
    var url = req.originalUrl;
    //console.log(url);
    if (url != "/login" && !req.session.user) {
        return res.json({"message":"You are not currently logged in"});
    }
    req.checkBody('num1', {"message":"---11The numbers you entered are not valid"}).isInt(); //.optional()
    req.checkBody('num2', {"message":"---22The numbers you entered are not valid"}).isInt();
    var errors = req.validationErrors();
    //console.log(errors.message);
    if (url != "/login" && url != "/logout" && errors ) {
    //if ( errors ) {	
    	return res.json({"message":"The numbers you entered are not valid"});  //or  errors.msg always undefined..?
    }
    next();
});


app.use('/', router);

app.listen(port); // can move to top 启动伺服器

// to run, use $node app.js



//如果用户请求的url上面没有被.get/post等接住，就会到这里。
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//module.exports = app;
console.log('Magic happens on port ' + port);