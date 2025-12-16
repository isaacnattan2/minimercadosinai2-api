import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dashboard } from '@/components/Dashboard';
import { AccessLogs } from '@/components/AccessLogs';
import { Users } from '@/components/Users';
import { LayoutDashboard, Clock, Users as UsersIcon, Store } from 'lucide-react';

type View = 'dashboard' | 'access-logs' | 'users';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'access-logs' as View, label: 'Registros de Acesso', icon: Clock },
    { id: 'users' as View, label: 'Usuarios', icon: UsersIcon },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Mini Mercado Sinai</h1>
                <p className="text-sm text-zinc-500">Sistema de Controle de Acesso</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav className="flex gap-2 mb-6 border-b border-zinc-200 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'default' : 'ghost'}
                onClick={() => setCurrentView(item.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <main>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'access-logs' && <AccessLogs />}
          {currentView === 'users' && <Users />}
        </main>
      </div>

      <footer className="border-t border-zinc-200 bg-white mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-zinc-500">
          Mini Mercado Sinai - Integracao iDFlex Pro
        </div>
      </footer>
    </div>
  );
}

export default App
