require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const samples = [
 {name:"Everyday Wireless Keyboard",description:"A compact wireless keyboard designed for a tidy desk and comfortable everyday typing.",price:2499,category:"Electronics",image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85",stock:18},
 {name:"Studio Headphones",description:"Comfortable over-ear headphones for focused work, playlists, and long listening sessions.",price:3999,category:"Electronics",image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",stock:12},
 {name:"Minimal Desk Lamp",description:"A warm, understated lamp to bring a little calm to your work surface.",price:1899,category:"Home",image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85",stock:9},
 {name:"Canvas Everyday Tote",description:"A roomy reusable tote for errands, books, and everyday carry.",price:699,category:"Accessories",image:"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85",stock:25},
 {name:"Ceramic Coffee Cup",description:"A simple ceramic cup for your morning coffee or afternoon tea.",price:449,category:"Home",image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85",stock:30},
 {name:"Classic Analog Watch",description:"A clean, versatile everyday watch with a timeless silhouette.",price:3299,category:"Accessories",image:"https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85",stock:7}
];
(async()=>{try{await mongoose.connect(process.env.MONGODB_URI);const count=await Product.countDocuments();if(count){console.log(`Seed skipped: ${count} products already exist.`);}else{await Product.insertMany(samples);console.log(`Inserted ${samples.length} sample products.`);}}catch(e){console.error(e.message);process.exitCode=1;}finally{await mongoose.disconnect();}})();
