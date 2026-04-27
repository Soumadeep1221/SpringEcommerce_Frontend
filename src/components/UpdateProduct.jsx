import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axios";
import { toast } from "react-toastify";
import { CATEGORIES } from "../constants/categories";
import { getCategoryLabel } from "../constants/categories";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageName, setCurrentImageName] = useState("");
  const [imageChanged, setImageChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });

  // ✅ Convert blob → file
  const convertUrlToFile = async (blobData, fileName) => {
    return new File([blobData], fileName, { type: blobData.type });
  };

  // ✅ Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/product/${id}`);

        setProduct(response.data);
        setUpdateProduct(response.data);
        setCurrentImageName(response.data.imageName);

        const responseImage = await axios.get(`/product/${id}/image`, {
          responseType: "blob",
        });

        const imageFile = await convertUrlToFile(
          responseImage.data,
          response.data.imageName
        );

        setImage(imageFile);
        setImagePreview(URL.createObjectURL(imageFile));

      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product.");
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ Cleanup object URLs (VERY IMPORTANT)
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleGenerateDescription = async () => {
    if (!updateProduct.name?.trim()) {
      toast.warning("Please enter a product name first.", { autoClose: 3000, hideProgressBar: true });
      return;
    }
    if (!updateProduct.category) {
      toast.warning("Please select a category first.", { autoClose: 3000, hideProgressBar: true });
      return;
    }
    setGeneratingDesc(true);
    try {
      const response = await axios.post(`/product/generate-description`, null, {
        params: { name: updateProduct.name, category: updateProduct.category },
      });
      setUpdateProduct((prev) => ({ ...prev, description: response.data }));
      if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
      toast.success("Description generated!", { autoClose: 2000, hideProgressBar: true });
    } catch {
      toast.error("Failed to generate description. Please try again.", { autoClose: 3000, hideProgressBar: true });
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!updateProduct.name?.trim()) {
      toast.warning("Please enter a product name first.", { autoClose: 3000, hideProgressBar: true });
      return;
    }
    if (!updateProduct.category) {
      toast.warning("Please select a category first.", { autoClose: 3000, hideProgressBar: true });
      return;
    }
    if (!updateProduct.description?.trim()) {
      toast.warning("Please enter a description first.", { autoClose: 3000, hideProgressBar: true });
      return;
    }
    setGeneratingImage(true);
    try {
      const response = await axios.post(`/product/generate-image`, null, {
        params: {
          name: updateProduct.name,
          category: updateProduct.category,
          description: updateProduct.description,
        },
        responseType: "arraybuffer",
      });
      const blob = new Blob([response.data], { type: "image/jpeg" });
      const file = new File([blob], "ai-generated.jpg", { type: "image/jpeg" });
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImage(file);
      setImageChanged(true);
      setImagePreview(URL.createObjectURL(blob));
      if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
      toast.success("Image generated!", { autoClose: 2000, hideProgressBar: true });
    } catch (err) {
      let message = "Failed to generate image. Please try again.";
      if (err.response?.data) {
        try { message = new TextDecoder().decode(err.response.data); } catch (_) {}
      }
      console.error("Image generation error:", message);
      toast.error("Failed to generate image. Please try again.", { autoClose: 3000, hideProgressBar: true });
    } finally {
      setGeneratingImage(false);
    }
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const updatedProduct = new FormData();

      // Only send image if changed
      if (imageChanged && image) {
        updatedProduct.append("imageFile", image);
      }

      updatedProduct.append(
        "product",
        new Blob([JSON.stringify(updateProduct)], {
          type: "application/json",
        })
      );

      await axios.put(`/product/${id}`, updatedProduct);

      toast.success("Product updated successfully!", {
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
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setUpdateProduct({
      ...updateProduct,
      [name]: fieldValue,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          image: "Please select a valid image file (JPEG or PNG)",
        });
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size should be less than 5MB" });
        return;
      }

      setImage(file);
      setImageChanged(true);
      setErrors({ ...errors, image: null });

      // cleanup old preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Loader
  if (!product.id) {
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

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--gray-50)', paddingTop: '6rem' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-9">
            {/* Page Header */}
            <div className="text-center mb-5 animate-fadeIn">
              <h1 className="display-5 fw-bold mb-3" style={{ color: 'var(--gray-900)' }}>
                <i className="bi bi-pencil-square me-3" style={{ color: 'var(--primary-color)' }}></i>
                Update Product
              </h1>
              <p className="text-muted">
                Modify the product details below and save your changes
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
                  <i className="bi bi-info-circle me-2" style={{ color: 'var(--primary-color)' }}></i>
                  Product Information
                </h4>
              </div>

              <div className="card-body p-5">
                <form className="row g-4" onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="col-md-6">
                    <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      value={updateProduct.name}
                      onChange={handleChange}
                      name="name"
                      required
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
                      value={updateProduct.brand}
                      onChange={handleChange}
                      required
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
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-medium mb-0" style={{ color: 'var(--gray-700)' }}>
                        Description *
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={generatingDesc}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: '600',
                          border: 'none', borderRadius: 'var(--radius-md)',
                          cursor: generatingDesc ? 'not-allowed' : 'pointer',
                          background: generatingDesc ? 'var(--gray-200)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                          color: generatingDesc ? 'var(--gray-500)' : 'white',
                          boxShadow: generatingDesc ? 'none' : '0 2px 8px rgba(124,58,237,0.35)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { if (!generatingDesc) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.45)'; }}}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = generatingDesc ? 'none' : '0 2px 8px rgba(124,58,237,0.35)'; }}
                      >
                        {generatingDesc ? (
                          <><span className="spinner-border" role="status" aria-hidden="true" style={{ width: '0.75rem', height: '0.75rem', borderWidth: '2px' }}></span>Generating...</>
                        ) : (
                          <><i className="bi bi-stars"></i>AI Generate</>
                        )}
                      </button>
                    </div>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      value={updateProduct.description}
                      name="description"
                      onChange={handleChange}
                      rows="4"
                      required
                      placeholder="Enter product description or click AI Generate above"
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
                        className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                        value={updateProduct.price}
                        name="price"
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
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
                      value={updateProduct.category}
                      onChange={handleChange}
                      name="category"
                      required
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

                  {/* Stock */}
                  <div className="col-md-4">
                    <label className="form-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.stockQuantity ? 'is-invalid' : ''}`}
                      value={updateProduct.stockQuantity}
                      name="stockQuantity"
                      onChange={handleChange}
                      min="0"
                      required
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
                      className={`form-control ${errors.releaseDate ? 'is-invalid' : ''}`}
                      value={
                        updateProduct.releaseDate
                          ? updateProduct.releaseDate.slice(0, 10)
                          : ""
                      }
                      name="releaseDate"
                      onChange={handleChange}
                      required
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

                  {/* ⭐ IMAGE SECTION (PROFESSIONAL UX) */}
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label fw-medium mb-0" style={{ color: 'var(--gray-700)' }}>
                        Product Image
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateImage}
                        disabled={generatingImage}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: '600',
                          border: 'none', borderRadius: 'var(--radius-md)',
                          cursor: generatingImage ? 'not-allowed' : 'pointer',
                          background: generatingImage ? 'var(--gray-200)' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                          color: generatingImage ? 'var(--gray-500)' : 'white',
                          boxShadow: generatingImage ? 'none' : '0 2px 8px rgba(124,58,237,0.35)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => { if (!generatingImage) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.45)'; }}}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = generatingImage ? 'none' : '0 2px 8px rgba(124,58,237,0.35)'; }}
                      >
                        {generatingImage ? (
                          <><span className="spinner-border" role="status" aria-hidden="true" style={{ width: '0.75rem', height: '0.75rem', borderWidth: '2px' }}></span>Generating...</>
                        ) : (
                          <><i className="bi bi-stars"></i>AI Generate</>
                        )}
                      </button>
                    </div>

                    {imagePreview && (
                      <div className="mb-3">
                        <div 
                          className="border rounded-lg p-3 text-center"
                          style={{ 
                            backgroundColor: 'var(--gray-50)',
                            borderColor: 'var(--gray-200)'
                          }}
                        >
                          <img
                            src={imagePreview}
                            alt="product preview"
                            className="img-fluid rounded"
                            style={{ 
                              maxHeight: "200px", 
                              maxWidth: "200px",
                              objectFit: "contain",
                              border: '2px solid var(--gray-200)'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Show existing filename */}
                    {!imageChanged && currentImageName && (
                      <div 
                        className="mb-2 p-2 rounded"
                        style={{ 
                          backgroundColor: 'var(--gray-50)',
                          color: 'var(--gray-600)',
                          fontSize: '0.875rem'
                        }}
                      >
                        <i className="bi bi-file-image me-2"></i>
                        Current file: <strong>{currentImageName}</strong>
                      </div>
                    )}

                    {/* Show new filename + size */}
                    {imageChanged && image && (
                      <div 
                        className="mb-2 p-2 rounded"
                        style={{ 
                          backgroundColor: 'var(--success-light)',
                          color: 'var(--success-color)',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        New file: <strong>{image.name}</strong> ({(image.size / 1024).toFixed(2)} KB)
                      </div>
                    )}

                    <input
                      className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                      type="file"
                      onChange={handleImageChange}
                      accept="image/png, image/jpeg"
                      style={{
                        borderColor: errors.image ? 'var(--error-color)' : 'var(--gray-300)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem'
                      }}
                    />
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Upload a new image only if you want to replace the existing one. (JPEG or PNG, max 5MB)
                    </div>
                    {errors.image && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.image}
                      </div>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="col-12">
                    <div 
                      className="form-check p-3 rounded"
                      style={{ 
                        backgroundColor: 'var(--gray-50)',
                        border: '1px solid var(--gray-200)'
                      }}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="productAvailable"
                        checked={updateProduct.productAvailable}
                        onChange={handleChange}
                        style={{
                          borderColor: 'var(--gray-300)',
                          borderRadius: 'var(--radius-sm)',
                          width: '1.25rem',
                          height: '1.25rem'
                        }}
                      />
                      <label className="form-check-label fw-medium" style={{ color: 'var(--gray-700)' }}>
                        Product Available for Sale
                      </label>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="col-12 mt-4 pt-4 border-top">
                    <div className="d-flex gap-3 justify-content-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/")}
                        disabled={loading}
                        style={{
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '500',
                          padding: '0.75rem 2rem'
                        }}
                      >
                        <i className="bi bi-x-lg me-2"></i>
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
                          minWidth: '180px'
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Update Product
                          </>
                        )}
                      </button>
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

export default UpdateProduct;
