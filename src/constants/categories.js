// Single source of truth for all product categories in the frontend
export const CATEGORIES = [
  { value: "Laptop", label: "Laptop" },
  { value: "Headphone", label: "Headphone" },
  { value: "Mobile", label: "Mobile" },
  { value: "Electronics", label: "Electronics" },
  { value: "Toys", label: "Toys" },
  { value: "Fashion", label: "Fashion" }
];

// Helper function to get category label by value
export const getCategoryLabel = (value) => {
  const category = CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value;
};

// Helper function to get all category values
export const getCategoryValues = () => CATEGORIES.map(cat => cat.value);

// Helper function to get all category labels
export const getCategoryLabels = () => CATEGORIES.map(cat => cat.label);