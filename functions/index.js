const functions = require('firebase-functions'),
	express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(cookieParser());

app.set('views', './views');
app.set('view engine', 'ejs');

var db = admin.firestore();

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/signup', (req, res) => {
	res.render('signup');
});

app.get('/studdash', (req, res) => {
	res.render('studdash');
});

app.get('/Login', (req, res) => {
	res.render('signin');
});

app.get('/Privacy', (req, res) => {
	res.send('TBA');
});

app.get('/TOS', (req, res) => {
	res.send('TBA');
});

app.get('/logout', (req, res) => {
	res.clearCookie('__session', { path: '/' });
	res.redirect('/');
});

app.get('/onLogin', (req, res) => {
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
			.get()
			.then(doc => {
				if (doc.exists) {
					return res.redirect('/dashboard');
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.post('/onSignUp', (req, res) => {
	var displayName = req.body.displayName;
	var email = req.body.email;
	var password = req.body.password;
	var phoneNumber = '+91' + req.body.phoneNumber;
	var role = req.body.userRole;
	// function verificationUpload() {
	// 	admin.storage().ref(req.cookies.__session + '/verificationUpload/' + file.name).put(file);
	// 	res.redirect('/Dashboard');
	// }
	function roleAdd() {
		db.collection('users')
			.doc(req.cookies.__session)
			.set({
				role: role
			})
			.then(res.redirect('/Dashboard'))
			.catch(err => {
				return res.send(err);
			});
	}
	admin
		.auth()
		.updateUser(req.cookies.__session, {
			email: email,
			phoneNumber: phoneNumber,
			password: password,
			displayName: displayName
			// photoURL: photoURL
		})
		.then(userRecord => {
			roleAdd();
			return;
		})
		.catch(error => {
			console.log('Error updating user:', error);
		});
});

app.get('/Dashboard', (req, res) => {
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'vendor')
						return res.redirect('/dashVendor');
					else if (doc.data().role === 'student')
						return res.redirect('/dashStudent');
					else return res.redirect('/login');
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/dashVendor', (req, res) => {
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'vendor') {
						return res.render('dashVendor');
					} else {
						return res.redirect('/Dashboard');
					}
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/dashStudent', (req, res) => {
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'student') {
						return res.render('dashStudent');
					} else {
						return res.redirect('/Dashboard');
					}
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.use((req, res, next) => {
	res.status(404).render('404');
});

exports.app = functions.https.onRequest(app);
