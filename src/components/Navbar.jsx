import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import { CATEGORIES } from "../constants/categories";
import { convertBase64ToDataURL, formatCurrency } from "../utils/formatters";
import unplugged from "../assets/unplugged.png";

const Navbar = ({ onSelectCategory }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };
  
  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Add click event listener to close navbar when clicking outside
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsNavCollapsed(true);
        setShowCategoryDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initial data fetch (if needed)
  const fetchInitialData = async () => {
    try {
      const response = await axios.get('/products');
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // Toggle navbar collapse state
  const handleNavbarToggle = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  // Close navbar when a link is clicked
  const handleLinkClick = () => {
    setIsNavCollapsed(true);
  };

  // Debounced search function
  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      setNoResults(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`/products/search?keyword=${searchTerm}`);
      setSearchResults(response.data);
      setNoResults(response.data.length === 0);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
      setNoResults(true);
      setShowSearchResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (value) => {
    setInput(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms debounce delay

    setSearchTimeout(newTimeout);
  };

  // Handle search form submission (for Enter key)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    performSearch(input);
  };

  // Handle clicking outside search to close results
  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  // Handle search result click
  const handleSearchResultClick = (productId) => {
    setShowSearchResults(false);
    setInput("");
    setSearchResults([]);
    navigate(`/product/${productId}`);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
    setShowCategoryDropdown(false);
    setIsNavCollapsed(true);
  };

  const toggleCategoryDropdown = (e) => {
    e.preventDefault();
    setShowCategoryDropdown(!showCategoryDropdown);
  };
  
  const toggleTheme = () => {
    const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);
  
  return (
    <nav className="navbar navbar-expand-lg fixed-top shadow-sm" style={{ backgroundColor: 'white', borderBottom: '1px solid var(--gray-200)' }} ref={navbarRef}>
      <div className="container-fluid px-4">
        {/* Brand Logo */}
        <a 
          className="navbar-brand d-flex align-items-center" 
          href="https://soumadeep-dey-portfolio.vercel.app/" 
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            fontWeight: '700', 
            fontSize: '1.5rem', 
            color: 'var(--primary-color)',
            textDecoration: 'none',
            transition: 'all var(--transition-normal)'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = 'var(--primary-hover)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = 'var(--primary-color)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <i className="bi bi-shop me-2" style={{ fontSize: '1.3rem' }}></i>
          Soumadeep's Corner
        </a>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={handleNavbarToggle}
          aria-controls="navbarSupportedContent"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
          style={{ 
            boxShadow: 'none',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        {/* Navigation Menu */}
        <div
          className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`}
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a 
                className="nav-link fw-medium px-3 py-2 rounded-pill" 
                style={{ 
                  color: 'var(--gray-700)',
                  transition: 'all var(--transition-fast)',
                  margin: '0 0.25rem'
                }}
                href="/" 
                onClick={handleLinkClick}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--primary-light)';
                  e.target.style.color = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--gray-700)';
                }}
              >
                <i className="bi bi-house me-1"></i>
                Home
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                className="nav-link fw-medium px-3 py-2 rounded-pill" 
                style={{ 
                  color: 'var(--gray-700)',
                  transition: 'all var(--transition-fast)',
                  margin: '0 0.25rem'
                }}
                href="/add_product" 
                onClick={handleLinkClick}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--primary-light)';
                  e.target.style.color = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--gray-700)';
                }}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Add Product
              </a>
            </li>

            {/* Categories Dropdown */}
            <li className="nav-item dropdown position-relative">
              <a 
                className="nav-link dropdown-toggle fw-medium px-3 py-2 rounded-pill" 
                href="#" 
                role="button" 
                onClick={toggleCategoryDropdown}
                aria-expanded={showCategoryDropdown}
                style={{ 
                  color: 'var(--gray-700)',
                  transition: 'all var(--transition-fast)',
                  margin: '0 0.25rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--primary-light)';
                  e.target.style.color = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  if (!showCategoryDropdown) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'var(--gray-700)';
                  }
                }}
              >
                <i className="bi bi-grid me-1"></i>
                Categories
              </a>
              <ul className={`dropdown-menu ${showCategoryDropdown ? 'show' : ''}`} style={{ minWidth: '200px' }}>
                <li>
                  <a 
                    className="dropdown-item" 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategorySelect("");
                    }}
                  >
                    <i className="bi bi-grid-3x3-gap me-2"></i>
                    All Products
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                {CATEGORIES.map((category) => (
                  <li key={category.value}>
                    <a 
                      className="dropdown-item" 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategorySelect(category.value);
                      }}
                    >
                      <i className="bi bi-tag me-2"></i>
                      {category.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>

            <li className="nav-item">
              <a 
                className="nav-link fw-medium px-3 py-2 rounded-pill" 
                style={{ 
                  color: 'var(--gray-700)',
                  transition: 'all var(--transition-fast)',
                  margin: '0 0.25rem'
                }}
                href="/orders" 
                onClick={handleLinkClick}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--primary-light)';
                  e.target.style.color = 'var(--primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--gray-700)';
                }}
              >
                <i className="bi bi-box-seam me-1"></i>
                Orders
              </a>
            </li>
          </ul>
          
          {/* Right Side - Cart and Search */}
          <div className="d-flex align-items-center gap-3">
            {/* Cart Link */}
            <a 
              href="/cart" 
              className="nav-link d-flex align-items-center px-3 py-2 rounded-pill" 
              onClick={handleLinkClick}
              style={{ 
                color: 'var(--gray-700)',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--primary-light)';
                e.target.style.color = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--gray-700)';
              }}
            >
              <i className="bi bi-cart3 me-1" style={{ fontSize: '1.1rem' }}></i>
              Cart
            </a>

            {/* Search Section */}
            <div className="position-relative">
              <form className="d-flex" role="search" onSubmit={handleSubmit} id="searchForm">
                <div className="input-group" style={{ minWidth: '280px' }}>
                  <input
                    className="form-control border-end-0"
                    type="search"
                    placeholder="Search products..."
                    aria-label="Search"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onBlur={handleSearchBlur}
                    onFocus={() => input && setShowSearchResults(true)}
                    style={{
                      borderColor: 'var(--gray-300)',
                      borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                      padding: '0.75rem 1rem',
                      fontSize: '0.95rem'
                    }}
                  />
                  {isLoading ? (
                    <button
                      className="btn btn-outline-secondary border-start-0"
                      type="button"
                      disabled
                      style={{
                        borderColor: 'var(--gray-300)',
                        borderRadius: '0 var(--radius-md) var(--radius-md) 0'
                      }}
                    >
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary border-start-0"
                      type="submit"
                      style={{
                        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                        paddingLeft: '1rem',
                        paddingRight: '1rem'
                      }}
                    >
                      <i className="bi bi-search"></i>
                    </button>
                  )}
                </div>
              </form>
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div 
                  className="position-absolute bg-white border rounded-lg shadow-lg mt-1 w-100 animate-fadeIn" 
                  style={{ 
                    zIndex: 1050, 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    minWidth: '350px',
                    left: 0,
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)'
                  }}
                >
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span className="ms-2 text-muted">Searching...</span>
                    </div>
                  ) : noResults ? (
                    <div className="p-4 text-center text-muted">
                      <i className="bi bi-search mb-2 d-block" style={{ fontSize: '2rem', color: 'var(--gray-400)' }}></i>
                      <div className="fw-medium">No products found</div>
                      <small>Try searching with different keywords</small>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 border-bottom" style={{ backgroundColor: 'var(--gray-50)' }}>
                        <small className="text-muted fw-medium">
                          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                        </small>
                      </div>
                      {searchResults.slice(0, 5).map((product) => (
                        <div 
                          key={product.id}
                          className="p-3 border-bottom search-result-item"
                          style={{ 
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                          }}
                          onClick={() => handleSearchResultClick(product.id)}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <img 
                                src={convertBase64ToDataURL(product.imageData, unplugged)}
                                alt={product.name}
                                style={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  objectFit: 'cover',
                                  borderRadius: 'var(--radius-md)',
                                  border: '2px solid var(--gray-200)'
                                }}
                                className="rounded"
                                onError={(e) => {
                                  e.target.src = unplugged;
                                }}
                              />
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold text-truncate mb-1" style={{ color: 'var(--gray-900)' }}>
                                {product.name}
                              </div>
                              <div className="text-muted small mb-1">{product.brand}</div>
                              <div className="fw-bold" style={{ color: 'var(--primary-color)' }}>
                                {formatCurrency(product.price)}
                              </div>
                            </div>
                            <div className="ms-2">
                              <i className="bi bi-arrow-right" style={{ color: 'var(--gray-400)' }}></i>
                            </div>
                          </div>
                        </div>
                      ))}
                      {searchResults.length > 5 && (
                        <div className="p-3 text-center border-top" style={{ backgroundColor: 'var(--gray-50)' }}>
                          <small className="text-muted">
                            Showing first 5 results. Refine your search for more specific results.
                          </small>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;