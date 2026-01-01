import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './ProductList.css';

const ProductList = () => {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      let mounted = true;
      api.get('/products')
         .then(res => {
            if (mounted) setProducts(res.data || []);
         })
         .catch(err => console.error('Error fetching products:', err))
         .finally(() => mounted && setLoading(false));

      return () => { mounted = false; };
   }, []);

   if (loading) return <div className="product-grid-loading">Loading products...</div>;

   return (
      <div className="product-grid" aria-live="polite">
         {products.map(product => (
            <div key={product.id} className="product-card">
               <h3 className="product-name">{product.name}</h3>
               <p className="product-price">${product.price}</p>
            </div>
         ))}
      </div>
   );
};

export default ProductList;
