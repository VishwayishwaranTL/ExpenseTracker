import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../../utils/apipath";
import { Pencil, Check, X } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err.message);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const uploadRes = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = uploadRes.data.imageUrl;

      await axiosInstance.put(API_PATHS.AUTH.UPDATE_USER, { profileImgUrl: imageUrl });
      fetchProfile();
    } catch (err) {
      console.error("Image upload failed:", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setNewName(user.fullName);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setNewName("");
  };

  const handleSaveName = async () => {
    try {
      await axiosInstance.put(API_PATHS.AUTH.UPDATE_USER, { fullName: newName });
      fetchProfile();
      setIsEditingName(false);
    } catch (err) {
      console.error("Failed to update name:", err.message);
    }
  };

  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-md text-center">
      <div className="relative w-28 h-28 mx-auto mb-4">
        {user.profileImgUrl ? (
        <img
          src={user.profileImgUrl}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border mx-auto"
        />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 mx-auto">
            {user.fullName.charAt(0)}
          </div>
        )}

        <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600">
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageChange}
            className="hidden"
          />
          {uploading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" />
          ) : (
            <Pencil size={16} />
          )}
        </label>
      </div>

      <div className="flex justify-center items-center gap-2 mb-1">
        {isEditingName ? (
          <>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-xl font-semibold text-gray-800 border px-2 py-1 rounded-md"
            />
            <button
              onClick={handleSaveName}
              className="text-green-600 hover:text-green-800"
              title="Save"
            >
              <Check size={20} />
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-gray-500 hover:text-gray-700"
              title="Cancel"
            >
              <X size={20} />
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-800">{user.fullName}</h2>
            <button
              onClick={handleNameEdit}
              className="text-gray-600 hover:text-blue-600"
              title="Edit name"
            >
              <Pencil size={18} />
            </button>
          </>
        )}
      </div>

      <p className="text-gray-600 mt-1">{user.email}</p>
    </div>
  );
};

export default Profile;
