import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface Props {
  children?: ReactNode;
}

export function AppLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
