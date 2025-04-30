
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { login, signup, requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetPassword) {
      await requestPasswordReset(email);
    } else if (isLogin) {
      await login(email, password);
    } else {
      await signup(email, password);
    }
  };

  return (
    <div className="bg-card shadow-lg rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
