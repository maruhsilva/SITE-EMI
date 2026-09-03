import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, ShieldCheck, Lock, CreditCard, User, AlertCircle } from 'lucide-react';

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [erro, setErro] = useState('');

  // Estados de Autenticação
  const token = localStorage.getItem('token_fisioemi');
  const alunoLocal = JSON.parse(localStorage.getItem('aluno_fisioemi') || 'null');
  const isLoggedIn = !!token;

  // Estados do Formulário (caso o utilizador não tenha conta)
  const [isLoginView, setIsLoginView] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    // Vamos usar a sua rota pública da vitrine para encontrar os dados deste curso
    const carregarDadosDoCurso = async () => {
      try {
        const res = await axios.get('http://localhost:3000/vitrine');
        const cursoEncontrado = res.data.find(c => c.id === courseId);
        
        if (cursoEncontrado) {
          setCurso(cursoEncontrado);
        } else {
          setErro('Curso não encontrado.');
        }
      } catch (e) {
        setErro('Erro ao carregar os dados do curso.');
      } finally {
        setLoading(false);
      }
    };
    
    carregarDadosDoCurso();
  }, [courseId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErro('');
    setProcessing(true);

    try {
      let currentToken = token;

      // PASSO 1: Se o aluno não estiver logado, cria a conta ou faz login primeiro
      if (!isLoggedIn) {
        if (isLoginView) {
          // Faz login
          const loginRes = await axios.post('http://localhost:3000/login', {
            email: formData.email,
            password: formData.password
          });
          currentToken = loginRes.data.token;
          localStorage.setItem('token_fisioemi', currentToken);
          localStorage.setItem('aluno_fisioemi', JSON.stringify(loginRes.data.aluno));
        } else {
          // Cria uma nova conta (Vamos criar esta rota pública no backend a seguir)
          const cadastroRes = await axios.post('http://localhost:3000/cadastro-aluno', formData);
          currentToken = cadastroRes.data.token;
          localStorage.setItem('token_fisioemi', currentToken);
          localStorage.setItem('aluno_fisioemi', JSON.stringify(cadastroRes.data.aluno));
        }
      }

      // PASSO 2: Pede ao backend para gerar a cobrança no Mercado Pago
      // Passamos o ID do curso. O backend saberá quem é o aluno pelo token.
      const checkoutRes = await axios.post(
        'http://localhost:3000/checkout/iniciar',
        { courseId: curso.id },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      // PASSO 3: Redireciona o aluno para a página segura do Mercado Pago
      if (checkoutRes.data.urlPagamento) {
        window.location.href = checkoutRes.data.urlPagamento;
      } else {
        throw new Error("URL de pagamento não gerada.");
      }

    } catch (error) {
      setErro(error.response?.data?.erro || 'Ocorreu um erro ao iniciar o pagamento. Tente novamente.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (erro && !curso) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">{erro}</h2>
        <Link to="/" className="text-brand-blue font-bold hover:underline">Voltar à página inicial</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header Minimalista (Sem distrações) */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-brand-dark transition-colors font-medium text-sm">
          <ArrowLeft size={18} /> Voltar
        </Link>
        <div className="text-xl font-bold tracking-widest uppercase italic">
          FISIO EMI
        </div>
        <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-3 py-1.5 rounded-full">
          <ShieldCheck size={16} /> Checkout Seguro
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 py-10 lg:py-16 flex flex-col lg:flex-row gap-10">
        
        {/* COLUNA ESQUERDA: Resumo da Compra */}
        <div className="flex-1 lg:max-w-md">
          <h2 className="text-2xl font-extrabold text-brand-dark mb-6">Resumo do Pedido</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
            <div className="h-40 bg-gray-200 relative">
              {curso.thumbnail ? (
                <img src={curso.thumbnail} alt={curso.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-dark" />
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-brand-blue mb-2 leading-tight">{curso.title}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{curso.description}</p>
              
              <div className="space-y-3 border-t border-gray-100 pt-6 mb-6">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <span>Acesso vitalício a todos os módulos e atualizações.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <span>Certificado de conclusão reconhecido.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <span>Acompanhamento direto e tira-dúvidas na plataforma.</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
                <span className="text-gray-500 font-medium">Total a pagar:</span>
                <span className="text-2xl font-black text-brand-dark">
                  R$ {Number(curso.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Identificação e Ação */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-extrabold text-brand-dark mb-2">
              {isLoggedIn ? 'Pronto para finalizar?' : 'Crie sua conta para aceder'}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {isLoggedIn 
                ? 'Os seus dados estão seguros. Será redirecionado para a plataforma do Mercado Pago para efetuar o pagamento.'
                : 'Preencha os seus dados abaixo. Esta será a sua conta de acesso à área de alunos.'}
            </p>

            {erro && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-2 border border-red-100">
                <AlertCircle size={18} /> {erro}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-5">
              
              {/* VISTA PARA ALUNOS JÁ LOGADOS */}
              {isLoggedIn ? (
                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 border border-gray-200 mb-8">
                  <div className="bg-brand-gold/20 p-3 rounded-full text-brand-gold">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Conta Conectada</p>
                    <p className="font-bold text-gray-800">{alunoLocal?.nome || 'Aluno Fisio Emi'}</p>
                    <p className="text-sm text-gray-500">{alunoLocal?.email}</p>
                  </div>
                </div>
              ) : (
                /* VISTA PARA NOVOS ALUNOS OU LOGIN RÁPIDO */
                <>
                  {!isLoginView && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
                        placeholder="Como gostaria de ser chamado?"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
                      placeholder="O seu melhor e-mail"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Palavra-passe</label>
                    <input 
                      type="password" 
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
                      placeholder={isLoginView ? "A sua palavra-passe" : "Crie uma palavra-passe segura"}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => setIsLoginView(!isLoginView)}
                      className="text-sm text-brand-blue font-bold hover:underline"
                    >
                      {isLoginView ? 'Não tem conta? Criar agora' : 'Já tem conta? Iniciar sessão'}
                    </button>
                  </div>
                </>
              )}

              <div className="pt-4 mt-6 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={processing}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 text-lg"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Lock size={20} /> 
                      Ir para Pagamento Seguro
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                  <CreditCard size={14} /> Pagamento processado pelo Mercado Pago
                </div>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}