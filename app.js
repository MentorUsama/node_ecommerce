const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongose = require('mongoose')

const errorController = require('./controllers/error');
// const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  // User.findById('6283241de94d3408baa88715')
  //   .then(user => {
  //     req.user = new User(user.name, user.email, user.cart, user._id);
  //     next();
  //   })
  //   .catch(err => console.log(err));
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongose.connect('mongodb://localhost:27017/ecommerce')
  .then((result)=>{
    app.listen(8000)
  })
  .catch((err)=>{
    console.log(err)
  });
