const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/database');
const Product = require('./Product');

class User {
  constructor(id, name, email, cart) {
    this._id = id;
    this.name = name;
    this.email = email;
    this.cart = cart;
  }

  save() {
    return getDb().collection('users').insertOne(this);
  }

  static findById(userId) {
    return getDb()
      .collection('users')
      .findOne({ _id: ObjectId.createFromHexString(userId) });
  }

  getCart() {
    console.log('this.cart.items', this.cart.items);

    return this.updateCart().then(() => {
      const productIds = this.cart.items.map((i) => {
        return i.productId;
      });
      return getDb()
        .collection('products')
        .find({ _id: { $in: productIds } })
        .toArray()
        .then((products) => {
          return products.map((p) => {
            return {
              ...p,
              quantity: this.cart.items.find((i) => {
                return i.productId.toString() === p._id.toString();
              }).quantity,
            };
          });
        });
    });
  }

  updateCart() {
    return Product.fetchAll().then((products) => {
      const updatedCartItems = this.cart.items.filter((cartItem) =>
        products.find(
          (product) => product._id.toString() === cartItem.productId.toString()
        )
      );

      this.cart.items = updatedCartItems;

      return getDb()
        .collection('users')
        .updateOne(
          { _id: this._id },
          { $set: { cart: { items: updatedCartItems } } }
        );
    });
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({ productId: product._id, quantity: newQuantity });
    }
    const updatedCart = { items: updatedCartItems };

    return getDb()
      .collection('users')
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });

    return getDb()
      .collection('users')
      .updateOne(
        { _id: this._id },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  getOrders() {
    return getDb()
      .collection('orders')
      .find({ 'user._id': this._id })
      .toArray();
  }

  addOrder() {
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: this._id,
            name: this.name,
          },
        };
        return getDb().collection('orders').insertOne(order);
      })
      .then(() => {
        this.cart = { items: [] };
        return getDb()
          .collection('users')
          .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
      });
  }
}

module.exports = User;
