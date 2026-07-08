import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Send, 
  MessageSquare, 
  Users, 
  Sparkles, 
  Calendar, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Megaphone
} from "lucide-react";
import { toast } from "sonner";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseLeadershipMessageScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    audience: "toda empresa",
    tone: "acolhedor"
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error("Por favor, preencha o título e a mensagem.");
      return;
    }
    toast.success("Comunicado publicado com sucesso.");
    setFormData({
      title: "",
      message: "",
      audience: "toda empresa",
      tone: "acolhedor"
    });
  };

  const recentMessages = [
    {
      id: 1,
      title: "Equilíbrio em períodos intensos",
      date: "2 dias atrás",
      tag: "Cultura"
    },
    {
      id: 2,
      title: "Cuidar da mente também é produtividade sustentável",
      date: "1 semana atrás",
      tag: "Bem-estar"
    },
    {
      id: 3,
      title: "Escuta coletiva e segurança emocional",
      date: "2 semanas atrás",
      tag: "Liderança"
    }
  ];

  const cultureQuotes = [
    { text: "Lideranças emocionalmente conscientes geram mais segurança.", id: 1 },
    { text: "Clareza emocional reduz desgaste silencioso.", id: 2 },
    { text: "Pausas ajudam a recuperar foco e presença.", id: 3 },
    { text: "Escuta coletiva fortalece pertencimento.", id: 4 }
  ];

  return (
    <EnterpriseRHLayout title="Comunicados">
      <main className="px-6 space-y-8 max-w-4xl mx-auto py-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 text-[#111] shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-10 blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#F88A2B] rounded-lg">
                <Megaphone className="w-4 h-4 text-[#111]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Comunicação Humana</span>
            </div>
            <h2 className="font-playfair text-3xl md:text-4xl leading-tight">
              A cultura também é construída pelas mensagens que circulam.
            </h2>
            <p className="text-[#666] text-sm leading-relaxed max-w-md">
              O Enterprise permite que liderança e RH reforcem equilíbrio, clareza emocional e escuta coletiva de forma inspiradora.
            </p>
            <div className="pt-4 flex items-center gap-2">
              <div className="h-[1px] w-8 bg-[#F88A2B]"></div>
              <span className="text-[10px] font-medium text-[#999] tracking-widest uppercase italic">Voz Institucional</span>
            </div>
          </div>
        </section>

        {/* Featured Message */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-playfair text-xl font-bold">Comunicado em destaque</h3>
            <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest">Editorial</span>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-[#0B0908]/5 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#F88A2B] opacity-50"></div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#0B0908]/40">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Hoje, 10:30</span>
              </div>
              <h4 className="font-playfair text-2xl text-[#0B0908] group-hover:text-[#F88A2B] transition-colors">
                “Pausas também fazem parte da performance.”
              </h4>
              <p className="text-[#0B0908]/70 text-sm leading-relaxed italic">
                “Nas últimas semanas percebemos aumento de pressão em algumas áreas. Gostaríamos de reforçar a importância de pausas cognitivas, recuperação emocional e conversas abertas com liderança.”
              </p>
              <div className="pt-4 flex items-center justify-between border-t border-[#0B0908]/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#F88A2B]/10 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                  </div>
                  <span className="text-xs font-bold text-[#0B0908]">RH & Liderança</span>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#F88A2B]">
                  Ler mais <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Messages */}
        <section className="space-y-4">
          <h3 className="font-playfair text-xl font-bold">Mensagens recentes</h3>
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <button 
                key={msg.id}
                className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-[#0B0908]/5 hover:border-[#F88A2B]/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center group-hover:bg-[#F88A2B]/5 transition-colors">
                    <MessageSquare className="w-5 h-5 text-[#0B0908]/30 group-hover:text-[#F88A2B]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-[#F88A2B] uppercase mb-0.5">{msg.tag}</p>
                    <h5 className="font-bold text-sm leading-tight group-hover:text-[#F88A2B] transition-colors">{msg.title}</h5>
                    <p className="text-[10px] text-[#0B0908]/40 mt-1">{msg.date}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#0B0908]/20 group-hover:text-[#F88A2B]" />
              </button>
            ))}
          </div>
        </section>

        {/* Create New Message */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#F88A2B]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#F88A2B]" />
            </div>
            <h3 className="font-playfair text-xl font-bold">Criar novo comunicado</h3>
          </div>
          <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-6 border border-white/60 shadow-lg space-y-6">
            <form onSubmit={handlePublish} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Título do comunicado</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Reforço sobre saúde mental..."
                  className="w-full bg-white/80 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#F88A2B]/20 outline-none placeholder:text-[#0B0908]/20 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Público</label>
                  <select 
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    className="w-full bg-white/80 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#F88A2B]/20 outline-none appearance-none shadow-inner"
                  >
                    <option value="toda empresa">Toda empresa</option>
                    <option value="área específica">Área específica</option>
                    <option value="liderança">Liderança</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Tom de voz</label>
                  <select 
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                    className="w-full bg-white/80 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#F88A2B]/20 outline-none appearance-none shadow-inner"
                  >
                    <option value="acolhedor">Acolhedor</option>
                    <option value="estratégico">Estratégico</option>
                    <option value="inspirador">Inspirador</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Mensagem editorial</label>
                <textarea 
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Escreva aqui a mensagem para o time..."
                  className="w-full bg-white/80 border-none rounded-[2rem] p-6 text-sm focus:ring-2 focus:ring-[#F88A2B]/20 outline-none placeholder:text-[#0B0908]/20 shadow-inner resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-[#F88A2B] text-[#111] rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#F88A2B]/20 hover:scale-[0.98] transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                Publicar comunicado
              </button>
            </form>
          </div>
        </section>

        {/* Culture Strengthening */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#F88A2B] rounded-full"></div>
            <h3 className="font-playfair text-xl font-bold italic">Mensagens que fortalecem cultura</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cultureQuotes.map((quote) => (
              <div 
                key={quote.id}
                className="p-6 bg-white rounded-3xl border border-[#0B0908]/5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
              >
                <div className="mt-1">
                  <CheckCircle2 className="w-4 h-4 text-[#F88A2B]" />
                </div>
                <p className="text-sm font-medium leading-relaxed text-[#0B0908]/80">{quote.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Impact Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-10 text-[#111] shadow-2xl text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F88A2B]/10 opacity-50"></div>
          <div className="relative z-10 space-y-6">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center backdrop-blur-sm border border-black/5 mb-2">
              <Users className="w-6 h-6 text-[#F88A2B]" />
            </div>
            <h2 className="font-playfair text-3xl leading-tight max-w-xs mx-auto">
              Cultura emocional é construída repetidamente.
            </h2>
            <p className="text-[#777] text-sm max-w-sm mx-auto leading-relaxed">
              Mensagens consistentes ajudam a transformar cuidado emocional em comportamento organizacional sustentável.
            </p>
            
            <div className="space-y-4 pt-4">
              <button 
                onClick={() => navigate("/enterprise/rh/impacto")}
                className="w-full py-5 bg-[#F88A2B] text-[#111] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F88A2B]/90 transition-colors"
              >
                Ver impacto organizacional
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate("/enterprise/rh")}
                className="w-full py-5 bg-black/[0.03] text-[#444] border border-black/5 rounded-2xl font-bold text-sm hover:bg-black/5 transition-colors"
              >
                Voltar ao módulo RH
              </button>
            </div>
          </div>
        </section>

        <footer className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-[#0B0908]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <p className="text-[10px] uppercase font-bold tracking-widest">Plataforma Segura</p>
          </div>
          <p className="text-[10px] text-[#0B0908]/40 max-w-[200px] mx-auto leading-relaxed">
            O Enterprise promove comunicação emocional coletiva sem exposição individual.
          </p>
        </footer>
      </main>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseLeadershipMessageScreen;