import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { getCategoryLabel } from "../constants/categories";
import { convertBase64ToDataURL, formatCurrency, getStockStatus } from "../utils/formatters";

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData, updateStockQuantity } = useContext(AppContext);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    if (!isDataFetched) {
      refreshData();
      setIsDataFetched(true);
    }
  }, [refreshData, isDataFetched]);

  useEffect(() => {
    let toastTimer;
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [showToast]);

  // Function to convert base64 string to data URL
  const convertImageData = (base64String, mimeType = 'image/jpeg') => {
    return convertBase64ToDataURL(base64String, unplugged, mimeType);
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    
    // Prevent multiple clicks
    if (addingToCart === product.id) return;
    
    setAddingToCart(product.id);
    
    try {
      // Check if this is the last item in stock
      const isLastItem = product.stockQuantity === 1;
      
      // Add to cart
      addToCart(product);
      
      // If this was the last item, immediately update the UI
      if (isLastItem) {
        updateStockQuantity(product.id, 0);
      }
      
      // Show success notification
      setToastProduct(product);
      setShowToast(true);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => {
        setAddingToCart(null);
      }, 500);
    }
  };

  const filteredProducts = selectedCategory && selectedCategory !== ""
    ? data.filter((product) => product.category === selectedCategory)
    : data;

  if (isError) {
    return (
      <div className="min-vh-100 w-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--gray-50)', paddingTop: '6rem' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div 
                className="card border-0 text-center animate-fadeIn"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '3rem 2rem'
                }}
              >
                <div className="mb-4">
                  <div 
                    style={{
                      width: '100px',
                      height: '100px',
                      margin: '0 auto',
                      borderRadius: '50%',
                      backgroundColor: 'var(--error-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className="bi bi-exclamation-triangle" style={{ fontSize: '3.5rem', color: 'var(--error-color)' }}></i>
                  </div>
                </div>
                <h2 className="mb-3 fw-bold" style={{ color: 'var(--gray-900)' }}>Something went wrong</h2>
                <p className="text-muted mb-4" style={{ fontSize: '1.125rem' }}>
                  We're having trouble loading the products. Please try again.
                </p>
                <button 
                  className="btn btn-primary btn-lg px-5"
                  onClick={() => window.location.reload()}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Professional Toast Notification */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
        <div 
          className={`toast ${showToast ? 'show' : 'hide'} animate-slideInUp`}
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
          style={{
            backgroundColor: 'white',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            minWidth: '300px'
          }}
        >
          <div 
            className="toast-header border-0 pb-2"
            style={{ 
              background: 'linear-gradient(135deg, var(--success-color) 0%, var(--success-hover) 100%)',
              color: 'white',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
            }}
          >
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong className="me-auto">Added to Cart</strong>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => setShowToast(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body p-3">
            {toastProduct && (
              <div className="d-flex align-items-center">
                <img 
                  src={convertImageData(toastProduct.imageData)} 
                  alt={toastProduct.name} 
                  className="me-3 rounded" 
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    border: '2px solid var(--gray-200)'
                  }}
                  onError={(e) => {
                    e.target.src = unplugged;
                  }}
                />
                <div>
                  <div className="fw-semibold mb-1" style={{ color: 'var(--gray-900)' }}>
                    {toastProduct.name}
                  </div>
                  <small className="text-muted">Successfully added to your cart!</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mt-5 pt-5" style={{ paddingTop: '6rem !important' }}>
        {/* Page Header */}
        {selectedCategory && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="mb-2" style={{ color: 'var(--gray-900)' }}>
                    {getCategoryLabel(selectedCategory)}
                  </h2>
                  <p className="text-muted mb-0">
                    Discover our collection of {getCategoryLabel(selectedCategory).toLowerCase()} products
                  </p>
                </div>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => window.location.href = '/'}
                >
                  <i className="bi bi-grid-3x3-gap me-2"></i>
                  View All Products
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!filteredProducts || filteredProducts.length === 0 ? (
          <div className="min-vh-100 w-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--gray-50)', paddingTop: '6rem' }}>
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                  <div 
                    className="card border-0 text-center animate-fadeIn"
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: '3rem 2rem'
                    }}
                  >
                    {selectedCategory ? (
                      <>
                        <div className="mb-4">
                          <div 
                            style={{
                              width: '100px',
                              height: '100px',
                              margin: '0 auto',
                              borderRadius: '50%',
                              backgroundColor: 'var(--gray-100)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="bi bi-search" style={{ fontSize: '3.5rem', color: 'var(--gray-400)' }}></i>
                          </div>
                        </div>
                        <h2 className="mb-3 fw-bold" style={{ color: 'var(--gray-900)' }}>
                          No products found in "{getCategoryLabel(selectedCategory)}" category
                        </h2>
                        <p className="text-muted mb-4" style={{ fontSize: '1.125rem' }}>
                          Try selecting a different category or browse all products.
                        </p>
                        <button 
                          className="btn btn-primary btn-lg px-5"
                          onClick={() => window.location.href = '/'}
                          style={{
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600'
                          }}
                        >
                          <i className="bi bi-grid-3x3-gap me-2"></i>
                          Browse All Products
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-4">
                          <div 
                            style={{
                              width: '100px',
                              height: '100px',
                              margin: '0 auto',
                              borderRadius: '50%',
                              backgroundColor: 'var(--gray-100)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="bi bi-box" style={{ fontSize: '3.5rem', color: 'var(--gray-400)' }}></i>
                          </div>
                        </div>
                        <h2 className="mb-3 fw-bold" style={{ color: 'var(--gray-900)' }}>
                          No Products Available
                        </h2>
                        <p className="text-muted mb-4" style={{ fontSize: '1.125rem' }}>
                          Please check back later for new products.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {filteredProducts.map((product, index) => {
              const { id, brand, name, price, productAvailable, imageData, stockQuantity } = product;
              const stockStatus = getStockStatus(stockQuantity);
              const isOutOfStock = stockQuantity === 0 || !productAvailable;
              const isAddingThisProduct = addingToCart === id;
              
              return (
                <div 
                  className="col animate-slideInUp" 
                  key={id}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div 
                    className={`card h-100 ${isOutOfStock ? 'opacity-75' : ''}`}
                    style={{
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all var(--transition-normal)',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!isOutOfStock) {
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Link to={`/product/${id}`} className="text-decoration-none text-dark">
                      {/* Product Image */}
                      <div className="position-relative">
                        <img
                          src={convertImageData(imageData)} 
                          alt={name}
                          className="card-img-top"
                          style={{ 
                            height: "200px", 
                            objectFit: "cover",
                            transition: 'transform var(--transition-normal)'
                          }}
                          onError={(e) => {
                            e.target.src = unplugged;
                          }}
                        />
                        
                        {/* Stock Status Badge */}
                        {stockStatus.status !== 'in-stock' && (
                          <div 
                            className="position-absolute top-0 end-0 m-2"
                          >
                            <span 
                              className={`badge ${stockStatus.status === 'out-of-stock' ? 'bg-danger' : 'bg-warning'}`}
                              style={{
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                              }}
                            >
                              {stockStatus.message}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="card-body d-flex flex-column p-4">
                        <h5 
                          className="card-title mb-2" 
                          style={{ 
                            color: 'var(--gray-900)',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            lineHeight: '1.3'
                          }}
                        >
                          {name}
                        </h5>
                        
                        <p 
                          className="card-text text-muted mb-3" 
                          style={{ 
                            fontSize: '0.9rem',
                            fontStyle: 'italic'
                          }}
                        >
                          by {brand}
                        </p>
                        
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 
                              className="mb-0 fw-bold" 
                              style={{ 
                                color: 'var(--primary-color)',
                                fontSize: '1.25rem'
                              }}
                            >
                              {formatCurrency(price)}
                            </h5>
                            
                            {stockStatus.status === 'in-stock' && (
                              <small 
                                className="text-success fw-medium"
                                style={{ fontSize: '0.8rem' }}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                In Stock
                              </small>
                            )}
                          </div>
                          
                          <button
                            className={`btn w-100 ${isOutOfStock ? 'btn-outline-secondary' : 'btn-primary'}`}
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={isOutOfStock || isAddingThisProduct}
                            style={{
                              borderRadius: 'var(--radius-md)',
                              fontWeight: '500',
                              padding: '0.75rem 1rem',
                              transition: 'all var(--transition-normal)'
                            }}
                          >
                            {isAddingThisProduct ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Adding...
                              </>
                            ) : isOutOfStock ? (
                              <>
                                <i className="bi bi-x-circle me-2"></i>
                                Out of Stock
                              </>
                            ) : (
                              <>
                                <i className="bi bi-cart-plus me-2"></i>
                                Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;