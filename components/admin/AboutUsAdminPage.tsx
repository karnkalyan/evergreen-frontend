// components/admin/AboutUsAdminPage.tsx
import React, { useState, useEffect } from 'react';
import { aboutUsService, AboutUsData } from '../../lib/aboutUsService';
import { toast } from 'react-hot-toast';
import Button from '../../components/shared/Button';
import TableControls from '../../components/admin/TableControls';
import AdminPagination from '../../components/admin/AdminPagination';
import { Edit2, Trash2, ToggleLeft, ToggleRight, Plus, X } from 'lucide-react';

const AboutUsAdminPage: React.FC = () => {
  const [aboutUsList, setAboutUsList] = useState<AboutUsData[]>([]);
  const [selectedAboutUs, setSelectedAboutUs] = useState<AboutUsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AboutUsData>>({
    title: '',
    subtitle: '',
    description: '',
    mission: '',
    vision: '',
    values: [],
    image: '',
    isActive: true
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchAboutUsList();
  }, [currentPage, statusFilter]);

  const fetchAboutUsList = async () => {
    try {
      setLoading(true);
      const response = await aboutUsService.getAllAboutUs({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE'
      });
      setAboutUsList(response.aboutUs);
    } catch (error) {
      console.error('Error fetching About Us list:', error);
      toast.error('Failed to load About Us content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedAboutUs?.id) {
        await aboutUsService.updateAboutUs(selectedAboutUs.id, formData);
        toast.success('About Us updated successfully');
      } else {
        await aboutUsService.createAboutUs(formData as AboutUsData);
        toast.success('About Us created successfully');
      }
      setEditing(false);
      setSelectedAboutUs(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        mission: '',
        vision: '',
        values: [],
        image: '',
        isActive: true
      });
      fetchAboutUsList();
    } catch (error) {
      console.error('Error saving About Us:', error);
      toast.error('Failed to save About Us content');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (aboutUs: AboutUsData) => {
    setSelectedAboutUs(aboutUs);
    setFormData(aboutUs);
    setEditing(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await aboutUsService.toggleAboutUsStatus(id);
      toast.success('Status updated successfully');
      fetchAboutUsList();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this About Us content?')) {
      try {
        await aboutUsService.deleteAboutUs(id);
        toast.success('About Us content deleted successfully');
        fetchAboutUsList();
      } catch (error) {
        console.error('Error deleting About Us:', error);
        toast.error('Failed to delete About Us content');
      }
    }
  };

  const addValue = () => {
    setFormData(prev => ({
      ...prev,
      values: [...(prev.values || []), { title: '', description: '' }]
    }));
  };

  const updateValue = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values?.filter((_, i) => i !== index)
    }));
  };

  const columnsForExport = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Title', accessor: 'title' },
    { Header: 'Subtitle', accessor: 'subtitle' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Created At', accessor: (row: AboutUsData) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' },
  ];

  const totalPages = Math.ceil(aboutUsList.length / ITEMS_PER_PAGE);

  if (loading && aboutUsList.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading About Us content...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TableControls
        title="About Us Management"
        onSearch={setSearchTerm}
        exportData={aboutUsList}
        exportColumns={columnsForExport}
        showFilters={true}
        additionalButtons={
          <Button
            onClick={() => {
              setEditing(true);
              setSelectedAboutUs(null);
              setFormData({
                title: '',
                subtitle: '',
                description: '',
                mission: '',
                vision: '',
                values: [],
                image: '',
                isActive: true
              });
            }}
            className="bg-primary-gradient hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        }
        filters={
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        }
      />

      {editing ? (
        <div className="bg-white rounded-xl shadow-soft-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedAboutUs ? 'Edit About Us' : 'Create About Us'}
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
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Enter title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subtitle"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                required
                placeholder="Enter description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mission <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.mission || ''}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                required
                placeholder="Enter mission statement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vision
              </label>
              <textarea
                value={formData.vision || ''}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                placeholder="Enter vision statement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter image URL"
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="h-32 object-cover rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700">
                  Values
                </label>
                <Button
                  type="button"
                  onClick={addValue}
                  variant="outline"
                  size="sm"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Value
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.values?.map((value, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Value Title"
                        value={value.title}
                        onChange={(e) => updateValue(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Value Description"
                        value={value.description}
                        onChange={(e) => updateValue(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!formData.values || formData.values.length === 0) && (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    No values added yet. Click "Add Value" to get started.
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary-gradient hover:opacity-90 text-white disabled:opacity-50"
              >
                {loading ? 'Saving...' : (selectedAboutUs ? 'Update' : 'Create')}
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
                    <th className="p-4">Title</th>
                    <th className="p-4">Subtitle</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Updated</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {aboutUsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        {searchTerm || statusFilter !== 'ALL' 
                          ? 'No About Us content found matching your criteria.' 
                          : 'No About Us content available.'}
                      </td>
                    </tr>
                  ) : (
                    aboutUsList.map((aboutUs) => (
                      <tr key={aboutUs.id} className="border-b last:border-0 text-slate-700 hover:bg-slate-50/70">
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{aboutUs.title}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-600 max-w-xs">
                            {aboutUs.subtitle || '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => aboutUs.id && handleToggleStatus(aboutUs.id)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              aboutUs.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {aboutUs.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                            <span>{aboutUs.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-slate-500">
                            {aboutUs.createdAt ? new Date(aboutUs.createdAt).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs text-slate-500">
                            {aboutUs.updatedAt ? new Date(aboutUs.updatedAt).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(aboutUs)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-50 text-xs font-semibold transition-colors flex items-center space-x-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => aboutUs.id && handleDelete(aboutUs.id)} 
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

export default AboutUsAdminPage;