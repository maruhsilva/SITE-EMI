import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, LogOut, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';

export default function Dashboard() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aluno, setAluno] = useState({ nome: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const dadosAluno = localStorage.getItem('aluno_fisioemi');
    if (dadosAluno) {
      setAluno(JSON.parse(dadosAluno));
    }

    const carregarCursos = async () => {
      try {
        const token = localStorage.getItem('token_fisioemi');
        const response = await axios.get('http://localhost:3000/meus-cursos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCursos(response.data);
      } catch (error) {
        console.error('Erro ao carregar cursos', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCursos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token_fisioemi');
    localStorage.removeItem('aluno_fisioemi');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans text-gray-800">
      <header className="bg-brand-dark text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold tracking-widest uppercase italic hover:text-brand-gold transition-colors">
            FISIO EMI <span className="text-brand-gold not-italic font-normal text-sm ml-2">| ACADEMY</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
              <GraduationCap size={20} className="text-brand-gold" />
              <span>Área do Aluno</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 font-medium transition-colors text-sm bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold text-brand-dark mb-2">
              Olá, <span className="text-brand-blue">{aluno.nome.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-gray-500 text-lg">
              Que bom ter você por aqui. Pronto para continuar a sua evolução?
            </p>
          </div>
          
          <div className="relative z-10 shrink-0 hidden md:block">
            <div className="bg-brand-gold/10 text-brand-gold p-4 rounded-full">
              <BookOpen size={40} />
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-blue flex items-center gap-2">
            Meus Treinamentos
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
          </div>
        ) : cursos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum treinamento encontrado</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Você ainda não está matriculado em nenhum dos nossos cursos. Conheça as formações da Dra. Êmili Mendes e eleve a sua prática clínica.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md">
              Conhecer Formações <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cursos.map((curso) => (
              <div key={curso.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group transform hover:-translate-y-1">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {curso.thumbnail ? (
                    <img src={curso.thumbnail} alt={curso.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  ) : (
                    <div className="w-full h-full bg-brand-dark flex items-center justify-center text-brand-gold/20"><PlayCircle size={64} /></div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-brand-dark mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
                    {curso.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">
                    {curso.description}
                  </p>
                  
                  {/* LINK AJUSTADO PARA NÃO FORÇAR AULA 1 */}
                  <Link to={`/curso/${curso.id}`} className="w-full mt-auto">
                    <button className="w-full bg-brand-blue hover:bg-brand-dark text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md">
                      <PlayCircle size={20} className="text-brand-gold" /> 
                      Acessar Turma
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}