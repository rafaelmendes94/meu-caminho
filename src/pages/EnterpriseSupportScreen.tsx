import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Headphones, 
  Calendar, 
  Zap, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Lock,
  EyeOff,
  UserCheck,
  Building2,
  Video
} from "lucide-react";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

const EnterpriseSupportScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const kpis = [
    { label: "Tempo médio de resposta", value: "2h", icon: Clock },
    { label: "Satisfação Enterprise", value: "98%", icon: CheckCircle2 },
    { label: "Suporte prioritário", value: "24/7", icon: ShieldCheck },
    { label: "Especialista dedicado", value: "1", icon: UserCheck },
  ];

  const helpCards = [
    { title: "Implantação assistida", desc: "Apoio para onboarding da empresa e ativação dos colaboradores.", btn: "Solicitar ajuda", icon: Building2 },
    { title: "Suporte executivo", desc: "Fale com um especialista Enterprise.", btn: "Agendar conversa", icon: Headphones },
    { title: "Expansão organizacional", desc: "Aumente licenças e recursos do Enterprise.", btn: "Solicitar expansão", icon: Zap },
    { title: "Problemas técnicos", desc: "Receba ajuda para integrações, acessos e configuração.", btn: "Abrir chamado", icon: MessageSquare },
  ];

  const recentTickets = [
    { title: "Integração Google Workspace", date: "Há 2 horas", status: "Em andamento", statusColor: "text-amber-600 bg-amber-50 border-amber-100" },
    { title: "Expansão de licenças", date: "Ontem", status: "Concluído", statusColor: "text-green-600 bg-green-50 border-green-100" },
    { title: "Configuração de domínio", date: "3 dias atrás", status: "Aguardando resposta", statusColor: "text-blue-600 bg-blue-50 border-blue-100" },
  ];

  const libraryItems = [
    { title: "Onboarding da empresa", desc: "Passo a passo inicial." },
    { title: "Convites e ativação", desc: "Como engajar seu time." },
    { title: "Privacidade e anonimização", desc: "Nossos pilares éticos." },
    { title: "Integrações", desc: "Google, Slack e Microsoft." },
    { title: "Exportações executivas", desc: "Relatórios de gestão." },
    { title: "Login corporativo", desc: "Configuração de SSO." },
  ];

  return (
    <EnterpriseRHLayout title="Suporte">
      <div className="space-y-12 animate-fade-in">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/enterprise/rh")}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#0B0908]" />
          </button>
          <h1 className="font-playfair text-xl font-bold">Suporte Enterprise</h1>
        </div>
        <div className="px-4 py-1.5 bg-white border border-[#F88A2B]/20 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F88A2B] animate-pulse" />
          <span className="text-[#F88A2B] text-[10px] font-bold uppercase tracking-widest">Parceria ativa</span>
        </div>
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0B0908] p-10 md:p-16 text-white shadow-2xl">
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#F88A2B]/20 blur-[120px] rounded-full" />
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F88A2B]">Atendimento premium</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-playfair leading-[1.1]">
              O suporte também faz parte da jornada organizacional.
            </h2>
            
            <p className="text-white/60 text-base md:text-lg leading-relaxed font-light">
              O Enterprise oferece acompanhamento humano para implantação, expansão e evolução emocional da empresa.
            </p>
          </div>

          {/* Abstract Organic Lines */}
          <svg className="absolute bottom-0 right-0 w-full h-full opacity-5 pointer-events-none" viewBox="0 0 800 400">
            <path d="M0,200 Q200,100 400,200 T800,200" stroke="white" fill="transparent" strokeWidth="1" />
            <path d="M0,250 Q200,150 400,250 T800,250" stroke="white" fill="transparent" strokeWidth="1" />
          </svg>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-[#0B0908]/5 shadow-sm hover:shadow-md transition-all group">
              <kpi.icon className="w-6 h-6 mb-6 text-[#F88A2B] group-hover:scale-110 transition-transform" />
              <div className="space-y-1">
                <p className="text-3xl font-playfair font-bold text-[#0B0908]">{kpi.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#0B0908]/40 font-bold">{kpi.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* How can we help - Grid */}
        <section className="space-y-8">
          <h3 className="font-playfair text-2xl font-bold px-2">Como podemos ajudar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCards.map((card, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] border border-[#0B0908]/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B] group-hover:bg-[#F88A2B] group-hover:text-white transition-colors">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-playfair text-lg font-bold">{card.title}</h4>
                    <p className="text-sm text-[#0B0908]/60 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
                <button className="mt-8 w-full py-3 px-4 bg-[#F7F4F2] text-[#0B0908] rounded-full text-xs font-bold hover:bg-[#0B0908] hover:text-white transition-all">
                  {card.btn}
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Tickets */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-playfair text-2xl font-bold">Chamados recentes</h3>
              <button className="text-xs font-bold text-[#F88A2B] uppercase tracking-widest hover:underline">Ver todos</button>
            </div>
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#0B0908]/5">
              {recentTickets.map((ticket, idx) => (
                <div 
                  key={idx}
                  className={`p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:bg-[#F7F4F2]/30 ${idx !== recentTickets.length - 1 ? 'border-b border-[#0B0908]/5' : ''}`}
                >
                  <div className="space-y-2">
                    <h4 className="font-bold text-[#0B0908]">{ticket.title}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#0B0908]/40 uppercase font-bold tracking-wider">{ticket.date}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ticket.statusColor}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-white border border-[#0B0908]/10 rounded-full text-xs font-bold hover:bg-[#0B0908] hover:text-white transition-all whitespace-nowrap self-start md:self-center">
                    Ver detalhes
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Enterprise Specialist Card */}
          <section className="space-y-6">
            <h3 className="font-playfair text-2xl font-bold px-2">Especialista Enterprise</h3>
            <div className="bg-white rounded-[2rem] p-8 border border-[#F88A2B]/10 shadow-sm relative overflow-hidden flex flex-col items-center text-center space-y-6">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#F88A2B]/5 to-transparent" />
              
              <div className="relative pt-4">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#F88A2B] to-amber-200">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200" 
                    alt="Camila Rocha"
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full" title="Disponível" />
              </div>

              <div className="space-y-1">
                <h4 className="font-playfair text-xl font-bold">Camila Rocha</h4>
                <p className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-[0.2em]">Enterprise Success Manager</p>
                <p className="pt-4 text-sm text-[#0B0908]/60 leading-relaxed italic">
                  “Acompanhando a evolução organizacional da sua empresa.”
                </p>
              </div>

              <div className="w-full space-y-3 pt-4">
                <button className="w-full py-4 bg-[#0B0908] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Video className="w-4 h-4" />
                  Agendar reunião
                </button>
                <button className="w-full py-4 bg-[#F7F4F2] text-[#0B0908] rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#0B0908]/5 transition-all">
                  <Mail className="w-4 h-4" />
                  Enviar mensagem
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Help Library */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <h3 className="font-playfair text-2xl font-bold">Biblioteca de ajuda</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B0908]/30" />
              <input 
                type="text"
                placeholder="Pesquisar guia..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-[#0B0908]/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {libraryItems.map((item, idx) => (
              <div key={idx} className="group bg-white p-6 rounded-2xl border border-[#0B0908]/5 shadow-sm hover:border-[#F88A2B]/20 transition-all cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-[#0B0908]/40 group-hover:bg-[#F88A2B]/10 group-hover:text-[#F88A2B] transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-sm font-bold text-[#0B0908]">{item.title}</h5>
                    <p className="text-[10px] text-[#0B0908]/40">{item.desc}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#0B0908]/10 group-hover:text-[#F88A2B] transition-colors" />
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Commitment */}
        <section>
          <div className="bg-[#0B0908] rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
              <div className="max-w-xl space-y-6">
                <div className="flex items-center gap-4 text-[#F88A2B]">
                  <Lock className="w-8 h-8" />
                  <h3 className="font-playfair text-3xl font-bold text-white">O suporte não acessa jornadas emocionais individuais.</h3>
                </div>
                <p className="text-white/60 text-lg leading-relaxed font-light">
                  O time Enterprise pode auxiliar apenas em configurações administrativas e organizacionais, preservando o sigilo absoluto dos colaboradores.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  { icon: EyeOff, label: "Sem respostas emocionais" },
                  { icon: Zap, label: "Sem acesso à IA privada" },
                  { icon: MessageSquare, label: "Sem conversas individuais" },
                  { icon: UserCheck, label: "Sem score pessoal" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                      <item.icon className="w-3 h-3 text-[#F88A2B]" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTAs */}
        <section className="flex flex-col items-center gap-8 py-12">
          <button className="w-full max-w-md bg-[#F88A2B] text-white py-6 rounded-full font-bold text-xl shadow-2xl shadow-[#F88A2B]/30 hover:bg-[#e07b25] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group">
            <Headphones className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            Falar com especialista
          </button>
          
          <button 
            onClick={() => navigate("/enterprise/rh")}
            className="text-[#0B0908]/40 font-bold text-sm uppercase tracking-[0.3em] hover:text-[#0B0908] transition-colors flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao módulo RH
          </button>

          <footer className="pt-8 text-center max-w-sm mx-auto">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-medium leading-relaxed italic">
              “O suporte Enterprise existe para acompanhar organizações de forma humana e estratégica.”
            </p>
          </footer>
        </section>

      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseSupportScreen;
