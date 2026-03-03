import { Menu, Search, RefreshCw, LayoutGrid, Settings, User } from "lucide-react";

interface KeepHeaderProps {
  onToggleSidebar: () => void;
}

const KeepHeader = ({ onToggleSidebar }: KeepHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex items-center h-16 px-4 border-b border-border bg-keep-header">
      {/* Left: Logo + Toggle */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleSidebar}
          className="p-3 rounded-full hover:bg-secondary transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-keep-icon" />
        </button>
        <div className="flex items-center gap-2 ml-1">
          <img
            src="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png"
            alt="Keep"
            className="w-8 h-8"
          />
          <span className="text-[22px] font-display text-keep-header-foreground hidden sm:block">
            Keep
          </span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-[720px] mx-8">
        <div className="flex items-center bg-keep-search rounded-lg px-4 py-2.5 gap-3 hover:keep-shadow transition-shadow">
          <Search className="w-5 h-5 text-keep-icon flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-base"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button className="p-3 rounded-full hover:bg-secondary transition-colors hidden sm:flex">
          <RefreshCw className="w-5 h-5 text-keep-icon" />
        </button>
        <button className="p-3 rounded-full hover:bg-secondary transition-colors hidden sm:flex">
          <LayoutGrid className="w-5 h-5 text-keep-icon" />
        </button>
        <button className="p-3 rounded-full hover:bg-secondary transition-colors">
          <Settings className="w-5 h-5 text-keep-icon" />
        </button>
        <button className="p-3 rounded-full hover:bg-secondary transition-colors ml-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default KeepHeader;
