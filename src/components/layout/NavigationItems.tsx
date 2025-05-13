
import { Link } from "react-router-dom";

interface NavigationItemsProps {
  items: { name: string; path: string }[];
  isMobile?: boolean;
  onClick?: () => void;
}

export default function NavigationItems({ items, isMobile = false, onClick }: NavigationItemsProps) {
  if (isMobile) {
    return (
      <>
        {items.map(item => (
          <Link
            key={item.name}
            to={item.path}
            className="block px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={onClick}
          >
            {item.name}
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {items.map(item => (
        <Link 
          key={item.name}
          to={item.path}
          className="px-3 py-2 rounded-full text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          {item.name}
        </Link>
      ))}
    </>
  );
}
