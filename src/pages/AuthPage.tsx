// import React, { useEffect, useState } from 'react';
// import { LoginForm } from '../components/LoginForm';
// import { RegisterForm } from '../components/RegisterForm';
// import { analyticsAPI } from '../utils/api';

// export const AuthPage = () => {
//   useEffect(() => {
//     analyticsAPI.trackVisit('guest');
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
//       <div className="w-full max-w-md">
//         <LoginForm />
//       </div>
//     </div>
//   );
// };
import React, { useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';
import { NetworkBackground } from '../components/NetworkBackground';
import { analyticsAPI } from '../utils/api';

export const AuthPage = () => {
  useEffect(() => {
    analyticsAPI.trackVisit('guest');
  }, []);

  return (
    // Main Container
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center overflow-hidden">
      
      {/* 1. The Animated Background Layer */}
      <NetworkBackground />

      {/* 2. The Login Form (Centered & High Z-Index) */}
      <div className="relative z-20 w-full max-w-md px-4">
        <LoginForm />
        
        {/* Optional: Footer text below form */}
        <p className="mt-8 text-center text-xs text-gray-400">
          LinkConnect &copy; 2025. Connecting Aditya Engineering College.
        </p>
      </div>
    </div>
  );
};