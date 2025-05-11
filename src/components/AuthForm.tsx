
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { login, signup, requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetPassword) {
      // Para reset de senha, precisamos de um email válido
      if (!emailOrUsername.includes('@')) {
        toast.error('Por favor, forneça um email válido para recuperar a senha.');
        return;
      }
      await requestPasswordReset(emailOrUsername);
    } else if (isLogin) {
      await login(emailOrUsername, password);
    } else {
      // Para cadastro, precisamos de um email válido
      if (!emailOrUsername.includes('@')) {
        toast.error('Por favor, forneça um email válido para o cadastro.');
        return;
      }
      await signup(emailOrUsername, password);
    }
  };

  return (
    <div className="bg-card shadow-lg rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="emailOrUsername" className="block text-sm font-medium mb-1">
            {isLogin ? 'Email ou Nome de Usuário' : 'Email'}
          </label>
          <Input
            type={isLogin ? "text" : "email"}
            id="emailOrUsername"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder={isLogin ? "nome@email.com ou usuário" : "nome@email.com"}
            required
          />
        </div>
        
        {!isResetPassword && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Senha</label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        <Button type="submit" className="w-full bg-mouro-red hover:bg-mouro-red/90">
          <LogIn className="mr-2" />
          {isResetPassword ? 'Recuperar Senha' : isLogin ? 'Entrar' : 'Cadastrar'}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        {!isResetPassword && (
          <button
            onClick={() => setIsResetPassword(true)}
            className="text-sm text-mouro-red hover:underline"
          >
            Esqueceu sua senha?
          </button>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setIsResetPassword(false);
          }}
          className="text-sm text-mouro-red hover:underline"
        >
          {isLogin ? 'Ainda não é membro? Solicitar Associação' : 'Já é membro? Entrar'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
