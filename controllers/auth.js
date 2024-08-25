const bcrypt = require('bcryptjs');

const User = require('../models/User');

exports.getSignup = (req, res, next) => {
  const messageArray = req.flash('error');
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign up',
    errorMessage: messageArray.length > 0 ? messageArray[0] : null,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error', 'Email already exists, please pick a different one');
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then(() => {
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.getLogin = (req, res, next) => {
  const messageArray = req.flash('error');
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: messageArray.length > 0 ? messageArray[0] : null,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }).then((user) => {
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
    bcrypt.compare(password, user.password).then((doMatch) => {
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.userId = user._id;
        return req.session.save((err) => {
          console.log(err);
          res.redirect('/');
        });
      }
      req.flash('error', 'Invalid email or password');
      res.redirect('/login');
    });
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};
