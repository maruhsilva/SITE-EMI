import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, PlayCircle, CheckCircle, Menu, FileText, Trophy, Play, Edit3, BookOpen, List, MessageSquare, Maximize2, Minimize2, X, Send, Lock, GraduationCap, ChevronRight } from 'lucide-react';

export default function CoursePlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [curso, setCurso] = useState(null);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  
  const [aulasConcluidas, setAulasConcluidas] = useState([]);
  const [salvando, setSalvando] = useState(false); 

  const [notasCurso, setNotasCurso] = useState([]); 
  const [textoNota, setTextoNota] = useState(''); 
  const [abaAtual, setAbaAtual] = useState('sobre'); 
  const [sidebarTab, setSidebarTab] = useState('modulos'); 
  const [abaWelcome, setAbaWelcome] = useState('resumo');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  const [salvandoNota, setSalvandoNota] = useState(false);
  const [notaFeedback, setNotaFeedback] = useState('');

  const playerContainerRef = useRef(null);
  const token = localStorage.getItem('token_fisioemi');

  const carregarNotas = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/cursos/${courseId}/notas`, { headers: { Authorization: `Bearer ${token}` } });
      setNotasCurso(response.data);
    } catch (e) { console.error(e); }
  };

  const carregarCursoCompleto = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/cursos/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      const dadosCurso = response.data;
      setCurso(dadosCurso);

      const concluidasIds = [];
      dadosCurso.modules.forEach(modulo => {
        modulo.lessons.forEach(aula => {
          if (aula.progress?.[0]?.completed) concluidasIds.push(aula.id);
        });
      });
      setAulasConcluidas(concluidasIds); 

      let aulaParaExibir = null;
      if (lessonId) {
        dadosCurso.modules.forEach(modulo => {
          const enc = modulo.lessons.find(l => l.id === lessonId);
          if (enc) aulaParaExibir = enc;
        });
      }
      setAulaAtual(aulaParaExibir);
      setAbaAtual('sobre'); 

    } catch (error) { setErro('Não foi possível carregar o curso.'); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    carregarCursoCompleto();
    carregarNotas();
  }, [courseId, lessonId]);

  useEffect(() => {
    setTextoNota(''); 
    setIsChatOpen(false); 
    setIsSidebarOpen(false); 
  }, [aulaAtual]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFocusMode(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleConcluirAula = async () => {
    setSalvando(true);
    try {
      await axios.post('http://localhost:3000/progresso', { lessonId: aulaAtual.id }, { headers: { Authorization: `Bearer ${token}` } });
      setAulasConcluidas(prev => [...prev, aulaAtual.id]);
    } catch (error) { console.error('Erro ao salvar progresso.'); } 
    finally { setSalvando(false); }
  };

  const handleSalvarNota = async () => {
    if (!textoNota.trim()) return; 
    setSalvandoNota(true);
    setNotaFeedback(''); 
    try {
      await axios.post('http://localhost:3000/notas', { lessonId: aulaAtual.id, content: textoNota }, { headers: { Authorization: `Bearer ${token}` } });
      await carregarNotas(); 
      setTextoNota(''); 
      setNotaFeedback('Salvo! ✓');
      setTimeout(() => setNotaFeedback(''), 2000); 
    } catch (e) {
      setNotaFeedback('Erro ao salvar.');
      setTimeout(() => setNotaFeedback(''), 2000);
    } finally { setSalvandoNota(false); }
  };

  const toggleFocusMode = () => {
    if (!document.fullscreenElement) playerContainerRef.current?.requestFullscreen().catch(err => console.error(err));
    else document.exitFullscreen();
  };

  const isModuleUnlocked = (moduleIndex) => {
    if (moduleIndex === 0) return true; 
    const prevModule = curso.modules[moduleIndex - 1];
    const examLesson = prevModule.lessons.find(l => l.type === 'EXAM');
    if (!examLesson) return true; 
    
    const notaAnterior = examLesson.examResults?.[0];
    return notaAnterior?.passed === true;
  };

  const checkCertificadoLiberado = () => {
    if (!curso || curso.modules.length === 0) return false;
    const ultimoMod = curso.modules[curso.modules.length - 1];
    const provaFinal = ultimoMod.lessons.find(l => l.type === 'EXAM');
    return provaFinal?.examResults?.[0]?.passed === true;
  };

  const FilterNotasDaAula = (idDaAula) => notasCurso.filter(n => n.lessonId === idDaAula);
  const notasDaAulaAtual = aulaAtual ? FilterNotasDaAula(aulaAtual.id) : [];

  const notasAgrupadasPorAula = notasCurso.reduce((acc, nota) => {
    if (!acc[nota.lessonId]) acc[nota.lessonId] = { lesson: nota.lesson, notas: [] };
    acc[nota.lessonId].notas.push(nota);
    return acc;
  }, {});

  const totalAulas = curso ? curso.modules.reduce((acc, mod) => acc + mod.lessons.length, 0) : 0;
  const progressoPercentual = totalAulas === 0 ? 0 : Math.round((aulasConcluidas.length / totalAulas) * 100);

  const getProximaAula = () => {
    if (!curso) return '';
    for (const modulo of curso.modules) {
      for (const aula of modulo.lessons) {
        if (!aulasConcluidas.includes(aula.id)) return aula.id;
      }
    }
    return curso.modules[0]?.lessons[0]?.id || '';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-light font-bold text-gray-500">Carregando LMS...</div>;
  if (erro) return <div className="min-h-screen flex items-center justify-center bg-brand-light text-red-500 font-bold">{erro} <Link to="/dashboard" className="ml-4 text-brand-blue underline">Voltar</Link></div>;
  if (!curso) return <div className="min-h-screen flex items-center justify-center bg-brand-light text-gray-500">Conteúdo não encontrado.</div>;

  const isAtualConcluida = aulaAtual ? aulasConcluidas.includes(aulaAtual.id) : false;
  const temCertificado = checkCertificadoLiberado();

  return (
    <div className="min-h-screen bg-brand-light flex flex-col md:flex-row relative">
      
      {!isFocusMode && (
        <>
          {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-60  md:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>}

          <aside className={`fixed md:sticky top-0 left-0 h-screen w-[85%] max-w-[320px] md:w-80 bg-white border-r border-gray-200 flex flex-col z-70 md:z-10 transition-transform duration-300 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0 gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Link to="/dashboard" className="hidden md:block text-gray-500 hover:text-brand-gold transition-colors shrink-0"><ArrowLeft size={20} /></Link>
                <Link to={`/curso/${curso.id}`} className="flex-1 min-w-0 block truncate">
                  <h2 className="font-bold text-brand-blue truncate hover:text-brand-dark transition-colors text-sm md:text-base" title={curso.title}>{curso.title}</h2>
                </Link>
              </div>
              <button className="md:hidden text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors p-2 shrink-0" onClick={() => setIsSidebarOpen(false)}><X size={18} /></button>
            </div>

            <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0">
              <button onClick={() => setSidebarTab('modulos')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${sidebarTab === 'modulos' ? 'border-b-2 border-brand-gold text-brand-dark bg-white' : 'border-b-2 border-transparent text-gray-400 hover:text-gray-600'}`}>
                <List size={16} /> Conteúdo
              </button>
              <button onClick={() => setSidebarTab('notes')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${sidebarTab === 'notes' ? 'border-b-2 border-brand-gold text-brand-dark bg-white' : 'border-b-2 border-transparent text-gray-400 hover:text-gray-600'}`}>
                <MessageSquare size={16} /> {aulaAtual ? 'Notas da Aula' : 'Todas as Notas'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {sidebarTab === 'modulos' ? (
                curso.modules.map((modulo, modIdx) => {
  const isLiberado = isModuleUnlocked(modIdx); 
  return (
    <div key={modulo.id} className={`mb-6 transition-opacity ${!isLiberado ? 'opacity-40' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider break-words leading-tight pr-2">
          {modulo.title}
        </h3>
        {!isLiberado && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"><Lock size={10}/> Trancado</span>}
      </div>
      <ul className="space-y-2">
        {modulo.lessons.map((aula) => {
          const isAtiva = aulaAtual?.id === aula.id;
          const isConcluida = aulasConcluidas.includes(aula.id); 
          const isProva = aula.type === 'EXAM';
          const notaProva = aula.examResults?.[0];

          return (
            <Link 
              key={aula.id} 
              to={isLiberado ? `/curso/${curso.id}/aula/${aula.id}` : '#'} 
              className="block"
              onClick={(e) => {
                if (!isLiberado) {
                  e.preventDefault();
                  alert("🔒 Módulo Bloqueado! Você precisa atingir a média de 70% na avaliação do módulo anterior.");
                } else setIsSidebarOpen(false);
              }}
            >
              <li className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${isAtiva ? 'bg-brand-gold/10 border-brand-gold font-bold text-brand-dark' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200 text-gray-600'}`}>
                <div className="flex items-center gap-3 truncate pr-2">
                  {isProva ? (
                    <GraduationCap size={18} className={notaProva?.passed ? "text-green-500 shrink-0" : "text-amber-500 shrink-0"} />
                  ) : isConcluida ? (
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                  ) : isAtiva ? (
                    <PlayCircle size={18} className="text-brand-gold shrink-0" />
                  ) : <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-300 shrink-0"></div>}
                  <span className="text-sm truncate">{aula.order}. {aula.title}</span>
                </div>

                {isProva && notaProva && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${notaProva.passed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {notaProva.score}%
                  </span>
                )}
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
})
              ) : (
                <div className="space-y-4">
                  {!aulaAtual ? (
                    Object.keys(notasAgrupadasPorAula).length === 0 ? (
                      <div className="text-center py-10">
                        <Edit3 size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm text-gray-400">Você ainda não tem anotações neste curso.</p>
                      </div>
                    ) : (
                      Object.values(notasAgrupadasPorAula).map(grupo => (
                        <div key={grupo.lesson.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <Link to={`/curso/${courseId}/aula/${grupo.lesson.id}`} onClick={() => setIsSidebarOpen(false)}>
                            <h4 className="font-bold text-brand-blue text-xs mb-3 hover:text-brand-dark flex items-center gap-1">
                              <PlayCircle size={12} /> Aula {grupo.lesson.order}: {grupo.lesson.title}
                            </h4>
                          </Link>
                          <div className="space-y-2">
                            {grupo.notas.map(nota => (
                              <div key={nota.id} className="text-xs text-gray-600 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm relative pl-3 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-brand-gold before:rounded-r-md">
                                {nota.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    <>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Histórico desta Aula</h4>
                      {notasDaAulaAtual.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-4 text-center">Nenhuma nota guardada nesta aula.</p>
                      ) : (
                        notasDaAulaAtual.map((nota, idx) => (
                          <div key={nota.id} className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 relative mb-3">
                            <span className="text-[9px] text-brand-gold font-bold block mb-1">Nota #{notasDaAulaAtual.length - idx}</span>
                            <p className="whitespace-pre-wrap">{nota.content}</p>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gray-50 relative w-full">
        
        {!isFocusMode && (
          <div className="md:hidden bg-brand-blue text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md shrink-0 gap-3">
            <Link to="/dashboard" className="text-white hover:text-brand-gold transition-colors p-1 rounded-md shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-bold truncate pr-2 text-sm flex-1 text-center min-w-0">
              {aulaAtual ? aulaAtual.title : curso.title}
            </span>
            <button onClick={() => setIsSidebarOpen(true)} className="text-white hover:text-brand-gold transition-colors p-1 rounded-md shrink-0">
              <Menu size={24} />
            </button>
          </div>
        )}

        {!aulaAtual ? (
          <div className="flex-1 flex flex-col p-6 md:p-10 max-w-4xl mx-auto w-full justify-center">
            <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-200">
              <button onClick={() => setAbaWelcome('resumo')} className={`pb-3 font-bold text-sm transition-all border-b-2 ${abaWelcome === 'resumo' ? 'border-brand-gold text-brand-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                Resumo do Curso
              </button>
              <button onClick={() => setAbaWelcome('todas-notas')} className={`pb-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${abaWelcome === 'todas-notas' ? 'border-brand-gold text-brand-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                Central de Anotações <span className="bg-brand-gold text-white text-[10px] px-2 py-0.5 rounded-full">{notasCurso.length}</span>
              </button>
            </div>

            {abaWelcome === 'resumo' ? (
              <div className="bg-white rounded-3xl p-6 md:p-12 shadow-lg border border-gray-100 text-center relative overflow-hidden w-full">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-gold"><Trophy size={32} /></div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-2">Bem-vindo(a) ao <br/><span className="text-brand-blue">{curso.title}</span></h1>
                <p className="text-gray-500 mb-8">Treinamento exclusivo preparado pela Dra. Êmili Mendes.</p>
                
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-w-md mx-auto mb-8 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700 text-sm">O seu progresso</span>
                    <span className="font-bold text-brand-gold">{progressoPercentual}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-brand-gold h-2 rounded-full transition-all duration-700" style={{ width: `${progressoPercentual}%` }}></div>
                  </div>
                </div>

                {temCertificado ? (
                  <div className="p-6 bg-linear-to-r from-amber-500 to-amber-600 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-lg mx-auto animate-bounce mb-6">
                    <div className="flex items-center gap-3 text-left">
                      <Trophy size={36} className="shrink-0 text-amber-200" />
                      <div>
                        <h4 className="font-black text-base uppercase tracking-wider">Formação Concluída!</h4>
                        <p className="text-xs text-amber-100">Você atingiu a proficiência clínica mínima de 70%.</p>
                      </div>
                    </div>
                    <button onClick={() => window.print()} className="bg-brand-dark hover:bg-black text-brand-gold font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest shadow-md shrink-0 transition-all">
                      Emitir Certificado
                    </button>
                  </div>
                ) : null}

                <Link to={`/curso/${curso.id}/aula/${getProximaAula()}`}>
                  <button className="bg-brand-dark hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mx-auto w-full sm:w-auto">
                    <Play size={18} className="text-brand-gold fill-current" /> Continuar Estudos
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 space-y-6 max-h-[70vh] overflow-y-auto w-full">
                <div>
                  <h2 className="text-xl font-bold text-brand-dark">Fichário de Revisão</h2>
                  <p className="text-sm text-gray-400 mt-1">Todas as suas anotações organizadas por aula.</p>
                </div>

                {Object.keys(notasAgrupadasPorAula).length === 0 ? (
                  <div className="text-center py-12 text-gray-400 italic">Você ainda não fez nenhuma anotação neste curso. Abra uma aula para começar!</div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {Object.values(notasAgrupadasPorAula).map(grupo => (
                      <div key={grupo.lesson.id} className="border border-gray-100 p-5 md:p-6 rounded-2xl bg-gray-50">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 border-b border-gray-200 pb-3">
                          <h4 className="font-bold text-brand-blue flex items-center gap-2 text-sm leading-tight">
                            <BookOpen size={16} className="text-brand-gold shrink-0" /> Aula {grupo.lesson.order}: {grupo.lesson.title}
                          </h4>
                          <Link to={`/curso/${courseId}/aula/${grupo.lesson.id}`} className="shrink-0">
                            <span className="text-xs text-brand-gold bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:border-brand-gold font-semibold transition-colors inline-block text-center w-full sm:w-auto">
                              Acessar Aula
                            </span>
                          </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {grupo.notas.map((nota, i) => (
                            <div key={nota.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                              <span className="absolute -top-2.5 left-4 bg-brand-gold/10 text-brand-gold text-[10px] font-bold px-2 py-0.5 rounded-full">Nota {grupo.notas.length - i}</span>
                              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed mt-2">{nota.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : aulaAtual.type === 'EXAM' ? (
          <div className="flex-1 flex flex-col p-6 justify-center">
            <QuizClassroom aula={aulaAtual} token={token} onSucesso={carregarCursoCompleto} />
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            
            <div 
              ref={playerContainerRef} 
              className={`w-full bg-black flex items-center justify-center relative shadow-inner group ${isFocusMode ? 'h-screen fixed inset-0 z-50' : 'aspect-video flex-1 shrink-0'}`}
            >
              <video key={aulaAtual.id} controls className="w-full h-full object-contain bg-black outline-none" controlsList="nodownload nofullscreen">
                <source src={aulaAtual.videoUrl} type="video/mp4" />
              </video>

              <button 
                onClick={toggleFocusMode}
                className="absolute top-4 right-4 bg-black/60 hover:bg-brand-gold text-white px-4 py-2 rounded-lg transition-all shadow-lg z-40 flex items-center gap-2 text-sm font-bold backdrop-blur-sm border border-white/10"
              >
                {isFocusMode ? <><Minimize2 size={18} /> Sair do Foco</> : <><Maximize2 size={18} /> Modo Foco</>}
              </button>

              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`fixed bottom-6 right-6 z-60 p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center ${isChatOpen ? 'bg-red-500 text-white rotate-90' : 'bg-green-500 text-white hover:bg-green-600'}`}
                title="Anotações da Aula"
              >
                {isChatOpen ? <X size={24} /> : <MessageSquare size={24} className="fill-current" />}
              </button>

              {isChatOpen && (
                <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-80 md:w-96 h-400px max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-60 overflow-hidden animate-in slide-in-from-bottom-5 duration-200 text-left">
                  
                  <div className="bg-brand-dark p-4 text-white flex justify-between items-center shadow-sm shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-gold/20 p-2 rounded-lg text-brand-gold"><Edit3 size={18}/></div>
                      <div>
                        <h4 className="font-bold text-sm truncate max-w-150px sm:max-w-180px md:max-w-240px">Notas: Aula {aulaAtual.order}</h4>
                        <p className="text-[10px] text-gray-400">Anotações exclusivas desta lição</p>
                      </div>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white p-1"><X size={18}/></button>
                  </div>

                  <div className="flex-1 bg-[#efeae2] p-4 overflow-y-auto space-y-3 flex flex-col-reverse">
                    {notasDaAulaAtual.length === 0 ? (
                      <div className="my-auto text-center text-gray-400 text-xs italic bg-white/80 p-4 rounded-xl mx-4 shadow-sm border border-gray-100">
                        Nenhum insight anotado ainda. Digite abaixo para criar sua primeira anotação!
                      </div>
                    ) : (
                      [...notasDaAulaAtual].reverse().map((nota, i) => (
                        <div key={nota.id} className="bg-white text-gray-800 p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] self-end border border-gray-100 relative">
                          <span className="text-[8px] font-bold text-brand-gold block mb-0.5">Nota #{notasDaAulaAtual.length - i}</span>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{nota.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2 shrink-0">
                    <div className="flex-1 relative bg-white border border-gray-300 rounded-xl focus-within:border-brand-gold transition-colors px-3 py-2 flex items-center">
                      <textarea 
                        value={textoNota}
                        onChange={(e) => setTextoNota(e.target.value)}
                        placeholder="Anote um insight..."
                        rows="1"
                        className="w-full text-xs text-gray-700 bg-transparent focus:outline-none resize-none max-h-12"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSalvarNota();
                          }
                        }}
                      />
                      {notaFeedback && (
                        <span className="absolute -top-7 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-bounce">
                          {notaFeedback}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={handleSalvarNota}
                      disabled={salvandoNota || !textoNota.trim()}
                      className="bg-brand-dark hover:bg-black text-white p-2.5 rounded-xl shadow-md transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send size={16} className="text-brand-gold fill-current" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!isFocusMode && (
              <div className="p-5 md:p-10 max-w-5xl mx-auto w-full bg-white border-x border-gray-100 shadow-sm flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2 leading-tight">{aulaAtual.title}</h1>
                    <p className="text-gray-500 font-medium text-sm">Módulo • Aula {aulaAtual.order}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
                    <button 
                      onClick={toggleFocusMode} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                    >
                      <Maximize2 size={18} /> Modo Foco
                    </button>
                    
                    <button 
                      onClick={handleConcluirAula} 
                      disabled={salvando || isAtualConcluida} 
                      className={`${isAtualConcluida ? 'bg-green-50 text-green-700 cursor-default border border-green-200' : salvando ? 'bg-gray-400 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 text-sm w-full sm:w-auto`}
                    >
                      <CheckCircle size={18} /> {isAtualConcluida ? 'Aula Concluída' : salvando ? 'Salvando...' : 'Marcar como Concluída'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 sm:gap-6 border-b border-gray-100 mb-6">
                  <button onClick={() => setAbaAtual('sobre')} className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${abaAtual === 'sobre' ? 'border-brand-gold text-brand-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    <BookOpen size={16}/> Sobre a Aula
                  </button>
                  <button onClick={() => setAbaAtual('notas')} className={`pb-3 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${abaAtual === 'notas' ? 'border-brand-gold text-brand-dark' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    <Edit3 size={16}/> Minhas Anotações <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">{notasDaAulaAtual.length}</span>
                  </button>
                </div>

                {abaAtual === 'sobre' && (
                  <div className="prose max-w-none text-gray-700">
                    {aulaAtual.description ? (
                      <p className="mb-4 leading-relaxed text-sm md:text-base bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">{aulaAtual.description}</p>
                    ) : (
                      <p className="mb-4 leading-relaxed text-sm md:text-base">Conteúdo de apoio para a aula <strong>{aulaAtual.title}</strong>. Aqui a Êmili poderá inserir textos, referências de artigos científicos e links importantes.</p>
                    )}
                    
                    {aulaAtual.pdfUrl && (
                      <div className="bg-brand-light p-4 rounded-xl border border-gray-200 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2.5 rounded-lg text-brand-gold border border-gray-100 shadow-sm"><FileText size={20} /></div>
                          <div>
                            <h4 className="font-bold text-brand-dark text-sm">Material Complementar</h4>
                            <p className="text-[11px] text-gray-400 mt-0.5">Ficheiro PDF exclusivo da aula</p>
                          </div>
                        </div>
                        <a href={aulaAtual.pdfUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-brand-gold font-bold text-xs bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm transition-all hover:border-brand-gold text-center">Baixar Material</a>
                      </div>
                    )}
                  </div>
                )}

                {abaAtual === 'notas' && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm focus-within:border-brand-gold focus-within:shadow-md transition-all">
                      <textarea
                        value={textoNota}
                        onChange={(e) => setTextoNota(e.target.value)}
                        rows="3"
                        className="w-full focus:outline-none resize-none text-gray-700 text-sm placeholder-gray-400 bg-transparent"
                        placeholder="Adicione um novo insight, dúvida ou ponto-chave..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSalvarNota();
                          }
                        }}
                      />
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <span className={`text-xs font-bold transition-opacity duration-300 ${notaFeedback ? 'opacity-100 text-green-500' : 'opacity-0'}`}>
                          {notaFeedback}
                        </span>
                        <button
                          onClick={handleSalvarNota}
                          disabled={salvandoNota || !textoNota.trim()}
                          className="bg-brand-dark hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-all text-xs shadow-md"
                        >
                          {salvandoNota ? 'Salvando...' : 'Adicionar Nota'}
                        </button>
                      </div>
                    </div>

                    {notasDaAulaAtual.length > 0 && (
                      <div className="pt-4 space-y-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Anotações Anteriores</h4>
                        {notasDaAulaAtual.map((nota, index) => (
                          <div key={nota.id} className="bg-amber-50/30 p-4 rounded-xl border border-amber-100 relative">
                            <span className="absolute -top-2.5 left-4 bg-white text-gray-400 border border-gray-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                              Nota {notasDaAulaAtual.length - index}
                            </span>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pt-1">{nota.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}

function QuizClassroom({ aula, token, onSucesso }) {
  const [step, setStep] = useState(0); 
  const [respostas, setRespostas] = useState({});
  const [corrigindo, setCorrigindo] = useState(false);
  const [resultado, setResultado] = useState(aula.examResults?.[0] || null);

  const questoes = aula.questions || [];

  const handleMarcar = (qId, idx) => setRespostas(prev => ({ ...prev, [qId]: idx }));

  const handleEntregar = async () => {
    setCorrigindo(true);
    try {
      const res = await axios.post('http://localhost:3000/exame/enviar', { lessonId: aula.id, answers: respostas }, { headers: { Authorization: `Bearer ${token}` } });
      setResultado(res.data);
      setStep(questoes.length + 1);
      if (res.data.passed) onSucesso(); 
    } catch (e) { alert("Erro ao entregar prova."); } 
    finally { setCorrigindo(false); }
  };

  if (step === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border max-w-2xl mx-auto text-center my-auto">
        <div className="w-20 h-20 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-6"><GraduationCap size={40} /></div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-3">{aula.title}</h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Esta prova possui <strong>{questoes.length} questões de múltipla escolha</strong>. Para obter aprovação e destrancar o cadeado do próximo módulo, você precisa de nota igual ou superior a <strong>70%</strong>.
        </p>

        {resultado && (
          <div className={`p-4 rounded-2xl mb-8 font-bold text-sm ${resultado.passed ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            Sua tentativa anterior: {resultado.score}% {resultado.passed ? '(Aprovado ✓)' : '(Reprovado)'}
          </div>
        )}

        <button onClick={() => setStep(1)} className="bg-brand-dark hover:bg-black text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg flex items-center gap-2 mx-auto text-sm">
          {resultado ? 'Refazer Prova' : 'Começar Prova Agora'} <ChevronRight size={18} className="text-brand-gold" />
        </button>
      </div>
    );
  }

  if (step === questoes.length + 1 && resultado) {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border max-w-md mx-auto text-center my-auto animate-in zoom-in-95 duration-300">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg ${resultado.passed ? 'bg-green-500' : 'bg-red-500'}`}>
          {resultado.passed ? <Trophy size={48} /> : <BookOpen size={48} />}
        </div>
        <h3 className="text-3xl font-black text-brand-dark mb-2">{resultado.passed ? 'Aprovado! 🎉' : 'Não foi dessa vez...'}</h3>
        <p className="text-gray-500 text-sm mb-6">
          {resultado.passed ? 'Nota excelente! O cadeado do próximo módulo acabou de ser destrancado na barra lateral.' : 'Você não atingiu a média mínima de 70%. Revise as aulas teóricas e tente novamente.'}
        </p>
        <div className="bg-gray-50 p-6 rounded-2xl mb-8 border"><span className="text-xs text-gray-400 block mb-1">Sua Nota Oficial</span><span className={`text-5xl font-black ${resultado.passed ? 'text-green-600' : 'text-red-600'}`}>{resultado.score}%</span></div>
        <button onClick={() => window.location.reload()} className="w-full bg-brand-dark hover:bg-black text-white font-bold py-4 rounded-xl text-sm transition-all shadow-md">
          Continuar Estudos
        </button>
      </div>
    );
  }

  const q = questoes[step - 1];
  const opcoes = JSON.parse(q.options);
  const sel = respostas[q.id];

  return (
    <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl border max-w-2xl mx-auto my-auto flex flex-col text-left w-full">
      <div className="flex justify-between items-center mb-6 pb-4 border-b text-xs font-bold text-gray-400">
        <span className="text-brand-gold uppercase tracking-widest">Questão {step} de {questoes.length}</span>
        <span>Progresso: {Math.round((step / questoes.length) * 100)}%</span>
      </div>

      <h3 className="text-gray-800 font-bold text-base md:text-lg mb-8 leading-relaxed">{q.text}</h3>

      <div className="space-y-3 mb-10 flex-1">
        {opcoes.map((op, i) => (
          <button key={i} onClick={() => handleMarcar(q.id, i)} className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center gap-4 ${sel === i ? 'bg-brand-gold/10 border-brand-gold text-brand-dark font-black shadow-sm' : 'bg-gray-50/50 hover:bg-gray-100 text-gray-600'}`}>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${sel === i ? 'bg-brand-gold border-brand-gold text-white' : 'bg-white border-gray-300'}`}>
              {sel === i ? '✓' : String.fromCharCode(65 + i)}
            </div>
            <span>{op}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <button onClick={() => setStep(step - 1)} disabled={step === 1} className="text-xs font-bold text-gray-400 hover:text-gray-700 disabled:opacity-0">➔ Anterior</button>
        {step < questoes.length ? (
          <button onClick={() => setStep(step + 1)} disabled={sel === undefined} className="bg-brand-dark hover:bg-black disabled:bg-gray-200 text-white font-bold px-8 py-3 rounded-xl text-xs flex items-center gap-2">Próxima <ChevronRight size={14}/></button>
        ) : (
          <button onClick={handleEntregar} disabled={sel === undefined || corrigindo} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold px-8 py-3 rounded-xl text-xs shadow-lg">{corrigindo ? 'Corrigindo...' : 'Entregar Prova'}</button>
        )}
      </div>
    </div>
  );
}