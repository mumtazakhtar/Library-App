//<----require dependencies---->
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();

//Dependencies configuration
const sequelize = new Sequelize('library_app', process.env.POSTGRES_USER,process.env.POSTGRES_PASSWORD,{
  host: 'localhost',
  dialect: 'postgres',
  define: {
  	timestamps: false
  }
});
app.use(express.static('../public'));
app.use(express.static('../public/css'))

app.set('views','./views');
app.set('view engine','pug');

app.use(bodyParser.urlencoded({extended: true}));

//defining models
const Author = sequelize.define('authors',{
	name: Sequelize.STRING
},{
	timestamps: false
})
const Book = sequelize.define('books',{
	name: Sequelize.STRING
},{
	timestamps: false
})
const Record = sequelize.define('records',{
	published_year: Sequelize.INTEGER
},{timestamps: false	
    
})
const User = sequelize.define('users',{
	name: {
		type: Sequelize.STRING,
		unique: true
	},
	email: {
		type: Sequelize.STRING,
		unique: true
	},
	password: Sequelize.STRING
},{
	timestamps: false
})

//defining relationship between tables
 
 Author.belongsToMany(Book,{through: Record})
 Book.belongsToMany(Author,{through: Record})

 //<<-------------Routes--------------->>
 //get index page
 app.get('/',(req,res)=>{
 	res.render('index.pug')
 })
 //get search page
 app.get('/search.pug',(req,res)=>{
 	res.render('search.pug')
 })
 //get result page
 app.get('/result.pug',(req,res)=>{
 	res.render('result.pug')
 })
 //get add entry page
 app.get('/addEntry.pug',(req,res)=>{
 	res.render('addEntry.pug')
 })
 //get home page
 app.get('/index.pug',(req,res)=>{
 	res.render('index.pug')
 })
 //login page
 app.get('/login',(req,res)=>{
 	res.render('login.pug')
 })

//add books
 app.post('/addBook',(req,res)=>{

 	let inputname = req.body.name

 	Book.create({
 		name: inputname
 	}).then(()=>{
 		res.redirect('/')
 	})
 })
 //add author
 app.post('/addAuthor',(req,res)=>{

 	let inputname = req.body.name

 	Author.create({
 		name: inputname
 	}).then(()=>{
 		res.redirect('/')
 	})
 })
 //add record
 app.post('/addRecord',(req,res)=>{

 	let inputyear = req.body.year
 	let bookId = req.body.book_id
 	let authorId = req.body.author_id

 	Record.create({
 		published_year: inputyear,
 		authorId: authorId,
 		bookId: bookId

 	}).then(()=>{
 		res.redirect('/')
 	})	
 })

 //search by author
 app.post('/searchauthor',(req,res)=>{

 	let inputname = req.body.author
 	console.log(inputname);

 	Author.findOne({
 		where:{name: inputname},
 		include: [{model: Book}]
 	})
 	
 	.then((name)=>{

 		if(name!== null){
 			// req.session.name = name

 		
 		res.render('search.pug',{data: name})
 	   }
 	   else{
 	   	const failureMessage = "Sorry!The author does not exist in our library"
 	   	res.render('search.pug',{ message1:failureMessage})
 	   }

 	 })
 })
 //search by books
 app.post('/searchbook',(req,res)=>{

 	let inputname = req.body.book

 	Book.findOne({
 		where:{name: inputname},
 		include: [{model:Author}]
 	})
 	.then((book)=>{
 		if(book!== null){
 			// req.session.book = book
 			res.render('search.pug',{output:book})

 		}
 		else{
 			const failureMessage = "sorry!The book does not exist in our library"
 	   	res.render('search.pug',{ message2:failureMessage})

 		}
 		
 	})
 })

 //sign up users
 app.post('/signup', (req,res)=>{
 	let inputname = req.body.name;
 	let email = req.body.email;
 	let password  = req.body.password;
 	console.log(`------>${email}`)

 	User.create({
 		name: inputname,
 		email: email,
 		password: password
 	}).then(()=>{
 		res.render('search.pug')
 	})

 })
 //login 
 app.post('/login',(req,res)=>{
 	let inputemail = req.body.email;
 	let password = req.body.password;

 	User.findOne({
 		where:{ email: inputemail}
 	}).then((data)=>{
 		if(data !== null && password === data.password){
 			let message = `Welcome back ${data.name}!`
 			res.render('search.pug',{message: message})

 		}
 	})
 })



 sequelize.sync()

 app.listen(4000,()=>{
 	console.log("app listening at port 4000")
 })