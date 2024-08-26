const crypto = require('crypto');
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
          // transporter.sendMail({
          //   to: email,
          //   from: 'nodejs@udemy.com',
          //   subject: 'Signup succeeded',
          //   html: '<h1>You successfully signed up!</h1>',
          // });
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

exports.getResetPassword = (req, res, next) => {
  const messageArray = req.flash('error');
  const tokensArray = req.flash('info');

  res.render('auth/reset-password', {
    path: '/reset-password',
    pageTitle: 'Reset Password',
    errorMessage: messageArray.length > 0 ? messageArray[0] : null,
    token: tokensArray.length > 0 ? tokensArray[0] : null,
  });
};

exports.postResetPassword = (req, res, next) => {
  const { email } = req.body;

  User.findOne({ email }).then((user) => {
    if (!user) {
      req.flash('error', 'No account with that email found');
      return res.redirect('/reset-password');
    }
    // Generate a token
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect('/reset-password');
      }
      const token = buffer.toString('hex');
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      user.save().then(() => {
        req.flash('info', token); // instead of sending mail, we will just flash the token
        res.redirect('/reset-password');
        // res.redirect('/');
        // transporter.sendMail({
        //   to: email,
        //   from: 'nodejs@udemy.com',
        //   subject: 'Password reset',
        //   html: `
        //     <p>You requested a password reset</p>
        //     <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password</p>
        //     `,
        // });
      });
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const { token } = req.params;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      const messageArray = req.flash('error');
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        userId: user._id.toString(),
        resetToken: token,
        errorMessage: messageArray.length > 0 ? messageArray[0] : null,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const { userId, newPassword, resetToken } = req.body;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect('/login');
    })
    .catch((err) => console.log(err));
};
