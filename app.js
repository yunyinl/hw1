// 这句的意思就是引入 `express` 模块，并将它赋予 `express` 这个变量等待使用。
var express = require('express');  //call express
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var session = require('express-session'); //npm install express-session to install seperately

var bodyParser = require('body-parser');
var expressValidator = require('express-validator'); //https://github.com/ctavan/express-validator
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
	//host: 'localhost',  
	//user:'YLiu78',
	//password:'',
	//(for aws use:)
	host:'hw2.c97rodnrfpf7.us-east-1.rds.amazonaws.com',
	user:'yyl',
	password:'yyl',
	database:'hw17648'
});


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

var selectUserSQL	= "SELECT * FROM users WHERE username= ?";
//var updateUserSQL = "UPDATE users SET"+ updateUser + " = ? WHERE username = " +username; 这样param传不进去
var selectProductSQL = "SELECT * FROM products WHERE asin= ?";
var updateProductSQL = "UPDATE products SET productName = ?, productDescription = ?, `group` = ? WHERE asin = ? ";
// var user = req.session.user;  => req is not defined
var callbackCounter = 0;


/* 这样有 “Error to connect DB”
function verifyUserUnique (req,error,tempCont) {

				if(!!error) {
					//tempCont.release();  这里没得到conn
					console.log('Error to connect DB'); //如果执行到这句了，因为没return所以显示一直在request
				} else {


	tempCont.query(selectUserSQL, req.body.username, function(error, rows, fields){
		console.log("username"+req.body.username);

		//tempCont.release();
		if(!!error){
			console.log('Error in the query');
			tempCont.release();

		} else {
					//console.log('Connected to DB');
			tempCont.query(selectUserSQL, req.body.username, function(error, rows, fields){
				console.log("username"+req.body.username);

				//tempCont.release();
				if(!!error){
					console.log('Error in the query');
					tempCont.release();
				} else {
					return (rows.length);
				}

			})
		}
	})

}



}
*/

	//below check if the element is passed in. but it can be empty
    //return (req.body.fname && req.body.lname && req.body.address && req.body.city && req.body.state && 
    //	req.body.zip && req.body.email && req.body.username && req.body.password)


    //Sï¿½o Josï¿½ ??address??
router.post('/registerUser', function(req, res) {

	req.checkBody('fname','first name is empty').notEmpty();//checkBody(param, msg) 只适用于 POST method
	//如果某个变量没传进来其value就是undefined也不符合notEmpty()会报错。 所以用notEmpty时候就不用单独检验这个param有没有传进来
	req.checkBody('lname', 'last name is empty').notEmpty();
	req.checkBody('address', 'address is empty').notEmpty();
	req.checkBody('city', 'city is empty').notEmpty();
	console.log('testing registerUser');
	req.checkBody('state', 'state is invalid').notEmpty().isAlpha().len(2,100); //写成length就直接跳到最后error handler怎么也查不出错哪,在每个checkbody之间都写了log
	req.checkBody('zip', 'zip is invalid').notEmpty().isAlphanumeric();
	//console.log('here7');
	req.checkBody('email', 'email is empty').notEmpty();
	req.checkBody('username', 'username is empty').notEmpty();
	req.checkBody('password', 'password is empty').notEmpty();	
	req.getValidationResult().then(function(result) {
  	// do something with the validation result
  		//result = "undefined";  this cannot clear the validation result error got from precedent app.use() call. how to do it?
	  	if(result.isEmpty()) {  //之前得到过的error也会记在里面


			myconn.getConnection(function(error,tempCont){ //这里只获得一个conn，不能后面select和insert都release



				if(!!error) {
					//tempCont.release();  这里没得到conn
					console.log('Error to connect DB'); //如果执行到这句了，因为没return所以显示一直在request
					return;
				} else {
					//console.log('Connected to DB');
					tempCont.query(selectUserSQL, req.body.username, function(error, rows, fields){
						console.log("username1"+req.body.username);

						//tempCont.release();
						if(!!error){
							console.log('Error in selectUserSQL query');
							tempCont.release();
							return;
						} else if (!rows.length){  //if no match, rows = [], rows.length = 0


//						if (verifyUserUnique(req,tempCont)) {
							var insertUserVAL = [
													[req.body.fname, req.body.lname, req.body.address, req.body.city, req.body.state, req.body.zip, req.body.email, req.body.username, req.body.password, "user"] 
												];


							console.log("username2"+req.body.username);
							tempCont.query("INSERT INTO users (fname, lname,address,city,state,zip,email,username,password,permission) VALUES ?", [insertUserVAL],function(error, rows, fields){
								tempCont.release();
								console.log("fname"+req.body.fname);

								if(error) {
									console.log('Error in the query');
									return;
								} else {
									console.log("lname"+req.body.lname);
									return res.json({"message":req.body.fname + " was registered successfully"});
								}

							})

						} else {
							tempCont.release();
		 					return res.json({"message":"The input you provided is not valid"});
						}
					})
				}

			});

	  	} else {
	  		console.log(result.array()) //会把error都print出： [  {param: "email", msg: "自己写的msg", value: "<received input>"},{..} ]
	  		return res.json({"message":"The input you provided is not valid"});
	  	}


	});


})


router.post('/addProducts', function(req, res) {

	req.checkBody('asin','asin is empty').notEmpty();    //.isNumeric(); 不需要是数字
	req.checkBody('productName', 'productName is empty').notEmpty();
	req.checkBody('productDescription', 'productDescription is empty').notEmpty();
	req.checkBody('group', 'group is empty').notEmpty();


	req.getValidationResult().then(function(result) {
  	// do something with the validation result
  		//result = "undefined";  don't know how to clear the validation result, but this doesn't work
	  	if(result.isEmpty()) {  //之前得到过的error也会记在里面


			myconn.getConnection(function(error,tempCont){ //这里只获得一个conn，不能后面select和insert都release



				if(!!error) {
					//tempCont.release();  这里没得到conn
					console.log('Error to connect DB'); //如果执行到这句了，因为没return所以显示一直在request
					return;
				} else {
					//console.log('Connected to DB');
					tempCont.query(selectProductSQL, req.body.asin, function(error, rows, fields){
						//console.log("username"+req.body.username);

						//tempCont.release();
						if(!!error){
							console.log('Error in selectProduct query');
							tempCont.release();
							return;
						} else if (!rows.length){  //if no match, rows = [], rows.length = 0


//						if (verifyUserUnique(req,tempCont)) {
							var insertVAL = [
													[req.body.asin, req.body.productName, req.body.productDescription, req.body.group] 
												];


							//console.log("username"+req.body.username);
							tempCont.query("INSERT INTO products (asin, productName,productDescription,`group`) VALUES ?", [insertVAL],function(error, rows, fields){
								tempCont.release();
								//console.log("fname"+req.body.fname);

								if(error) {
									console.log('Error in insertProduct query');
									return;
								} else {
									//console.log("lname"+req.body.lname);
									return res.json({"message":req.body.productName + " was successfully added to the system"});
								}

							})

						} else {
							tempCont.release();
		 					return res.json({"message":"The input you provided is not valid"});
						}
					})
				}

			});

	  	} else {
	  		console.log(result.array()) //会把error都print出： [  {param: "email", msg: "自己写的msg", value: "<received input>"},{..} ]
	  		return res.json({"message":"The input you provided is not valid"});
	  	}


	});


})

router.post('/updateInfo', function(req, res) {

	if (typeof req.body.state !== 'undefined' && req.body.state!='') {
		req.checkBody('state', 'state is invalid').isAlpha().len(2,100); //写成length就直接跳到最后error handler怎么也查不出错哪,在每个checkbody之间都写了log
	}

	if (typeof req.body.zip !== 'undefined' && req.body.zip!='') {
		req.checkBody('zip', 'zip is invalid').isAlphanumeric();
	}
	
	req.getValidationResult().then(function(result) {
  	// do something with the validation result
  		//result = "undefined";  don't know how to clear the validation result, but this doesn't work
	  	if(result.isEmpty()) {  //之前得到过的error也会记在里面


			myconn.getConnection(function(error,tempCont){ //这里只获得一个conn，不能后面select和insert都release

				if(!!error) {
					//tempCont.release();  这里没得到conn
					console.log('Error to connect DB'); //如果执行到这句了，因为没return所以显示一直在request
					return;
				} else {
					// if Connected to DB
					var curUsername = req.session.user.username;

					tempCont.query(selectUserSQL, curUsername, function(error, rows){ //get this user's original info

						if(!!error){
							console.log('Error in the select user query1');
							tempCont.release();
							return;
						} else {  

							if (typeof req.body.fname === 'undefined' || req.body.fname == "")
								var fname = rows[0].fname;
							else
								var fname = req.body.fname;

							if (typeof req.body.lname === 'undefined' || req.body.lname == "")
								var lname = rows[0].lname;
							else
								var lname = req.body.lname;

							if (typeof req.body.address === 'undefined' || req.body.address == "")
								var address = rows[0].address;
							else
								var address = req.body.address;

							if (typeof req.body.city === 'undefined' || req.body.city == "")
								var city = rows[0].city;
							else
								var city = req.body.city;

							if (typeof req.body.state === 'undefined' || req.body.state == "")
								var state = rows[0].state;
							else
								var state = req.body.state;

							if (typeof req.body.zip === 'undefined' || req.body.zip == "")
								var zip = rows[0].zip;
							else
								var zip = req.body.zip;

							if (typeof req.body.email === 'undefined' || req.body.email == "")
								var email = rows[0].email;
							else
								var email = req.body.email;

							if (typeof req.body.password === 'undefined' || req.body.password == "")
								var password = rows[0].password;
							else
								var password = req.body.password;


							if (typeof req.body.username !== 'undefined' && req.body.username != "" && req.body.username!==rows[0].username){ 
							//"username" update request received and is not current username

								console.log("username is requested to be updated:");
								tempCont.query(selectUserSQL, req.body.username, function(error, rows){
									//see if the username already taken someone else;

									var callbackCounter = 1;

									if(!!error){
										console.log('Error in the select user query2');
										tempCont.release();
										return;
									} else if (!rows.length){  //not already taken - can be used

										var username = req.body.username;
								

									} else {  // is already taken - cannot use
										
										tempCont.release();
										console.log("username is already taken:");
					 					return res.json({"message":"The input you provided is not valid"});
					 					//console.log("testing execution order1");  <- will not come to here
									}
								})
							} else { // username field is left blank
								var callbackCounter = 1;
								console.log("testing execution order-username field is left blank");
								var username = rows[0].username;
							}
								
								
							
							var updateUserSQL = "UPDATE users SET fname=?,lname=?,address=?,city=?,state=?,zip=?,\
												email=?,username=?,password=? WHERE username = ?";


							//注意这里[]里的param如果多给了，竟然不会报错。 我多写了permission = "user", 
							//于是sql没找到叫user的username就没有成功update Sql但仍然显示更新成功
							//这里能保证下面的query是在上一个query之后才执行吗 如果下面不是query应该写在哪才能让上面query执行完才执行，并且if else都执行(容易repeat code)
							
							if(callbackCounter === 1){
								tempCont.query(updateUserSQL, [fname,lname,address,city,state,zip,email,username,password,curUsername],function(error, rows){
									console.log("testing execution order2");
									tempCont.release();

									if(error) {
										console.log('Error in update username query');
										return;
									} else {
										console.log("testing execution order3");
										console.log(fname,lname,address,city,state,zip,email,username,password,curUsername);
										return res.json({"message": fname+" your information was successfully updated"});
									}
								})	

							}
						} 
					})

						
				}


			})


		} else {
	  		console.log(result.array()) //会把error都print出： [  {param: "email", msg: "自己写的msg", value: "<received input>"},{..} ]

			return res.json({"message":"The input you provided is not valid"});


		}


	});


})


router.post('/modifyProduct', function(req, res) {

	var user = req.session.user;

	req.checkBody('asin', 'asin is empty').notEmpty(); 
	req.checkBody('productName', 'productName is empty').notEmpty(); 
	req.checkBody('productDescription', 'productDescription is empty').notEmpty(); 
	req.checkBody('group', 'group is empty').notEmpty(); 


	req.getValidationResult().then(function(result) {
	  	if(result.isEmpty()) {  

			myconn.getConnection(function(error,tempCont){ //这里只获得一个conn，不能后面select和insert都release

				if(!!error) {
					//tempCont.release();  这里没得到conn
					console.log('Error to connect DB'); //如果执行到这句了，因为没return所以显示一直在request
					return;
				} else {
					// if Connected to DB

					if(req.body.username!=''){

						//var updateUserSQL = "UPDATE users SET username = ? WHERE username = ?";

						tempCont.query(selectProductSQL, req.body.asin, function(error, rows){
							//console.log("username"+req.body.username);

							//tempCont.release();
							if(!!error){
								console.log('Error in the select user query');
								tempCont.release();
								return;
							} else if (!rows.length){  //modify a product that is not in the system
								console.log('modify a product that is not in the system');
								tempCont.release();
			 					return res.json({"message":"The input you provided is not valid"});

							} else {  //asin received exist

								tempCont.query(updateProductSQL, [req.body.productName,req.body.productDescription, req.body.group, req.body.asin],function(error, rows, fields){
									tempCont.release();
									if(error) {
										console.log('Error in update product query');
										return;
									} else {

										return res.json({"message": req.body.productName+" was successfully updated"});
									}
								})
							}
						})
					}
				
					

	  				

				}

			});

	  	} else {
	  		console.log(result.array()) //会把error都print出： [  {param: "email", msg: "自己写的msg", value: "<received input>"},{..} ]

			return res.json({"message":"The input you provided is not valid"});


	  	}


	});


})



router.post('/viewUsers',function(req,res){
	var fname = req.body.fname
	var lname = req.body.lname

	var user = req.session.user;

	function fnameProvided(){
		return ((typeof fname !=='undefined') && (fname!=='') )

	}

	function lnameProvided(){
		return ((typeof lname !=='undefined') && (lname!=='') )

	}

/*
	if((typeof fname ==='undefined') || (typeof lname ==='undefined')){
		console.log('fname or lname is not provided');
		return res.json({"message":"The input you provided is not valid"});
	} else {

*/

		myconn.getConnection(function(error,tempCont){ 

			console.log(myconn._freeConnections.indexOf(tempCont)); //-1: connection not released

			if(!!error) {
				console.log('Error to connect DB'); 
				return;
			} else {
				// if Connected to DB

				
				if( (fnameProvided()&& lnameProvided()) ){

					console.log("fname and lname both provided");

					//var updateUserSQL = "UPDATE users SET username = ? WHERE username = ?";

					var viewUsersSQL = "SELECT * from users WHERE fname = ? and lname = ?";


					tempCont.query(viewUsersSQL, [fname,lname], function(error, rows){

						//console.log(user);  // { fname: 'yy1', .., permission: 'user'} 从sql得到的是是个obj。
						//tempCont.release();  

						if(!!error){
							console.log('Error in the view user query1');
							tempCont.release();
							return;
						} else if (!rows.length){ //no matched users
							tempCont.release();
		 					return res.json({"message":"There are no users that match that criteria"});

						} else {

							var rowslist = [];
							//console.log(rows); //有时得到[object Object]  有时又得到  [ RowDataPacket { fname: 'yy', 。。, permission: 'user' } ]
							//js返回的sql结果是array of RowDataPacket

							var filtered = new Array();
							filtered[0]="fname";
							filtered[1]="lname";
							filtered[2]="username";

							console.log(JSON.stringify(rows[0],filtered));  //{"fname":"yy","lname":"l"}
							for (var i = 0; i < rows.length; i++){
								rowslist.push(JSON.parse(JSON.stringify(rows[i],filtered))); //把json的string形式又用parse变回json(object)
							}
							//console.log("000000: "+rowslist); //得到[object Object]
							//console.log("111111: "+JSON.stringify(rowslist)); //得到[ {"fname":"yy","lname":"l"} ]
							return res.json({"message":"The action was successful", "user":rowslist}); 

	/*
							这样相当于把string加到array里，所以后面得到的是escape双引号即每个双引号被加了backslash的结果，
							注意结果的{}外面的双引号，证明得到的不是个object的json 而是string的json
							for (var i = 0; i < rows.length; i++){
								rowslist.push(JSON.stringify(rows[i],filtered)); 
							}
							console.log("000000: "+rowslist); //{"fname":"yy","lname":"l"}
							console.log("111111: "+JSON.stringify(rowslist)); //["{\"fname\":\"yy\",\"lname\":\"l\"}"]

							return res.json({"message":"The action was successful", "users":rowslist}); 
																			这里得到"users":["{\"fname\":\"yy\",\"lname\":\"l\"}"]

	*/


						}
					})
				}


				//req.body.xxx 如果xxx不是post来的param，就是undefined， req.body.xxx!=''也会成立
				//前面if里的tempCont.query()还没执行就会执行下面的if，所以不能前面的if catch了fname和lname都为空，这里只写fname不为空相当于lname是空
				//因为前面的return是在后执行的tempCont.query()里的
				if( (!lnameProvided()) && fnameProvided() ) {

					console.log('only fname is provided');
					var viewUsersSQL = "SELECT * from users WHERE fname = ?";


					tempCont.query(viewUsersSQL, [fname], function(error, rows){

						if(!!error){
							console.log('Error in the view user query1');
							tempCont.release();
							return;
						} else if (!rows.length){ //no matched users
							tempCont.release();
		 					return res.json({"message":"There are no users that match that criteria"});

						} else {

							var rowslist = [];

							var filtered = new Array();
							filtered[0]="fname";
							filtered[1]="lname";
							filtered[2]="username";

							console.log(JSON.stringify(rows[0],filtered));  
							for (var i = 0; i < rows.length; i++){
								rowslist.push(JSON.parse(JSON.stringify(rows[i],filtered))); 
							}
		
							return res.json({"message":"The action was successful", "user":rowslist}); 

						}
					})
				}


				if( (!lnameProvided()) && (!fnameProvided())) {

					console.log('both lname fname are not provided');

					var viewUsersSQL = "SELECT * from users";


					tempCont.query(viewUsersSQL, function(error, rows){
 

						if(!!error){
							console.log('Error in the view user query1');
							tempCont.release();
							return;
						} else if (!rows.length){ //no matched users
							tempCont.release();
		 					return res.json({"message":"There are no users that match that criteria"});

						} else {

							var rowslist = [];


							var filtered = new Array();
							filtered[0]="fname";
							filtered[1]="lname";
							filtered[2]="username";

							console.log(JSON.stringify(rows[0],filtered));  
							for (var i = 0; i < rows.length; i++){
								rowslist.push(JSON.parse(JSON.stringify(rows[i],filtered))); 
							}

							return res.json({"message":"The action was successful", "user":rowslist}); 
						}
					})
				}
			
				if( (!lnameProvided()) && fnameProvided( ) ) {

					console.log('only lname is provided');

					var viewUsersSQL = "SELECT * from users WHERE lname = ?";


					tempCont.query(viewUsersSQL, [lname], function(error, rows){


						if(!!error){
							console.log('Error in the view user query1');
							tempCont.release();
							return;
						} else if (!rows.length){ //no matched users
							tempCont.release();
		 					return res.json({"message":"There are no users that match that criteria"});

						} else {

							var rowslist = [];
							
							var filtered = new Array();
							filtered[0]="fname";
							filtered[1]="lname";
							filtered[2]="username";

							console.log(JSON.stringify(rows[0],filtered));  
							for (var i = 0; i < rows.length; i++){
								rowslist.push(JSON.parse(JSON.stringify(rows[i],filtered))); 
							}
							return res.json({"message":"The action was successful", "user":rowslist}); 

						}
					})
				}
				//tempCont.release(); 是这里被release的，所以前面的if里调用了tempCont.query以后的tempCont.release时候每次都报错“Connection already released”


			}

		})



})


router.post('/viewProducts',function(req,res){
	var asin = req.body.asin
	var keyword = req.body.keyword
	var group = req.body.group

	var user = req.session.user;

	/*
	if((typeof asin ==='undefined') || (typeof keyword ==='undefined') || (typeof group ==='undefined')){
		console.log('some parameter(s) is/are not provided');
		return res.json({"message":"The input you provided is not valid"});
	} else {
*/
		myconn.getConnection(function(error,tempCont){ 

			if(!!error) {
				console.log('Error to connect DB'); 
				return;
			} else {
				// if Connected to DB

				function buildConditions() {
				    var conditions = [];
				    var values = [];
				    var conditionsStr;

				    if ( asin !== '' && (typeof asin !=='undefined')) {
				        conditions.push("asin = ?");
				        console.log(asin);
				        
				        values.push(asin);
				        console.log(values);
				    }

				    if ( keyword !== '' &&  (typeof keyword !=='undefined') ) {
				        conditions.push("(productDescription LIKE ?) OR (productName LIKE ?)");
				        values.push('%'+keyword +'%');
				        values.push('%'+keyword +'%');
				    }

				    if ( group !== '' && (typeof group !=='undefined')) {
				        conditions.push("`group` = ?");
				        values.push(group);
				        console.log(values);
				    }

				    console.log(conditions.length);

				    return {
				    	// if (conditions.length>=1).. syntax error?
				        where:  conditions.length>=1 ?
				        			conditions.join(' AND '):1,
				        			//condition 只有一个elem时候 不会出现"AND"
				      				        
				        values: values
				    };
				}

				var conditions = buildConditions();
				var viewProductsSQL = 'SELECT * FROM products WHERE ' + conditions.where;
				console.log(viewProductsSQL, conditions.values)

/*				
				if((asin!=='') && (keyword!=='')&& (group!=='')) {
					var viewProductsSQL = "SELECT * from users WHERE asin = ? and keyword = ? and `group` = ?";
				} else if (if((asin!=='') && (keyword==='')&& (group==='')) ) {
					var viewProductsSQL = "SELECT * from users WHERE asin = ?";

				} else if (if((asin==='') && (keyword!=='')&& (group==='')) ) {
					var viewProductsSQL = "SELECT * from users WHERE keyword = ?";
				}  else if (if((asin==='') && (keyword==='')&& (group!=='')) ) {
					var viewProductsSQL = "SELECT * from users WHERE group = ?";
				} else if (if((asin!=='') && (keyword!=='')&& (group==='')) ) {
					var viewProductsSQL = "SELECT * from users WHERE asin = ? and keyword = ?";
				} else if (if((asin==='') && (keyword!=='')&& (group==='')) ) {
					var viewProductsSQL = "SELECT * from users WHERE keyword = ?";
				} else if (if((asin==='') && (keyword!=='')&& (group==='')) ) {
					var viewProductsSQL = "SELECT * from users WHERE keyword = ?";
				}
*/
				tempCont.query(viewProductsSQL, conditions.values, function(error, rows){

					//console.log(user);  // { fname: 'yy1', .., permission: 'user'} 从sql得到的是是个obj。
					//tempCont.release();  

					if(!!error){
						console.log('Error in the view product query1');
						tempCont.release();
						return;
					} else if (!rows.length){ //no matched users
						tempCont.release();
	 					return res.json({"message":"There are no products that match that criteria"});

					} else {

						var rowslist = [];

						var filtered = new Array();
						filtered[0]="asin";
						filtered[1]="productName";

						console.log(JSON.stringify(rows[0],filtered));  
						for (var i = 0; i < rows.length; i++){
							rowslist.push(JSON.parse(JSON.stringify(rows[i],filtered))); 
						}
					
						return res.json({"product":rowslist}); 
					}
				})
				

			}

		});

	

})

router.post('/login', function(req, res) {
	//console.log("..2");
	//if (req.session.user) {
			// 	req.session.destroy(); //session object没有了，后面call req.sesson.user会出错 ”Cannot set property 'user' of undefined“ 但是logout那里销掉session就没事，因为新的request来就创建新的obj了
	//	req.session.user = null;
	//}

	if(!req.body.username || !req.body.password){
		return res.json({"message":"There seems to be an issue with the username/password combination that you entered"});

	}
	//console.log("..");
	myconn.getConnection(function(error,tempCont){
		if(!!error) {
			tempCont.release();
			console.log('Error to connect DB');
			return;
		} else {
			//console.log('Connected to DB');
			
			tempCont.query("SELECT * FROM users WHERE username= ?", req.body.username, function(error, rows, fields){
				tempCont.release();
				if(!!error){
					console.log('Error in the query');
					return;
				} else if (!rows.length){  //if no match, rows = [], rows.length = 0
					console.log(rows.length);
					return res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
				} else {
					//写成res.json({rows[0].Password})会报错Error: Can't set headers after they are sent." means that you're already in the Body or Finished state, but some function tried to set a header or statusCode
					//req.session.user = user; //give user a session
					if(rows[0].password===req.body.password){
						req.session.user = rows[0];
						return res.json({"message":"Welcome " + rows[0].fname});  //可以直接res.json(rows)  [{"Username":"hsmith","Password":"smith"}]
					} else{
						return res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
						}    				
				}
			})
		}

	});

	//console.log("...");
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

/*
router.post('/add', function(req, res) {
	var num1 = req.body.num1;
	var num2 = req.body.num2;
    res.json({"message":"The action was successful", "result": num1 + num2});  
});
*/

// or router.use?
app.use(function (req, res, next) {
	//console.log(".....");
    var url = req.originalUrl;
    //must logged in to perform
    if (url != "/login" && url != "/registerUser" && url != "/viewProducts" && !req.session.user) {
        return res.json({"message":"You are not currently logged in"});
    }

    var user = req.session.user; //非global，不会带到router.use(..)里面.也不该用next()把user传下去，应该再从req拿	
	//console.log(user);  
    //console.log(url);
    //must be admin to perform
    //console.log(user.permission); 这样也会执行后面那个match不上page的error handler（why不报错）
    //console.log(user); 得到"undefined"
    if (url == "/addProducts" || url == "/modifyProduct" || url == "/viewUsers") {
    	//console.log(user.permission);
    	if (user.permission != "admin"){
    		return res.json({"message":"You must be an admin to perform this action"});    		
    	}
    }
    
    //console.log(".....");
    next();
});


app.use('/', router);

app.listen(port); // can move to top 启动伺服器

// to run, use $node app.js



//如果用户请求的url上面没有被.get/post等接住，就会到这里。或者上面router.method(..)都执行完了没return也会到这。
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
//会得到Error: No default engine was specified and no extension was provided.  
//usually that error happens when you call res.render() on a template but you don't set a view engine

});

//module.exports = app;
console.log('Magic happens on port ' + port);