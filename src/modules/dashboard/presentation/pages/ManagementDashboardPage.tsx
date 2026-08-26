// src/modules/dashboard/presentation/pages/ManagementDashboardPage.tsx

import React from 'react';
import { DashboardPage } from './DashboardPage';
import { UserRepository } from '../../../../core/infrastructure/repositories';

export const ManagementDashboardPage: React.FC = () => {
  const users = UserRepository.getAll();
  const managerUser = users.find(u => u.role === 'Manager') || users[0];

  return <DashboardPage user={managerUser} />;
};

export default ManagementDashboardPage;
