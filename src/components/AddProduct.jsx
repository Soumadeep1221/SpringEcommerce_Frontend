import { useState } from "react";
import axios from "../axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CATEGORIES } from "../constants/categories";
import { formatDateIndian } from "../utils/formatters";

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setProduct({ ...product, [name]: fieldValue });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          image: "Please select a valid image file (JPEG or PNG)",
        });
      } else if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size should be less than 5MB" });
      } else {
        setErrors({ ...errors, image: null });
      }
    } else {
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (!product.brand.trim()) newErrors.brand = "Brand is required";
    if (!product.description.trim())
      newErrors.description = "Description is required";
    if (!product.price || parseFloat(product.price) <= 0)
      newErrors.price = "Price must be greater than zero";
    if (!product.category) newErrors.category = "Please select a category";
    if (!product.stockQuantity || parseInt(product.stockQuantity) < 0)
      newErrors.stockQuantity = "Stock quantity cannot be negative";
    if (!product.releaseDate)
      newErrors.releaseDate = "Release date is required";
    if (!image) newErrors.image = "Product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setValidated(true);
    if (!validateForm() || !form.checkValidity()) {
      event.stopPropagation();
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );

    axios
      .post(`/product`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        toast.success("Product added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setProduct({
          name: "",
          brand: "",
          description: "",
          price: "",
          category: "",
          stockQuantity: "",
          releaseDate: "",
          productAvailable: false,
        });
        setImage(null);
        setImagePreview(null);
        setValidated(false);
        setErrors({});
        
        // Navigate to home after a short delay to show the success message
        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          setErrors(error.response.data);
        } else {
          toast.error("Error adding product. Please try again.", {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: true,
          });
        }
        setLoading(false);
      });
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--gray-50)', paddingTop: '6rem' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-7">
            {/* Page Header */}
            <div className="text-center mb-5 animate-fadeIn">
              <h1 className="display-5 fw-bold mb-3" style={{ color: 'var(--gray-900)' }}>
                <i className="bi bi-plus-circle me-3" style={{ color: 'var(--primary-color)' }}></i>
                Add New Product
              </h1>
              <p className="text-muted">
                Fill in the details below to add a new product to your inventory
              </p>
            </div>

            {/* Form Card */}
            <div 
              className="card animate-slideInUp" 
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
                  Product Information
                </h4>
              </div>

              <div className="card-body p-5">
                <form noValidate onSubmit={submitHandler}>
                  <div className="row g-4">
                    {/* Product Name */}
                    <div className="col-md-6">
                      <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        value={product.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        style={{
                          borderColor: errors.name ? 'var(--error-color)' : 'var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 1rem'
                        }}
                      />
                      {errors.name && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.name}
                        </div>
                      )}
                    </div>

                    {/* Brand */}
                    <div className="col-md-6">
                      <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                        Brand *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        className={`form-control ${errors.brand ? 'is-invalid' : ''}`}
                        value={product.brand}
                        onChange={handleInputChange}
                        placeholder="Enter brand name"
                        style={{
                          borderColor: errors.brand ? 'var(--error-color)' : 'var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 1rem'
                        }}
                      />
                      {errors.brand && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.brand}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                        Description *
                      </label>
                      <textarea
                        name="description"
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        value={product.description}
                        onChange={handleInputChange}
                        placeholder="Enter product description"
                        rows="4"
                        style={{
                          borderColor: errors.description ? 'var(--error-color)' : 'var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 1rem',
                          resize: 'vertical'
                        }}
                      />
                      {errors.description && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.description}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="col-md-4">
                      <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                        Price (₹) *
                      </label>
                      <div className="input-group">
                        <span 
                          className="input-group-text"
                          style={{
                            backgroundColor: 'var(--gray-50)',
                            borderColor: 'var(--gray-300)',
                            color: 'var(--gray-600)'
                          }}
                        >
                          ₹
                        </span>
                        <input
                          type="number"
                          name="price"
                          className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                          value={product.price}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          style={{
                            borderColor: errors.price ? 'var(--error-color)' : 'var(--gray-300)',
                            padding: '0.75rem 1rem'
                          }}
                        />
                      </div>
                      {errors.price && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.price}
                        </div>
                      )}
                    </div>

                    {/* Category */}
                    <div className="col-md-4">
                      <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                        Category *
                      </label>
                      <select
                        className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                        value={product.category}
                        onChange={handleInputChange}
                        name="category"
                        style={{
                          borderColor: errors.category ? 'var(--error-color)' : 'var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 1rem'
                        }}
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.category}
                        </div>
                      )}
                    </div>

                    {/* Stock Quantity */}
                    <div className="col-md-4">
                      <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        className={`form-control ${errors.stockQuantity ? 'is-invalid' : ''}`}
                        value={product.stockQuantity}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        style={{
                          borderColor: errors.stockQuantity ? 'var(--error-color)' : 'var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 1rem'
                        }}
                      />
                      {errors.stockQuantity && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.stockQuantity}
                        </div>
                      )}
                    </div>

                    {/* Release Date */}
                    <div className="col-md-6">
                      <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                        Release Date *
                      </label>
                      <input
                        type="date"
                        name="releaseDate"
                        className={`form-control ${errors.releaseDate ? 'is-invalid' : ''}`}
                        value={product.releaseDate}
                        onChange={handleInputChange}
                        style={{
                          borderColor: errors.releaseDate ? 'var(--error-color)' : 'var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 1rem'
                        }}
                      />
                      {errors.releaseDate && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.releaseDate}
                        </div>
                      )}
                    </div>

                    {/* Product Available */}
                    <div className="col-md-6 d-flex align-items-end">
                      <div className="form-check" style={{ paddingBottom: '0.75rem' }}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="productAvailable"
                          checked={product.productAvailable}
                          onChange={handleInputChange}
                          style={{
                            borderColor: 'var(--gray-300)',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        />
                        <label className="form-check-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                          Product Available for Sale
                        </label>
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="col-12">
                      <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                        Product Image *
                      </label>
                      <input
                        type="file"
                        className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                        onChange={handleImageChange}
                        accept="image/jpeg,image/png"
                        style={{
                          borderColor: errors.image ? 'var(--error-color)' : 'var(--gray-300)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.75rem 1rem'
                        }}
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Upload a JPEG or PNG image (max 5MB)
                      </div>
                      {errors.image && (
                        <div className="invalid-feedback d-block">
                          <i className="bi bi-exclamation-circle me-1"></i>
                          {errors.image}
                        </div>
                      )}
                      
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="mt-3">
                          <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                            Image Preview:
                          </label>
                          <div 
                            className="border rounded-lg p-3 text-center"
                            style={{ 
                              backgroundColor: 'var(--gray-50)',
                              borderColor: 'var(--gray-200)'
                            }}
                          >
                            <img
                              src={imagePreview}
                              alt="Product Preview"
                              className="rounded"
                              style={{ 
                                maxWidth: "200px", 
                                maxHeight: "200px",
                                objectFit: "cover",
                                border: '2px solid var(--gray-200)'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-center pt-4">
                      <div className="d-flex gap-3 justify-content-center">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => navigate('/')}
                          disabled={loading}
                          style={{
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '500',
                            padding: '0.75rem 2rem'
                          }}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Cancel
                        </button>
                        
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={loading}
                          style={{
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            padding: '0.75rem 2rem',
                            minWidth: '150px'
                          }}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Adding Product...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-plus-circle me-2"></i>
                              Add Product
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
