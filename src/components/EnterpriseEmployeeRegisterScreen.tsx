import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Eye, 
  EyeOff, 
  Camera, 
  ArrowRight, 
  ArrowLeft,
  Heart,
  Brain,
  Sparkles,
  CloudMoon,
  Zap,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const EnterpriseEmployeeRegisterScreen = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const strengths = [
    { id: "ansiedade", label: "Reduzir ansiedade", icon: Heart },
    { id: "desacelerar", label: "Desacelerar a mente", icon: CloudMoon },
    { id: "clareza", label: "Melhorar clareza emocional", icon: Sparkles },
    { id: "equilibrio", label: "Recuperar equilíbrio", icon: Zap },
    { id: "inteligencia", label: "Fortalecer inteligência emocional", icon: Brain }
  ];

  const toggleStrength = (id: string) => {
    setSelectedStrengths(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAccount = () => {
    // Simulação de navegação para boas-vindas
    navigate("/enterprise/boas-vindas");
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] text-[#0B0908] font-montserrat overflow-y-auto pb-32">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#F7F4F2]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F88A2B] rounded-lg flex items-center justify-center shadow-lg shadow-orange-200">
            <ShieldCheck className="text-[#111] w-5 h-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#0B0908]">Meu Caminho Enterprise</span>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100 shadow-sm">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Conta protegida</span>
        </div>
      </header>

      <main className="px-6 max-w-2xl mx-auto space-y-10 pt-4">
        
        {/* Hero Section */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full -mr-20 -mt-20 animate-pulse" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5">
                <Lock className="w-3.5 h-3.5 text-[#F88A2B]" />
                <span className="text-[11px] font-bold text-orange-50 tracking-[0.15em] uppercase">Privado e pessoal</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-playfair text-[#111] leading-[1.15]">
                Seu espaço emocional <br/>
                <span className="text-[#F88A2B]">começa aqui.</span>
              </h1>
              
              <p className="text-orange-50/70 text-base leading-relaxed">
                Crie sua conta para iniciar uma jornada privada de equilíbrio, clareza emocional e inteligência emocional.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Criar Conta Section */}
        <section className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <h2 className="text-2xl font-playfair font-semibold">Suas informações</h2>
            
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#F7F4F2] border-2 border-[#E5E0DA] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#F88A2B]">
                  {profileImage ? (
                    <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-[#0B0908]/20" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#F88A2B] text-[#111] p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <span className="text-[11px] font-bold text-[#0B0908]/40 uppercase tracking-widest">Foto de perfil (opcional)</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#0B0908]/60 uppercase tracking-wider ml-4">Nome completo</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B0908]/30 group-focus-within:text-[#F88A2B] transition-colors">
                    <User className="w-full h-full" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Como você gostaria de ser chamado?"
                    className="w-full bg-[#F7F4F2] border border-transparent focus:border-[#F88A2B]/30 focus:bg-white rounded-2xl py-4 pl-12 pr-6 outline-none transition-all text-[#0B0908] placeholder:text-[#0B0908]/20"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5 opacity-60 grayscale cursor-not-allowed">
                <label className="text-[11px] font-bold text-[#0B0908]/60 uppercase tracking-wider ml-4">E-mail corporativo</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0B0908]/30">
                    <Mail className="w-full h-full" />
                  </div>
                  <input 
                    type="email" 
                    readOnly
                    className="w-full bg-[#E5E0DA]/30 border border-transparent rounded-2xl py-4 pl-12 pr-6 outline-none text-[#0B0908]/50"
                    value={formData.email}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#0B0908]/60 uppercase tracking-wider ml-4">Criar senha</label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full bg-[#F7F4F2] border border-transparent focus:border-[#F88A2B]/30 focus:bg-white rounded-2xl py-4 px-6 outline-none transition-all text-[#0B0908] placeholder:text-[#0B0908]/20"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0B0908]/20 hover:text-[#F88A2B]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#0B0908]/60 uppercase tracking-wider ml-4">Confirmar senha</label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full bg-[#F7F4F2] border border-transparent focus:border-[#F88A2B]/30 focus:bg-white rounded-2xl py-4 px-6 outline-none transition-all text-[#0B0908] placeholder:text-[#0B0908]/20"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Como sua conta funciona */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Experiência privada", desc: "Sua jornada emocional é individual e protegida.", icon: Lock },
            { title: "IA confidencial", desc: "Conversas com a IA são privadas.", icon: Brain },
            { title: "Dados coletivos", desc: "A organização vê apenas tendências agregadas.", icon: Sparkles }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-[#E5E0DA] rounded-[2rem] p-5 space-y-3 shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F88A2B]/5 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-[#F88A2B]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">{item.title}</h4>
                <p className="text-[11px] text-[#0B0908]/50 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Preferências iniciais */}
        <section className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <h2 className="text-2xl font-playfair font-semibold">O que você deseja fortalecer?</h2>
            <div className="w-12 h-0.5 bg-[#F88A2B]/30 rounded-full" />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {strengths.map((item) => {
              const isSelected = selectedStrengths.includes(item.id);
              return (
                <EnterpriseUserLayout>
                <button
                  key={item.id}
                  onClick={() => toggleStrength(item.id)}
                  className={`
                    flex items-center gap-3 px-6 py-4 rounded-full border transition-all duration-300
                    ${isSelected 
                      ? 'bg-[#F88A2B] border-[#F88A2B] text-[#111] shadow-lg shadow-orange-200 scale-105' 
                      : 'bg-white border-[#E5E0DA] text-[#0B0908]/60 hover:border-[#F88A2B]/30'}
                  `}
                >
                  <item.icon className={`w-4 h-4 ${isSelected ? 'text-[#111]' : 'text-[#F88A2B]'}`} />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
                </EnterpriseUserLayout>
              );
            })}
          </div>
        </section>

        {/* Experiência personalizada */}
        <section>
          <div className="bg-white/40 backdrop-blur-sm border border-white rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h3 className="text-xl font-playfair font-semibold leading-relaxed">
                Experiência personalizada ao <span className="text-[#F88A2B]">seu momento.</span>
              </h3>
              <p className="text-sm text-[#0B0908]/60 leading-relaxed">
                O app adaptará trilhas, conteúdos e reflexões ao seu momento emocional de forma inteligente.
              </p>
            </div>
            <div className="w-32 h-32 relative shrink-0">
              <div className="absolute inset-0 bg-[#F88A2B]/10 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-[#F88A2B]/20 rounded-full animate-ping" />
              <div className="absolute inset-8 bg-[#F88A2B] rounded-full flex items-center justify-center text-[#111] shadow-xl shadow-orange-200">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Segurança emocional */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 text-[#111] space-y-8 shadow-xl relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#F88A2B]/10 blur-[60px] rounded-full -mr-10 -mb-10" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-playfair">Seu espaço continua protegido.</h2>
                <div className="inline-flex items-center gap-1.5 bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30">
                  <div className="w-1 h-1 bg-orange-500 rounded-full" />
                  <span className="text-[9px] font-bold text-orange-400 uppercase tracking-tighter">Proteção ativa</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-black/[0.03] border border-black/5 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#F88A2B]" />
              </div>
            </div>

            <ul className="relative z-10 space-y-4">
              {[
                "Sem acesso do RH às conversas",
                "Sem relatórios individuais",
                "Sem score emocional pessoal",
                "IA privada e confidencial",
                "Anonimização organizacional ativa"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border border-black/5 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#F88A2B]" />
                  </div>
                  <span className="text-sm text-[#444] font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4 pt-4 pb-8">
          <button 
            onClick={handleCreateAccount}
            className="w-full bg-[#F88A2B] text-[#111] py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span className="font-bold text-lg tracking-tight">Criar minha conta</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button 
            onClick={() => navigate(-1)}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[#0B0908]/40 hover:text-[#0B0908] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">Voltar</span>
          </button>
          
          <div className="pt-8 text-center">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-xs mx-auto">
              O cuidado emocional começa em um ambiente seguro.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EnterpriseEmployeeRegisterScreen;
