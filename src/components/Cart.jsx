import { useContext, useState, useEffect } from "react";
import AppContext from "../Context/Context";
import CheckoutPopup from "./CheckoutPopup";
import OrderSuccessModal from "./OrderSuccessModal";
import { Button } from 'react-bootstrap';
import { toast } from "react-toastify";
import unplugged from "../assets/unplugged.png";
import { convertBase64ToDataURL, formatCurrency } from "../utils/formatters";

const Cart = () => {
  const { cart, removeFromCart, clearCart, updateCartItemQuantity } = useContext(AppContext);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const total = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cart]);

  const handleIncreaseQuantity = (itemId) => {
    const item = cart.find(item => item.id === itemId);
    if (item && item.quantity < item.stockQuantity) {
      updateCartItemQuantity(itemId, item.quantity + 1);
      toast.success("Quantity increased");
    } else {
      toast.info("Cannot add more than available stock");
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    const item = cart.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      updateCartItemQuantity(itemId, item.quantity - 1);
      toast.success("Quantity decreased");
    }
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    toast.success("Item removed from cart", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const convertImageData = (base64String, mimeType = 'image/jpeg') => {
    return convertBase64ToDataURL(base64String, unplugged, mimeType);
  };

  const handleCheckout = async (customerName, customerEmail) => {
    try {
      // Store order details for success modal
      setOrderDetails({
        items: [...cart],
        totalPrice: totalPrice,
        customerName: customerName,
        customerEmail: customerEmail
      });
      
      // Clear cart and close checkout modal
      clearCart();
      setShowModal(false);
      
      // Show success modal instead of toast
      setShowSuccessModal(true);
      
    } catch (error) {
      console.log("error during checkout", error);
      toast.error("Error during checkout", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--gray-50)', paddingTop: '6rem' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            {/* Page Header */}
            <div className="mb-5 text-center">
              <h1 className="display-5 fw-bold mb-3" style={{ color: 'var(--gray-900)' }}>
                <i className="bi bi-cart3 me-3" style={{ color: 'var(--primary-color)' }}></i>
                Shopping Cart
              </h1>
              <p className="text-muted">
                {cart.length === 0 ? 'Your cart is empty' : `${cart.length} item${cart.length !== 1 ? 's' : ''} in your cart`}
              </p>
            </div>

            {cart.length === 0 ? (
              /* Empty Cart State */
              <div className="text-center py-5 animate-fadeIn">
                <div 
                  className="card mx-auto" 
                  style={{ 
                    maxWidth: '500px',
                    border: 'none',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div className="card-body p-5">
                    <div className="mb-4">
                      <i 
                        className="bi bi-cart-x" 
                        style={{ 
                          fontSize: '5rem', 
                          color: 'var(--gray-400)' 
                        }}
                      ></i>
                    </div>
                    <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
                      Your cart is empty
                    </h3>
                    <p className="text-muted mb-4">
                      Looks like you haven't added any items to your cart yet. 
                      Start shopping to fill it up!
                    </p>
                    <a 
                      href="/" 
                      className="btn btn-primary btn-lg px-5"
                      style={{
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '500'
                      }}
                    >
                      <i className="bi bi-shop me-2"></i>
                      Continue Shopping
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Cart Items */
              <div className="animate-fadeIn">
                <div 
                  className="card mb-4" 
                  style={{
                    border: 'none',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div 
                    className="card-header border-0 py-4"
                    style={{ 
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                    }}
                  >
                    <h4 className="mb-0 fw-semibold" style={{ color: 'var(--gray-900)' }}>
                      Cart Items
                    </h4>
                  </div>
                  
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                          <tr>
                            <th className="border-0 py-3 px-4 fw-semibold" style={{ color: 'var(--gray-700)' }}>
                              Product
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold text-center" style={{ color: 'var(--gray-700)' }}>
                              Price
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold text-center" style={{ color: 'var(--gray-700)' }}>
                              Quantity
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold text-center" style={{ color: 'var(--gray-700)' }}>
                              Total
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold text-center" style={{ color: 'var(--gray-700)' }}>
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item, index) => (
                            <tr 
                              key={item.id}
                              className="animate-slideInUp"
                              style={{ 
                                animationDelay: `${index * 100}ms`,
                                borderBottom: '1px solid var(--gray-200)'
                              }}
                            >
                              <td className="py-4 px-4">
                                <div className="d-flex align-items-center">
                                  <div className="me-3">
                                    <img
                                      src={convertImageData(item.imageData)}
                                      alt={item.name}
                                      className="rounded"
                                      style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        border: '2px solid var(--gray-200)'
                                      }}
                                      onError={(e) => {
                                        e.target.src = unplugged;
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <h6 className="mb-1 fw-semibold" style={{ color: 'var(--gray-900)' }}>
                                      {item.name}
                                    </h6>
                                    <small className="text-muted">by {item.brand}</small>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="py-4 px-4 text-center">
                                <span className="fw-semibold" style={{ color: 'var(--gray-900)' }}>
                                  {formatCurrency(item.price)}
                                </span>
                              </td>
                              
                              <td className="py-4 px-4 text-center">
                                <div className="d-flex justify-content-center">
                                  <div 
                                    className="input-group" 
                                    style={{ 
                                      width: '140px',
                                      borderRadius: 'var(--radius-md)',
                                      overflow: 'hidden',
                                      boxShadow: 'var(--shadow-sm)'
                                    }}
                                  >
                                    <button
                                      className="btn btn-outline-secondary border-end-0"
                                      type="button"
                                      onClick={() => handleDecreaseQuantity(item.id)}
                                      style={{
                                        borderColor: 'var(--gray-300)',
                                        color: 'var(--gray-600)'
                                      }}
                                    >
                                      <i className="bi bi-dash"></i>
                                    </button>
                                    <input
                                      type="text"
                                      className="form-control text-center border-0 fw-semibold"
                                      value={item.quantity}
                                      readOnly
                                      style={{
                                        backgroundColor: 'var(--gray-50)',
                                        color: 'var(--gray-900)'
                                      }}
                                    />
                                    <button
                                      className="btn btn-outline-secondary border-start-0"
                                      type="button"
                                      onClick={() => handleIncreaseQuantity(item.id)}
                                      style={{
                                        borderColor: 'var(--gray-300)',
                                        color: 'var(--gray-600)'
                                      }}
                                    >
                                      <i className="bi bi-plus"></i>
                                    </button>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="py-4 px-4 text-center">
                                <span className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </td>
                              
                              <td className="py-4 px-4 text-center">
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  style={{
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.5rem 0.75rem'
                                  }}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="row">
                  <div className="col-lg-8">
                    {/* Continue Shopping Button */}
                    <a 
                      href="/" 
                      className="btn btn-outline-secondary"
                      style={{
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '500',
                        padding: '0.75rem 2rem'
                      }}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Continue Shopping
                    </a>
                  </div>
                  
                  <div className="col-lg-4">
                    <div 
                      className="card" 
                      style={{
                        border: 'none',
                        borderRadius: 'var(--radius-xl)',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                    >
                      <div 
                        className="card-header border-0 py-4"
                        style={{ 
                          backgroundColor: 'var(--primary-light)',
                          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                        }}
                      >
                        <h5 className="mb-0 fw-semibold" style={{ color: 'var(--primary-color)' }}>
                          Order Summary
                        </h5>
                      </div>
                      
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted">Subtotal:</span>
                          <span className="fw-semibold" style={{ color: 'var(--gray-900)' }}>
                            {formatCurrency(totalPrice)}
                          </span>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="text-muted">Shipping:</span>
                          <span className="fw-semibold text-success">Free</span>
                        </div>
                        
                        <hr style={{ borderColor: 'var(--gray-200)' }} />
                        
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="mb-0 fw-bold" style={{ color: 'var(--gray-900)' }}>Total:</h5>
                          <h4 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>
                            {formatCurrency(totalPrice)}
                          </h4>
                        </div>

                        <div className="d-grid">
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() => setShowModal(true)}
                            style={{
                              borderRadius: 'var(--radius-md)',
                              fontWeight: '600',
                              padding: '1rem',
                              fontSize: '1.1rem'
                            }}
                          >
                            <i className="bi bi-credit-card me-2"></i>
                            Proceed to Checkout
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        cartItems={cart}
        totalPrice={totalPrice}
        onOrderSuccess={handleCheckout}
      />

      {/* Order Success Modal */}
      {orderDetails && (
        <OrderSuccessModal
          show={showSuccessModal}
          handleClose={() => {
            setShowSuccessModal(false);
            setOrderDetails(null);
          }}
          orderItems={orderDetails.items}
          totalPrice={orderDetails.totalPrice}
          customerName={orderDetails.customerName}
        />
      )}
    </div>
  );
};

export default Cart;