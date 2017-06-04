var express = require('express');
var mysql=require('mysql');
var connection=mysql.createPool({
	connectionLimit:50,
	host:'YLiu78',
	user:'root',
	password:'',
	database:'hw17648'
 
});




 module.exports=connection;
