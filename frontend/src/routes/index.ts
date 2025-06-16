import React from 'react';
import Home from '../components/Home';
import { userRoutes } from './userRoutes';
import { adminRoutes } from './adminRoutes';

export const appRoutes = [
  {
    path: '/',
    element: React.createElement(Home),
  },
  userRoutes,
  adminRoutes,
];
