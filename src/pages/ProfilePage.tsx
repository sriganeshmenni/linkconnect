// import React, { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext.jsx';
// import { UserCircle, Mail, Shield, CalendarDays, Activity } from 'lucide-react';

// type UserType = {
//   id?: string | number;
//   name?: string;
//   email?: string;
//   role?: string;
//   createdAt?: string;
//   rollNumber?: string;
// };

// interface HistoryItem {
//   id: string;
//   type: string;
//   description: string;
//   date: string;
// }

// const ProfilePage: React.FC = () => {
//   const { user } = useAuth() as { user: UserType };
//   const [history, setHistory] = useState<HistoryItem[]>([]);

//   useEffect(() => {
//     // Fetch user history (replace with real API call)
//     setHistory([
//       { id: '1', type: 'link', description: 'Created a new link', date: '2025-12-01' },
//       { id: '2', type: 'submission', description: 'Submitted assignment', date: '2025-12-05' },
//       { id: '3', type: 'login', description: 'Logged in', date: '2025-12-10' },
//     ]);
//   }, []);

//   if (!user) return <div>Loading...</div>;

//   return (
//     <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-10 border border-orange-100">
//       <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
//         <div className="flex-shrink-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-2 shadow-lg">
//           <UserCircle className="w-32 h-32 text-white" />
//         </div>
//         <div className="flex-1">
//           <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
//             {user.name}
//             <span className="ml-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600 uppercase">{user.role}</span>
//           </h2>
//           <div className="flex flex-col gap-2 text-gray-700 text-lg">
//             <div className="flex items-center gap-2">
//               <Mail className="w-5 h-5 text-blue-500" />
//               <span>{user.email}</span>
//             </div>
//             {user.rollNumber && (
//               <div className="flex items-center gap-2">
//                 <Shield className="w-5 h-5 text-orange-500" />
//                 <span>Roll No: {user.rollNumber}</span>
//               </div>
//             )}
//             <div className="flex items-center gap-2">
//               <CalendarDays className="w-5 h-5 text-gray-400" />
//               <span>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-6 shadow-inner">
//         <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//           <Activity className="w-6 h-6 text-orange-500" />
//           Activity History
//         </h3>
//         <ul className="divide-y divide-orange-100">
//           {history.length === 0 ? (
//             <li className="py-4 text-gray-500">No activity yet.</li>
//           ) : (
//             history.map(item => (
//               <li key={item.id} className="py-4 flex items-center gap-4">
//                 <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 uppercase min-w-[80px] text-center">
//                   {item.type}
//                 </span>
//                 <span className="flex-1 text-gray-700">{item.description}</span>
//                 <span className="text-gray-400 text-sm">{new Date(item.date).toLocaleDateString()}</span>
//               </li>
//             ))
//           )}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;





// import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext.jsx";
// import { UserCircle } from "lucide-react";

// type UserType = {
//   id?: string | number;
//   name?: string;
//   email?: string;
//   role?: string;
//   createdAt?: string;
//   rollNumber?: string;
// };

// interface HistoryItem {
//   id: string;
//   type: string;
//   description: string;
//   date: string;
// }

// const ProfilePage: React.FC = () => {
//   const { user } = useAuth() as { user: UserType };
//   const [history, setHistory] = useState<HistoryItem[]>([]);

//   useEffect(() => {
//     setHistory([
//       { id: "1", type: "link", description: "Created a new link", date: "2025-12-01" },
//       { id: "2", type: "submission", description: "Submitted assignment", date: "2025-12-05" },
//       { id: "3", type: "login", description: "Logged in", date: "2025-12-10" },
//     ]);
//   }, []);

//   if (!user) return <div>Loading...</div>;

//   return (
//     <div className="w-full p-6 bg-gray-50">
//       {/* Use flex with gap and equal widths */}
//       <div className="flex gap-6 justify-center flex-wrap">

//          {/* -------- LEFT COLUMN -------- */}
//         <div className="flex-1 min-w-[300px] max-w-[350px] bg-white border-2 rounded-lg p-6 shadow-sm flex flex-col items-center">
//           <div className="w-full h-[400px] border flex items-center justify-center bg-gray-100 rounded-xl">
//             <UserCircle className="w-48 h-48 text-gray-400" />
//           </div>

//           {/* Buttons evenly spread */}
//           <div className="mt-5 flex gap-4 w-full">
//             <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
//               Upload Photo
//             </button>
//             <button
//               className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
//               onClick={() => setEditMode(!editMode)}
//             >
//               Edit profile
//             </button>
//             <button className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer">
//               Change
//             </button>
//           </div>

//           {/* Edit Profile Form */}
//           {editMode && (
//             <form className="w-full mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Name"
//                 value={formData.name || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />
//               <input
//                 type="text"
//                 name="rollNumber"
//                 placeholder="Roll Number"
//                 value={formData.rollNumber || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />
//               <input
//                 type="text"
//                 name="branch"
//                 placeholder="Branch"
//                 value={formData.branch || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />
//               <input
//                 type="text"
//                 name="campus"
//                 placeholder="Campus"
//                 value={formData.campus || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />

//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
//               >
//                 Save
//               </button>
//             </form>
//           )}
//         </div>

//         {/* -------- CENTER COLUMN -------- */}
//         <div className="flex-1 min-w-[300px] max-w-[400px] bg-white border rounded-lg p-6 shadow-sm flex flex-col items-center">
//           <h2 className="text-gray-600 text-xl font-semibold">Newbie</h2>
//           <h1 className="text-3xl font-bold text-gray-800 mb-4">{user.name}</h1>

//           <p className="text-gray-700">
//             <strong>Contest rating:</strong> 578 <span className="text-sm text-gray-500">(max. newbie, 578)</span>
//           </p>
//           <p className="mt-3"><strong>Contribution:</strong> 0</p>
//           <p className="mt-2"><strong>Friend of:</strong> 0 users</p>

//           <div className="mt-4 flex flex-col gap-2 text-blue-600 underline cursor-pointer">
//             <span>My friends</span>
//             <span>Change settings</span>
//           </div>

//           <p className="mt-4 text-gray-700">{user.email} (not visible)</p>
//           <p className="mt-4"><strong>Last visit:</strong> <span className="text-green-600 font-semibold">online now</span></p>
//           <p className="mt-2 text-gray-700">Registered: 6 months ago</p>

//           <div className="mt-4 flex flex-col gap-2 text-blue-600 underline cursor-pointer">
//             <span>Start your own blog, Comments</span>
//             <span>Comments</span>
//             <span>View my talks</span>
//           </div>
//         </div>

//         {/* -------- RIGHT COLUMN -------- */}
//         <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col gap-6">
//           {/* Pay attention */}
//           <div className="bg-white border rounded-lg p-4 shadow-sm">
//             <h3 className="text-gray-700 font-semibold mb-2">→ Pay attention</h3>
//             <p className="text-center font-semibold text-gray-800">Before contest</p>
//             <p className="text-center text-blue-700 underline cursor-pointer">
//               Codeforces Round (Div. 2)
//             </p>
//             <p className="text-center text-gray-600 mt-1">28:20:58</p>
//             <p className="text-center text-blue-600 underline cursor-pointer mt-1">
//               Register now »
//             </p>
//           </div>

//           {/* Streams */}
//           <div className="bg-white border rounded-lg p-4 shadow-sm">
//             <h3 className="text-gray-700 font-semibold mb-2">→ Streams</h3>
//             <p className="text-blue-700 underline cursor-pointer">
//               Repovive Testing Round #2 — Solution Discussion
//             </p>
//             <p className="text-gray-600 text-sm mt-1">Before stream 06:20:58</p>
//             <p className="text-right text-blue-600 underline cursor-pointer text-sm mt-2">
//               View all →
//             </p>
//           </div>

//           {/* Mini profile */}
//           <div className="bg-white border rounded-lg p-4 shadow-sm">
//             <h3 className="font-semibold text-gray-700 mb-2">→ {user.name}</h3>
//             <p className="text-gray-800"><strong>Rating:</strong> 578</p>
//             <p className="text-gray-800"><strong>Contribution:</strong> 0</p>

//             <ul className="mt-3 text-blue-600 underline cursor-pointer flex flex-col gap-1">
//               <li>Settings</li>
//               <li>Blog</li>
//               <li>Teams</li>
//               <li>Submissions</li>
//               <li>Talks</li>
//               <li>Contests</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;


// import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext.jsx";
// import { UserCircle } from "lucide-react";

// type UserType = {
//   id?: string | number;
//   name?: string;
//   email?: string;
//   role?: string;
//   createdAt?: string;
//   rollNumber?: string;
//   branch?: string;
//   campus?: string;
// };

// interface HistoryItem {
//   id: string;
//   type: string;
//   description: string;
//   date: string;
// }

// const ProfilePage: React.FC = () => {
//   const { user } = useAuth() as { user: UserType };
//   const [history, setHistory] = useState<HistoryItem[]>([]);
  
//   // For Edit Profile form
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState<UserType>({});

//   useEffect(() => {
//     setHistory([
//       { id: "1", type: "link", description: "Created a new link", date: "2025-12-01" },
//       { id: "2", type: "submission", description: "Submitted assignment", date: "2025-12-05" },
//       { id: "3", type: "login", description: "Logged in", date: "2025-12-10" },
//     ]);

//     if (user) {
//       setFormData({
//         name: user.name,
//         rollNumber: user.rollNumber,
//         branch: user.branch,
//         campus: user.campus,
//         email: user.email,
//       });
//     }
//   }, [user]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Updated profile data:", formData);
//     setEditMode(false);
//     // Here you can call backend API to update user profile
//   };

//   if (!user) return <div>Loading...</div>;

//   return (
//     <div className="w-full p-6 bg-gray-50">
//       <div className="flex gap-6 justify-center flex-wrap">

//         {/* -------- LEFT COLUMN -------- */}
//         <div className="flex-1 min-w-[300px] max-w-[350px] bg-white border-2 rounded-lg p-6 shadow-sm flex flex-col items-center">
//           <div className="w-full h-[400px] border flex items-center justify-center bg-gray-100 rounded-xl">
//             <UserCircle className="w-48 h-48 text-gray-400" />
//           </div>

//           {/* Buttons evenly spread */}
//           <div className="mt-5 flex gap-4 w-full">
//             <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
//               Upload Photo
//             </button>
//             <button
//               className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
//               onClick={() => setEditMode(!editMode)}
//             >
//               Edit profile
//             </button>
//             <button className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer">
//               Change
//             </button>
//           </div>

//           {/* Edit Profile Form */}
//           {editMode && (
//             <form className="w-full mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Name"
//                 value={formData.name || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />
//               <input
//                 type="text"
//                 name="rollNumber"
//                 placeholder="Roll Number"
//                 value={formData.rollNumber || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />
//               <input
//                 type="text"
//                 name="branch"
//                 placeholder="Branch"
//                 value={formData.branch || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />
//               <input
//                 type="text"
//                 name="campus"
//                 placeholder="Campus"
//                 value={formData.campus || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email || ""}
//                 onChange={handleChange}
//                 className="border p-2 rounded-lg w-full"
//               />

//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
//               >
//                 Save
//               </button>
//             </form>
//           )}
//         </div>

//         {/* -------- CENTER COLUMN -------- */}
//         <div className="flex-1 min-w-[300px] max-w-[400px] bg-white border rounded-lg p-6 shadow-sm flex flex-col items-center">
//           <h2 className="text-gray-600 text-xl font-semibold">Newbie</h2>
//           <h1 className="text-3xl font-bold text-gray-800 mb-4">{user.name}</h1>

//           <p className="text-gray-700">
//             <strong>Contest rating:</strong> 578 <span className="text-sm text-gray-500">(max. newbie, 578)</span>
//           </p>
//           <p className="mt-3"><strong>Contribution:</strong> 0</p>
//           <p className="mt-2"><strong>Friend of:</strong> 0 users</p>

//           <div className="mt-4 flex flex-col gap-2 text-blue-600 underline cursor-pointer">
//             <span>My friends</span>
//             <span>Change settings</span>
//           </div>

//           <p className="mt-4 text-gray-700">{user.email} (not visible)</p>
//           <p className="mt-4"><strong>Last visit:</strong> <span className="text-green-600 font-semibold">online now</span></p>
//           <p className="mt-2 text-gray-700">Registered: 6 months ago</p>

//           <div className="mt-4 flex flex-col gap-2 text-blue-600 underline cursor-pointer">
//             <span>Start your own blog, Comments</span>
//             <span>Comments</span>
//             <span>View my talks</span>
//           </div>
//         </div>

//         {/* -------- RIGHT COLUMN -------- */}
//         <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col gap-6">
//           {/* Pay attention */}
//           <div className="bg-white border rounded-lg p-4 shadow-sm">
//             <h3 className="text-gray-700 font-semibold mb-2">→ Pay attention</h3>
//             <p className="text-center font-semibold text-gray-800">Before contest</p>
//             <p className="text-center text-blue-700 underline cursor-pointer">
//               Codeforces Round (Div. 2)
//             </p>
//             <p className="text-center text-gray-600 mt-1">28:20:58</p>
//             <p className="text-center text-blue-600 underline cursor-pointer mt-1">
//               Register now »
//             </p>
//           </div>

//           {/* Streams */}
//           <div className="bg-white border rounded-lg p-4 shadow-sm">
//             <h3 className="text-gray-700 font-semibold mb-2">→ Streams</h3>
//             <p className="text-blue-700 underline cursor-pointer">
//               Repovive Testing Round #2 — Solution Discussion
//             </p>
//             <p className="text-gray-600 text-sm mt-1">Before stream 06:20:58</p>
//             <p className="text-right text-blue-600 underline cursor-pointer text-sm mt-2">
//               View all →
//             </p>
//           </div>

//           {/* Mini profile */}
//           <div className="bg-white border rounded-lg p-4 shadow-sm">
//             <h3 className="font-semibold text-gray-700 mb-2">→ {user.name}</h3>
//             <p className="text-gray-800"><strong>Rating:</strong> 578</p>
//             <p className="text-gray-800"><strong>Contribution:</strong> 0</p>

//             <ul className="mt-3 text-blue-600 underline cursor-pointer flex flex-col gap-1">
//               <li>Settings</li>
//               <li>Blog</li>
//               <li>Teams</li>
//               <li>Submissions</li>
//               <li>Talks</li>
//               <li>Contests</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;


import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { UserCircle } from "lucide-react";

type UserType = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  rollNumber?: string;
  branch?: string;
  campus?: string;
};

interface HistoryItem {
  id: string;
  type: string;
  description: string;
  date: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth() as { user: UserType };
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserType>({});
  const [displayData, setDisplayData] = useState<UserType>({});

  useEffect(() => {
    setHistory([
      { id: "1", type: "link", description: "Created a new link", date: "2025-12-01" },
      { id: "2", type: "submission", description: "Submitted assignment", date: "2025-12-05" },
      { id: "3", type: "login", description: "Logged in", date: "2025-12-10" },
    ]);

    if (user) {
      const initialData = {
        name: user.name,
        rollNumber: user.rollNumber,
        branch: user.branch,
        campus: user.campus,
        email: user.email,
      };
      setFormData(initialData);
      setDisplayData(initialData);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDisplayData(formData); // Update center column
    setEditMode(false);       // Close form after submit
  };

  const handleReset = () => {
    setFormData(displayData); // Reset form to currently displayed values
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="w-full p-6 bg-gray-50">
      <div className="flex gap-6 justify-center flex-wrap">

        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-[300px] max-w-[350px] bg-white border-2 rounded-lg p-6 shadow-sm flex flex-col items-center">
          <div className="w-full h-[400px] border flex items-center justify-center bg-gray-100 rounded-xl">
            <UserCircle className="w-48 h-48 text-gray-400" />
          </div>

          {/* Buttons */}
          <div className="mt-5 flex gap-4 w-full">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              Upload Photo
            </button>
            <button
              className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => setEditMode(!editMode)}
            >
              Edit profile
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer">
              Change
            </button>
          </div>

          {/* Edit Profile Form */}
          {editMode && (
            <form className="w-full mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
              <label className="font-semibold">Name <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
                required
              />

              <label className="font-semibold">Roll Number <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber || ""}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
                required
              />

              <label className="font-semibold">Branch <span className="text-red-600">*</span></label>
              <input
                type="text"
                name="branch"
                value={formData.branch || ""}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
                required
              />

              <label className="font-semibold">Campus</label>
              <input
                type="text"
                name="campus"
                value={formData.campus || ""}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
              />

              <label className="font-semibold">Email <span className="text-red-600">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
                required
              />

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </form>
          )}
        </div>

        {/* CENTER COLUMN */}
        <div className="flex-1 min-w-[300px] max-w-[400px] bg-white border rounded-lg p-6 shadow-sm flex flex-col items-center">
          <h2 className="text-gray-600 text-xl font-semibold">Newbie</h2>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{displayData.name}</h1>

          <p className="text-gray-700"><strong>Roll Number:</strong> {displayData.rollNumber || "-"}</p>
          <p className="text-gray-700"><strong>Branch:</strong> {displayData.branch || "-"}</p>
          <p className="text-gray-700"><strong>Campus:</strong> {displayData.campus || "-"}</p>
          <p className="text-gray-700 mt-2"><strong>Email:</strong> {displayData.email}</p>
          <p className="text-gray-700 mt-3"><strong>Contribution:</strong> 0</p>
          <p className="mt-2"><strong>Friend of:</strong> 0 users</p>

          <div className="mt-4 flex flex-col gap-2 text-blue-600 underline cursor-pointer">
            <span>My friends</span>
            <span>Change settings</span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col gap-6">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-700 font-semibold mb-2">→ Pay attention</h3>
            <p className="text-center font-semibold text-gray-800">Before contest</p>
            <p className="text-center text-blue-700 underline cursor-pointer">Codeforces Round (Div. 2)</p>
            <p className="text-center text-gray-600 mt-1">28:20:58</p>
            <p className="text-center text-blue-600 underline cursor-pointer mt-1">Register now »</p>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-gray-700 font-semibold mb-2">→ Streams</h3>
            <p className="text-blue-700 underline cursor-pointer">
              Repovive Testing Round #2 — Solution Discussion
            </p>
            <p className="text-gray-600 text-sm mt-1">Before stream 06:20:58</p>
            <p className="text-right text-blue-600 underline cursor-pointer text-sm mt-2">View all →</p>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">→ {user.name}</h3>
            <p className="text-gray-800"><strong>Rating:</strong> 578</p>
            <p className="text-gray-800"><strong>Contribution:</strong> 0</p>

            <ul className="mt-3 text-blue-600 underline cursor-pointer flex flex-col gap-1">
              <li>Settings</li>
              <li>Blog</li>
              <li>Teams</li>
              <li>Submissions</li>
              <li>Talks</li>
              <li>Contests</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
