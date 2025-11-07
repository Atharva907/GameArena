import { MongoClient } from 'mongodb';

// Use the MongoDB connection URI directly
const uri = "mongodb+srv://gamearena083_db_user:MyGvI59NO744lkez@cluster0.jbt8w7x.mongodb.net/game-arena?retryWrites=true&w=majority";
const options = {
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000,  // 45 seconds
  serverSelectionTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 10, // Maintain up to 10 socket connections
};

let client;
let clientPromise;

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then(client => {
        console.log('Connected to MongoDB');
        return client;
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log('Connected to MongoDB');
      return client;
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB', err);
      throw err;
    });
}

export default clientPromise;
