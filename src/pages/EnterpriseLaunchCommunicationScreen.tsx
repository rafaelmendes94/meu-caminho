import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  MessageSquare, 
  Send, 
  Eye, 
  Type, 
  Palette, 
  Hash, 
  Mail, 
  Slack, 
  Link2, 
  Globe, 
  CheckCircle2, 
  Lock, 
  Heart,
  Sparkles,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const EnterpriseLaunchCommunicationScreen = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const canSend = hasAnyRole(["owner", "rh_admin", "platform_admin"]);
  const [tone, setTone] = useState("Acolhedor");
  const [title, setTitle] = useState("Uma nova jornada emocional começa agora");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(
    "Estamos iniciando uma nova jornada coletiva de cuidado emocional.\n\nO Meu Caminho Enterprise foi criado para apoiar equilíbrio emocional, clareza mental e inteligência emocional — sempre com total privacidade individual."
  );

  const tones = ["Acolhedor", "Inspirador", "Institucional leve", "Executivo humano"];
  
  const communicationPoints = [
    { label: "Privacidade individual", active: true },
    { label: "IA confidencial", active: true },
    { label: "Anonimização automática", active: true },
    { label: "Apoio emocional", active: true },
    { label: "Check-ins privados", active: true },
    { label: "Trilhas emocionais", active: true },
  ];

  const channels = [
    { name: "Slack", icon: Slack, status: "Pronto para conectar" },
    { name: "Microsoft Teams", icon: MessageSquare, status: "Pronto para conectar" },
    { name: "E-mail corporativo", icon: Mail, status: "Verificado" },
    { name: "Intranet", icon: Globe, status: "Pendente" },
    { name: "Link privado", icon: Link2, status: "Gerado" },
  ];

  const handleSend = async () => {
    if (!canSend) {
      toast.error("Você não tem permissão para enviar comunicados.");
      return;
    }
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha o título e a mensagem.");
      return;
    }
    const ok = window.confirm(
      "Enviar este comunicado como notificação in-app para todos os colaboradores da organização?"
    );
    if (!ok) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "broadcast-org-announcement",
        { body: { title: title.trim(), message: message.trim(), tone } }
      );
      if (error) throw error;
      const count = (data as any)?.recipients ?? 0;
      toast.success(`Comunicado enviado para ${count} colaborador${count === 1 ? "" : "es"}.`, {
        className: "bg-[#0B0908] text-white border-none rounded-2xl p-4 font-montserrat",
      });
    } catch (e: any) {
      toast.error(`Falha ao enviar: ${e?.message ?? "erro desconhecido"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <EnterpriseRHLayout title="Comunicação de lançamento">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] text-[#0B0908] font-montserrat overflow-y-auto pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#F7F4F2]/80 backdrop-blur-md z-50 px-6 py-4 flex items-center justify-between border-b border-[#0B0908]/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/enterprise/rh/onboarding")}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#0B0908]" />
          </button>
          <h1 className="font-playfair text-xl font-bold">Comunicação de lançamento</h1>
        </div>
        <div className="px-4 py-1.5 bg-white border border-[#F88A2B]/20 rounded-full flex items-center gap-2">
          <Heart className="w-3 h-3 text-[#F88A2B]" />
          <span className="text-[#F88A2B] text-[10px] font-bold uppercase tracking-widest">Cultura organizacional</span>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0B0908] p-10 md:p-16 text-white shadow-2xl">
          <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[#F88A2B]/20 blur-[120px] rounded-full" />
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#F88A2B]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Comunicação estratégica</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-playfair leading-[1.1]">
              A forma como a jornada começa define a confiança coletiva.
            </h2>
            
            <p className="text-white/60 text-base md:text-lg leading-relaxed font-light">
              Apresente o Enterprise de maneira humana, acolhedora e emocionalmente segura.
            </p>
          </div>

          <svg className="absolute bottom-0 right-0 w-full h-full opacity-5 pointer-events-none" viewBox="0 0 800 400">
            <path d="M0,350 Q200,300 400,350 T800,350" stroke="white" fill="transparent" strokeWidth="1" />
            <path d="M0,300 Q300,250 500,300 T800,300" stroke="white" fill="transparent" strokeWidth="1" />
          </svg>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Editor & Options */}
          <div className="space-y-12">
            
            {/* Main Message Editor */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-playfair text-2xl font-bold">Mensagem principal</h3>
                <Type className="w-5 h-5 text-[#0B0908]/20" />
              </div>
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#0B0908]/5 focus-within:border-[#F88A2B]/30 transition-all">
                <input
                  className="w-full mb-4 pb-3 border-b border-[#0B0908]/10 bg-transparent text-[#0B0908] font-bold text-lg focus:outline-none focus:border-[#F88A2B]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título do comunicado"
                  maxLength={160}
                />
                <textarea 
                  className="w-full h-48 bg-transparent text-[#0B0908]/80 leading-relaxed font-light resize-none focus:outline-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva a mensagem de lançamento..."
                />
              </div>
            </section>

            {/* Tone Selection */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-playfair text-2xl font-bold">Tom da comunicação</h3>
                <Palette className="w-5 h-5 text-[#0B0908]/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {tones.map((t) => (
                  <button 
                    key={t}
                    onClick={() => setTone(t)}
                    className={`py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border ${
                      tone === t 
                        ? 'bg-[#0B0908] text-white border-[#0B0908] shadow-lg shadow-[#0B0908]/20' 
                        : 'bg-white text-[#0B0908]/50 border-[#0B0908]/5 hover:border-[#0B0908]/20'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            {/* Communication Points */}
            <section className="space-y-4">
              <h3 className="font-playfair text-2xl font-bold px-2">Pontos que serão destacados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {communicationPoints.map((point, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-[#0B0908]/5 flex items-center justify-between group">
                    <span className="text-sm font-medium text-[#0B0908]/80">{point.label}</span>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${point.active ? 'bg-[#F88A2B]' : 'bg-[#0B0908]/10'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 transform ${point.active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Preview & Channels */}
          <div className="space-y-12">
            
            {/* Communication Preview */}
            <section className="space-y-4">
              <h3 className="font-playfair text-2xl font-bold px-2">Prévia do comunicado</h3>
              <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-[#0B0908]/5 relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#F88A2B]" />
                
                <div className="w-16 h-16 rounded-full bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B] mb-8">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-6">
                  <h4 className="font-playfair text-3xl font-bold text-[#0B0908]">Uma nova jornada emocional começa agora.</h4>
                  
                  <div className="space-y-4 text-sm text-[#0B0908]/60 leading-relaxed font-light max-w-sm">
                    <p>{message}</p>
                    <p className="font-bold text-[#F88A2B]">Sua experiência individual é protegida. A organização verá apenas tendências coletivas agregadas.</p>
                  </div>

                  <button className="mt-8 px-10 py-4 bg-[#0B0908] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all">
                    Iniciar minha jornada
                  </button>
                </div>

                <div className="mt-12 pt-8 border-t border-[#0B0908]/5 w-full">
                  <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] italic">“Editorial Card Preview”</p>
                </div>
              </div>
            </section>

            {/* Channels */}
            <section className="space-y-4">
              <h3 className="font-playfair text-2xl font-bold px-2">Canais de envio</h3>
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#0B0908]/5">
                {channels.map((channel, idx) => (
                  <div key={idx} className={`p-6 flex items-center justify-between border-b border-[#0B0908]/5 last:border-0 hover:bg-[#F7F4F2]/50 transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-[#0B0908]/60">
                        <channel.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0B0908]">{channel.name}</p>
                        <p className="text-[10px] text-[#0B0908]/40 uppercase tracking-widest">{channel.status}</p>
                      </div>
                    </div>
                    <button className="px-5 py-2 rounded-full border border-[#0B0908]/10 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0B0908] hover:text-white transition-all">
                      Conectar
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* AI Recommendations */}
        <section>
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 border border-[#F88A2B]/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <Sparkles className="w-8 h-8 text-[#F88A2B] opacity-20" />
            </div>
            
            <div className="space-y-8">
              <h4 className="font-playfair text-2xl font-bold">Momento ideal para lançamento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  "Evitar períodos críticos",
                  "Iniciar junto com liderança",
                  "Criar mensagem humana",
                  "Reforçar privacidade",
                  "Estimular adesão gradual"
                ].map((sug, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F88A2B]/10 flex items-center justify-center text-[#F88A2B]">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-[#0B0908]/70 font-light">{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Message Mock */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#0B0908] rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/10 blur-[60px] rounded-full" />
            
            <div className="w-24 h-24 rounded-full border-2 border-[#F88A2B] p-1 shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200" 
                alt="Executivo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div>
                <p className="text-[#F88A2B] text-[10px] font-bold uppercase tracking-[0.2em]">Mensagem da liderança</p>
                <h5 className="font-playfair text-xl font-bold pt-1">Carlos Drummond</h5>
                <p className="text-white/40 text-[10px] uppercase tracking-widest italic">CEO & Co-fundador</p>
              </div>
              <p className="text-white/60 text-sm leading-relaxed italic font-light">
                “O cuidado emocional coletivo faz parte da cultura que queremos construir.”
              </p>
            </div>
          </div>

          <div className="bg-[#0B0908] rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-4 text-[#F88A2B]">
              <Lock className="w-8 h-8" />
              <h3 className="font-playfair text-2xl font-bold text-white">Confiança organizacional</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed font-light">
              O lançamento precisa reduzir medo, não gerar vigilância. O colaborador precisa entender que o Enterprise existe para apoiar pessoas — nunca monitorá-las.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full self-start">
              <UserCheck className="w-4 h-4 text-[#F88A2B]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Privacidade preservada</span>
            </div>
          </div>
        </section>

        {/* Final Actions */}
        <section className="flex flex-col items-center gap-8 py-12">
          <button 
            onClick={handleSend}
            disabled={sending || !canSend}
            className="w-full max-w-md bg-[#F88A2B] text-white py-6 rounded-full font-bold text-xl shadow-2xl shadow-[#F88A2B]/30 hover:bg-[#e07b25] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            {sending ? "Enviando..." : "Enviar comunicado agora"}
          </button>
          {!canSend && (
            <p className="text-xs text-[#0B0908]/50 -mt-6">
              Apenas owner ou RH Admin podem disparar o comunicado.
            </p>
          )}
          
          <button 
            onClick={() => navigate("/enterprise/rh/onboarding")}
            className="text-[#0B0908]/40 font-bold text-sm uppercase tracking-[0.3em] hover:text-[#0B0908] transition-colors flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao onboarding
          </button>

          <footer className="pt-8 text-center max-w-sm mx-auto">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-medium leading-relaxed italic">
              “A adesão emocional começa quando existe clareza e confiança.”
            </p>
          </footer>
        </section>

      </main>

      {/* Background Decorative Blur */}
      <div className="fixed top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-[#F88A2B]/5 blur-[150px] rounded-full pointer-events-none -z-10" />
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseLaunchCommunicationScreen;
