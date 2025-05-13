import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup, requestPasswordReset, authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isResetPassword) {
        // Para reset de senha, precisamos de um email válido
        if (!email.includes('@')) {
          toast.error('Por favor, forneça um email válido para recuperar a senha.');
          setIsSubmitting(false);
          return;
        }
        await requestPasswordReset(email);
      } else if (isLogin) {
        // Limpa espaços em branco extras e verifica campo vazio
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        
        if (!trimmedEmail || !trimmedPassword) {
          toast.error('Por favor, preencha todos os campos.');
          setIsSubmitting(false);
          return;
        }
        
        await login(trimmedEmail, trimmedPassword);
      } else {
        // Para cadastro, precisamos de um email válido
        if (!email.includes('@')) {
          toast.error('Por favor, forneça um email válido para o cadastro.');
          setIsSubmitting(false);
          return;
        }
        
        if (!name.trim()) {
          toast.error('Por favor, informe seu nome.');
          setIsSubmitting(false);
          return;
        }
        
        if (password.length < 6) {
          toast.error('A senha deve ter pelo menos 6 caracteres.');
          setIsSubmitting(false);
          return;
        }
        
        await signup(email, password);
      }
    } catch (error) {
      console.error('Erro no formulário de autenticação:', error);
      
      // Exibir mensagem genérica de erro ao usuário
      if (!authError) {
        toast.error('Ocorreu um erro durante a autenticação. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card shadow-lg rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email ou Username
          </label>
          <Input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@email.com ou username"
            required
          />
        </div>

        {!isLogin && !isResetPassword && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome
            </label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>
        )}

        {!isResetPassword && (
          <div>
            <div className="flex justify-between">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Senha
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setIsResetPassword(true)}
                  className="text-xs text-mouro-red hover:underline"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        )}

        {/* Exibe mensagem de erro caso exista */}
        {authError && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
            {authError}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full flex items-center justify-center bg-mouro-red hover:bg-mouro-red/90"
          disabled={isSubmitting}
        >
          <LogIn className="mr-2 h-4 w-4" />
          {isResetPassword
            ? 'Enviar email de recuperação'
            : isLogin
            ? 'Entrar'
            : 'Cadastrar'}
          {isSubmitting && <span className="ml-2">...</span>}
        </Button>
        
        {isResetPassword ? (
          <Button
            type="button"
            onClick={() => setIsResetPassword(false)}
            variant="outline"
            className="w-full"
          >
            Voltar ao login
          </Button>
        ) : (
          <div className="text-center text-sm">
            {isLogin ? (
              <span>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-mouro-red hover:underline"
                >
                  Cadastre-se
                </button>
              </span>
            ) : (
              <span>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-mouro-red hover:underline"
                >
                  Entrar
                </button>
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default AuthForm;
