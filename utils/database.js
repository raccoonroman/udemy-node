require('dotenv').config();

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    `mongodb+srv://roman:${process.env.MONGODB_PASSWRD}@cluster0.pgdxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
    .then((client) => {
      console.log('Connected!');
      _db = client.db();
      callback();
      // client.close();
    })
    .catch((err) => {
      console.log(err);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
