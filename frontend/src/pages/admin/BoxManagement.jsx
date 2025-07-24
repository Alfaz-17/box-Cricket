import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Plus, Edit, Trash2, Box as BoxIcon } from "lucide-react";
import api from "../../utils/api";
import useBoxStore from "../../store/boxStore";
const BoxManagement = () => {
    const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [ownerCode, setOwnerCode] = useState("");

  const { boxes, loading, fetchBoxes } = useBoxStore();

  useEffect(() => {
    fetchBoxes();
  }, []);


  const handleDelete = async () => {
    if (!ownerCode) {
      toast.error("Owner code is required");
      return;
    }

    if (!confirm("Are you sure you want to delete this box?")) return;

    try {
      await api.delete(`/boxes/delete/${selectedBoxId}`, {
        data: { ownerCode },
      });

      toast.success("Box deleted successfully");
      setShowDeleteInput(false);
      setOwnerCode("");
      fetchBoxes();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to delete box"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-primary w-12 h-12"></span>
      </div>
    );
  }

  return (
    <div className="container  mx-auto px-4">
      <div className="flex justify-between  items-center mb-6">
        <h1 style={{ fontFamily: "Bebas Neue" }}  className="text-3xl font-bold">Box Management</h1>
        <Link to="/admin/boxes/create">
          <button className="btn bg-primary rounded-2xl  btn-md text-primary-content">
            <Plus size={20} className="mr-2 " />
            Add New Box
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boxes.map((box) => (
          <div className="card bg-base-300 shadow-xl" key={box._id}>
            <figure className="relative h-48 overflow-hidden">
              <img
                src={
                  box.image ||
                  "https://images.pexels.com/photos/5739101/pexels-photo-5739101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                }
                alt={box.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Link to={`/admin/boxes/edit/${box._id}`}>
                  <button className="btn btn-sm ">
                    <Edit size={16} />
                  </button>
                </Link>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => {
                    setSelectedBoxId(box._id);
                    setShowDeleteInput(true);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </figure>

            <div className="card-body">
              <h2 style={{ fontFamily: "Bebas Neue" }}  className="card-title text-primary ">{box.name}</h2>
              <div className="text-sm space-y-2  dark:text-gray-400">
                <div className="flex items-center">
                  <BoxIcon size={16} className="mr-2 text-primary" />
                  <span className="text-pri">Rate: ${box.hourlyRate}/hour</span>
                </div>
                <p className="line-clamp-2">{box.description}</p>
              </div>

              {showDeleteInput && selectedBoxId === box._id && (
                <div className="mt-4 p-4 border border-error bg-error/10 rounded space-y-3">
                  <label className="text-sm font-medium text-error">
                    Enter Owner Code to Confirm Delete:
                  </label>
                  <input
                    type="password"
                    value={ownerCode}
                    onChange={(e) => setOwnerCode(e.target.value)}
                    className="input input-bordered w-full text-[16px] input-error"
                    placeholder="Owner code"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      className="btn btn-error btn-sm"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteInput(false);
                        setOwnerCode("");
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoxManagement;
