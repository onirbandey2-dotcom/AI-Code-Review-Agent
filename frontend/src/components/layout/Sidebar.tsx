import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  GitBranch,
  Code2,
  Shield,
  Bot,
  FileSearch,
  Settings,
  ChevronLeft,
  ChevronRight,
  Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: GitBranch, label: 'Repositories', path: '/repositories' },
  { icon: Code2, label: 'Code Review', path: '/reviews' },
  { icon: Shield, label: 'Security', path: '/security' },
  { icon: Bot, label: 'AI Chat', path: '/chat' },
  { icon: FileSearch, label: 'Code Explorer', path: '/explorer' },
];

const bottomLinks = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-sidebar-border px-4',
        collapsed ? 'justify-center' : 'gap-3',
      )}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Code2 className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">CodeSage</span>
            <span className="text-[10px] text-sidebar-foreground/50">AI Code Review</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              cn(
                'sidebar-link group',
                collapsed && 'justify-center px-2',
                isActive && 'active',
              )
            }
            title={collapsed ? link.label : undefined}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 hidden rounded-md bg-sidebar-accent px-2 py-1 text-xs text-sidebar-foreground shadow-lg group-hover:block">
                {link.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Links */}
      <div className="p-3">
        <Separator className="mb-3 bg-sidebar-border" />
        {bottomLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              cn(
                'sidebar-link',
                collapsed && 'justify-center px-2',
                isActive && 'active',
              )
            }
            title={collapsed ? link.label : undefined}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Collapse Button */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-sidebar-foreground/50 hover:text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
