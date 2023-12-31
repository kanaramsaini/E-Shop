const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const errorController = require('./controllers/error');
const User = require('./models/user');


const app = express();
require('dotenv').config();
const store = new MongoDBStore({
        uri: process.env.MONGODB_URI,
        collection: 'sessions'
      })
const csrfProtection = csrf();
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
        session({
                secret:'my secret',
                resave:false,
                saveUninitialized:false,
                store: store
        })
)

app.use(csrfProtection);

app.use(flash());

app.use((req,res,next)=>{
        if(!req.session.user){
                return next()
        }
        User.findById(req.session.user._id)
        .then(user=>{
                req.user=user
                next()
        }).catch(erro=>{console.log(erro)})
        
 })


 app.use((req, res, next) => {
        res.locals.isAuthenticated = req.session.isLoggedIn;
        res.locals.csrfToken = req.csrfToken();
        next();
      })


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
.connect(process.env.MONGODB_URI)
.then(result=>{
 
        const PORT = 5000
        app.listen(PORT)
        console.log('mongoose database connect')
})
.catch(erro=>{console.log(erro);})

