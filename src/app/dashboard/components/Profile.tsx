"use client";

import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaBriefcase, FaInfoCircle, FaCheckCircle, FaEye, FaCamera, FaTrash, FaUpload } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

interface User {
  name: string;
  email: string;
  profilePhoto?: string;
  bio?: string;
  occupation?: string;
}

interface ProfileProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  onRefreshUser?: () => Promise<void>;
}

export default function Profile({ user, onUserUpdate, onRefreshUser }: ProfileProps) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    profilePhoto: user.profilePhoto || "",
    bio: user.bio || "",
    occupation: user.occupation || "",
  });

  const [editBio, setEditBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(formData.bio || user.bio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const occupationOptions = [
    { value: "", label: "Select Occupation" },
    { value: "student", label: "Student" },
    { value: "teacher", label: "Teacher" },
    { value: "other", label: "Other" },
  ];

  const completeness = [formData.name, formData.email, formData.occupation, formData.bio, formData.profilePhoto].filter(Boolean).length;
  const completenessPercent = Math.round((completeness / 5) * 100);

  useEffect(() => {
    setBioDraft(formData.bio || user.bio || "");
  }, [formData.bio, user.bio]);

  useEffect(() => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      profilePhoto: user.profilePhoto || "",
      bio: user.bio || "",
      occupation: user.occupation || "",
    });
    setPreviewImage(user.profilePhoto || null);
  }, [user]);

  // Add window focus listener to refresh user data after email verification
  useEffect(() => {
    const handleWindowFocus = async () => {
      if (onRefreshUser) {
        await onRefreshUser();
        // Clear any success messages after refreshing user data
        if (message.type === "success" && message.text.includes("Verification email sent")) {
          setMessage({ text: "", type: "" });
        }
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [onRefreshUser, message]);

  const handleBioSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditBio(false);
    setFormData(prev => ({ ...prev, bio: bioDraft }));
    try {
      const response = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bio: bioDraft }),
      });
      const data = await response.json();
    } catch (error) {
      setMessage({ text: "An error occurred while updating bio", type: "error" });
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "occupation") {
      try {
        const response = await fetch("/api/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ occupation: value }),
        });
        const data = await response.json();
      } catch (error) {
        setMessage({ text: "An error occurred while updating occupation", type: "error" });
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ text: "Please select a valid image file", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "File size must be less than 5MB", type: "error" });
      return;
    }

    setIsUploading(true);
    setMessage({ text: "", type: "" });

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        console.log('File uploaded, setting preview image:', base64String.substring(0, 50) + '...');
        
        try {
          // Save to backend
          const response = await fetch("/api/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ profilePhoto: base64String }),
          });

          const data = await response.json();

          if (response.ok) {
            // Update local state only after successful backend save
            setPreviewImage(base64String);
            setFormData(prev => ({
              ...prev,
              profilePhoto: base64String
            }));
            
            onUserUpdate({
              ...user,
              profilePhoto: base64String
            });
            
            setMessage({ text: "Photo uploaded successfully!", type: "success" });
          } else {
            setMessage({ text: data.error || "Failed to upload photo", type: "error" });
          }
        } catch (error) {
          console.error('Error saving photo to backend:', error);
          setMessage({ text: "Error saving photo", type: "error" });
        }
        
        setIsUploading(false);
        
        // Auto-clear success message
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 3000);
      };
      reader.onerror = () => {
        setMessage({ text: "Error reading file", type: "error" });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage({ text: "Error uploading file", type: "error" });
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      // Save deletion to backend
      const response = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profilePhoto: "" }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state only after successful backend save
        setPreviewImage(null);
        setFormData(prev => ({
          ...prev,
          profilePhoto: ""
        }));
        
        onUserUpdate({
          ...user,
          profilePhoto: ""
        });
        
        setMessage({ text: "Photo deleted successfully!", type: "success" });
        
        // Auto-clear success message
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 3000);
      } else {
        setMessage({ text: data.error || "Failed to delete photo", type: "error" });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setMessage({ text: "Error deleting photo", type: "error" });
    }
    
    setShowDeleteConfirm(false);
    setShowEditDropdown(false);
  };

  const handleViewPhoto = () => {
    setShowPhotoModal(true);
    setShowEditDropdown(false);
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    fileInput?.click();
    setShowEditDropdown(false);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
    setShowEditDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const emailChanged = formData.email !== user.email;
      
      if (emailChanged) {
        const verificationResponse = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: "temp",
            emailChangeVerification: true,
            currentUserId: user.email
          }),
        });

        const verificationData = await verificationResponse.json();

        if (!verificationResponse.ok) {
          setMessage({ 
            text: verificationData.error || "Failed to send verification email", 
            type: "error" 
          });
          setIsLoading(false);
          return;
        }

        setMessage({ 
          text: `Verification email sent to ${formData.email}. Please check your email and click the verification link to update your email address.`, 
          type: "success" 
        });

        // Auto-clear the message after 10 seconds
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 10000);
        
        const updateData = {
          name: formData.name,
          profilePhoto: formData.profilePhoto,
          bio: formData.bio,
          occupation: formData.occupation,
        };

        const response = await fetch("/api/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (response.ok) {
          onUserUpdate({
            ...data.user,
            email: user.email
          });
        }
      } else {
        const response = await fetch("/api/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({ text: "Profile updated successfully!", type: "success" });
          onUserUpdate(data.user);
        } else {
          setMessage({ text: data.error || "Failed to update profile", type: "error" });
        }
      }
    } catch (error) {
      setMessage({ text: "An error occurred while updating profile", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getOccupationLabel = (value: string) => {
    const option = occupationOptions.find(opt => opt.value === value);
    return option ? option.label : "Not specified";
  };

  return (
    <div className="relative w-full h-screen p-3 md:p-6 bg-gradient-to-br from-purple-100/60 via-yellow-50/60 to-pink-100/60 overflow-hidden">
      {/* Photo View Modal */}
      {showPhotoModal && (previewImage || user.profilePhoto) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="relative bg-white dark:bg-purple-900 rounded-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-2xl font-bold"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-4 text-center">Profile Photo</h3>
            <div className="flex justify-center">
              <img
                src={previewImage || user.profilePhoto || ""}
                alt="Profile"
                className="w-64 h-64 rounded-full object-cover border-4 border-purple-300 dark:border-purple-600 shadow-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="relative bg-white dark:bg-purple-900 rounded-2xl p-6 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-4 text-center">Delete Photo</h3>
            <p className="text-purple-700 dark:text-purple-300 text-center mb-6">
              Are you sure you want to delete your profile photo? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePhoto}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto h-full relative z-10 flex flex-col">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-4xl font-extrabold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-3">
              <FaUser className="text-purple-400" /> My Profile
            </h1>
            <p className="text-purple-700 dark:text-purple-300 text-lg font-medium">
              Welcome back! Here's your creative space to shine ✨
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-purple-600 dark:text-purple-600 font-semibold">Profile Completeness</span>
            <div className="w-40 h-3 bg-purple-200 dark:bg-purple-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-yellow-400 rounded-full transition-all duration-700" style={{ width: `${completenessPercent}%` }}></div>
            </div>
            <span className="text-xs text-purple-700 dark:text-purple-200 font-bold">{completenessPercent}%</span>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg border text-base font-medium flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-red-100 text-red-800 border-red-200"
          }`}>
            <FaCheckCircle className={message.type === "success" ? "text-green-500" : "text-red-500"} />
            {message.text}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Profile Card */}
          <div className="flex-1 bg-white/80 dark:bg-purple-900/80 rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-700 p-6 backdrop-blur-md relative overflow-hidden h-full flex flex-col">
            <div className="relative w-fit mx-auto mb-4">
              {(previewImage || user.profilePhoto) ? (
                <img
                  src={previewImage || user.profilePhoto}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-300 dark:border-purple-600 shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-3xl font-extrabold border-4 border-purple-300 dark:border-purple-600 shadow-xl">
                  {getInitials(formData.name || user.name)}
                </div>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowEditDropdown(!showEditDropdown)}
                  className="absolute bottom-1 right-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-yellow-400 hover:to-orange-400 text-white hover:text-gray-800 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-xl border-3 border-white transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                >
                  <MdEdit className="text-xl" />
                </button>
                
                {/* Edit Dropdown */}
                {showEditDropdown && (
                  <div className="absolute top-12 right-0 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px] z-20 transform transition-all duration-200 scale-100">
                    {(previewImage || user.profilePhoto) && (
                      <button
                        onClick={handleViewPhoto}
                        className="w-full px-3 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 text-sm font-medium"
                      >
                        <FaEye className="text-blue-500 w-4 h-4" />
                        View Photo
                      </button>
                    )}
                    <button
                      onClick={handleUploadClick}
                      className="w-full px-3 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 text-sm font-medium"
                    >
                      <FaUpload className="text-green-500 w-4 h-4" />
                      Upload Photo
                    </button>
                    {(previewImage || user.profilePhoto) && (
                      <>
                        <hr className="border-gray-200 dark:border-gray-700 my-1" />
                        <button
                          onClick={handleConfirmDelete}
                          className="w-full px-3 py-2 text-left text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3 text-sm font-medium"
                        >
                          <FaTrash className="text-red-500 w-4 h-4" />
                          Delete Photo
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="flex flex-col items-center text-white">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div className="text-xs font-medium">Uploading...</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center flex-1 flex flex-col">
              <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-200 mb-2 flex items-center justify-center gap-2">
                <FaUser className="text-purple-400" /> {formData.name || user.name}
              </h2>
              <p className="text-purple-600 dark:text-purple-300 mb-3 flex items-center justify-center gap-2 text-lg">
                <FaEnvelope className="text-purple-300" /> {formData.email || user.email}
              </p>
              {(formData.occupation || user.occupation) && (
                <p className="text-purple-500 dark:text-purple-400 mb-4 flex items-center justify-center gap-2 text-lg">
                  <FaBriefcase className="text-purple-300" /> {getOccupationLabel(formData.occupation || user.occupation || "")}
                </p>
              )}
              
              <div className="flex-1 text-left bg-purple-50 dark:bg-purple-700/30 rounded-xl p-4 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                    <FaInfoCircle className="text-purple-400" /> About You
                  </h3>
                  <button onClick={() => setEditBio(true)} className="ml-2 text-purple-500 hover:text-yellow-500 transition-colors" title="Edit bio">
                    <MdEdit />
                  </button>
                </div>
                {editBio ? (
                  <form onSubmit={handleBioSave} className="flex flex-col gap-3">
                    <textarea
                      id="bio"
                      name="bio"
                      value={bioDraft}
                      onChange={e => setBioDraft(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-3 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-yellow-400 bg-white dark:bg-purple-800 text-purple-900 dark:text-purple-100 shadow-sm resize-none"
                      placeholder="Tell us a little about yourself..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm font-semibold">Save</button>
                      <button type="button" onClick={() => { setEditBio(false); setBioDraft(formData.bio || user.bio || ""); }} className="bg-gray-200 text-purple-800 px-4 py-2 rounded hover:bg-gray-300 text-sm font-semibold">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <p className="text-purple-700 dark:text-purple-200 text-base leading-relaxed min-h-[60px] flex items-center">
                    {formData.bio || user.bio || "No bio provided yet. Add a bio to tell others about yourself!"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form Card */}
          <div className="flex-1 bg-white/90 dark:bg-purple-900/90 rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-700 p-6 backdrop-blur-md h-full">
            <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-6 flex items-center gap-2">
              <MdEdit className="text-purple-400" /> Edit Profile
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
              <div className="space-y-6 flex-1">
                <div className="relative">
                  <label htmlFor="name" className="block text-sm font-semibold text-purple-700 dark:text-purple-200 mb-2 flex items-center gap-2">
                    <FaUser /> Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-yellow-400 bg-white dark:bg-purple-800 text-purple-900 dark:text-purple-100 shadow-sm text-lg"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-semibold text-purple-700 dark:text-purple-200 mb-2 flex items-center gap-2">
                    <FaEnvelope /> Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-yellow-400 bg-white dark:bg-purple-800 text-purple-900 dark:text-purple-100 shadow-sm text-lg"
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="occupation" className="block text-sm font-semibold text-purple-700 dark:text-purple-200 mb-2 flex items-center gap-2">
                    <FaBriefcase /> Occupation
                  </label>
                  <select
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-yellow-400 bg-white dark:bg-purple-800 text-purple-900 dark:text-purple-100 shadow-sm text-lg"
                  >
                    {occupationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-yellow-400 text-white py-3 px-6 rounded-lg hover:from-yellow-400 hover:to-purple-600 hover:text-purple-900 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
                  >
                    {isLoading ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
