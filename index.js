import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url"; // THESE NEXT 2 LINES LET US GRAB DIRECTORY NAME DYNAMICALLY
const __dirname = dirname(fileURLToPath(import.meta.url));

//initialize express server
const app = express();
const port = 3000;

//-----------------middleware-----------------------
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

//express session middleware
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}))
//custom middleware to initalize posts array for session if not created yet
app.use((req, res, next) => {
    if (!req.session.posts){
        req.session.posts = [];
    }
    next()
})

//-----------------routes----------------------------
//home page
app.get("/", (req,res) =>{
    res.render("index.ejs", {
        posts: req.session.posts
    });
})

//about route
app.get("/about", (req,res) =>{
    res.render("about.ejs");
})

//contact route
app.get("/contact", (req,res) =>{
    res.render("contact.ejs");
})

//create post route
app.get("/create", (req,res) =>{
    res.render("create.ejs");
})

//submit post route
app.post("/submit", (req,res) =>{
    //create new Blog object
    var blog = new BlogPost(
        req.body['blogAuthor'],
        req.body['blogTitle'],
        req.body['blogText'])
    //add blog to posts array
    req.session.posts.push(blog);

    //return to index page
    res.render("index.ejs", {
        posts: req.session.posts
    });
})

//view post route
app.post("/viewpost", (req,res) =>{
    //obtain postID (index in posts array) from the read more button name/value pair
    let postID = req.body['postID'];
    
    //Obtain current post and go to viewpost page
    res.render("viewpost.ejs", {
        currentPost: req.session.posts[postID],
        postID: postID
    });
})

//update post route
app.post("/update", (req,res) =>{
    //obtain postID (index in posts array) from button name/value pair
    let postID = req.body['postID']
    
    //render the create post page, but use the previous blog values as default values (logic in create.ejs)
    res.render("create.ejs",{
        currentPost: req.session.posts[postID],
        postID:postID
    });
})

//submit update route
app.post("/submit-update", (req,res) =>{
    //obtain postID (index in posts array) from the button name/value pair
    let postID = req.body['postID']

    //update the blog object's attributes with updated values
    req.session.posts[postID].author = req.body['blogAuthor']
    req.session.posts[postID].title = req.body['blogTitle']
    req.session.posts[postID].text = req.body['blogText']
    req.session.posts[postID].date = new Date().toDateString();
    
    //return to index page
    res.render("index.ejs", {
        posts: req.session.posts
    });
})

//delete post route
app.post("/delete", (req,res) =>{
    //obtain postID (index in posts array) from the button name/value pair
    let postID = req.body['postID'];

    //delete post from the posts array using the postID (index)
    req.session.posts.splice(postID, 1);

    //return to index page
    res.render("index.ejs", {
        posts: req.session.posts
    });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

//---------------------objects-----------------------------
//BlogPost object, containing author, title, text and date
class BlogPost {
    constructor(author, title, text){
        this.author = author;
        this.title = title;
        this.text = text;
        this.date = new Date().toDateString();
    }
}