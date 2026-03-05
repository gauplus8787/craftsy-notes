import { Menu, Search, RefreshCw, LayoutGrid, Settings, User } from "lucide-react";
import { useSidebarContext } from "@/contexts/SidebarContext";

const KeepHeader = () => {
  const { toggle } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 p-2 border-b border-border bg-keep-header keep-header-shadow">
      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          className="p-3 rounded-full hover:bg-secondary transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6 text-keep-icon" />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png"
            alt="Keep"
            className="w-10 h-10"
          />
          <span className="text-[22px] font-display text-keep-header-foreground hidden sm:block">
            Keep
          </span>
        </div>
      </div>

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
