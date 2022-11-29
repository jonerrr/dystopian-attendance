'use client';

import Dashboard from '../../components/Dashboard';
import testData from './testData';

export default function Page() {
  return <Dashboard data={testData.data} />;
}
