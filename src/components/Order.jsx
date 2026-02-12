import axios from '../axios';
import React, { useEffect, useState } from 'react';
import { formatDateIndian, formatCurrency } from '../utils/formatters';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`/orders`);
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError("Failed to fetch orders. Please try again later.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PLACED':
        return { bg: 'var(--primary-light)', color: 'var(--primary-color)', icon: 'bi-clock' };
      case 'SHIPPED':
        return { bg: 'var(--warning-light)', color: 'var(--warning-color)', icon: 'bi-truck' };
      case 'DELIVERED':
        return { bg: 'var(--success-light)', color: 'var(--success-color)', icon: 'bi-check-circle' };
      case 'CANCELLED':
        return { bg: 'var(--error-light)', color: 'var(--error-color)', icon: 'bi-x-circle' };
      default:
        return { bg: 'var(--gray-200)', color: 'var(--gray-600)', icon: 'bi-question-circle' };
    }
  };

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center animate-fadeIn">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 style={{ color: 'var(--gray-700)' }}>Loading your orders...</h5>
          <p className="text-muted">Please wait while we fetch your order history</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="text-center animate-fadeIn">
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle" style={{ fontSize: '4rem', color: 'var(--error-color)' }}></i>
          </div>
          <h4 className="mb-3" style={{ color: 'var(--gray-900)' }}>Unable to Load Orders</h4>
          <p className="text-muted mb-4">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--gray-50)', paddingTop: '6rem' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            {/* Page Header */}
            <div className="text-center mb-5 animate-fadeIn">
              <h1 className="display-5 fw-bold mb-3" style={{ color: 'var(--gray-900)' }}>
                <i className="bi bi-box-seam me-3" style={{ color: 'var(--primary-color)' }}></i>
                Order Management
              </h1>
              <p className="text-muted">
                {orders.length === 0 ? 'No orders found' : `Manage and track your ${orders.length} order${orders.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {orders.length === 0 ? (
              /* Empty Orders State */
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
                        className="bi bi-box" 
                        style={{ 
                          fontSize: '5rem', 
                          color: 'var(--gray-400)' 
                        }}
                      ></i>
                    </div>
                    <h3 className="mb-3" style={{ color: 'var(--gray-900)' }}>
                      No Orders Yet
                    </h3>
                    <p className="text-muted mb-4">
                      You haven't placed any orders yet. Start shopping to see your orders here!
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
                      Start Shopping
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Orders List */
              <div className="animate-fadeIn">
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
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h4 className="mb-0 fw-semibold" style={{ color: 'var(--gray-900)' }}>
                        All Orders ({orders.length})
                      </h4>
                      <div className="d-flex gap-2">
                        <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                          Total Orders: {orders.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                          <tr>
                            <th className="border-0 py-3 px-4 fw-semibold" style={{ color: 'var(--gray-700)' }}>
                              Order Details
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold" style={{ color: 'var(--gray-700)' }}>
                              Customer
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold" style={{ color: 'var(--gray-700)' }}>
                              Date
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold" style={{ color: 'var(--gray-700)' }}>
                              Status
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold text-center" style={{ color: 'var(--gray-700)' }}>
                              Items
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold text-end" style={{ color: 'var(--gray-700)' }}>
                              Total
                            </th>
                            <th className="border-0 py-3 px-4 fw-semibold text-center" style={{ color: 'var(--gray-700)' }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, index) => {
                            const statusInfo = getStatusClass(order.status);
                            return (
                              <React.Fragment key={order.orderId}>
                                <tr 
                                  className="animate-slideInUp"
                                  style={{ 
                                    animationDelay: `${index * 100}ms`,
                                    borderBottom: '1px solid var(--gray-200)'
                                  }}
                                >
                                  <td className="py-4 px-4">
                                    <div>
                                      <h6 className="mb-1 fw-semibold" style={{ color: 'var(--gray-900)' }}>
                                        #{order.orderId}
                                      </h6>
                                      <small className="text-muted">Order ID</small>
                                    </div>
                                  </td>
                                  
                                  <td className="py-4 px-4">
                                    <div>
                                      <div className="fw-semibold mb-1" style={{ color: 'var(--gray-900)' }}>
                                        {order.customerName}
                                      </div>
                                      <small className="text-muted">{order.email}</small>
                                    </div>
                                  </td>
                                  
                                  <td className="py-4 px-4">
                                    <div className="fw-medium" style={{ color: 'var(--gray-700)' }}>
                                      {formatDateIndian(order.orderDate)}
                                    </div>
                                  </td>
                                  
                                  <td className="py-4 px-4">
                                    <span 
                                      className="badge d-flex align-items-center gap-1"
                                      style={{ 
                                        backgroundColor: statusInfo.bg,
                                        color: statusInfo.color,
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: '500',
                                        width: 'fit-content'
                                      }}
                                    >
                                      <i className={`bi ${statusInfo.icon}`}></i>
                                      {order.status}
                                    </span>
                                  </td>
                                  
                                  <td className="py-4 px-4 text-center">
                                    <span 
                                      className="badge"
                                      style={{ 
                                        backgroundColor: 'var(--gray-200)',
                                        color: 'var(--gray-700)',
                                        borderRadius: 'var(--radius-md)'
                                      }}
                                    >
                                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                    </span>
                                  </td>
                                  
                                  <td className="py-4 px-4 text-end">
                                    <div className="fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                                      {formatCurrency(calculateOrderTotal(order.items))}
                                    </div>
                                  </td>
                                  
                                  <td className="py-4 px-4 text-center">
                                    <button 
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => toggleOrderDetails(order.orderId)}
                                      style={{
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: '500',
                                        padding: '0.5rem 1rem'
                                      }}
                                    >
                                      {expandedOrder === order.orderId ? (
                                        <>
                                          <i className="bi bi-eye-slash me-1"></i>
                                          Hide Details
                                        </>
                                      ) : (
                                        <>
                                          <i className="bi bi-eye me-1"></i>
                                          View Details
                                        </>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                                
                                {/* Expanded Order Details */}
                                {expandedOrder === order.orderId && (
                                  <tr className="animate-slideInUp">
                                    <td colSpan="7" className="p-0">
                                      <div 
                                        className="p-4"
                                        style={{ 
                                          backgroundColor: 'var(--gray-50)',
                                          borderTop: '1px solid var(--gray-200)'
                                        }}
                                      >
                                        <h6 className="mb-3 fw-semibold" style={{ color: 'var(--gray-900)' }}>
                                          <i className="bi bi-list-ul me-2" style={{ color: 'var(--primary-color)' }}></i>
                                          Order Items
                                        </h6>
                                        
                                        <div 
                                          className="table-responsive"
                                          style={{
                                            borderRadius: 'var(--radius-lg)',
                                            overflow: 'hidden',
                                            boxShadow: 'var(--shadow-sm)'
                                          }}
                                        >
                                          <table className="table table-sm mb-0" style={{ backgroundColor: 'white' }}>
                                            <thead style={{ backgroundColor: 'var(--primary-light)' }}>
                                              <tr>
                                                <th className="py-3 px-4 fw-semibold" style={{ color: 'var(--primary-color)' }}>
                                                  Product Name
                                                </th>
                                                <th className="py-3 px-4 fw-semibold text-center" style={{ color: 'var(--primary-color)' }}>
                                                  Quantity
                                                </th>
                                                <th className="py-3 px-4 fw-semibold text-end" style={{ color: 'var(--primary-color)' }}>
                                                  Total Price
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {order.items.map((item, itemIndex) => (
                                                <tr key={itemIndex} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                                  <td className="py-3 px-4">
                                                    <div className="fw-medium" style={{ color: 'var(--gray-900)' }}>
                                                      {item.productName}
                                                    </div>
                                                  </td>
                                                  <td className="py-3 px-4 text-center">
                                                    <span 
                                                      className="badge"
                                                      style={{ 
                                                        backgroundColor: 'var(--gray-200)',
                                                        color: 'var(--gray-700)',
                                                        borderRadius: 'var(--radius-sm)'
                                                      }}
                                                    >
                                                      {item.quantity}
                                                    </span>
                                                  </td>
                                                  <td className="py-3 px-4 text-end">
                                                    <span className="fw-semibold" style={{ color: 'var(--gray-900)' }}>
                                                      {formatCurrency(item.totalPrice)}
                                                    </span>
                                                  </td>
                                                </tr>
                                              ))}
                                              
                                              {/* Order Total Row */}
                                              <tr style={{ backgroundColor: 'var(--primary-light)' }}>
                                                <td colSpan="2" className="py-3 px-4 text-end fw-bold" style={{ color: 'var(--primary-color)' }}>
                                                  Order Total:
                                                </td>
                                                <td className="py-3 px-4 text-end fw-bold" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                                                  {formatCurrency(calculateOrderTotal(order.items))}
                                                </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;