import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  created_at: string;
  action: string;
  table_name: string;
  user_email: string | null;
  user_role: string | null;
  changed_fields: string[] | null;
  data_summary: any;
  ip_address: string | null;
  record_id: string | null;
}

export default function LogsAuditoria() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { toast } = useToast();

  // Buscar logs de auditoria
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', currentPage, filterAction, filterTable],
    queryFn: async () => {
      let query = supabase
        .from('audit_log_readable')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }

      if (filterTable !== 'all') {
        query = query.eq('table_name', filterTable);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Erro ao carregar logs',
          description: 'Não foi possível carregar os logs de auditoria.',
          variant: 'destructive',
        });
        throw error;
      }

      return (data as AuditLog[]) || [];
    },
  });

  // Buscar total de logs para paginação
  const { data: totalCount } = useQuery({
    queryKey: ['audit-logs-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('audit_log')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  const totalPages = Math.ceil((totalCount || 0) / itemsPerPage);

  // Filtrar logs por termo de busca (client-side)
  const filteredLogs = logs?.filter(log =>
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Exportar logs para CSV
  const handleExportCSV = () => {
    if (!logs || logs.length === 0) {
      toast({
        title: 'Nenhum dado para exportar',
        description: 'Não há logs disponíveis para exportar.',
        variant: 'destructive',
      });
      return;
    }

    const csv = [
      ['Data/Hora', 'Usuário', 'Ação', 'Tabela', 'Campos Alterados', 'ID Registro'].join(','),
      ...logs.map(log => [
        format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
        log.user_email || 'Sistema',
        log.action,
        log.table_name,
        log.changed_fields?.join('; ') || 'N/A',
        log.record_id || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    link.click();

    toast({
      title: 'Exportado com sucesso',
      description: `${logs.length} registros exportados para CSV.`,
    });
  };

  const getActionBadgeVariant = (action: string): 'default' | 'destructive' | 'secondary' => {
    switch (action) {
      case 'DELETE':
        return 'destructive';
      case 'INSERT':
        return 'default';
      case 'UPDATE':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'INSERT': 'Criação',
      'UPDATE': 'Atualização',
      'DELETE': 'Exclusão',
      'LOGIN': 'Login',
      'LOGOUT': 'Logout',
      'PASSWORD_CHANGE': 'Mudança de Senha',
      'PERMISSION_CHANGE': 'Mudança de Permissão',
    };
    return labels[action] || action;
  };

  const getTableLabel = (table: string): string => {
    const labels: Record<string, string> = {
      'pacientes': 'Pacientes',
      'user_profiles': 'Perfis de Usuário',
      'dentistas': 'Dentistas',
      'funcionarios': 'Funcionários',
      'procedimentos_ppr': 'Procedimentos PPR',
      'procedimentos_pt_pm': 'Procedimentos PT/PM',
      'procedimentos_fixa': 'Procedimentos Fixa',
      'protocolo_provisorio': 'Protocolo Provisório',
      'protocolo_definitivo': 'Protocolo Definitivo',
      'contas_pagar': 'Contas a Pagar',
      'contas_receber': 'Contas a Receber',
    };
    return labels[table] || table;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Logs de Auditoria
            </h1>
            <p className="text-muted-foreground mt-1">
              Histórico completo de ações realizadas no sistema
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={!logs || logs.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
            <CardDescription>
              Filtre os logs por ação, tabela ou usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Email, tabela, ação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ação</label>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Ações</SelectItem>
                    <SelectItem value="INSERT">Criação</SelectItem>
                    <SelectItem value="UPDATE">Atualização</SelectItem>
                    <SelectItem value="DELETE">Exclusão</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tabela</label>
                <Select value={filterTable} onValueChange={setFilterTable}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Tabelas</SelectItem>
                    <SelectItem value="pacientes">Pacientes</SelectItem>
                    <SelectItem value="user_profiles">Perfis de Usuário</SelectItem>
                    <SelectItem value="dentistas">Dentistas</SelectItem>
                    <SelectItem value="funcionarios">Funcionários</SelectItem>
                    <SelectItem value="contas_pagar">Contas a Pagar</SelectItem>
                    <SelectItem value="contas_receber">Contas a Receber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Logs */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Campos Alterados</TableHead>
                    <TableHead>ID Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Carregando logs...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Shield className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Nenhum log encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{log.user_email || 'Sistema'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.user_role || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {getActionLabel(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {getTableLabel(log.table_name)}
                        </TableCell>
                        <TableCell>
                          {log.changed_fields && log.changed_fields.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {log.changed_fields.slice(0, 3).map((field, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {field}
                                </Badge>
                              ))}
                              {log.changed_fields.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{log.changed_fields.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.record_id ? log.record_id.slice(0, 8) + '...' : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {filteredLogs.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                  {Math.min(currentPage * itemsPerPage, totalCount || 0)} de {totalCount || 0} registros
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-sm font-medium">
                      Página {currentPage} de {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
