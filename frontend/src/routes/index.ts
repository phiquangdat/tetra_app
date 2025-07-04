import React from 'react';
import Home from '../components/home/Home';
import { userRoutes } from './userRoutes';
import { adminRoutes } from './adminRoutes';

export const appRoutes = [
  {
    path: '/',
    element: React.createElement(Home),
  },
  {
    path: '/login',
    element: React.createElement(Home),
  },
  userRoutes,
  adminRoutes,
];
