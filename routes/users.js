var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var upload2 = multer();
var session = require('express-session');
var mongoose = require('mongoose');
var randomstring = require('randomstring');
var Promise = require('promise');
var expressValidator = require('express-validator');
var mailer = require('../misc/mailer')

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
	res.render('register', {title:'register'});
});

router.get('/profile', function(req, res, next) {
	res.render('profile', {title:'Profile'});
});


router.get('/verify', function(req, res, next) {
	res.render('verify', {title:'verify'});
});

router.get('/chat', function(req, res, next){
	res.render('chat', {title:'Chat'});
});

router.get('/login', function(req, res, next) {
    res.render('login', {title:'Login'});
});

router.post('/login',
  passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: true}),
  function(req, res, next) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
    global.name2 = req.body.username;
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});



passport.use(new LocalStrategy(function(username, password, done){
	User.getUserByUsername(username, function(err, user){
		if(err) throw err;
		if(!user){
			return done(null, false, {message: 'Unknown User'});
		}

		if (!user.active) {
			return done(null, false, {message: 'You need to verify email first'});
		}

		User.comparePassword(password, user.password, function(err,isMatch){
			if(err) return done(err);
			if(isMatch){
				return done(null, user);
			} else {
				return done(null, false, {message: 'Invalid Password'});
			}
		});
	});
}));


router.post('/register', upload.single('profileimage'),  function(req, res, next) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	if(req.file){
		console.log('Uploading File...');
		var profileimage = req.file.filename;
	} else {
		console.log('No File Uploaded...');
		var profileimage = 'noimage.jpg';
	}

	// Form Validator
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username field is required').notEmpty();
	req.checkBody('password','Password field is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	// Check Errors
	var errors = req.validationErrors();

	const secretToken = randomstring.generate();

	if(errors){
		res.render('register', {
			errors: errors
		});
	}	else{
		console.log('No Errors');
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password,
			profileimage: profileimage,
			secretToken: secretToken,
			active: false,
			age: "",
			height: "",
			politics: "",
			social: ""
		});

		User.createUser(newUser, function(error, user) {
			if(error) {
				res.render('register',
				{message: req.flash('alert-danger', 'Email or Username already taken')});
			} else {
				res.render('./verify', {message: req.flash('success', 'A verification code has been sent to your email, please enter it below in order to continue.')})
				const html = `Hi there, <br/> Thank you for registering!<br/><br/>Please verify your email by typing the following token<br/>Token: ${secretToken}</b><br/>On the following page: <a href="http://localhost:3000/users/verify">http://localhost:3000/users/verify</a><br/><br/>Have a pleasant day!`;
				mailer.sendEmail('admin@smartmatch.com', email, 'Please verify your email', html);
		}});
		}
	});

router.post('/verify', function(req, res, next) {
	const secretToken = req.body.secretToken;
	User.findOneAndUpdate({'secretToken': secretToken}, {secretToken: secretToken, active: true}, function(err, user) {
		if(!user)
			res.render('verify',
			{message: req.flash('alert-danger', 'Invalid token')});
		else
			res.render('./login', {message: req.flash('success', 'You are now registered and can login')})
	});
});

router.post('/profile', upload2.none(), function(req, res, next) {
	var age = req.body.age;
	var height = req.body.height;
	var politics = req.body.politics;
	var social = req.body.social;

	req.checkBody('age', 'Age field is required').notEmpty();
	req.checkBody('height', 'Height field is required').notEmpty();
	req.checkBody('politics', 'Political views field is required').notEmpty();
	req.checkBody('social','Intorverted/Extroverted field is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('profile', {
			errors: errors
		});
	}	else{
		var query2 = {username: name2};
		User.findOneAndUpdate(query2, {age: age, height: height, politics: politics, social: social}, { 'new': true }, function(err, doc){
                  if(err){
                    console.log("Something wrong when updating data!");
        }

                console.log(doc);
        });
		req.flash('success', 'Your profile is now updated and you will be matched as soon as possible!');

		res.location('/');
		res.redirect('/');
	}
});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You are now logged out');
	res.redirect('/users/login');

});

module.exports = router;
