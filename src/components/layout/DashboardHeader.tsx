import { useState } from "react";
import { Search, User, LogOut, Calendar, Users, Loader2, Home, Bell, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Dashboard header component with authentication
export function DashboardHeader() {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { results, isLoading } = useGlobalSearch(searchQuery);
  const { data: notificacoes = [] } = useNotificacoes();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      // Força navegação para tela de login
      navigate("/auth", { replace: true });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleResultClick = (result: any) => {
    if (result.type === "paciente") {
      navigate("/patients");
    } else if (result.type === "agendamento") {
      navigate("/appointments");
    }
    setSearchQuery("");
    setSearchOpen(false);
  };
    return (
      <header className="h-14 sm:h-16 border-b border-border/50 glass sticky top-0 z-10 transition-all duration-200">
        <div className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <SidebarTrigger className="hover-scale" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 hover-scale"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Menu Principal</span>
            </Button>
            <div className="hidden md:flex items-center gap-2 max-w-md w-full">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar pacientes, agendamentos..."
                      className="pl-9 bg-background"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchOpen(e.target.value.length >= 2);
                      }}
                      onFocus={() => {
                        if (searchQuery.length >= 2) {
                          setSearchOpen(true);
                        }
                      }}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                  <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : results.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        {searchQuery.length >= 2
                          ? "Nenhum resultado encontrado"
                          : "Digite ao menos 2 caracteres"}
                      </div>
                    ) : (
                      <div className="py-2">
                        {results.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={cn(
                              "w-full px-4 py-3 text-left hover:bg-accent transition-colors",
                              "flex items-start gap-3 border-b border-border last:border-0"
                            )}
                          >
                            <div className="mt-0.5">
                              {result.type === "paciente" ? (
                                <Users className="w-4 h-4 text-primary" />
                              ) : (
                                <Calendar className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {result.title}
                              </div>
                              {result.subtitle && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notificações */}
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notificacoes.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 shrink-0 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-white">
                      {notificacoes.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 mr-4" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Notificações
                  </h4>
                  <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">{notificacoes.length} novas</Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificacoes.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <p className="text-sm">Tudo certo por aqui!</p>
                      <p className="text-xs mt-1">Nenhuma notificação pendente.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notificacoes.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => { setNotifOpen(false); if(notif.link) navigate(notif.link); }}
                          className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex gap-3"
                        >
                          <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.tipo === 'FALTA' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{notif.titulo}</p>
                            <p className="text-sm text-muted-foreground leading-tight mt-1">{notif.mensagem}</p>
                            <p className="text-xs text-muted-foreground mt-2 opacity-75">
                              {notif.data && !isNaN(new Date(notif.data).getTime()) ? format(new Date(notif.data), "dd 'de' MMM", { locale: ptBR }) : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-2 border-t text-center bg-muted/20">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground w-full">
                    Marcar todas como lidas
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {profile?.foto_perfil_base64 ? (
                      <AvatarImage src={profile.foto_perfil_base64} alt="Foto de perfil" />
                    ) : null}
                    <AvatarFallback className="gradient-primary text-white">
                      {profile?.nome_exibicao?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.nome_exibicao || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
}