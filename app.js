const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongose = require('mongoose')

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('62892842a65a2999db3eb137')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongose.connect('mongodb://localhost:27017/ecommerce')
  .then((result)=>{
    User.findOne().then(user=>{
      if(!user)
      {
        const user = new User({
          name:'Usama',
          email:'usama.farhat.99@gmail.com',
          cart:{
            items:[]
          }
        })
        user.save()
      }
      app.listen(8000)
    })
  })
  .catch((err)=>{
    console.log(err)
  });
