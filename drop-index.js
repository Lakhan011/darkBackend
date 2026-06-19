const mongoose = require('mongoose');

async function dropIndex() {
  await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
  try {
    await mongoose.connection.collection('categories').dropIndex('slug_1');
    console.log('categories slug_1 dropped');
  } catch (e) {
    console.log(e.message);
  }
  try {
    await mongoose.connection.collection('subcategories').dropIndex('slug_1');
    console.log('subcategories slug_1 dropped');
  } catch (e) {
    console.log(e.message);
  }
  process.exit(0);
}
dropIndex();
