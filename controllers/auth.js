exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  const userId = '66c25507cf7b25269ac4645e';
  req.session.userId = userId;
  req.session.isLoggedIn = true;
  req.session.save((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};
