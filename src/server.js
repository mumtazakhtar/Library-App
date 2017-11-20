//<----require dependencies---->
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store);

//<----configurating dependencies------>
const app = express();

//<-----connecting to database----->
const sequelize = new Sequelize('library_app', process.env.POSTGRES_USER,process.env.POSTGRES_PASSWORD,{
  host: 'localhost',
  dialect: 'postgres',
  storage: './session.postgres',
  define: {
  	timestamps: false
  }
});
//<------static files------>
app.use(express.static('../public'));
app.use(express.static('../public/css'))

app.set('views','./views');
app.set('view engine','pug');

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  store: new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
    expiration: 24 * 60 * 60 * 1000 // The maximum age (in milliseconds) of a valid session.
  }),
  secret: "mohammed",
  saveUnitialized: true,
  resave: false
}))

//<------Defining models-------->
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

//<--Defining relationship between tables-->
 
 Author.belongsToMany(Book,{through: Record})
 Book.belongsToMany(Author,{through: Record})

 //<<----------------Routes------------------>>
 //<-----get index page------->
 app.get('/',(req,res)=>{

 	let user = req.session.user
 	
 	res.render('index.pug', {message:req.query.message})
 })
 //<-------get search page---------->
 app.get('/search.pug',(req,res)=>{
 	const user = req.session.user;

 	if(user === undefined){
 		res.redirect('/?message=' + encodeURIComponent("Please login to search books in library"))

 	}
 	else{
 		res.render("search");
 	}
 	
 });

  //<-------get add entry page----->
 app.get('/addEntry.pug',(req,res)=>{

 const user = req.session.user;
console.log(user)
 	if(user === undefined){
 		res.redirect('/?message=' + encodeURIComponent("Please login to add entry in library"))

 	}
 	else{
 		res.render("addEntry");
 	 }
 })
 //<-----get home page-------->
 app.get('/index.pug',(req,res)=>{
 	res.render('index.pug')
 })
 //<-------login page--------->
 app.get('/login',(req,res)=>{
 	res.render('login.pug')
 })

//<--------add books--------->
 app.post('/addBook',(req,res)=>{

 	let inputname = req.body.name

 	Book.create({
 		name: inputname
 	}).then(()=>{
 		res.redirect('/')
 	})
 })
 //<-----add author-------->
 app.post('/addAuthor',(req,res)=>{

 	let inputname = req.body.name

 	Author.create({
 		name: inputname
 	}).then(()=>{
 		res.redirect('/')
 	})
 })
 //<-----add record--------->
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

 //<-------search by author-------->
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
 //<-------search by books--------->
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

 //<-------sign up users------>
 app.post('/signup', (req,res)=>{
 	let inputname = req.body.name;
 	let email = req.body.email;
 	let password  = req.body.password;
 	console.log(`------>${email}`)

 	User.create({
 		name: inputname,
 		email: email,
 		password: password
 	}).then((user)=>{
 		req.session.user = user;
 		res.render('search.pug')
 	})

 })
 //<------login route--------->
 app.post('/login',(req,res)=>{
 	let inputemail = req.body.email;
 	let password = req.body.password;

 	User.findOne({
 		where:{ email: inputemail}
 	}).then((data)=>{
 		if(data !== null && password === data.password){
 			let message = `Welcome back ${data.name}!`
 			req.session.user = data
 			res.render('search.pug',{message: message})

 		}
 	})
 })
//<------Log out route------->
app.get('/logout', (req,res)=>{
  req.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		res.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
})



 sequelize.sync()

 app.listen(4001,()=>{
 	console.log("app listening at port 4001")
 })