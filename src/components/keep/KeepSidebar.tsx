import { Lightbulb, Bell, Pencil, Archive, Trash2 } from "lucide-react";

interface KeepSidebarProps {
  expanded: boolean;
  activeItem: string;
  onItemClick: (item: string) => void;
}

const navItems = [
  { id: "notes", label: "Ghi chú", icon: Lightbulb },
  { id: "reminders", label: "Lời nhắc", icon: Bell },
  { id: "edit-labels", label: "Chỉnh sửa nhãn", icon: Pencil },
  { id: "archive", label: "Lưu trữ", icon: Archive },
  { id: "trash", label: "Thùng rác", icon: Trash2 },
];

const KeepSidebar = ({ expanded, activeItem, onItemClick }: KeepSidebarProps) => {
  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] bg-keep-sidebar transition-all duration-200 ease-in-out flex-shrink-0 z-20 ${
        expanded ? "w-[280px]" : "w-[72px]"
      }`}
    >
      <nav className="pt-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`flex items-center w-full h-12 transition-colors group ${
                expanded ? "px-3" : "px-3 justify-center"
              } ${
                isActive
                  ? "bg-keep-sidebar-active rounded-r-full"
                  : "hover:bg-keep-sidebar-hover rounded-r-full"
              }`}
              title={!expanded ? item.label : undefined}
            >
              <div className={`flex items-center justify-center w-12 h-12 flex-shrink-0`}>
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-foreground" : "text-keep-icon"
                  }`}
                />
              </div>
              {expanded && (
                <span
                  className={`ml-3 text-sm font-medium whitespace-nowrap ${
                    isActive ? "text-foreground" : "text-keep-icon"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default KeepSidebar;
