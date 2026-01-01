const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator';

const seed = async () => {
   try {
      await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB for seeding');

      const products = [
         { name: 'Intro to React', price: 19.99, description: 'Learn the basics of React.' },
         { name: 'Advanced Node.js', price: 29.99, description: 'Deep dive into Node.js internals.' },
         { name: 'Data Structures', price: 24.99, description: 'Essential data structures and usage.' },
         { name: 'Algorithms Deep Dive', price: 34.99, description: 'Algorithm patterns and problem solving.' },
         { name: 'Fullstack Capstone', price: 49.99, description: 'Build a fullstack project from scratch.' }
      ];

      // Clear existing products and insert seed data
      await Product.deleteMany({});
      await Product.insertMany(products);

      console.log('Products seeded successfully');
      process.exit(0);
   } catch (err) {
      console.error('Seeding error', err);
      process.exit(1);
   }
};

seed();
