import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, LayoutGrid, FolderPlus, PlayCircle, Plus, CheckCircle, AlertCircle, Loader2, Edit3, Save, Trash2, Users, UploadCloud, X, Link2 } from 'lucide-react';

export default function Admin() {
  const [tab, setTab] = useState('curso'); 
  const [cursos, setCursos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [alunos, setAlunos] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');

  // Controle de Origem do Vídeo (link ou arquivo)
  const [videoType, setVideoType] = useState('link');

  const [formCurso, setFormCurso] = useState({ title: '', description: '', price: '', thumbnail: '' });
  const [formModulo, setFormModulo] = useState({ title: '', order: '', courseId: '' });
  const [formAula, setFormAula] = useState({ title: '', videoUrl: '', videoFile: '', order: '', courseId: '', moduleId: '', pdf: '' });
  const [formAluno, setFormAluno] = useState({ name: '', email: '', password: '' });
  const [formMatricula, setFormMatricula] = useState({ userId: '', courseId: '' });

  const token = localStorage.getItem('token_fisioemi');

  const carregarDados = async () => {
    try {
      const resCursos = await axios.get('http://localhost:3000/admin/cursos', { headers: { Authorization: `Bearer ${token}` } });
      setCursos(resCursos.data);

      const resAlunos = await axios.get('http://localhost:3000/admin/alunos', { headers: { Authorization: `Bearer ${token}` } });
      setAlunos(resAlunos.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { carregarDados(); }, []);

  const changeTab = (novaAba) => {
    setTab(novaAba);
    setIsEditing(false);
    setEditId('');
    setVideoType('link');
    setFormCurso({ title: '', description: '', price: '', thumbnail: '' });
    setFormModulo({ title: '', order: '', courseId: '' });
    setFormAula({ title: '', videoUrl: '', videoFile: '', order: '', courseId: '', moduleId: '', pdf: '' });
    setFormAluno({ name: '', email: '', password: '' });
    setFormMatricula({ userId: '', courseId: '' });
    setMsg({ tipo: '', texto: '' });
  };

  const handleCursoChange = (courseId) => {
    const curso = cursos.find(c => c.id === courseId);
    setModulos(curso ? curso.modules : []);
    setFormModulo({ ...formModulo, courseId });
    setFormAula({ ...formAula, courseId, moduleId: '', videoUrl: '', videoFile: '', pdf: '' });
    setAulas([]);
  };

  const handleModuloChange = (moduleId) => {
    const modulo = modulos.find(m => m.id === moduleId);
    setAulas(modulo ? modulo.lessons : []);
    setFormAula({ ...formAula, moduleId });
  };

  const preencherEdicao = (tipo, id) => {
    setEditId(id);
    if (!id) return;
    if (tipo === 'curso') {
      const c = cursos.find(x => x.id === id);
      if(c) setFormCurso({ title: c.title, description: c.description, price: c.price, thumbnail: c.thumbnail || '' });
    } else if (tipo === 'modulo') {
      const m = modulos.find(x => x.id === id);
      if(m) setFormModulo({ ...formModulo, title: m.title, order: m.order });
    } else if (tipo === 'aula') {
      const a = aulas.find(x => x.id === id);
      if(a) {
        setFormAula({ ...formAula, title: a.title, videoUrl: a.videoUrl, order: a.order });
        setVideoType('link'); // Default para edição voltar em texto
      }
    }
  };

  const preencherEdicaoAluno = (aluno) => {
    setIsEditing(true);
    setEditId(aluno.id);
    setFormAluno({ name: aluno.name, email: aluno.email, password: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAction = async (e, tipo) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ tipo: '', texto: '' });

    let url = `http://localhost:3000/admin/${tipo}s`;
    if (isEditing && editId) url = `http://localhost:3000/admin/${tipo}s/${editId}`;

    let payload;
    let configHeaders = { Authorization: `Bearer ${token}` };

    if (tipo === 'curso') {
      payload = new FormData();
      payload.append('title', formCurso.title);
      payload.append('description', formCurso.description);
      payload.append('price', formCurso.price);
      if (formCurso.thumbnail) payload.append('thumbnail', formCurso.thumbnail);
      configHeaders['Content-Type'] = 'multipart/form-data';
    } else if (tipo === 'aula') {
      payload = new FormData();
      payload.append('title', formAula.title);
      payload.append('order', formAula.order);
      payload.append('moduleId', formAula.moduleId);
      
      if (videoType === 'link') {
        payload.append('videoUrl', formAula.videoUrl);
      } else if (formAula.videoFile) {
        payload.append('video', formAula.videoFile);
      }
      
      if (formAula.pdf) payload.append('pdf', formAula.pdf);
      configHeaders['Content-Type'] = 'multipart/form-data';
    } else {
      payload = formModulo;
    }

    try {
      if (isEditing) await axios.put(url, payload, { headers: configHeaders });
      else await axios.post(url, payload, { headers: configHeaders });
      
      setMsg({ tipo: 'sucesso', texto: `${tipo.toUpperCase()} salvo com sucesso!` });
      setEditId('');
      if (tipo === 'curso') setFormCurso({ title: '', description: '', price: '', thumbnail: '' });
      if (tipo === 'modulo') setFormModulo({ ...formModulo, title: '', order: '' });
      if (tipo === 'aula') setFormAula({ ...formAula, title: '', videoUrl: '', videoFile: '', order: '', pdf: '' });
      await carregarDados();
    } catch (err) {
      setMsg({ tipo: 'erro', texto: 'Erro ao salvar dados.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (tipo) => {
    if (!editId) return;
    if (!window.confirm(`Tem a certeza de que deseja eliminar este ${tipo}?`)) return;
    setLoading(true);
    setMsg({ tipo: '', texto: '' });

    try {
      await axios.delete(`http://localhost:3000/admin/${tipo}s/${editId}`, { headers: { Authorization: `Bearer ${token}` } });
      setMsg({ tipo: 'sucesso', texto: `${tipo.toUpperCase()} removido com sucesso!` });
      setEditId('');
      await carregarDados();
    } catch (e) {
      setMsg({ tipo: 'erro', texto: 'Erro ao eliminar o registo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGestaoAlunos = async (e, subtipo) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ tipo: '', texto: '' });

    try {
      if (subtipo === 'aluno') {
        if (isEditing && editId) {
          await axios.put(`http://localhost:3000/admin/alunos/${editId}`, formAluno, { headers: { Authorization: `Bearer ${token}` } });
          setMsg({ tipo: 'sucesso', texto: 'Conta do aluno atualizada com sucesso!' });
        } else {
          await axios.post('http://localhost:3000/admin/alunos', formAluno, { headers: { Authorization: `Bearer ${token}` } });
          setMsg({ tipo: 'sucesso', texto: 'Conta do aluno criada!' });
        }
        setFormAluno({ name: '', email: '', password: '' });
        setIsEditing(false);
        setEditId('');
      } else if (subtipo === 'matricular') {
        await axios.post('http://localhost:3000/admin/matriculas', formMatricula, { headers: { Authorization: `Bearer ${token}` } });
        setMsg({ tipo: 'sucesso', texto: 'Matrícula realizada!' });
        setFormMatricula({ userId: '', courseId: '' });
      }
      await carregarDados();
    } catch (err) {
      setMsg({ tipo: 'erro', texto: err.response?.data?.erro || 'Erro na operação.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col">
      <header className="bg-brand-dark text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-brand-gold transition-colors"><ArrowLeft size={24} /></Link>
          <div className="text-xl font-bold tracking-widest uppercase italic">FISIO EMI <span className="text-brand-gold not-italic font-normal ml-2">| ADMIN</span></div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className="flex flex-wrap md:flex-nowrap gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button onClick={() => changeTab('curso')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${tab === 'curso' ? 'bg-brand-gold text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><LayoutGrid size={18} /> Cursos</button>
          <button onClick={() => changeTab('modulo')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${tab === 'modulo' ? 'bg-brand-gold text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><FolderPlus size={18} /> Módulos</button>
          <button onClick={() => changeTab('aula')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${tab === 'aula' ? 'bg-brand-gold text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><PlayCircle size={18} /> Aulas</button>
          <button onClick={() => changeTab('aluno')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${tab === 'aluno' ? 'bg-brand-gold text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Users size={18} /> Alunos</button>
        </div>

        {msg.texto && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${msg.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {msg.tipo === 'sucesso' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold">{msg.texto}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          
          {tab !== 'aluno' && (
            <div className="flex justify-end mb-6 border-b border-gray-100 pb-4">
              <button type="button" onClick={() => { setIsEditing(!isEditing); setEditId(''); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${isEditing ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Edit3 size={16} /> {isEditing ? 'Sair do Modo Edição' : 'Modo Edição/Exclusão'}
              </button>
            </div>
          )}

          {/* ABA CURSO */}
          {tab === 'curso' && (
            <form onSubmit={(e) => handleAction(e, 'curso')} className="space-y-4">
              <h2 className="text-xl font-bold text-brand-blue">{isEditing ? 'Editar Curso' : 'Novo Curso'}</h2>
              {isEditing && (
                <select className="w-full p-3 rounded-lg border bg-amber-50 outline-none" value={editId} onChange={e => preencherEdicao('curso', e.target.value)}>
                  <option value="">Selecione o curso...</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              )}
              <input type="text" placeholder="Título" required className="w-full p-3 rounded-lg border outline-none" value={formCurso.title} onChange={e => setFormCurso({...formCurso, title: e.target.value})} />
              <textarea placeholder="Descrição" required className="w-full p-3 rounded-lg border outline-none h-32" value={formCurso.description} onChange={e => setFormCurso({...formCurso, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Preço" required className="w-full p-3 rounded-lg border outline-none" value={formCurso.price} onChange={e => setFormCurso({...formCurso, price: e.target.value})} />
                
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setFormCurso({...formCurso, thumbnail: e.target.files[0]})} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full h-full p-3 rounded-lg border border-dashed border-brand-gold bg-brand-gold/5 flex items-center justify-center gap-2 text-brand-dark font-semibold">
                    <UploadCloud size={20} className="text-brand-gold" />
                    {formCurso.thumbnail instanceof File ? formCurso.thumbnail.name : 'Subir Imagem de Capa'}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-brand-dark text-white font-bold py-4 rounded-xl flex justify-center gap-2 hover:bg-black transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : <Save />} Salvar Curso
                </button>
                {isEditing && editId && (
                  <button type="button" onClick={() => handleEliminar('curso')} disabled={loading} className="bg-red-600 text-white px-6 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2">
                    <Trash2 size={20} /> Eliminar
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ABA MÓDULO */}
          {tab === 'modulo' && (
            <form onSubmit={(e) => handleAction(e, 'modulo')} className="space-y-4">
              <h2 className="text-xl font-bold text-brand-blue">{isEditing ? 'Editar Módulo' : 'Novo Módulo'}</h2>
              <select required className="w-full p-3 rounded-lg border outline-none" value={formModulo.courseId} onChange={e => handleCursoChange(e.target.value)}>
                <option value="">1. Selecione o Curso...</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {isEditing && (
                <select className="w-full p-3 rounded-lg border bg-amber-50 outline-none" value={editId} onChange={e => preencherEdicao('modulo', e.target.value)}>
                  <option value="">2. Selecione o Módulo...</option>
                  {modulos.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              )}
              <input type="text" placeholder="Nome do Módulo" required className="w-full p-3 rounded-lg border outline-none" value={formModulo.title} onChange={e => setFormModulo({...formModulo, title: m => m.target.value})} />
              <input type="number" placeholder="Ordem" required className="w-full p-3 rounded-lg border outline-none" value={formModulo.order} onChange={e => setFormModulo({...formModulo, order: e.target.value})} />
              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-brand-dark text-white font-bold py-4 rounded-xl flex justify-center gap-2 hover:bg-black transition-all"><Save /> Salvar Módulo</button>
                {isEditing && editId && (
                  <button type="button" onClick={() => handleEliminar('modulo')} disabled={loading} className="bg-red-600 text-white px-6 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2">
                    <Trash2 size={20} /> Eliminar
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ABA AULA COM INTERRUPTOR DE ORIGEM DO VÍDEO */}
          {tab === 'aula' && (
            <form onSubmit={(e) => handleAction(e, 'aula')} className="space-y-4">
              <h2 className="text-xl font-bold text-brand-blue">{isEditing ? 'Editar Aula' : 'Nova Aula'}</h2>
              <div className="grid grid-cols-2 gap-4">
                <select required className="p-3 rounded-lg border outline-none" value={formAula.courseId} onChange={e => handleCursoChange(e.target.value)}>
                  <option value="">1. Selecione o Curso...</option>
                  {cursos.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <select required className="p-3 rounded-lg border outline-none" value={formAula.moduleId} onChange={e => handleModuloChange(e.target.value)}>
                  <option value="">2. Selecione o Módulo...</option>
                  {modulos.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              {isEditing && (
                <select className="w-full p-3 rounded-lg border bg-amber-50 outline-none" value={editId} onChange={e => preencherEdicao('aula', e.target.value)}>
                  <option value="">3. Selecione a Aula...</option>
                  {aulas.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              )}
              
              <input type="text" placeholder="Título da Aula" required className="w-full p-3 rounded-lg border outline-none" value={formAula.title} onChange={e => setFormAula({...formAula, title: e.target.value})} />
              
              {/* SELETOR DE ORIGEM DO VÍDEO */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex gap-6 items-center">
                <span className="text-sm font-bold text-gray-600">Origem do Vídeo:</span>
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
                  <input type="radio" name="videoType" value="link" checked={videoType === 'link'} onChange={() => setVideoType('link')} className="text-brand-gold focus:ring-brand-gold" />
                  Link Externo (Vimeo/Direct)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
                  <input type="radio" name="videoType" value="file" checked={videoType === 'file'} onChange={() => setVideoType('file')} className="text-brand-gold focus:ring-brand-gold" />
                  Carregar do Computador (.mp4)
                </label>
              </div>

              {/* INPUT ALTERNÁVEL CONFORME ESCOLHA */}
              {videoType === 'link' ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Link2 size={18} /></div>
                  <input type="text" placeholder="URL do Vídeo (Ex: http://exemplo.com/aula.mp4)" required className="w-full pl-10 p-3 rounded-lg border outline-none" value={formAula.videoUrl} onChange={e => setFormAula({...formAula, videoUrl: e.target.value})} />
                </div>
              ) : (
                <div className="relative">
                  <input type="file" accept="video/mp4" required={!isEditing} onChange={e => setFormAula({...formAula, videoFile: e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-full p-3 rounded-lg border border-dashed border-brand-gold bg-brand-gold/5 flex items-center justify-center gap-2 text-brand-dark font-semibold text-sm">
                    <UploadCloud size={18} className="text-brand-gold" />
                    {formAula.videoFile instanceof File ? formAula.videoFile.name : 'Escolher Ficheiro de Vídeo (.mp4)'}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Ordem" required className="w-full p-3 rounded-lg border outline-none" value={formAula.order} onChange={e => setFormAula({...formAula, order: e.target.value})} />
                
                <div className="relative">
                  <input type="file" accept=".pdf" onChange={e => setFormAula({...formAula, pdf: e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-full h-full p-3 rounded-lg border border-dashed border-brand-gold bg-brand-gold/5 flex items-center justify-center gap-2 text-brand-dark font-semibold text-sm">
                    <UploadCloud size={18} className="text-brand-gold" />
                    {formAula.pdf instanceof File ? formAula.pdf.name : 'Material de Apoio (PDF)'}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-brand-dark text-white font-bold py-4 rounded-xl flex justify-center gap-2 hover:bg-black transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : <Save />} Salvar Aula
                </button>
                {isEditing && editId && (
                  <button type="button" onClick={() => handleEliminar('aula')} disabled={loading} className="bg-red-600 text-white px-6 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2">
                    <Trash2 size={20} /> Eliminar
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ABA GESTÃO ALUNOS E MATRÍCULAS */}
          {tab === 'aluno' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <form onSubmit={(e) => handleGestaoAlunos(e, 'aluno')} className={`space-y-4 border-r md:pr-10 border-gray-100 ${isEditing ? 'bg-amber-50 p-4 rounded-xl border border-amber-200' : ''}`}>
                  <h3 className="text-lg font-bold text-brand-blue flex items-center gap-2">
                    {isEditing ? <Edit3 size={18} className="text-brand-gold"/> : <Plus size={18} className="text-brand-gold"/>} 
                    {isEditing ? 'Editar Conta do Aluno' : 'Criar Conta'}
                  </h3>
                  <input type="text" placeholder="Nome" required className="w-full p-3 rounded-lg border outline-none bg-white" value={formAluno.name} onChange={e => setFormAluno({...formAluno, name: e.target.value})} />
                  <input type="email" placeholder="E-mail" required className="w-full p-3 rounded-lg border outline-none bg-white" value={formAluno.email} onChange={e => setFormAluno({...formAluno, email: e.target.value})} />
                  <input type="password" placeholder={isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha'} required={!isEditing} className="w-full p-3 rounded-lg border outline-none bg-white" value={formAluno.password} onChange={e => setFormAluno({...formAluno, password: e.target.value})} />
                  <button type="submit" disabled={loading} className="w-full bg-brand-dark text-white font-bold py-3 rounded-xl hover:bg-black transition-all">{isEditing ? 'Salvar Alterações' : 'Gerar Acesso'}</button>
                  {isEditing && (
                    <button type="button" onClick={() => { setIsEditing(false); setEditId(''); setFormAluno({name:'', email:'', password:''}); }} className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 mt-2 transition-colors"><X size={16} /> Cancelar Edição</button>
                  )}
                </form>

                <form onSubmit={(e) => handleGestaoAlunos(e, 'matricular')} className="space-y-4">
                  <h3 className="text-lg font-bold text-brand-blue flex items-center gap-2"><Plus size={18} className="text-brand-gold"/> Matricular</h3>
                  <select required className="w-full p-3 rounded-lg border outline-none" value={formMatricula.userId} onChange={e => setFormMatricula({...formMatricula, userId: e.target.value})}>
                    <option value="">Escolha o Aluno...</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <select required className="w-full p-3 rounded-lg border outline-none" value={formMatricula.courseId} onChange={e => setFormMatricula({...formMatricula, courseId: e.target.value})}>
                    <option value="">Escolha o Treinamento...</option>
                    {cursos.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <button type="submit" disabled={loading} className="w-full bg-brand-gold text-white font-bold py-3 rounded-xl hover:bg-brand-goldHover transition-all shadow-md">Liberar Matrícula</button>
                </form>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-brand-blue mb-4 flex items-center gap-2"><Users size={18} className="text-brand-gold"/> Lista de Alunos e Matrículas</h3>
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-100 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                        <th className="p-4 font-semibold">Nome</th>
                        <th className="p-4 font-semibold">E-mail</th>
                        <th className="p-4 font-semibold">Cursos Matriculados</th>
                        <th className="p-4 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alunos.map(a => (
                        <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm font-bold text-gray-800">{a.name}</td>
                          <td className="p-4 text-sm text-gray-500">{a.email}</td>
                          <td className="p-4 text-sm text-gray-600">
                            {a.enrollments && a.enrollments.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {a.enrollments.map(e => <li key={e.course.id}>{e.course.title}</li>)}
                              </ul>
                            ) : <span className="text-gray-400 italic">Sem matrículas ativas</span>}
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => preencherEdicaoAluno(a)} className="text-brand-gold hover:text-brand-goldHover transition-colors p-2 rounded-lg hover:bg-brand-gold/10" title="Editar Aluno"><Edit3 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}