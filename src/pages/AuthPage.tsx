import React, { useEffect, useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { analyticsAPI } from '../utils/api';

export const AuthPage = () => {
  useEffect(() => {
    analyticsAPI.trackVisit('guest');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};
