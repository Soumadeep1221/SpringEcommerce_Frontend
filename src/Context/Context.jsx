import axios from "../axios";
import { useState, useEffect, useRef, createContext, useCallback } from "react";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  selectedCategory: "",
  setSelectedCategory: () => {},
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  refreshData:() =>{},
  updateStockQuantity: (productId, newQuantity) =>{},
  updateProductInData: (productId, updatedFields) => {},
  updateCartItemQuantity: (productId, newQuantity) => {}
});

// Module-level cache — survives StrictMode remounts
let productCache = null;

// Exported so other components can bust the per-product cache after update/delete
export const productDetailCache = {};

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const isFirstRender = useRef(true);

  const addToCart = (product) => {
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    if (existingProductIndex !== -1) {
      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCart = cart.map((item) =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const refreshData = useCallback(async (force = false) => {
    try {
      // On forced refresh (e.g. after adding a product), bust the cache
      if (force) productCache = null;
      // Reuse in-flight or cached promise — prevents duplicate calls in StrictMode
      if (!productCache) {
        productCache = axios.get('/products');
      }
      const response = await productCache;
      setData(response.data);
    } catch (error) {
      productCache = null;
      setIsError(error.message);
    }
  }, []);

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const updateStockQuantity = (productId, newQuantity) => {
    setData(prevData => 
      prevData.map(product => 
        product.id === productId 
          ? { ...product, stockQuantity: newQuantity }
          : product
      )
    );
  };

  // Optimistically update a product in the list — instant UI update without re-fetch
  const updateProductInData = (productId, updatedFields) => {
    setData(prevData =>
      prevData.map(product =>
        product.id === productId
          ? { ...product, ...updatedFields }
          : product
      )
    );
    // Also bust caches so next navigation gets fresh data
    productCache = null;
    delete productDetailCache[productId];
  };
  
  useEffect(() => {
    refreshData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Skip first render — cart is already loaded from localStorage via useState initializer
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  return (
    <AppContext.Provider value={{ data, isError, cart, selectedCategory, setSelectedCategory, addToCart, removeFromCart, refreshData, clearCart, updateStockQuantity, updateProductInData, updateCartItemQuantity }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;