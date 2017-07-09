const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const flashMiddleware = require('./middlewares/flash');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'superSecret';

const csurf = require('csurf');

const Message = require('./models/message.model');
const User = require('./models/user.model');

const app = express();

//moteur de template
app.set('view engine', 'ejs');

//Middleware
app.use('/assets', express.static('public')); //load static files

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(session({
    secret: 'super secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false // because not https
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flashMiddleware);

passport.use(new LocalStrategy((username, password, done) => {
    // seach in the db
    User.find(username, (user) => {

        //Need to hash password
        if(username === user.USERNAME && password === user.PASSWORD){

            return done(null, {username: user.USERNAME});
        }
        return done(null, false);
    });

}));

//Serialize User
passport.serializeUser((user, done) => {
    done(null, user.username)
});

//Deserialize User
passport.deserializeUser((username, done) => {
    done(null, {username: username});
});

app.use(csurf());
app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    res.status(403)
    res.send('session has expired or form tampered with')
});

//routes
app.get('/', (request, response) => {

    Message.all((messages) => {

        response.render('pages/index', {
            name: 'Inthalak',
            messages: messages,
            csrfToken: request.csrfToken()
        });
    });
});

app.post('/', (request, response) => {

    if(!request.body.message) {

        resquest.flash('error', 'No content in the body');
        response.redirect('/');
    } else {

        Message.create(request.body.message, () => {

            request.flash('success', 'Message has successfully been created');
            response.redirect('/');
        });
    }
});

app.get('/message/:id', (request, response) => {

    Message.find(request.params.id, (message) => {

        response.end(JSON.stringify(message[0]));
    });
});

app.get('/error', (request, response) => {

    response.end('error');
});

app.get('/success', (request, response) => {

    response.end('success');
});

app.post('/register', (request, response) => {

    if(!request.body.username && !request.body.password) {
        response.end('error invalid parameters');
    }
    User.add(request.body.username, request.body.password, () => {
        response.end('User successfully added');
    });
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/error',
    successRedirect: '/success'
}));

app.get('/token', (request, response) => {
    let user = {
        username: 'test'
    };
    let token = jwt.sign(user, SECRET_KEY, {
        expiresIn: 4000
    });
    response.json({
        success: true,
        token: token
    })
});

//validation middleware
app.use((request, response, next) => {
    let token = request.body.token || request.headers['token'];

    if(token) {
        jwt.verify(token, SECRET_KEY, (err, decode) => {
            if(err) {
                response.status(500).send("Invalid Token");
            } else {
                next();
            }
        });
    } else {
        response.end('No token provided');
    }
});

//to test api token authorization
app.get('/secret', (request, response) => {
    response.end('secret data');
});

//csurf test
app.post('/secret', (request, response) => {
    response.end('secret data');
});

app.listen(8080);