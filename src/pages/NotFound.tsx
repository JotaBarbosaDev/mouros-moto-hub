
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold text-mouro-red mb-4">404</h1>
      <p className="text-xl text-mouro-black mb-8">Página não encontrada</p>
      <Button asChild className="bg-mouro-red hover:bg-mouro-red/90">
        <Link to="/">Voltar ao Início</Link>
      </Button>
    </div>
  );
};

export default NotFound;
