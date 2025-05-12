
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
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
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
          className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
        >
          {item.name}
        </Link>
      ))}
    </>
  );
}
