import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import Button from '../../components/shared/Button';
import AdminPagination from '../../components/admin/AdminPagination';
import TableControls from '../../components/admin/TableControls';
import { toast } from 'react-hot-toast';
import { productService } from '../../lib/productService';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const ITEMS_PER_PAGE = 10;

  // Get currency symbol based on product's country
  const getCurrencySymbol = (countryCode: string) => {
    const countryCurrencyMap: { [key: string]: string } = {
      'US': '$', 'CA': '$', 'AU': '$', 'NZ': '$',
      'GB': '£',
      'EU': '€', 'DE': '€', 'FR': '€', 'IT': '€', 'ES': '€',
      'IN': '₹',
      'NP': '₹', // Nepal uses Nepalese Rupee (₹)
      'JP': '¥',
      'CN': '¥',
      'KR': '₩',
      'RU': '₽',
      'BR': 'R$',
      'MX': '$',
      'Global': '$'
    };
    
    return countryCurrencyMap[countryCode] || '$';
  };

  // Format price with correct currency symbol
  const formatPrice = (price: number, countryCode: string) => {
    const currencySymbol = getCurrencySymbol(countryCode);
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  // Fetch products from ADMIN API with pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔄 Fetching page ${currentPage} with search: ${searchTerm}...`);
        
        // Use the new paginated method
        const response = await productService.getProductsPaginated(currentPage, ITEMS_PER_PAGE, searchTerm || undefined);
        console.log('📦 Paginated response:', response);
        
        if (response && response.products && Array.isArray(response.products)) {
          setProducts(response.products);
          setPagination(response.pagination);
          console.log(`✅ Loaded ${response.products.length} products for page ${currentPage}`);
        } else {
          console.warn('❌ Invalid response structure:', response);
          setError('Invalid response format from server');
        }
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        setError('Failed to load products');
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchTerm]);

  const handleDelete = async (id: number) => {
    toast(
      (t) => (
        <div className="p-4 bg-white rounded-lg shadow-lg">
          <p className="text-center text-sm text-slate-700 mb-4">Are you sure you want to delete this product?</p>
          <div className="flex justify-center space-x-3">
            <Button variant="secondary" size="sm" onClick={() => toast.dismiss(t.id)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                try {
                  await productService.deleteProduct(id);
                  setProducts(prev => prev.filter(p => p.id !== id));
                  toast.dismiss(t.id);
                  toast.success("Product deleted successfully.");
                } catch (error) {
                  console.error('❌ Error deleting product:', error);
                  const errorMessage = (error as any).message || "Failed to delete product.";
                  toast.dismiss(t.id);
                  toast.error(errorMessage);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );
  };

  const filteredProducts = products; // Already filtered by backend

  const paginatedProducts = products; // Already paginated by backend

  const totalPages = pagination.totalPages;

  const columnsForExport = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Name', accessor: 'name' },
    { Header: 'SKU', accessor: 'sku' },
    { Header: 'Category', accessor: (row: Product) => row.category?.name || 'N/A' },
    { Header: 'Brand', accessor: (row: Product) => row.brand?.name || 'N/A' },
    { Header: 'Price', accessor: 'price' },
    { Header: 'Stock', accessor: (row: Product) => {
      const stock = row.variants?.[0]?.options?.reduce((total, option) => total + (option.stock || 0), 0) || 0;
      return stock;
    }},
    { Header: 'Country', accessor: 'country' },
    { Header: 'Currency', accessor: (row: Product) => getCurrencySymbol(row.country || 'Global') }, // Added currency symbol for export
  ];

  // Function to get the first image or placeholder
  const getFirstImage = (product: Product) => {
    if (product.images && product.images.length > 0 && product.images[0].url) {
      return product.images[0].url;
    }
    return '/placeholder-image.png';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading products from admin API...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
        <Button 
          onClick={() => window.location.reload()} 
          className="ml-4"
          variant="secondary"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <TableControls
        title="Products (Admin)"
        onSearch={setSearchTerm}
        exportData={filteredProducts}
        exportColumns={columnsForExport}
        actionButton={
          <Link to="/admin/products/new">
            <Button>Add New Product</Button>
          </Link>
        }
      />
      
      <div className="bg-white rounded-xl shadow-soft-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                <th className="p-4">Image</th>
                <th className="p-4">Name & SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Country</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    {searchTerm ? 'No products found matching your search.' : 'No products available.'}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const firstImage = getFirstImage(product);
                  const stock = product.variants?.[0]?.options?.reduce((total, option) => total + (option.stock || 0), 0) || 0;
                  const imageCount = product.images?.length || 0;
                  const productCountry = product.country || 'Global';
                  
                  return (
                    <tr key={product.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                      <td className="p-4">
                        <div className="relative inline-block">
                          <img 
                            src={firstImage} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded-md bg-slate-100 shadow-sm border border-slate-200"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).src = '/placeholder-image.png';
                            }}
                          />
                          {imageCount > 1 && (
                            <div className="absolute -top-2 -right-2 bg-primaryEnd text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-white">
                              +{imageCount - 1}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 max-w-xs truncate">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.sku}</div>
                      </td>
                      <td className="p-4">{product.category?.name || 'N/A'}</td>
                      <td className="p-4">{product.brand?.name || 'N/A'}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {formatPrice(product.price, productCountry)}
                        </div>
                        {product.mrp && product.mrp > product.price && (
                          <div className="text-xs text-slate-500 line-through">
                            {formatPrice(product.mrp, productCountry)}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {productCountry}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {product.isFeatured && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Featured</span>
                          )}
                          {product.isTrending && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Trending</span>
                          )}
                          {!product.isActive && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Link 
                            to={`/admin/products/edit/${product.slug}`} 
                            className="text-slate-500 hover:text-primaryEnd p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold transition-colors"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(product.id!)} 
                            className="text-slate-500 hover:text-coral p-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
};

export default ProductListPage;