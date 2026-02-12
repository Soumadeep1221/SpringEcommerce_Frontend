import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import AppContext from "../Context/Context";
import axios from "../axios";
import { toast } from "react-toastify";
import { convertBase64ToDataURL, formatCurrency, getStockStatus } from "../utils/formatters";
import { getCategoryLabel } from "../constants/categories";
import unplugged from "../assets/unplugged.png";

const Product = () => {
  const { id } = useParams();
  const { data, addToCart, removeFromCart, refreshData, updateStockQuantity } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [localStockQuantity, setLocalStockQuantity] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/product/${id}`);
        const productData = response.data;
        setProduct(productData);
        setLocalStockQuantity(productData.stockQuantity);
        
        // Try to fetch image
        if (productData.imageName) {
          try {
            const imageResponse = await axios.get(`/product/${id}/image`, { responseType: "blob" });
            setImageUrl(URL.createObjectURL(imageResponse.data));
          } catch (imageError) {
            console.error("Error fetching image:", imageError);
            // Fallback to base64 image data if available
            if (productData.imageData) {
              setImageUrl(convertBase64ToDataURL(productData.imageData, unplugged));
            } else {
              setImageUrl(unplugged);
            }
          }
        } else if (productData.imageData) {
          // Use base64 image data directly
          setImageUrl(convertBase64ToDataURL(productData.imageData, unplugged));
        } else {
          setImageUrl(unplugged);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    
    fetchProduct();
  }, [id]);

  // Cleanup image URL
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    let toastTimer;
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [showToast]);

  const deleteProduct = async () => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(`/product/${id}`);
      removeFromCart(id);
      refreshData();
      
      // Show professional delete success message
      toast.success("Product deleted successfully", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: 'linear-gradient(135deg, var(--success-color) 0%, var(--success-hover) 100%)',
          color: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          fontWeight: '500',
          fontSize: '1rem'
        }
      });
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again.");
      setDeleting(false);
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handleAddToCart = async () => {
    if (addingToCart) return;
    
    setAddingToCart(true);
    
    try {
      // Check if this is the last item in stock
      const isLastItem = localStockQuantity === 1;
      
      // Add to cart
      addToCart(product);
      
      // If this was the last item, immediately update the UI
      if (isLastItem) {
        setLocalStockQuantity(0);
        updateStockQuantity(product.id, 0);
      } else {
        // Update local stock quantity
        const newQuantity = localStockQuantity - 1;
        setLocalStockQuantity(newQuantity);
        updateStockQuantity(product.id, newQuantity);
      }
      
      // Show standardized notification
      setToastProduct(product);
      setShowToast(true);
      
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart");
    } finally {
      setTimeout(() => {
        setAddingToCart(false);
      }, 500);
    }
  };

  if (!product) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--gray-50)', paddingTop: '6rem' }}>
        <div className="text-center animate-fadeIn">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 style={{ color: 'var(--gray-700)' }}>Loading product details...</h5>
        </div>
      </div>
    );
  }

  const currentStock = localStockQuantity !== null ? localStockQuantity : product.stockQuantity;
  const stockStatus = getStockStatus(currentStock);
  const isOutOfStock = currentStock === 0 || !product.productAvailable;

  return (
    <>
      {/* Standardized Toast Notification */}
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
                  src={toastProduct.imageData ? convertBase64ToDataURL(toastProduct.imageData, unplugged) : unplugged} 
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
                  <small className="text-muted">by {toastProduct.brand}</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-vh-100" style={{ backgroundColor: 'var(--gray-50)', paddingTop: '6rem' }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
              <div className="row g-5">
                {/* Product Image */}
                <div className="col-md-6">
                  <div 
                    className="card border-0 animate-fadeIn"
                    style={{
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-lg)',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      className="position-relative"
                      style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        minHeight: '500px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        src={imageUrl || (product ? convertBase64ToDataURL(product.imageData, unplugged) : unplugged)}
                        alt={product.name}
                        className="img-fluid"
                        style={{ 
                          maxHeight: "500px", 
                          objectFit: "contain",
                          borderRadius: 'var(--radius-lg)'
                        }}
                        onError={(e) => {
                          e.target.src = unplugged;
                        }}
                      />
                      
                      {/* Stock Status Badge */}
                      {stockStatus.status !== 'in-stock' && (
                        <div 
                          className="position-absolute top-0 end-0 m-3"
                        >
                          <span 
                            className={`badge ${stockStatus.status === 'out-of-stock' ? 'bg-danger' : 'bg-warning'}`}
                            style={{
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              padding: '0.5rem 1rem'
                            }}
                          >
                            {stockStatus.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="col-md-6">
                  <div className="animate-slideInUp" style={{ animationDelay: '100ms' }}>
                    {/* Category and Date */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary-color)',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}
                      >
                        {getCategoryLabel(product.category)}
                      </span>
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        Listed: {(() => {
                          const date = new Date(product.releaseDate);
                          const day = date.getDate().toString().padStart(2, '0');
                          const month = (date.getMonth() + 1).toString().padStart(2, '0');
                          const year = date.getFullYear();
                          return `${day}/${month}/${year}`;
                        })()}
                      </small>
                    </div>

                    {/* Product Name */}
                    <h1 
                      className="mb-2" 
                      style={{ 
                        color: 'var(--gray-900)',
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        lineHeight: '1.2'
                      }}
                    >
                      {product.name}
                    </h1>
                    
                    {/* Brand */}
                    <p 
                      className="mb-4" 
                      style={{ 
                        color: 'var(--gray-600)',
                        fontSize: '1.125rem',
                        fontStyle: 'italic'
                      }}
                    >
                      by {product.brand}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      <h2 
                        className="fw-bold mb-0" 
                        style={{ 
                          color: 'var(--primary-color)',
                          fontSize: '2.5rem'
                        }}
                      >
                        {formatCurrency(product.price)}
                      </h2>
                    </div>

                    {/* Stock Information */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <span className="fw-medium" style={{ color: 'var(--gray-700)' }}>
                          Stock Available:
                        </span>
                        <span 
                          className={`fw-bold ${isOutOfStock ? 'text-danger' : 'text-success'}`}
                          style={{ fontSize: '1.125rem' }}
                        >
                          {currentStock} {currentStock === 1 ? 'item' : 'items'}
                        </span>
                        {stockStatus.status === 'in-stock' && (
                          <span 
                            className="badge"
                            style={{
                              backgroundColor: 'var(--success-light)',
                              color: 'var(--success-color)',
                              padding: '0.375rem 0.75rem',
                              borderRadius: 'var(--radius-md)',
                              fontWeight: '500'
                            }}
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-5">
                      <h5 
                        className="mb-3 fw-semibold" 
                        style={{ color: 'var(--gray-900)' }}
                      >
                        Product Description
                      </h5>
                      <p 
                        style={{ 
                          color: 'var(--gray-600)',
                          lineHeight: '1.8',
                          fontSize: '1rem'
                        }}
                      >
                        {product.description}
                      </p>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="mb-4">
                      <button
                        className={`btn btn-lg w-100 ${isOutOfStock ? 'btn-outline-secondary' : 'btn-primary'}`}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || addingToCart}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '600',
                          padding: '1rem 2rem',
                          fontSize: '1.125rem',
                          transition: 'all var(--transition-normal)',
                          boxShadow: isOutOfStock ? 'none' : 'var(--shadow-md)'
                        }}
                      >
                        {addingToCart ? (
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

                    {/* Action Buttons */}
                    <div className="d-flex gap-3">
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        onClick={handleEditClick}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '500',
                          padding: '0.75rem 1.5rem',
                          flex: 1
                        }}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Update Product
                      </button>

                      <button
                        className="btn btn-outline-danger"
                        type="button"
                        onClick={deleteProduct}
                        disabled={deleting}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '500',
                          padding: '0.75rem 1.5rem',
                          flex: 1
                        }}
                      >
                        {deleting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-trash me-2"></i>
                            Delete Product
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;
