
import { NavLink } from 'react-router-dom';
import { Home, Users, GlassWater, Users2, Settings, Car } from 'lucide-react';

export function MembersSidebar() {
  return (
    <aside className="bg-mouro-black h-full w-64 flex flex-col">
      <div className="p-4">
        <h1 className="text-white text-xl font-bold">Mouro Racing</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center p-2 text-white rounded-md hover:bg-white/10 ${isActive ? 'bg-white/20' : ''}`
              }
            >
              <Home className="mr-2 h-5 w-5" />
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/membros" 
              className={({ isActive }) => 
                `flex items-center p-2 text-white rounded-md hover:bg-white/10 ${isActive ? 'bg-white/20' : ''}`
              }
            >
              <Users className="mr-2 h-5 w-5" />
              Membros
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/administracao" 
              className={({ isActive }) => 
                `flex items-center p-2 text-white rounded-md hover:bg-white/10 ${isActive ? 'bg-white/20' : ''}`
              }
            >
              <Users2 className="mr-2 h-5 w-5" />
              Administração
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/bar" 
              className={({ isActive }) => 
                `flex items-center p-2 text-white rounded-md hover:bg-white/10 ${isActive ? 'bg-white/20' : ''}`
              }
            >
              <GlassWater className="mr-2 h-5 w-5" />
              Bar
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/garagem" 
              className={({ isActive }) => 
                `flex items-center p-2 text-white rounded-md hover:bg-white/10 ${isActive ? 'bg-white/20' : ''}`
              }
            >
              <Car className="mr-2 h-5 w-5" />
              Garagem
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/configuracoes" 
              className={({ isActive }) => 
                `flex items-center p-2 text-white rounded-md hover:bg-white/10 ${isActive ? 'bg-white/20' : ''}`
              }
            >
              <Settings className="mr-2 h-5 w-5" />
              Configurações
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
