import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/login', {
        email,
        password
      });

      localStorage.setItem('token_fisioemi', response.data.token);
      localStorage.setItem('aluno_fisioemi', JSON.stringify(response.data.aluno));

      if (response.data.aluno.role === 'ADMIN') {
        navigate('/admin'); 
      } else {
        navigate('/dashboard'); 
      }

    } catch (error) {
      if (error.response && error.response.data && error.response.data.erro) {
        setErro(error.response.data.erro);
      } else {
        setErro('Erro de conexão com o servidor. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center gap-2 text-brand-gold hover:text-yellow-600 mb-6 transition-colors w-fit mx-auto sm:mx-0 font-medium">
          <ArrowLeft size={20} /> Voltar para a página inicial
        </Link>
        
        <div className="text-center">
          <div className="text-3xl font-bold tracking-widest uppercase italic text-brand-dark mb-2">
            FISIO EMI <span className="text-brand-gold not-italic font-normal text-sm ml-2">| ACADEMY</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-brand-blue">
            Acesse sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Bem-vindo de volta à sua área de estudos.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-brand-dark/5 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {erro && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-medium">{erro}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Endereço de E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-dark hover:bg-black'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition-all`}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Entrar na Plataforma'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}