import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLoginRateLimit } from '@/hooks/useRateLimit';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkRateLimit } = useLoginRateLimit();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    // Verificar rate limiting antes de tentar login
    if (!checkRateLimit()) {
      return; // Bloqueado por muitas tentativas
    }

    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Instituto Belém",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: "linear-gradient(135deg, #010101 0%, #1a1a1a 60%, #2a2a2a 100%)"}}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/belem/logo-ib.jpg"
              alt="Instituto Belém"
              className="w-32 h-32 rounded-2xl object-cover shadow-2xl"
              style={{boxShadow: "0 0 40px rgba(248,204,114,0.3)"}}
            />
          </div>
          <h1 className="text-3xl font-bold" style={{color: "#f8cc72"}}>Instituto Belém</h1>
          <p className="mt-2 text-sm tracking-widest uppercase" style={{color: "rgba(248,204,114,0.6)"}}>Odontologia Especializada</p>
        </div>

        <Card className="border-0 shadow-2xl" style={{background: "#1a1a1a", borderTop: "2px solid #f8cc72"}}>
          <CardHeader className="text-center">
            <CardTitle style={{color: "#f8cc72"}}>Acesse sua conta</CardTitle>
            <CardDescription style={{color: "rgba(248,204,114,0.6)"}}>
              Entre com suas credenciais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" style={{color: "rgba(248,204,114,0.8)"}}>Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/30 border-yellow-900/40 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" style={{color: "rgba(248,204,114,0.8)"}}>Senha</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/30 border-yellow-900/40 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full font-bold tracking-wide"
                style={{background: "#f8cc72", color: "#010101"}}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Sistema seguro e confiável para gestão odontológica
        </p>
      </div>
    </div>
  );
}