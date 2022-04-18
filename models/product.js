const fs = require('fs');

const Cart = require('./cart');
const db = require('../util/database')


module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return db.execute('INSERT INTO products (title,imageUrl,description,price) VALUES (?,?,?,?)',[this.title,this.imageUrl,this.description,this.price])
  }

  static deleteById(id) {
    
  }

  static fetchAll() {
    return db.execute("SELECT * FROM products")
  }

  static findById(id) {
    return db.execute('SELECT * from products WHERE products.id = ?',[id]);
  }
};
