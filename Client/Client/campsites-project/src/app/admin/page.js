'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Pencil, Trash2, X, User, Car, Home, LogOut, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('camps');
  const [camps, setCamps] = useState([]);
  const [campLoading, setCampLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddCampOpen, setIsAddCampOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [editingCamp, setEditingCamp] = useState(null);
  const [editCampForm, setEditCampForm] = useState({ name: '', description: '', imageUrl: '', latitude: '', longitude: '' });
  const [newCampForm, setNewCampForm] = useState({ name: '', description: '', imageUrl: '', latitude: '', longitude: '' });

  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ firstName: '', lastName: '', userName: '' });
  const [newUserForm, setNewUserForm] = useState({ firstName: '', lastName: '', userName: '', password: '' });

  const [editingReview, setEditingReview] = useState(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: '' });

  const admin = { name: 'Alex Ivanov' };

  const getInitials = (name) => name.split(' ').map(part => part[0]).join('').toUpperCase();

  useEffect(() => {
    const checkAdminRole = async () => {
      const jwtToken = localStorage.getItem("jwt");
      if (!jwtToken) return router.push("/");

      try {
        const response = await fetch("https://localhost:5022/api/Auth/GetUser", {
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
        if (!response.ok || !(await response.json()).roles.includes("Admin")) {
          localStorage.clear();
          router.push("/");
        }
      } catch {
        router.push("/");
      }
    };
    checkAdminRole();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'camps') fetchCamps();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'reviews') fetchReviews();
  }, [activeTab]);

  const fetchCamps = async () => {
    try {
      const res = await fetch('https://localhost:5022/api/Admin/GetAllCampEnquieries');
      const result = await res.json();
      if (result.success) setCamps(result.data);
      console.log(result.data)
    } catch (err) {
      console.error('Failed to fetch camps:', err);
    } finally {
      setCampLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('https://localhost:5022/api/Admin/GetAllUserEnquieries');
      const result = await res.json();
      if (result.success) setUsers(result.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('https://localhost:5022/api/Admin/GetAllReviews');
      const result = await res.json();
      if (result.success) setReviews(result.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("https://localhost:5022/api/Auth/Logout", { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        localStorage.clear();
        router.push("/");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleLogoutClick = () => {
    handleLogout();
  };

  const handleCampEditChange = (e) => setEditCampForm({ ...editCampForm, [e.target.name]: e.target.value });
  const handleUserEditChange = (e) => setEditUserForm({ ...editUserForm, [e.target.name]: e.target.value });
  const handleNewCampChange = (e) => setNewCampForm({ ...newCampForm, [e.target.name]: e.target.value });
  const handleNewUserChange = (e) => setNewUserForm({ ...newUserForm, [e.target.name]: e.target.value });

  const handleCampDelete = async (id) => {
    const res = await fetch(`https://localhost:5022/api/Admin/DeleteCamp/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) setCamps(prev => prev.filter(camp => camp.id !== id));
  };

  const handleUserDelete = async (id) => {
    const res = await fetch(`https://localhost:5022/api/Admin/DeleteUser/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) setUsers(prev => prev.filter(user => user.id !== id));
  };

  const handleCampEditSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`https://localhost:5022/api/Admin/UpdateCamp/${editingCamp.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editCampForm),
    });
    const result = await res.json();
    if (result.success) {
      setCamps(prev => prev.map(camp => camp.id === editingCamp.id ? { ...camp, ...editCampForm } : camp));
      setIsEditOpen(false);
    }
  };

  const handleUserEditSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`https://localhost:5022/api/Admin/UpdateUser/${editingUser.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editUserForm),
    });
    const result = await res.json();
    if (result.success) {
      setUsers(prev => prev.map(user => user.id === editingUser.id ? { ...user, ...editUserForm } : user));
      setIsEditOpen(false);
    }
  };

  const handleNewCampSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...newCampForm,
      latitude: parseFloat(newCampForm.latitude),
      longitude: parseFloat(newCampForm.longitude),
    };
    const res = await fetch(`https://localhost:5022/api/Admin/AddCamp`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success) {
      fetchCamps();
      setNewCampForm({ name: '', description: '', imageUrl: '', latitude: '', longitude: '' });
      setIsAddCampOpen(false);
    }
  };

  const handleNewUserSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`https://localhost:5022/api/Admin/AddUser`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUserForm),
    });
    const result = await res.json();
    if (result.success) {
      fetchUsers();
      setNewUserForm({ firstName: '', lastName: '', userName: '', password: '' });
      setIsAddUserOpen(false);
    }
  };

  const openCampEditModal = (camp) => {
    setEditingCamp(camp);
    setEditCampForm({ name: camp.name, description: camp.description, imageUrl: camp.imageUrl, latitude: camp.latitude, longitude: camp.longitude });
    setIsEditOpen(true);
  };

  const openUserEditModal = (user) => {
    setEditingUser(user);
    setEditUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName
    });
    setIsEditOpen(true);
  };

  const handleReviewDelete = async (id) => {
    const res = await fetch(`https://localhost:5022/api/Review/DeleteReview/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) setReviews(prev => prev.filter(review => review.id !== id));
  };

  const handleReviewEditSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`https://localhost:5022/api/Review/UpdateReview/${editingReview.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editReviewForm),
    });
    const result = await res.json();
    if (result.success) {
      setReviews(prev => prev.map(review => review.id === editingReview.id ? { ...review, ...editReviewForm } : review));
      setIsEditOpen(false);
    }
  };

  const openReviewEditModal = (review) => {
    setEditingReview(review);
    setEditReviewForm({
      rating: review.rating,
      comment: review.comment
    });
    setIsEditOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Mammoth Panel</h1>
        </div>
        <nav className="space-y-3 text-gray-600 text-sm">
          <button
            onClick={() => router.push('/')}
            className={`flex items-center gap-3 w-full text-left hover:text-blue-600`}
          >
            <Home size={24} /> Home Page
          </button>
          <button
            onClick={() => setActiveTab('camps')}
            className={`flex items-center gap-3 w-full text-left ${
              activeTab === 'camps' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'
            }`}
          >
            <Car size={24} /> Manage Camps
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 w-full text-left ${
              activeTab === 'users' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'
            }`}
          >
            <User size={24} /> Manage Users
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-3 w-full text-left ${
              activeTab === 'reviews' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'
            }`}
          >
            <Star size={24} /> Manage Reviews
          </button>
        </nav>
        <div className="absolute bottom-6 left-6 flex items-center gap-3">
  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 shadow">
    {getInitials(admin.name)}
  </div>
  <div className="text-sm text-gray-600">{admin.name}</div>
  <button
    onClick={() => handleLogoutClick()}
    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center shadow transition-colors"
    title="Logout"
  >
    <LogOut size={18} />
  </button>
</div>
      </aside>

      <main className="flex-1 p-6">
        {activeTab === 'camps' ? (
          <div className="bg-white shadow-md rounded p-6">
<div className="flex justify-between items-center mb-4">
  <h2 className="text-lg font-semibold text-gray-800">Camps</h2>

  <Dialog.Root open={isAddCampOpen} onOpenChange={setIsAddCampOpen}>
    <Dialog.Trigger asChild>
      <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm cursor-pointer">Add Camp</button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <Dialog.Title className="text-lg font-semibold text-gray-500">Add Camp</Dialog.Title>
          <Dialog.Close asChild>
            <button className="text-gray-500 hover:text-gray-800">
              <X size={18} />
            </button>
          </Dialog.Close>
        </div>
        <form onSubmit={handleNewCampSubmit} className="space-y-4">
          {[
            { label: "Name", name: "name" },
            { label: "Description", name: "description", type: "textarea" },
            { label: "Image URL", name: "imageUrl" },
            { label: "Latitude", name: "latitude", type: "number" },
            { label: "Longitude", name: "longitude", type: "number" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label className="block text-sm mb-1 text-gray-500">{label}</label>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  value={newCampForm[name]}
                  onChange={handleNewCampChange}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                  required
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  value={newCampForm[name]}
                  onChange={handleNewCampChange}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                  required
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <button type="button" className="text-gray-600 hover:text-gray-800 text-sm">
                Cancel
              </button>
            </Dialog.Close>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
              Create
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</div>


            {campLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="text-gray-500 border-b">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Image URL</th>
                      <th className="p-3">Latitude</th>
                      <th className="p-3">Longitude</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {camps.map((order, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-500">{order.id}</td>
                        <td className="p-3 text-gray-500">{order.name}</td>
                        <td className="p-3 text-gray-500">{order.description}</td>
                        <td className="p-3 text-gray-500">{order.imageUrl}</td>
                        <td className="p-3 text-gray-500">{order.latitude}</td>
                        <td className="p-3 text-gray-500">{order.longitude}</td>
                        <td className="p-3 text-gray-500 flex items-center gap-3">
                          <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
                            <Dialog.Trigger asChild>
                              <button onClick={() => { openCampEditModal(order); setIsEditOpen(true); }} className="text-blue-500 hover:text-blue-700">
                                <Pencil size={14} />
                              </button>
                            </Dialog.Trigger>
                            <Dialog.Portal>
                              <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                              <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
                                <div className="flex justify-between items-center mb-4">
                                  <Dialog.Title className="text-lg font-semibold text-gray-500">Edit Camp</Dialog.Title>
                                  <Dialog.Close asChild>
                                    <button className="text-gray-500 hover:text-gray-800">
                                      <X size={18} />
                                    </button>
                                  </Dialog.Close>
                                </div>
                                <form onSubmit={handleCampEditSubmit} className="space-y-4">
                                  <div>
                                    <label className="block text-sm mb-1 text-gray-500">Name</label>
                                    <input
                                      name="name"
                                      value={editCampForm.name}
                                      onChange={handleCampEditChange}
                                      className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm mb-1 text-gray-500">Description</label>
                                    <input
                                      name="description"
                                      value={editCampForm.description}
                                      onChange={handleCampEditChange}
                                      className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm mb-1 text-gray-500">Latitude</label>
                                    <input
                                      name="latitude"
                                      value={editCampForm.latitude}
                                      onChange={handleCampEditChange}
                                      type="number"
                                      className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm mb-1 text-gray-500">Longitude</label>
                                    <input
                                      name="longitude"
                                      value={editCampForm.longitude}
                                      onChange={handleCampEditChange}
                                      type="number"
                                      className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm mb-1 text-gray-500">Image URL</label>
                                    <input
                                      name="imageUrl"
                                      value={editCampForm.imageUrl}
                                      onChange={handleCampEditChange}
                                      className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Dialog.Close asChild>
                                      <button type="button" className="text-gray-600 hover:text-gray-800 text-sm">
                                        Cancel
                                      </button>
                                    </Dialog.Close>
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                      Save
                                    </button>
                                  </div>
                                </form>
                              </Dialog.Content>
                            </Dialog.Portal>
                          </Dialog.Root>

                          <button onClick={() => handleCampDelete(order.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white shadow-md rounded p-6">
            <div className='flex justify-between items-center'>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Users</h2>
            <Dialog.Root open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <Dialog.Trigger asChild>
                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm cursor-pointer">Add User</button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title className="text-lg font-semibold text-gray-500">Add User</Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="text-gray-500 hover:text-gray-800">
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>
                  <form onSubmit={handleNewUserSubmit} className="space-y-4">
                    {[
                      { label: "Username", name: "userName" },
                      { label: "First Name", name: "firstName" },
                      { label: "Last Name", name: "lastName" },
                      { label: "Password", name: "password", type: "password" },
                    ].map(({ label, name, type = "text" }) => (
                      <div key={name}>
                        <label className="block text-sm mb-1 text-gray-500">{label}</label>
                        <input
                          type={type}
                          name={name}
                          value={newUserForm[name]}
                          onChange={handleNewUserChange}
                          className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                          required
                        />
                      </div>
                    ))}

                    <div className="flex justify-end gap-2">
                      <Dialog.Close asChild>
                        <button type="button" className="text-gray-600 hover:text-gray-800 text-sm">
                          Cancel
                        </button>
                      </Dialog.Close>
                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                        Create
                      </button>
                    </div>
                  </form>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            </div>
            {userLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="text-gray-500 border-b">
                      <tr>
                        <th className="p-3">Username</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((order, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-500">{order.userName}</td>
                          <td className="p-3 text-gray-500">{order.firstName} {order.lastName}</td>
                          <td className="p-3 text-gray-500 flex items-center gap-3">
                            <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
                              <Dialog.Trigger asChild>
                                <button onClick={() => { openUserEditModal(order); setIsEditOpen(true); }} className="text-blue-500 hover:text-blue-700">
                                  <Pencil size={14} />
                                </button>
                              </Dialog.Trigger>
                              <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                                <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
                                  <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title className="text-lg font-semibold text-gray-500">Edit User</Dialog.Title>
                                    <Dialog.Close asChild>
                                      <button className="text-gray-500 hover:text-gray-800">
                                        <X size={18} />
                                      </button>
                                    </Dialog.Close>
                                  </div>
                                  <form onSubmit={handleUserEditSubmit} className="space-y-4">
                                    <div>
                                      <label className="block text-sm mb-1 text-gray-500">Username</label>
                                      <input
                                        name="userName"
                                        value={editUserForm.userName}
                                        onChange={handleUserEditChange}
                                        className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm mb-1 text-gray-500">First Name</label>
                                      <input
                                        name="firstName"
                                        value={editUserForm.firstName}
                                        onChange={handleUserEditChange}
                                        className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm mb-1 text-gray-500">Last Name</label>
                                      <input
                                        name="lastName"
                                        value={editUserForm.lastName}
                                        onChange={handleUserEditChange}
                                        className="w-full border rounded px-3 py-2 text-sm text-gray-500"
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Dialog.Close asChild>
                                        <button type="button" className="text-gray-600 hover:text-gray-800 text-sm">
                                          Cancel
                                        </button>
                                      </Dialog.Close>
                                      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                                        Save
                                      </button>
                                    </div>
                                  </form>
                                </Dialog.Content>
                              </Dialog.Portal>
                            </Dialog.Root>

                            <button onClick={() => handleUserDelete(order.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        ) : activeTab === 'reviews' ? (
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Reviews</h2>
            {reviewLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="text-gray-500 border-b">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Camp</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Comment</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-500">{review.userName}</td>
                        <td className="p-3 text-gray-500">{review.campName}</td>
                        <td className="p-3 text-gray-500">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`${
                                  star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-gray-500">{review.comment}</td>
                        <td className="p-3 text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                          {review.updatedAt && (
                            <span className="text-xs text-gray-400 ml-1">
                              (updated)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-500 flex items-center gap-3">
                          <button
                              className="text-blue-500 hover:text-blue-700"
                          >
                          <Pencil size={14} />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}