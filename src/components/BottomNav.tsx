interface NavItem {
  key: string;
  icon: string;
  label: string;
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
  active: string;
  onSelect: (key: string) => void;
}

export function BottomNav({ items, active, onSelect }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-color)] shadow-[0_-8px_24px_rgba(20,83,45,0.08)] safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 py-1 transition-colors ${
              active === item.key ? 'text-teal-800' : 'text-teal-600 hover:text-[var(--text-main)]'
            }`}
          >
            <div className="relative">
              <span className="text-xl">{item.icon}</span>
              {(item.badge ?? 0) > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[0.6rem] font-bold rounded-full">
                  {item.badge! > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[0.7rem] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
