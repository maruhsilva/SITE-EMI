import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, CheckCircle, ArrowRight, User } from 'lucide-react';

export default function Home() {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verifica se o usuário já está logado
  const isLoggedIn = !!localStorage.getItem('token_fisioemi');

  useEffect(() => {
    const carregarVitrine = async () => {
      try {
        const res = await axios.get('http://localhost:3000/vitrine');
        setCursos(res.data);
      } catch (e) {
        console.error('Erro ao buscar cursos', e);
      } finally {
        setLoading(false);
      }
    };
    carregarVitrine();
  }, []);

  const handleComprar = (cursoId) => {
  navigate(`/checkout/${cursoId}`);
};

  return (
    <div className="min-h-screen bg-brand-light font-sans text-gray-800">
      
      {/* CABEÇALHO PÚBLICO */}
      <header className="bg-brand-dark text-white p-5 shadow-lg relative z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold tracking-widest uppercase italic">
            FISIO EMI <span className="text-brand-gold not-italic font-normal text-sm ml-2">| Academy</span>
          </div>
          
          <nav>
            {isLoggedIn ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 bg-brand-gold hover:bg-brand-goldHover text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-md"
              >
                <User size={18} /> Meu Painel
              </button>
            ) : (
              <Link 
                to="/login"
                className="text-gray-300 hover:text-white font-semibold transition-colors flex items-center gap-2"
              >
                Já sou aluno <ArrowRight size={18} />
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* HERO SECTION (SESSÃO DE DESTAQUE) */}
      <section className="bg-brand-blue text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-0"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <span className="bg-brand-gold/20 text-brand-gold px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-6 inline-block">
            Especialização Profissional
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Eleve sua prática clínica ao <span className="text-brand-gold">próximo nível</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Treinamentos completos em reabilitação, baseados em evidência científica e prática clínica real com a Dra. Êmili Mendes.
          </p>
          <a 
            href="#cursos" 
            className="inline-flex items-center gap-3 bg-brand-gold hover:bg-yellow-500 text-white text-lg font-bold py-4 px-8 rounded-full transition-all shadow-xl hover:shadow-brand-gold/30 hover:-translate-y-1"
          >
            <PlayCircle size={24} /> Conhecer Treinamentos
          </a>
        </div>
      </section>

      {/* VITRINE DE CURSOS */}
      <section id="cursos" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Formações Disponíveis</h2>
            <div className="w-20 h-1 bg-brand-gold mx-auto rounded-full"></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
            </div>
          ) : cursos.length === 0 ? (
            <div className="text-center text-gray-500 py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              Nenhuma turma com vagas abertas no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cursos.map((curso) => (
                <div key={curso.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col hover:shadow-xl transition-shadow group">
                  
                  {/* IMAGEM DA CAPA */}
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {curso.thumbnail ? (
                      <img 
                        src={curso.thumbnail} 
                        alt={`Capa do curso ${curso.title}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-dark flex items-center justify-center text-brand-gold/20">
                        <PlayCircle size={64} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-dark shadow-sm">
                      Online
                    </div>
                  </div>

                  {/* INFORMAÇÕES DO CURSO */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-brand-blue mb-3 line-clamp-2">
                      {curso.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-1">
                      {curso.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-500" /> Acesso imediato
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-500" /> Certificado de conclusão
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-auto border-t border-gray-100 pt-6">
                      <div>
                        <span className="block text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Investimento</span>
                        <span className="text-2xl font-black text-brand-dark">
                          R$ {Number(curso.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleComprar(curso.id)}
                        className="bg-brand-dark hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md"
                      >
                        Garantir Vaga
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="bg-brand-dark text-white text-center py-8 border-t border-white/10">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Fisio Emi Academy. Todos os direitos reservados.
        </p>
      </footer>

    </div>
  );
}