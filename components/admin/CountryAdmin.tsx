// components/admin/CountryAdminPage.tsx
import React, { useState, useEffect } from 'react';
import { countryService, Country } from '../../lib/countryService';
import { toast } from 'react-hot-toast';
import Button from '../../components/shared/Button';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import { Edit2, Trash2, ToggleLeft, ToggleRight, Plus, X, Globe } from 'lucide-react';

const CountryAdminPage: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Country>>({
    name: '',
    code: '',
    currency: '',
    currencySymbol: '',
    flag: '',
    isActive: true,
    isGlobal: false,
    sortOrder: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchCountries();
  }, [currentPage, statusFilter]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await countryService.getAllCountries({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE'
      });
      setCountries(response.countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedCountry?.id) {
        await countryService.updateCountry(selectedCountry.id, formData);
        toast.success('Country updated successfully');
      } else {
        await countryService.createCountry(formData as Country);
        toast.success('Country created successfully');
      }
      setEditing(false);
      setSelectedCountry(null);
      setFormData({
        name: '',
        code: '',
        currency: '',
        currencySymbol: '',
        flag: '',
        isActive: true,
        isGlobal: false,
        sortOrder: 0
      });
      fetchCountries();
    } catch (error: any) {
      console.error('Error saving country:', error);
      toast.error(error.message || 'Failed to save country');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (country: Country) => {
    setSelectedCountry(country);
    setFormData(country);
    setEditing(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await countryService.toggleCountryStatus(id);
      toast.success('Status updated successfully');
      fetchCountries();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      try {
        await countryService.deleteCountry(id);
        toast.success('Country deleted successfully');
        fetchCountries();
      } catch (error) {
        console.error('Error deleting country:', error);
        toast.error('Failed to delete country');
      }
    }
  };

  // Predefined country data for quick adding
  const predefinedCountries: Partial<Country>[] = [
    { name: 'United States', code: 'US', currency: 'USD', currencySymbol: '$', flag: '🇺🇸' },
    { name: 'United Kingdom', code: 'UK', currency: 'GBP', currencySymbol: '£', flag: '🇬🇧' },
    { name: 'European Union', code: 'EU', currency: 'EUR', currencySymbol: '€', flag: '🇪🇺' },
    { name: 'Canada', code: 'CA', currency: 'CAD', currencySymbol: 'C$', flag: '🇨🇦' },
    { name: 'Australia', code: 'AU', currency: 'AUD', currencySymbol: 'A$', flag: '🇦🇺' },
    { name: 'Japan', code: 'JP', currency: 'JPY', currencySymbol: '¥', flag: '🇯🇵' },
    { name: 'Global (Fallback)', code: 'Global', currency: 'USD', currencySymbol: '$', flag: '🌍', isGlobal: true }
  ];

  const addPredefinedCountry = async (countryData: Partial<Country>) => {
    try {
      setLoading(true);
      await countryService.createCountry(countryData as Country);
      toast.success('Country added successfully');
      fetchCountries();
    } catch (error: any) {
      console.error('Error adding predefined country:', error);
      toast.error(error.message || 'Failed to add country');
    } finally {
      setLoading(false);
    }
  };

  const columnsForExport = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Name', accessor: 'name' },
    { Header: 'Code', accessor: 'code' },
    { Header: 'Currency', accessor: 'currency' },
    { Header: 'Currency Symbol', accessor: 'currencySymbol' },
    { Header: 'Status', accessor: (row: Country) => row.isActive ? 'Active' : 'Inactive' },
    { Header: 'Type', accessor: (row: Country) => row.isGlobal ? 'Global (Fallback)' : 'Country' },
    { Header: 'Created At', accessor: (row: Country) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' },
  ];

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);

  if (loading && countries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading countries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
   

        <TableControls
        title="Countries"
        onSearch={setSearchTerm}
        exportData={filteredCountries}
        exportColumns={columnsForExport}
        actionButton={
          <Button onClick={() => {
            setEditing(true);
            setSelectedCountry(null);
            setFormData({
              name: '',
              code: '',
              currency: '',
              currencySymbol: '',
              flag: '',
              isActive: true,
              isGlobal: false,
              sortOrder: 0
            });
          }}>Add New Country</Button>
        }
        showFilters={true}
      />

      {/* Quick Add Predefined Countries */}
      <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Add Common Countries</h2>
        <div className="flex flex-wrap gap-2">
          {predefinedCountries.map((country, index) => (
            <Button
              key={index}
              onClick={() => addPredefinedCountry(country)}
              disabled={loading}
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <span className="mr-2">{country.flag}</span>
              {country.name}
            </Button>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-3">
          <strong>Global (Fallback):</strong> This serves as the default option when a specific country is not available or for international users.
        </p>
      </div>

      {editing ? (
        <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedCountry ? 'Edit Country' : 'Add New Country'}
            </h2>
            <button
              onClick={() => setEditing(false)}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Country Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Enter country name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Country Code (ISO 3166-1) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={2}
                  required
                  placeholder="US, UK, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Currency Code (ISO 4217) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currency || ''}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={3}
                  required
                  placeholder="USD, EUR, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Currency Symbol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol || ''}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="$, £, €, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Flag (Emoji) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.flag || ''}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="🇺🇸"
                  required
                />
                <div className="mt-2 text-xs text-slate-500">
                  Preview: {formData.flag && (
                    <span className="text-2xl ml-2">{formData.flag}</span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder || 0}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isGlobal || false}
                  onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Global Option</span>
                  <div className="text-xs text-slate-500">Fallback for unknown countries</div>
                </div>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary-gradient hover:opacity-90 text-white disabled:opacity-50"
              >
                {loading ? 'Saving...' : (selectedCountry ? 'Update Country' : 'Create Country')}
              </Button>
              <Button
                type="button"
                onClick={() => setEditing(false)}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-soft-md overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-slate-500 uppercase border-b bg-slate-50">
                    <th className="p-4">Country</th>
                    <th className="p-4">Currency</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Sort Order</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredCountries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        {searchTerm || statusFilter !== 'ALL' 
                          ? 'No countries found matching your criteria.' 
                          : 'No countries available. Click "Add New Country" to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCountries.map((country) => (
                      <tr key={country.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{country.flag}</span>
                            <div>
                              <div className="font-semibold text-slate-800">{country.name}</div>
                              <div className="text-xs text-slate-500 font-mono">{country.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-800">
                            <span className="font-medium">{country.currencySymbol}</span>
                            <span className="text-slate-600 ml-1 font-mono text-xs">{country.currency}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => country.id && handleToggleStatus(country.id)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              country.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {country.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                            <span>{country.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            country.isGlobal 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {country.isGlobal ? (
                              <Globe className="w-3 h-3" />
                            ) : null}
                            <span>{country.isGlobal ? 'Global (Fallback)' : 'Country'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-600 font-mono text-xs">
                            {country.sortOrder || 0}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-slate-500">
                            {country.createdAt ? new Date(country.createdAt).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(country)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 text-xs font-semibold transition-colors flex items-center space-x-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => country.id && handleDelete(country.id)} 
                              className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 text-xs font-semibold transition-colors flex items-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <AdminPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CountryAdminPage;