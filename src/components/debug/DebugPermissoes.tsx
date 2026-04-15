import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, X } from 'lucide-react';

/**
 * Componente de Debug - Mostra permissões em tempo real
 *
 * COMO USAR:
 * 1. Adicione este componente em qualquer página (ex: Dashboard ou FixaDetail)
 * 2. Import: import { DebugPermissoes } from '@/components/debug/DebugPermissoes';
 * 3. Adicione no JSX: <DebugPermissoes />
 * 4. Veja suas permissões em tempo real
 * 5. REMOVA após confirmar que está tudo ok
 */
export function DebugPermissoes() {
  const {
    profile,
    role,
    isAdmin,
    isDev,
    canExecuteEtapa,
    permissions,
    isLoading
  } = usePermissions();

  if (isLoading) {
    return (
      <Card className="border-2 border-yellow-500 mb-4">
        <CardContent className="p-4">
          Carregando permissões...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-500 mb-4 bg-purple-50">
      <CardHeader className="bg-purple-100">
        <CardTitle className="text-purple-900 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          🔍 DEBUG - Permissões do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Informações do Perfil */}
        <div className="bg-white p-3 rounded-lg border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-2">📋 Perfil Atual</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Nome:</strong> {profile?.nome || 'N/A'}</p>
            <p><strong>Email:</strong> {profile?.email || 'N/A'}</p>
            <p><strong>Role:</strong> <Badge className="ml-2">{role}</Badge></p>
            <p><strong>Ativo:</strong> {profile?.ativo ? '✅ Sim' : '❌ Não'}</p>
          </div>
        </div>

        {/* Verificações Importantes */}
        <div className="bg-white p-3 rounded-lg border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-2">🎯 Verificações</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isAdmin ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
              <span className={isAdmin ? 'text-green-700 font-semibold' : 'text-red-700'}>
                É Admin/Dev: {isAdmin ? 'SIM ✅' : 'NÃO ❌'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isDev ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-gray-400" />}
              <span className={isDev ? 'text-green-700' : 'text-gray-500'}>
                É Dev: {isDev ? 'SIM' : 'NÃO'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {role === 'ADMIN' ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-gray-400" />}
              <span className={role === 'ADMIN' ? 'text-green-700 font-semibold' : 'text-gray-500'}>
                É Admin: {role === 'ADMIN' ? 'SIM ✅' : 'NÃO'}
              </span>
            </div>
          </div>
        </div>

        {/* Permissões de Etapas */}
        <div className="bg-white p-3 rounded-lg border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-2">🔧 Permissões de Etapas</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {canExecuteEtapa('DENTISTA') ?
                <Check className="w-4 h-4 text-green-600" /> :
                <X className="w-4 h-4 text-red-600" />
              }
              <span className={canExecuteEtapa('DENTISTA') ? 'text-green-700' : 'text-red-700'}>
                Executar etapas de DENTISTA: {canExecuteEtapa('DENTISTA') ? 'SIM ✅' : 'NÃO ❌'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {canExecuteEtapa('PROTETICO') ?
                <Check className="w-4 h-4 text-green-600" /> :
                <X className="w-4 h-4 text-red-600" />
              }
              <span className={canExecuteEtapa('PROTETICO') ? 'text-green-700' : 'text-red-700'}>
                Executar etapas de PROTÉTICO: {canExecuteEtapa('PROTETICO') ? 'SIM ✅' : 'NÃO ❌'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {canExecuteEtapa('SECRETARIA') ?
                <Check className="w-4 h-4 text-green-600" /> :
                <X className="w-4 h-4 text-red-600" />
              }
              <span className={canExecuteEtapa('SECRETARIA') ? 'text-green-700' : 'text-red-700'}>
                Executar etapas de SECRETARIA: {canExecuteEtapa('SECRETARIA') ? 'SIM ✅' : 'NÃO ❌'}
              </span>
            </div>
          </div>
        </div>

        {/* Módulos Permitidos */}
        <div className="bg-white p-3 rounded-lg border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-2">📦 Módulos com Acesso</h3>
          <div className="flex flex-wrap gap-2">
            {permissions?.modules.map((module) => (
              <Badge key={module} variant="outline" className="bg-green-50 text-green-700 border-green-300">
                {module}
              </Badge>
            ))}
          </div>
        </div>

        {/* Ações Permitidas */}
        <div className="bg-white p-3 rounded-lg border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-2">⚡ Ações Permitidas</h3>
          <div className="flex flex-wrap gap-2">
            {permissions?.actions.map((action) => (
              <Badge key={action} variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                {action}
              </Badge>
            ))}
          </div>
        </div>

        {/* Diagnóstico */}
        <div className={`p-3 rounded-lg border-2 ${
          role === 'ADMIN' || role === 'DEV'
            ? 'bg-green-50 border-green-500'
            : 'bg-red-50 border-red-500'
        }`}>
          <h3 className="font-bold mb-2">🩺 Diagnóstico</h3>
          {role === 'ADMIN' || role === 'DEV' ? (
            <div className="text-green-800">
              <p className="font-bold">✅ TUDO CERTO!</p>
              <p>Você tem acesso TOTAL como {role}.</p>
              <p>Pode executar todas as etapas de todos os procedimentos.</p>
            </div>
          ) : (
            <div className="text-red-800">
              <p className="font-bold">⚠️ ATENÇÃO!</p>
              <p>Seu role atual é: <strong>{role}</strong></p>
              <p>Você NÃO tem acesso total.</p>
              <p className="mt-2 text-sm">
                📝 Execute o script SQL em: supabase/migrations/61_verificar_perfil_admin.sql
              </p>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-300 text-sm">
          <p className="font-bold text-yellow-900 mb-1">💡 Instruções:</p>
          <ol className="list-decimal ml-4 space-y-1 text-yellow-800">
            <li>Se não está como ADMIN, execute o script SQL: <code className="bg-yellow-100 px-1 rounded">61_verificar_perfil_admin.sql</code></li>
            <li>Faça logout e login novamente</li>
            <li>Recarregue a página (F5)</li>
            <li>Verifique se as permissões mudaram para ✅</li>
            <li><strong>REMOVA este componente depois de verificar!</strong></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
