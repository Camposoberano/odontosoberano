import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Shield, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllUserProfiles, useUpdateUserProfile } from '@/hooks/usePermissions';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  UserRole,
  UserProfile,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_PERMISSIONS
} from '@/types/permissions';
import { ProtectedByRole } from '@/components/auth/ProtectedByRole';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GerenciarUsuarios() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profiles, isLoading } = useAllUserProfiles();
  const { updateProfile } = useUpdateUserProfile();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    nome: string;
    role: UserRole;
    ativo: boolean;
  }>({ nome: '', role: 'SECRETARIA', ativo: true });

  const handleEdit = (profile: UserProfile) => {
    setEditingId(profile.id);
    setEditForm({
      nome: profile.nome,
      role: profile.role,
      ativo: profile.ativo
    });
  };

  const handleSave = async (profileId: string) => {
    try {
      await updateProfile(profileId, editForm);
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast({
        title: 'Sucesso!',
        description: 'Perfil atualizado com sucesso',
      });
      setEditingId(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <ProtectedByRole allowedRoles={['ADMIN', 'DEV']} showMessage>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="gap-2 border-2 hover:border-primary hover:bg-primary/5"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar ao Menu</span>
            </Button>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent rounded-xl border-l-4 border-l-primary shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              Gerenciar Usuários
            </h1>
            <p className="text-muted-foreground mt-2 ml-0 sm:ml-11">
              Gerencie os perfis e permissões dos usuários do sistema
            </p>
          </div>
        </div>

        {/* Legenda de Roles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Tipos de Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                <div
                  key={role}
                  className={`p-3 rounded-lg border-2 ${ROLE_COLORS[role]}`}
                >
                  <p className="font-bold text-sm">{ROLE_LABELS[role]}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {ROLE_PERMISSIONS[role].modules.length} módulos
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Usuários Cadastrados ({profiles?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !profiles || profiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum usuário cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>
                          {editingId === profile.id ? (
                            <Input
                              value={editForm.nome}
                              onChange={(e) =>
                                setEditForm({ ...editForm, nome: e.target.value })
                              }
                              className="w-40"
                            />
                          ) : (
                            <span className="font-medium">{profile.nome}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {profile.email}
                        </TableCell>
                        <TableCell>
                          {editingId === profile.id ? (
                            <Select
                              value={editForm.role}
                              onValueChange={(value) =>
                                setEditForm({ ...editForm, role: value as UserRole })
                              }
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {ROLE_LABELS[role]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant="outline"
                              className={ROLE_COLORS[profile.role]}
                            >
                              {ROLE_LABELS[profile.role]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === profile.id ? (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={editForm.ativo}
                                onCheckedChange={(checked) =>
                                  setEditForm({ ...editForm, ativo: checked })
                                }
                              />
                              <span className="text-sm">
                                {editForm.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                          ) : (
                            <Badge
                              variant={profile.ativo ? 'default' : 'secondary'}
                            >
                              {profile.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(profile.created_at), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === profile.id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSave(profile.id)}
                                className="gap-1"
                              >
                                <Save className="w-4 h-4" />
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(profile)}
                              className="gap-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              Editar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedByRole>
  );
}
