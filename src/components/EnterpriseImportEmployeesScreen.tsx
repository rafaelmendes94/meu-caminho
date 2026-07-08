import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Upload, 
  FileSpreadsheet, 
  Globe, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Download, 
  ShieldCheck, 
  Mail, 
  Users,
  LayoutGrid,
  Lock,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseImportEmployeesScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploaded, setIsUploaded] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleFileUpload = () => {
    setIsUploaded(true);
    toast({
      title: "Arquivo processado",
      description: "Sua planilha foi analisada com sucesso.",
    });
  };

  const handleFinalImport = () => {
    toast({
      title: "Importação concluída",
      description: "Colaboradores importados com segurança.",
    });
    setTimeout(() => navigate("/enterprise/rh/equipe/convidar"), 2000);
  };

  return (
    <EnterpriseRHLayout title="Importar colaboradores">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] text-[#0B0908] font-montserrat overflow-y-auto pb-32">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#F7F4F2]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white border border-[#E5E0DA] flex items-center justify-center hover:bg-[#F88A2B]/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Importar colaboradores</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-[#F88A2B] rounded-full" />
              <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider">Ativação em escala</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 max-w-3xl mx-auto space-y-12 pt-4">
        
        {/* Hero Section */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B]/10 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/[0.03] blur-[80px] rounded-full -ml-10 -mb-10" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                <span className="text-[11px] font-bold text-orange-50 tracking-[0.15em] uppercase">Importação segura</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-playfair text-[#111] leading-[1.15]">
                Convide toda a empresa <br/>
                <span className="text-[#F88A2B]">sem perder o cuidado individual.</span>
              </h2>
              
              <p className="text-orange-50/70 text-base leading-relaxed max-w-xl">
                Importe colaboradores em massa mantendo privacidade, organização e uma experiência de entrada acolhedora.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Métodos de importação */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-playfair font-semibold">Métodos de importação</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'csv', icon: FileSpreadsheet, title: "CSV ou planilha", desc: "Envie uma lista com nome, e-mail, departamento e cargo.", action: "Importar arquivo" },
              { id: 'google', icon: Globe, title: "Google Workspace", desc: "Sincronize colaboradores e grupos da organização.", action: "Conectar Google" },
              { id: 'microsoft', icon: Cloud, title: "Microsoft Entra ID", desc: "Importe usuários e áreas do diretório corporativo.", action: "Conectar Microsoft" },
              { id: 'domain', icon: Lock, title: "Domínio corporativo", desc: "Permita entrada automática para e-mails autorizados.", action: "Configurar domínio" }
            ].map((method) => (
              <motion.div 
                key={method.id}
                whileHover={{ y: -4 }}
                className={`bg-white border p-6 rounded-[2rem] flex flex-col gap-6 shadow-sm transition-all ${selectedMethod === method.id ? 'border-[#F88A2B] ring-1 ring-[#F88A2B]/20' : 'border-[#E5E0DA]'}`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7F4F2] flex items-center justify-center text-[#0B0908]">
                    <method.icon className="w-6 h-6" />
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-5 h-5 rounded-full bg-[#F88A2B] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#111]" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">{method.title}</h4>
                  <p className="text-sm text-[#0B0908]/60 leading-relaxed">{method.desc}</p>
                </div>
                <button className={`mt-auto py-3 px-6 rounded-xl text-sm font-bold transition-all ${selectedMethod === method.id ? 'bg-[#F88A2B] text-[#111]' : 'bg-[#F7F4F2] text-[#0B0908] hover:bg-[#E5E0DA]'}`}>
                  {method.action}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Upload de arquivo */}
        <section className="space-y-6">
          <div className="bg-white/40 backdrop-blur-sm border border-white rounded-[2.5rem] p-8 md:p-12 shadow-sm">
            <div 
              onClick={handleFileUpload}
              className="border-2 border-dashed border-[#E5E0DA] rounded-[2rem] p-12 flex flex-col items-center text-center gap-4 hover:border-[#F88A2B]/40 hover:bg-[#F88A2B]/5 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-[#E5E0DA] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-[#F88A2B]" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold">Arraste sua planilha aqui ou selecione um arquivo</p>
                <p className="text-sm text-[#0B0908]/40">Formatos aceitos: .csv, .xlsx</p>
              </div>
              <button className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] px-8 py-3 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all">
                Selecionar arquivo
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2">
              <Download className="w-4 h-4 text-[#F88A2B]" />
              <button className="text-sm font-semibold text-[#F88A2B] border-b border-[#F88A2B]/20 hover:border-[#F88A2B] transition-all">
                Baixar modelo CSV
              </button>
            </div>
          </div>
        </section>

        {/* Modelo esperado */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold px-2">Estrutura recomendada</h3>
          <div className="bg-white border border-[#E5E0DA] rounded-3xl p-6 overflow-hidden">
            <div className="flex gap-4 mb-6 border-b border-[#F7F4F2] pb-4">
              {['Nome', 'Email', 'Departamento', 'Cargo (opc.)'].map((col) => (
                <span key={col} className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/30 flex-1">{col}</span>
              ))}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 py-2 border-b border-[#F7F4F2]">
                <span className="text-sm font-medium flex-1">Ana Costa</span>
                <span className="text-sm text-[#0B0908]/60 flex-1">ana@empresa.com</span>
                <span className="text-sm text-[#F88A2B] font-semibold flex-1">Operações</span>
                <span className="text-sm text-[#0B0908]/40 flex-1 italic">Gerente</span>
              </div>
              <div className="flex items-center gap-4 py-2">
                <span className="text-sm font-medium flex-1">Bruno Lima</span>
                <span className="text-sm text-[#0B0908]/60 flex-1">bruno@empresa.com</span>
                <span className="text-sm text-[#F88A2B] font-semibold flex-1">Produto</span>
                <span className="text-sm text-[#0B0908]/40 flex-1 italic">Designer</span>
              </div>
            </div>
          </div>
        </section>

        {/* Validação da importação (Mock State) */}
        <AnimatePresence>
          {isUploaded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-8 pt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Encontrados", value: 142, color: "bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111]" },
                  { label: "Válidos", value: 136, color: "bg-green-500" },
                  { label: "Duplicados", value: 4, color: "bg-amber-500" },
                  { label: "Incompletos", value: 2, color: "bg-blue-400" }
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-[#E5E0DA] p-4 rounded-2xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40">{stat.label}</span>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-playfair font-bold">{stat.value}</span>
                      <div className={`w-1.5 h-1.5 rounded-full mb-2 ${stat.color}`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Correções necessárias */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold px-2">Correções sugeridas</h3>
                <div className="space-y-3">
                  <div className="bg-white border border-amber-100 p-5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">Departamento 'Suporte' ainda não existe</p>
                        <p className="text-[11px] text-[#0B0908]/40">4 colaboradores usam este nome.</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-[#F88A2B] px-4 py-2 rounded-lg border border-[#F88A2B]/20 hover:bg-[#F88A2B]/5 transition-all">
                      Criar departamento
                    </button>
                  </div>

                  <div className="bg-white border border-blue-50 p-5 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">2 linhas sem nome completo</p>
                        <p className="text-[11px] text-[#0B0908]/40">Apenas o e-mail foi fornecido.</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-[#0B0908] px-4 py-2 rounded-lg border border-[#E5E0DA] hover:bg-[#F7F4F2] transition-all">
                      Revisar dados
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensagem de convite */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold px-2">Mensagem de convite</h3>
                <div className="bg-white border border-[#E5E0DA] rounded-3xl p-6 space-y-4 shadow-sm">
                  <textarea 
                    className="w-full h-32 bg-[#F7F4F2] rounded-2xl p-4 text-sm outline-none focus:ring-1 focus:ring-[#F88A2B]/20 border border-transparent focus:bg-white transition-all resize-none"
                    defaultValue="Você recebeu acesso ao Meu Caminho Enterprise, uma jornada de cuidado emocional com privacidade individual protegida."
                  />
                  <div className="flex flex-wrap gap-3">
                    {['Enviar imediatamente', 'Salvar como rascunho', 'Enviar depois'].map((opt, i) => (
                      <button key={opt} className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${i === 0 ? 'bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] border-transparent' : 'border-[#E5E0DA] text-[#0B0908]/60 hover:border-[#F88A2B]/40'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacidade da importação */}
        <section>
          <div className="bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] rounded-[2.5rem] p-8 md:p-12 text-[#111] space-y-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full -mr-10 -mt-10" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-playfair leading-snug">Importar colaboradores não dá acesso <br/> à <span className="text-[#F88A2B]">vida emocional</span> deles.</h2>
                <p className="text-sm text-[#777] leading-relaxed max-w-lg">
                  O RH administra acessos e departamentos. Respostas, conversas e resultados individuais continuam privados e inacessíveis para a gestão.
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-black/[0.03] border border-black/5 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8 text-[#F88A2B]" />
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: MessageSquare, text: "Sem conversas de IA" },
                { icon: AlertCircle, text: "Sem dados individuais" },
                { icon: Users, text: "Apenas status administrativo" },
                { icon: ShieldCheck, text: "Anonimização ativa" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/[0.03] p-3 rounded-xl border border-white/5">
                  <item.icon className="w-4 h-4 text-[#F88A2B]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#333]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4 pt-4">
          <button 
            onClick={handleFinalImport}
            className="w-full bg-[#F88A2B] text-[#111] py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            <span className="font-bold text-lg tracking-tight">Importar e enviar convites</span>
            <CheckCircle2 className="w-5 h-5" />
          </button>

          <button 
            onClick={() => navigate("/enterprise/rh/equipe/convidar")}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[#0B0908]/40 hover:text-[#0B0908] transition-colors"
          >
            <span className="font-semibold text-sm">Voltar para convites</span>
          </button>
          
          <div className="pt-8 text-center">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-xs mx-auto">
              A importação em escala deve preservar a mesma confiança da experiência individual.
            </p>
          </div>
        </section>
      </main>
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseImportEmployeesScreen;
