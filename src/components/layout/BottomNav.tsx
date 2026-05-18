import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, Calendar, DollarSign, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Início",     icon: Home,     to: "/dashboard" },
  { label: "Pacientes",  icon: Users,    to: "/patients" },
  { label: "Agenda",     icon: Calendar, to: "/appointments" },
  { label: "Financeiro", icon: DollarSign, to: "/financeiro/contas-receber" },
] as const;

export function BottomNav() {
  const { toggleSidebar } = useSidebar();
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(to);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
          const active = isActive(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            >
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-full h-full",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all duration-200",
                    active ? "bg-primary/10" : "group-hover:bg-muted"
                  )}
                >
                  <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
                </div>
                <span className={cn("text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
                  {label}
                </span>
              </div>
            </NavLink>
          );
        })}

        {/* Botão Menu — abre sidebar */}
        <button
          onClick={toggleSidebar}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors active:text-primary"
        >
          <div className="p-1.5 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
