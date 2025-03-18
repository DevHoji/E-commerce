const Product = require('../models/Product');

async function getAllProducts (req, res){
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    console.error('Error in getAllProducts controller:', error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while fetching products' 
    });
  }
};

async function getProductById (req, res){
  try {
    const productId = req.params.id;
    const product = await Product.getById(productId);
    
    if (!product) {
      return res.status(404).json({  
        success: false,
        message: 'Product not found' 
      });
    }
    
    res.json(product);
      
  } catch (error) {
    console.error(`Error in getProductById controller for product ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false,
      message: 'An error occurred while fetching the product' 
    });
  }
};

async function getProductsByCategory (req, res){
  try {
    const categoryId = req.params.categoryId;
    const products = await Product.getByCategory(categoryId);
    
    res.json(products);
  } catch (error) {
    console.error(`Error in getProductsByCategory controller for category ${req.params.categoryId}:`, error);
    res.status(500).json({ 
      success:false,
      message: 'An error occurred while fetching the products' 
    });
  }
};

async function getFeaturedProducts (req, res){
  try {
    const featuredProducts = await Product.getFeatured();
    res.json(featuredProducts);
  } catch (error) {
    console.error('Error in getFeaturedProducts controller:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching featured products'
    })
  }
};

module.exports = {getAllProducts, getProductById, getProductsByCategory,getFeaturedProducts};