const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.findAll().then((products)=>{
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(error=>{
    console.log(error)
  })
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findAll({where:{id:prodId}})
    .then((product)=>{
      res.render('shop/product-detail', {
        product: product[0],
        pageTitle: product[0].title,
        path: '/products'
      });
    })
    .catch((error)=>{
      console.log(error)
    }) 
  // Product.findByPk(prodId)
  //   .then((product)=>{
  //     res.render('shop/product-detail', {
  //       product: product,
  //       pageTitle: product.title,
  //       path: '/products'
  //     });
  //   })
  //   .catch((error)=>{
  //     console.log(error)
  //   })  
};

exports.getIndex = (req, res, next) => {
  Product.findAll().then((products)=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(error=>{
    console.log(error)
  })
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
  .then((cart)=>{
    return cart.getProducts()
  })
  .then((cartProducts)=>{
    res.render('shop/cart', {
      path: '/cart',
      pageTitle: 'Your Cart',
      products: cartProducts
    });
  })
  .catch((error)=>{
    console.log(error)
  })
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let newQuantity = 1;
  let fetchedCart;
  req.user.getCart()
    .then((cart)=>{
      fetchedCart = cart;
      return cart.getProducts({where:{id:prodId}})
    })
    .then((products)=>{
      let product;
      if(products.length > 0){
        product=products[0];
      }
      if(product)
      {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId)
    })
    .then((product)=>{
      return fetchedCart.addProduct(product, {through:{quantity:newQuantity}})
    })
    .then(()=>{
      res.redirect('/cart');
    })
    .catch((error)=>{
      console.log(error)
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart()
    .then(cart=>{
      return cart.getProducts({where:{id:prodId}})
    })
    .then(products=>{
      const product = products[0];
      return product.cartItem.destroy()
    })
    .then(()=>{
      res.redirect('/cart');
    })
    .catch(error=>{
      console.log(error)
    })
};

exports.postOrder = (req, res, next) => {
  let cartProductsGot;
  let fetchedCart;
  req.user.getCart()
    .then(cart=>{
      fetchedCart = cart;
      return cart.getProducts()
    })
    .then(products=>{
      cartProductsGot=products
      return req.user.createOrder()
    })
    .then(order=>{
      return order.addProducts(cartProductsGot.map(product=>{
        product.orderItem={quantity:product.cartItem.quantity}
        return product
      }))
    })
    .then(result=>{
      return fetchedCart.setProducts(null)
    })
    .then(result=>{
      res.redirect('/orders')
    })
    .catch(error=>{})
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include:['products']})
    .then((orders)=>{
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders:orders
      });
    })  
    .catch(error=>{})
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
