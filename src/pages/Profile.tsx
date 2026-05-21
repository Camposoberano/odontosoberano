import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { User, Mail, Calendar, Shield, Phone, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome_exibicao: '',
    telefone: '',
  });

  // Atualizar formData quando o perfil carregar
  useEffect(() => {
    if (profile) {
      setFormData({
        nome_exibicao: profile.nome_exibicao || '',
        telefone: profile.telefone || '',
      });
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        nome_exibicao: profile.nome_exibicao || '',
        telefone: profile.telefone || '',
      });
    }
  };

  const [senhaForm, setSenhaForm] = useState({ nova: '', confirmar: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  const handleTrocarSenha = async () => {
    if (!senhaForm.nova || !senhaForm.confirmar) {
      toast({ title: 'Preencha os campos', variant: 'destructive' });
      return;
    }
    if (senhaForm.nova !== senhaForm.confirmar) {
      toast({ title: 'Senhas não coincidem', variant: 'destructive' });
      return;
    }
    if (senhaForm.nova.length < 8) {
      toast({ title: 'Senha muito curta', description: 'Mínimo 8 caracteres.', variant: 'destructive' });
      return;
    }
    setTrocandoSenha(true);
    const { error } = await supabase.auth.updateUser({ password: senhaForm.nova });
    setTrocandoSenha(false);
    if (error) {
      toast({ title: 'Erro ao trocar senha', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Senha alterada!', description: 'Sua senha foi atualizada com sucesso.' });
      setSenhaForm({ nova: '', confirmar: '' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Perfil do Usuário</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências da conta
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center">
                    <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                      <AvatarFallback className="gradient-primary text-white text-xl sm:text-2xl">
                        {formData.nome_exibicao?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nome de Exibição</Label>
                      <Input
                        id="displayName"
                        value={formData.nome_exibicao}
                        onChange={(e) => setFormData({ ...formData, nome_exibicao: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Seu nome"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <div className="flex">
                        <Phone className="w-4 h-4 mr-2 mt-3 text-muted-foreground flex-shrink-0" />
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                          disabled={!isEditing}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex">
                        <Mail className="w-4 h-4 mr-2 mt-3 text-muted-foreground flex-shrink-0" />
                        <Input
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Função</Label>
                      <div className="flex">
                        <Shield className="w-4 h-4 mr-2 mt-3 text-muted-foreground flex-shrink-0" />
                        <Input
                          id="role"
                          value="Administrador"
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                        Editar Perfil
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={handleSave} 
                          className="w-full sm:w-auto"
                          disabled={isUpdating}
                        >
                          {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Salvar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleCancel} 
                          className="w-full sm:w-auto"
                          disabled={isUpdating}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">ID do Usuário</Label>
                  <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1 break-all">
                    {user?.id || 'N/A'}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Data de Criação</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Último Login</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Status da Conta</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">Ativo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card: Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <div className="space-y-1">
              <Label>Nova senha</Label>
              <div className="relative">
                <Input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={senhaForm.nova}
                  onChange={e => setSenhaForm({ ...senhaForm, nova: e.target.value })}
                  className="pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setMostrarSenha(v => !v)}>
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Confirmar nova senha</Label>
              <Input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={senhaForm.confirmar}
                onChange={e => setSenhaForm({ ...senhaForm, confirmar: e.target.value })}
              />
            </div>
            <Button onClick={handleTrocarSenha} disabled={trocandoSenha} className="gap-2">
              {trocandoSenha ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {trocandoSenha ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}