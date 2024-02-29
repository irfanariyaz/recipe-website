const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const ejs = require('ejs')
const session = require('express-session')
// const storage = multer.memoryStorage()
// const upload = multer({ storage: storage })
const app = express();
app.use(
    session({
      secret: '12345', // Replace with a secure secret
      resave: false,
      saveUninitialized: true,
    })
  );
  
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })  
  const upload = multer({ storage: storage }) 
 
 //const upload = multer({ dest: 'uploads/' })


app.set('view engine', 'ejs')
app.set('views', './views')
//middleware for the request to parse JSON in the request body
app.use(express.json());
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

  // render Main  page 
  app.get('/', function(req, res) {
    const username = req.session.username;
    const image = req.session.image;
    const categories= [ 'Beef','Chicken',
'Dessert',       'Lamb',
'Miscellaneous', 'Pasta',
'Pork',          'Seafood',
'Side',          'Starter',
'Vegan',         'Vegetarian',
'Breakfast',     'Goat'
]

    res.render("index",{username,image,categories})
  });
// render  recipes page  to list all the dishes
app.get('/recipes', function(req, res) {
    const username = req.session.username;
    const image = req.session.image; 
    let category = req.session.category; 
    if(!category){
      category ="Seafood";
    }
    res.render("allRecipes",{username,image,category})
  });
//render loginPage
app.get('/login', function(req, res) {
       res.render("login")
  });
//register Page
app.get('/register', function(req, res) {
    res.render("register")
  });
//recipe detail page
app.get("/recipeinfo",(req,res) =>{
  const username = req.session.username;
  const image = req.session.image; 
  res.render("recipeDetail",{username,image})
})
//post for category
app.post("/category",(req,res) =>{
  const {category} = req.body;
  req.session.category = category;
  res.redirect("/recipes")
})
//SIGN UP POST
app.post('/submit-form',upload.single('profilePicture'), async (req, res) =>{
    console.log(req.file.path);
    const  connection =  mysql.createConnection({
        host : "localhost",
        // port :3306,
        user : "root",
        password:"Esteem@12?",
        database: "recipedb"
        // insecureAuth : true
    });
    const imagepath = req.file.filename;// .buffer gives the binary data
    const {username, email,password} = req.body;
    //console.log('Received form data:', { username,email, password,profilepicfile});
    try {
        // Save data to the MySQL database
        var sql = "INSERT INTO users (username,password,email,imagepath) VALUES (?, ?,?, ?)";
        connection.query(sql,[username,password,email,imagepath],(err,result) =>{
            if (err) throw err;
            console.log('File saved to database:', result);
        })
        // Close the connection to the MySQL database
        connection.end();
       // Send a response back to the client
       res.redirect("/login")
        // res.redirect("http://localhost:5500/login.html")
    } catch (error) {
        console.error('Error saving file to database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }      
});

//LOGIN SUBMIT 

app.post('/submit-login',async (req, res)=> {
    const  connection =  mysql.createConnection({
        host : "localhost",
        // port :3306,
        user : "root",
        password:"Esteem@12?",
        database: "recipedb"
        // insecureAuth : true
    });
    const {username,password} = req.body;
    try{
        const sql = "SELECT * FROM users where username = ? AND password =?";
        connection.query(sql,[username,password],(err,results,fields) =>{
            // if (err) console.log(err);
            console.log('correct login', results);
            console.log("results.length",results.length);
           
            // Check if user exists
            if (results.length > 0) {
                req.session.username = username.charAt(0).toUpperCase() + username.slice(1);
                req.session.image = results[0].imagepath;
                res.redirect("/")
               } else {
              res.redirect("/login");
                  }
        })
         connection.end();      
        // res.json(result);
    }catch (error) {
        console.error('Error saving file to database:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }  
});
app.get("/logout",(req,res) =>{
    req.session.destroy(()=>{
        res.redirect("/")
    })
})
//     try{
//         //save data to db
//         const insertQuery = 'INSERT INTO users (username, password, email, profilepic) VALUES (?, ?, ?, ?)';
//         const values = [username, password, email, profilepicfile];
        
//         con.connect((err)=>{
//             if (err) {
//                console.error('Error connecting to MySQL:', err);
//             }else{
//                 //insert values to db
//                 con.query(insertQuery , values, (err,results)=>{
//                     if(err){
//                         console.log("Error inserting user:",err);
//                         res.status(500).json({
//                             success: false,
//                             message: 'Internal Server Error'
//                         })
//                         return;
//                     }
//                     res.json({ success: true, message: 'User registered successfully', userId: results.insertId });
//                 });
//                 }
//         })
//     }catch (error) {
//         console.error('Error saving file to database:', error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }      
  //   });
// //     // Query the database for the user
//   const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
//   db.query(query, [username, password], (err, results) => {
//     if (err) {
//       console.error('Error executing MySQL query:', err);
//       return res.status(500).json({ success: false, message: 'Internal server error' });
//     }

//     // Check if user exists
//     if (results.length > 0) {
//       res.json({ success: true, message: 'Login successful' });
//     } else {
//       res.status(401).json({ success: false, message: 'Invalid username or password' });
//     }
//   });
    

//   })

  // Start the server
const port =3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});