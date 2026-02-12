import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, convertBase64ToDataURL } from '../utils/formatters';
import unplugged from '../assets/unplugged.png';

const OrderSuccessModal = ({ show, handleClose, orderItems, totalPrice, customerName }) => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    handleClose();
    navigate('/');
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg"
      className="order-success-modal"
      backdrop="static"
    >
      <Modal.Header className="border-0 pb-0 position-relative">
        <button
          type="button"
          className="btn-close position-absolute"
          style={{ top: '1rem', right: '1rem', zIndex: 10 }}
          onClick={handleClose}
          aria-label="Close"
        ></button>
        
        <div className="w-100 text-center">
          {/* Success Icon with Animation */}
          <div className="success-icon-container mb-4">
            <div className="success-icon animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div 
                className="success-checkmark"
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--success-color) 0%, var(--success-hover) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'scaleIn 0.5s ease-out'
                  }}
                >
                  <i 
                    className="bi bi-check-circle-fill" 
                    style={{ 
                      fontSize: '3.5rem',
                      color: 'white',
                      animation: 'checkmarkDraw 0.6s ease-out 0.3s both'
                    }}
                  ></i>
                </div>
                {/* Pulse Ring Animation */}
                <div 
                  className="pulse-ring"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '3px solid var(--success-color)',
                    animation: 'pulse 2s infinite'
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <Modal.Title 
            className="h3 mb-2 animate-slideInUp" 
            style={{ 
              color: 'var(--success-color)',
              fontWeight: '700',
              animationDelay: '0.2s'
            }}
          >
            Order Successfully Placed!
          </Modal.Title>
          <p 
            className="text-muted mb-0 animate-slideInUp" 
            style={{ 
              fontSize: '1.125rem',
              animationDelay: '0.3s'
            }}
          >
            Thank you for your purchase, <strong>{customerName}</strong>
          </p>
        </div>
      </Modal.Header>
      
      <Modal.Body className="pt-4">
        <div className="order-summary animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <h5 
            className="mb-4 text-center fw-semibold" 
            style={{ color: 'var(--gray-900)' }}
          >
            <i className="bi bi-list-ul me-2" style={{ color: 'var(--primary-color)' }}></i>
            Order Summary
          </h5>
          
          {/* Order Items */}
          <div 
            className="order-items mb-4"
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}
          >
            {orderItems.map((item, index) => (
              <div 
                key={item.id} 
                className="order-item d-flex align-items-center p-3 mb-3 bg-white rounded-lg animate-slideInUp"
                style={{ 
                  animationDelay: `${0.5 + index * 0.1}s`,
                  border: '1px solid var(--gray-200)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition-normal)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="item-image me-3">
                  <img
                    src={convertBase64ToDataURL(item.imageData, unplugged)}
                    alt={item.name}
                    className="rounded"
                    style={{ 
                      width: '70px', 
                      height: '70px', 
                      objectFit: 'cover',
                      border: '2px solid var(--gray-200)'
                    }}
                    onError={(e) => {
                      e.target.src = unplugged;
                    }}
                  />
                </div>
                
                <div className="item-details flex-grow-1">
                  <h6 className="mb-1 fw-semibold" style={{ color: 'var(--gray-900)' }}>
                    {item.name}
                  </h6>
                  <p className="mb-2 text-muted small">by {item.brand}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span 
                      className="badge"
                      style={{
                        backgroundColor: 'var(--gray-100)',
                        color: 'var(--gray-700)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '500'
                      }}
                    >
                      Qty: {item.quantity}
                    </span>
                    <span className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.125rem' }}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Total */}
          <div 
            className="order-total mt-4 pt-4 border-top animate-slideInUp"
            style={{ animationDelay: `${0.5 + orderItems.length * 0.1}s` }}
          >
            <div 
              className="d-flex justify-content-between align-items-center p-3 rounded-lg"
              style={{ 
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <h5 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>
                Total Amount:
              </h5>
              <h4 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.75rem' }}>
                {formatCurrency(totalPrice)}
              </h4>
            </div>
          </div>
          
          {/* Order Info */}

        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-0 pt-0 pb-4">
        <div className="w-100 d-flex gap-3">
          <Button 
            variant="outline-secondary" 
            onClick={handleClose}
            className="flex-fill"
            style={{
              borderRadius: 'var(--radius-md)',
              fontWeight: '500',
              padding: '0.75rem 1.5rem'
            }}
          >
            <i className="bi bi-x-lg me-2"></i>
            Close
          </Button>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleContinueShopping}
            className="flex-fill"
            style={{
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
              border: 'none',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Continue Shopping
          </Button>
        </div>
      </Modal.Footer>
      
      <style jsx>{`
        .order-success-modal .modal-content {
          border: none;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }
        
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes checkmarkDraw {
          0% {
            transform: scale(0) rotate(45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(45deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        
        .order-item {
          transition: all 0.3s ease;
        }
        
        .order-item:hover {
          border-color: var(--primary-light) !important;
        }
      `}</style>
    </Modal>
  );
};

export default OrderSuccessModal;
