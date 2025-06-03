import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Box as BoxIcon } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../utils/api'
const BoxManagement = () => {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
const [showDeleteInput, setShowDeleteInput] = useState(false);
const [selectedBoxId, setSelectedBoxId] = useState(null);
const [ownerCode, setOwnerCode] = useState('');
  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
  try {
    const response = await api.get('/boxes/my-box');
    const data = response.data;

    setBoxes(data.boxes);
  } catch (error) {
    toast.error('Failed to fetch boxes');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

 const handleDelete = async () => {
  if (!ownerCode) {
    toast.error('Owner code is required');
    return;
  }

  if (!confirm('Are you sure you want to delete this box?')) return;

  try {
    await api.delete(`/boxes/delete/${selectedBoxId}`, {
      data: { ownerCode },
    });

    toast.success('Box deleted successfully');
    setShowDeleteInput(false);
    setOwnerCode('');
    fetchBoxes();
  } catch (error) {
    toast.error(error.response?.data?.message || error.message || 'Failed to delete box');
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">Box Management</h1>
        <Link to="/admin/boxes/create">
          <Button className="flex items-center">
            <Plus size={20} className="mr-2" />
            Add New Box
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boxes.map((box) => (
          <Card key={box._id}>
            <div className="relative h-48 mb-4">
              <img
                src={box.image?box.image : "https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                alt={box.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Link to={`/admin/boxes/edit/${box._id}`}>
                  <Button variant="secondary" size="sm">
                    <Edit size={16} />
                  </Button>
                </Link>
                <Button 
  variant="danger" 
  size="sm"
  onClick={() => {
    setSelectedBoxId(box._id);
    setShowDeleteInput(true);
  }}
>
  <Trash2 size={16} />
</Button>

              </div>
            </div>
            {showDeleteInput && (
  <div className="p-4 mt-2 bg-red-50 border border-red-300 rounded">
    <label className="block text-sm font-medium text-red-700 mb-1">Enter Owner Code to Confirm Delete:</label>
    <input
      type="password"
      value={ownerCode}
      onChange={(e) => setOwnerCode(e.target.value)}
      className="border border-gray-300 rounded px-3 py-1 w-full"
      placeholder="Owner code"
    />
    <div className="mt-2 flex gap-2">
      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
      >
        Confirm Delete
      </button>
      <button
        onClick={() => {
          setShowDeleteInput(false);
          setOwnerCode('');
        }}
        className="bg-gray-200 text-gray-800 px-4 py-1 rounded hover:bg-gray-300"
      >
        Cancel
      </button>
    </div>
  </div>
)}


            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              {box.name}
            </h3>

            <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <div className="flex items-center">
                <BoxIcon size={16} className="mr-2" />
                <span>Rate: ${box.hourlyRate}/hour</span>
              </div>
              <p className="line-clamp-2">{box.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BoxManagement;