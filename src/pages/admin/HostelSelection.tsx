import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function HostelSelection() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirmation
  const [confirmName, setConfirmName] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    // Check if hostel is already selected
    const selectedHostel = localStorage.getItem('selectedHostel');
    if (selectedHostel && selectedHostel !== 'null') {
      // If hostel is already selected, redirect to dashboard
      navigate('/admin/dashboard', { replace: true });
    }
    
    fetchHostels();
  }, [navigate]);

  const fetchHostels = async () => {
    try {
      const res = await api.get("/api/admin/hostels");
      setHostels(res.data);
    } catch (err) {
      console.error("Failed to fetch hostels", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHostel = (hostel) => {
    // Store selected hostel
    localStorage.setItem('selectedHostel', JSON.stringify(hostel));
    localStorage.setItem('selectedHostelId', hostel.id);
    
    // Redirect to admin dashboard
    navigate('/admin/dashboard', { replace: true });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Hostel name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open edit modal
  const handleEditClick = (hostel, e) => {
    e.stopPropagation();
    setSelectedHostel(hostel);
    setFormData({
      name: hostel.name,
      active: hostel.active
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const handleDeleteClick = (hostel, e) => {
    e.stopPropagation();
    setSelectedHostel(hostel);
    setConfirmName('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  // Submit add hostel
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      const response = await api.post("/api/admin/hostels", formData);
      
      // Add new hostel to list
      setHostels([...hostels, response.data]);
      setShowAddModal(false);
      resetForm();
      
      // Show success message
      alert('Hostel added successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to add hostel';
      alert(errorMsg);
      console.error('Error adding hostel:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit edit hostel
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      const response = await api.put(`/api/admin/hostels/${selectedHostel.id}`, formData);
      
      // Update hostel in list
      setHostels(hostels.map(h => h.id === selectedHostel.id ? response.data : h));
      setShowEditModal(false);
      resetForm();
      setSelectedHostel(null);
      
      // Show success message
      alert('Hostel updated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to update hostel';
      alert(errorMsg);
      console.error('Error updating hostel:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit delete hostel
  const handleDeleteSubmit = async () => {
    if (confirmName !== selectedHostel.name) {
      setDeleteError('Hostel name does not match. Please type the exact name to confirm deletion.');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await api.delete(`/api/admin/hostels/${selectedHostel.id}`);
      
      if (response.data.canDelete) {
        // Remove hostel from list
        setHostels(hostels.filter(h => h.id !== selectedHostel.id));
        setShowDeleteModal(false);
        setSelectedHostel(null);
        setConfirmName('');
        
        // Show success message
        alert('Hostel deleted successfully!');
      }
    } catch (err) {
      if (err.response?.status === 409) {
        // Handle conflict response with dependencies
        const deps = err.response.data.dependencies;
        
        // Build warning message based on what exists
        let warningMessage = 'Cannot delete this hostel because:\n\n';
        const warnings = [];
        
        if (deps.students > 0) {
          warnings.push(`• ${deps.students} student${deps.students > 1 ? 's' : ''} associated with this hostel`);
        }
        if (deps.staff > 0) {
          warnings.push(`• ${deps.staff} staff member${deps.staff > 1 ? 's' : ''} working in this hostel`);
        }
        
        warningMessage += warnings.join('\n');
        warningMessage += '\n\nPlease remove or reassign these records before deleting the hostel.';
        
        alert(warningMessage);
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to delete hostel';
        alert(errorMsg);
      }
      console.error('Error deleting hostel:', err);
      setShowDeleteModal(false);
      setSelectedHostel(null);
      setConfirmName('');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      active: true
    });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hostels...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Select a Hostel to Manage
            </h1>
            <p className="text-gray-600 text-lg">
              Choose a hostel from the list below to access its dashboard
            </p>
          </div>

          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
            {hostels.map((hostel) => (
              <div
                key={hostel.id}
                className="relative group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-500"
              >
                {/* Admin actions - appear on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                  <button
                    onClick={(e) => handleEditClick(hostel, e)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Edit Hostel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(hostel, e)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete Hostel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div onClick={() => handleSelectHostel(hostel)} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      hostel.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hostel.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{hostel.name}</h2>
                  
                  <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Select Hostel
                  </button>
                </div>
              </div>
            ))}

            {/* Add hostel card */}
            <div
              onClick={() => setShowAddModal(true)}
              className="cursor-pointer border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-blue-50 transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Add New Hostel</h3>
              <p className="text-blue-600 text-sm">Click here to register a new hostel</p>
            </div>
          </div>

          {hostels.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Hostels Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't added any hostels yet. Start by adding your first hostel to manage.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Hostel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Hostel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Hostel</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="space-y-4">
                  {/* Hostel Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter hostel name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Active Status Field */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="ml-3 text-sm text-gray-700">
                      Active Hostel
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 -mt-2">
                    Active hostels can be selected for management
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      'Add Hostel'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hostel Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Hostel</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                    setSelectedHostel(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  {/* Hostel Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter hostel name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Active Status Field */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-active"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="edit-active" className="ml-3 text-sm text-gray-700">
                      Active Hostel
                    </label>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                      setSelectedHostel(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      'Update Hostel'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHostel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Hostel</h2>
              <p className="text-gray-600 text-center mb-6">
                This action <span className="font-semibold text-red-600">cannot be undone</span>. 
                This will permanently delete the hostel.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>
                    <span className="font-semibold">Warning:</span> You can only delete a hostel if it has no students or staff assigned.
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">{selectedHostel.name}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => {
                    setConfirmName(e.target.value);
                    setDeleteError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                  placeholder="Enter hostel name to confirm"
                  autoFocus
                />
                {deleteError && (
                  <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedHostel(null);
                    setConfirmName('');
                    setDeleteError('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || confirmName !== selectedHostel.name}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete Hostel'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}