import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  end?: boolean;
}

export function NavLink({ to, children, className, activeClassName, end }: NavLinkProps) {
  const { pathname } = useLocation();
  
  const isActive = end 
    ? pathname === to 
    : pathname.startsWith(to);

  return (
    <Link 
      to={to} 
      className={cn(className, isActive && activeClassName)}
    >
      {children}
    </Link>
  );
}
