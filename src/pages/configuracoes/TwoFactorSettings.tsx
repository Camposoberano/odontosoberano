import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Home, Smartphone, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProtectedByRole } from '@/components/auth/ProtectedByRole';

export function TwoFactorSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  // States for the enrollment process
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    checkEnrollmentStatus();
  }, [user]);

  const checkEnrollmentStatus = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const totpFactor = data.all.find(f => f.factor_type === 'totp' && f.status === 'verified');
      if (totpFactor) {
        setIsEnrolled(true);
      }
    } catch (err: any) {
      console.error('Error checking MFA status:', err);
    }
  };

  const startEnrollment = async () => {
    setLoading(true);
    try {
      // Create a new TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      
      if (error) throw error;
      
      setFactorId(data.id);
      setQrCodeData(data.totp.qr_code);
    } catch (err: any) {
      console.error('Error starting MFA enrollment:', err);
      toast.error('Erro ao iniciar configuração 2FA: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (!factorId || !verificationCode || verificationCode.length < 6) {
      toast.error('Digite o código de 6 dígitos gerado pelo aplicativo.');
      return;
    }
    
    setLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verificationCode
      });
      
      if (verify.error) throw verify.error;
      
      setIsEnrolled(true);
      setQrCodeData(null);
      setFactorId(null);
      setVerificationCode('');
      toast.success('Autenticação de 2 Fatores habilitada com sucesso!');
    } catch (err: any) {
      console.error('Error verifying MFA:', err);
      toast.error('Código inválido ou expirado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    if(!confirm("Tem certeza que deseja desabilitar a segurança de 2 fatores? Sua conta ficará mais vulnerável.")) {
        return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const totpFactor = data.all.find(f => f.factor_type === 'totp');
      if (totpFactor) {
         const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
         if (unenrollError) throw unenrollError;
         
         setIsEnrolled(false);
         toast.success('Autenticação de 2 Fatores desabilitada.');
      }
    } catch (err: any) {
       console.error('Error disabling MFA:', err);
       toast.error('Erro ao desabilitar 2FA: ' + err.message);
    } finally {
       setLoading(false);
    }
  };

  return (
    <ProtectedByRole allowedRoles={['ADMIN', 'DEV']} showMessage>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/configuracoes/usuarios')}
              className="gap-2 border-2 hover:border-primary hover:bg-primary/5"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar para Usuários</span>
            </Button>
          </div>

          <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl border-l-4 border-l-blue-400 shadow-sm text-white">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-blue-300" />
              </div>
              Segurança
            </h1>
            <p className="text-slate-300 mt-2 ml-0 sm:ml-11">
              Configure a Autenticação em 2 Fatores (2FA) para proteger sua conta administrativa.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Autenticação de Dois Fatores (MFA/2FA)
              </CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança usando um aplicativo autenticador como Google Authenticator ou Authy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEnrolled ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-green-900 font-bold text-lg">2FA Ativado!</h3>
                    <p className="text-green-700 text-sm mt-1">Sua conta administrativa está protegida com autenticação em dois fatores.</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={disableMFA} 
                    disabled={loading}
                    className="mt-4"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Desabilitar Segurança 2FA
                  </Button>
                </div>
              ) : qrCodeData ? (
                <div className="bg-slate-50 border rounded-lg p-6 space-y-6 max-w-sm mx-auto">
                   <div className="text-center">
                       <h3 className="font-bold text-lg text-slate-800">Escaneie o QR Code</h3>
                       <p className="text-sm text-slate-500 mt-1">Abra seu App Autenticador (Google Auth, Authy) e adicione a Odonto PRO escaneando a imagem abaixo.</p>
                   </div>
                   
                   <div className="bg-white p-4 rounded-lg flex justify-center w-full mx-auto" dangerouslySetInnerHTML={{ __html: qrCodeData }} />
                   
                   <div className="space-y-3">
                       <Label htmlFor="code" className="text-center block">Digite o código de 6 dígitos gerado:</Label>
                       <Input 
                         id="code"
                         type="text" 
                         maxLength={6}
                         placeholder="000000" 
                         value={verificationCode}
                         onChange={(e) => setVerificationCode(e.target.value)}
                         className="text-center text-2xl tracking-widest font-mono"
                       />
                       <Button 
                         className="w-full" 
                         onClick={verifyAndEnable}
                         disabled={loading || verificationCode.length < 6}
                       >
                         {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verificar e Ativar"}
                       </Button>
                       <Button variant="ghost" className="w-full" onClick={() => { setQrCodeData(null); setFactorId(null); }}>
                           Cancelar
                       </Button>
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      Recomendamos fortemente a habilitação do 2FA para contas com perfil ADMIN ou FINANCEIRO para evitar fraudes ou vazamentos de dados de pacientes (conforme LGPD).
                    </div>
                  </div>
                  <Button onClick={startEnrollment} disabled={loading} size="lg">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Configurar Aplicativo Autenticador"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedByRole>
  );
}
