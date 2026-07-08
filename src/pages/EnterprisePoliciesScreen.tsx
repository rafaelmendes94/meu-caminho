import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  FileText, 
  CheckCircle2, 
  Bell, 
  Mail, 
  Download, 
  MessageSquare, 
  History, 
  ShieldAlert, 
  Clock,
  ChevronRight,
  Globe,
  Settings2,
  LockKeyhole,
  FileCheck
} from "lucide-react";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

const EnterprisePoliciesScreen = () => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const [policies, setPolicies] = useState({
    anonymization: true,
    groupLock: true,
    directChannel: true,
    exportProtection: true,
    inviteConsent: true,
    sso: false,
    personalEmails: true,
    multiAdmins: true,
    individualResults: true,
  });

  const togglePolicy = (key: keyof typeof policies) => {
    setPolicies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const Switch = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
        active ? "bg-[#F88A2B]" : "bg-zinc-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <EnterpriseRHLayout title="Políticas">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] font-['Montserrat'] text-[#0B0908] overflow-y-auto pb-32">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#0B0908] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-[#F88A2B]/30">
            <CheckCircle2 className="w-5 h-5 text-[#F88A2B]" />
            <span className="text-sm font-medium">Políticas atualizadas com segurança.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 bg-[#F7F4F2]/80 backdrop-blur-md z-40">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-[#0B0908]">Políticas Enterprise</h1>
        <div className="bg-[#F88A2B]/10 text-[#F88A2B] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
          Governança
        </div>
      </header>

      <main className="px-6 max-w-4xl mx-auto space-y-8">
        {/* Hero Card */}
        <section className="bg-[#0B0908] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-[#F88A2B]">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-[0.2em]">Ética por desenho</span>
            </div>
            <h2 className="text-3xl font-['Playfair_Display'] leading-tight">
              Políticas claras protegem confiança.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              Defina regras organizacionais sem transformar cuidado emocional em burocracia.
            </p>
          </div>
        </section>

        {/* Políticas Ativas Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Políticas ativas</h3>
            <span className="text-[10px] font-medium text-zinc-400">5 ATIVADAS</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { id: 'anonymization', title: 'Anonimização automática', desc: 'Todos os indicadores emocionais são exibidos apenas de forma agregada.', icon: EyeOff },
              { id: 'groupLock', title: 'Bloqueio de grupos pequenos', desc: 'Recortes só aparecem com volume mínimo suficiente.', icon: ShieldAlert },
              { id: 'directChannel', title: 'Canal Direto separado', desc: 'Mensagens sensíveis não entram em dashboards.', icon: MessageSquare },
              { id: 'exportProtection', title: 'Exportações sem dados individuais', desc: 'Relatórios nunca incluem nomes, conversas ou respostas pessoais.', icon: Download },
              { id: 'inviteConsent', title: 'Convite com aceite de privacidade', desc: 'Todo colaborador deve aceitar a política antes do cadastro.', icon: FileCheck },
            ].map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-2xl bg-[#F88A2B]/5 flex items-center justify-center text-[#F88A2B]">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <Switch 
                    active={policies[item.id as keyof typeof policies]} 
                    onClick={() => togglePolicy(item.id as keyof typeof policies)} 
                  />
                </div>
                <div>
                  <h4 className="font-bold text-[#0B0908] mb-1">{item.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Política de Check-in */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Política de check-in</h3>
          <div className="bg-white/40 backdrop-blur-md border border-white p-8 rounded-[2rem] shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Frequência</span>
                <p className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#F88A2B]" /> Semanal
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lembrete</span>
                <p className="font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#F88A2B]" /> Segunda-feira, 9h
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Participação</span>
                <p className="font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#F88A2B]" /> Voluntária
                </p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Exibir resultado individual ao colaborador</p>
                  <p className="text-xs text-zinc-400 italic">O colaborador vê sua própria evolução</p>
                </div>
                <Switch 
                  active={policies.individualResults} 
                  onClick={() => togglePolicy('individualResults')} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Exibir resultado individual ao RH</p>
                  <p className="text-xs text-[#F88A2B] font-medium">Impossível configurar por ética de dados</p>
                </div>
                <div className="bg-zinc-100 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Nunca</div>
              </div>
            </div>
          </div>
        </section>

        {/* Política de Acesso */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Política de acesso</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { title: 'Login por convite', icon: Mail, active: true },
              { title: 'Domínio autorizado', icon: Globe, active: true },
              { title: 'SSO opcional', icon: LockKeyhole, active: false, key: 'sso' },
              { title: 'E-mails pessoais bloqueados', icon: ShieldAlert, active: true, key: 'personalEmails' },
              { title: 'Múltiplos admins', icon: Settings2, active: true, key: 'multiAdmins' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.active || (item.key && policies[item.key as keyof typeof policies]) ? 'bg-[#F88A2B]/10 text-[#F88A2B]' : 'bg-zinc-100 text-zinc-400'}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">{item.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Política de Exportações */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Política de exportações</h3>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100 divide-y divide-zinc-50">
            {[
              'PDF executivo sem identificação',
              'CSV apenas agregado',
              'Apresentações sem nomes',
              'Logs administrativos sem conteúdo emocional'
            ].map((text, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#F88A2B]" />
                  <span className="text-sm font-medium text-zinc-700">{text}</span>
                </div>
                <Lock className="w-4 h-4 text-zinc-300" />
              </div>
            ))}
          </div>
        </section>

        {/* Política do Canal Direto */}
        <section className="bg-[#0B0908] rounded-[2rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-['Playfair_Display']">Situações sensíveis seguem fluxo próprio.</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Relatos de assédio, ambiente tóxico ou assuntos confidenciais nunca viram estatística coletiva.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#F88A2B] font-medium">
              <ShieldCheck className="w-4 h-4" /> Camada extra de proteção ativada
            </div>
          </div>
        </section>

        {/* Histórico de Alterações */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <History className="w-4 h-4" /> Histórico de alterações
          </h3>
          <div className="space-y-3">
            {[
              { text: 'Política de anonimização atualizada', date: 'Hoje, 10:24' },
              { text: 'Frequência de check-in revisada', date: 'Ontem, 16:40' },
              { text: 'Canal Direto confirmado como separado', date: '12 Out, 2025' },
              { text: 'Exportações protegidas habilitadas', date: '05 Out, 2025' }
            ].map((log, idx) => (
              <div key={idx} className="bg-white/60 p-4 rounded-2xl flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                  <span className="text-xs font-semibold text-zinc-700">{log.text}</span>
                </div>
                <span className="text-[10px] text-zinc-400">{log.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 pt-6">
          <button 
            onClick={handleSave}
            className="w-full bg-[#F88A2B] text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-[#F88A2B]/20 active:scale-[0.98] transition-all"
          >
            Salvar políticas
          </button>
          <button 
            onClick={() => navigate('/enterprise/rh/compliance')}
            className="w-full bg-white text-[#0B0908] border border-zinc-200 py-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            Ver compliance <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <footer className="pt-8 pb-12 text-center">
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[280px] mx-auto italic">
            "Boas políticas preservam o equilíbrio entre inteligência organizacional e privacidade individual."
          </p>
        </footer>
      </main>
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterprisePoliciesScreen;
