import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Key, 
  Globe, 
  ShieldCheck, 
  ChevronRight,
  Database,
  CheckCircle2,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const BG = "#F7F4F2";
const ORANGE = "#F88A2B";
const DARK_BG = "#0B0908";

const DepartmentItem = ({ name, count, onDelete }: { name: string; count: number; onDelete: () => void }) => (
  <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-white/60 shadow-sm animate-fade-up">
    <div>
      <h4 className="text-[15px] font-bold text-[#111]">{name}</h4>
      <p className="text-[12px] text-[#999] font-medium">{count} colaboradores ativos</p>
    </div>
    <button 
      onClick={onDelete}
      className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 active:scale-90 transition-transform"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
);

export default function EnterpriseAdminIntegrationScreen() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([
    { id: 1, name: "Operações", count: 42 },
    { id: 2, name: "Comercial", count: 28 },
    { id: 3, name: "Produto & Tecnologia", count: 35 },
    { id: 4, name: "Recursos Humanos", count: 12 },
    { id: 5, name: "Financeiro", count: 8 }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Dados sincronizados com o sistema de RH.");
    }, 2000);
  };

  const handleDeleteDept = (id: number) => {
    setDepartments(departments.filter(d => d.id !== id));
    toast.success("Departamento removido com sucesso.");
  };

  return (
    <EnterpriseRHLayout title="Integração & Estrutura">
      <div className="space-y-8 animate-fade-in">
        
        {/* Status Hero Card */}
        <section>
          <div className="rounded-[32px] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 relative overflow-hidden text-[#111] shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F88A2B] opacity-[0.08] rounded-full -translate-y-20 translate-x-20 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-black/5 border border-black/5">
                  <Database className="h-6 w-6 text-[#F88A2B]" />
                </div>
                <button 
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Sincronizar Agora</span>
                </button>
              </div>
              
              <h2 className="text-[24px] leading-tight font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Conexão com ERP/HRIS
              </h2>
              <p className="text-[13px] text-[#777] mb-6">
                Sua lista de colaboradores e áreas é atualizada automaticamente via integração API.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
                <div>
                  <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest mb-1">Última Sincronização</div>
                  <div className="text-[14px] font-bold">Hoje, 09:42</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest mb-1">Status da Chave</div>
                  <div className="text-[14px] font-bold text-green-400">Ativa & Segura</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gestão de Departamentos */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999]">Departamentos</h3>
              <p className="text-[11px] text-[#BBB] font-medium">Estrutura organizacional mapeada</p>
            </div>
            <button className="flex items-center gap-2 text-[#F88A2B] font-bold text-[13px] active:opacity-70">
              <Plus className="h-4 w-4" />
              <span>Novo Grupo</span>
            </button>
          </div>

          <div className="space-y-3">
            {departments.map((dept) => (
              <DepartmentItem 
                key={dept.id} 
                name={dept.name} 
                count={dept.count} 
                onDelete={() => handleDeleteDept(dept.id)}
              />
            ))}
          </div>
          
          <div className="p-4 rounded-2xl bg-black/[0.03]0 border border-white/60 flex items-start gap-3">
            <Info className="h-4 w-4 text-[#999] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#999] leading-relaxed">
              Áreas com menos de 5 colaboradores não geram relatórios individuais para garantir o anonimato absoluto.
            </p>
          </div>
        </section>

        {/* API & Webhooks */}
        <section className="space-y-4">
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999] px-2">API & Webhooks</h3>
          
          <div className="rounded-[32px] bg-white border border-white/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#F7F4F2] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center">
                  <Key className="h-5 w-5 text-[#999]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#111]">Chave de API</h4>
                  <p className="text-[12px] text-[#999]">•••• •••• •••• 8492</p>
                </div>
              </div>
              <button className="text-[12px] font-bold text-[#F88A2B]">Revelar</button>
            </div>
            
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center">
                  <Globe className="h-5 w-5 text-[#999]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#111]">Webhook de Alerta</h4>
                  <p className="text-[12px] text-[#999]">https://api.empresa.com/...</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#CCC]" />
            </div>
          </div>
        </section>

        {/* Segurança e Ética */}
        <section>
          <div className="rounded-[32px] p-7 bg-[#7FA06E1A] border border-[#7FA06E2A] flex items-start gap-5">
            <div className="h-12 w-12 rounded-2xl bg-[#7FA06E2A] flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6 text-[#7FA06E]" />
            </div>
            <div>
              <h4 className="text-[17px] font-bold text-[#111] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Integridade de Dados
              </h4>
              <p className="text-[13px] text-[#555] leading-relaxed">
                A integração é unidirecional para nomes e e-mails. Nenhum dado de saúde emocional sai do ecossistema Meu Caminho para seu ERP.
              </p>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="pt-4 space-y-4">
          <button 
            onClick={() => {
              toast.success("Estrutura administrativa salva.");
              navigate('/enterprise/rh/configuracoes');
            }}
            className="w-full h-16 rounded-full bg-[#F88A2B] text-[#111] font-bold text-[16px] flex items-center justify-center gap-3 shadow-[0_12px_30px_-10px_rgba(248,138,43,0.5)] active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>Salvar Estrutura</span>
          </button>
          
          <button 
            onClick={() => navigate('/enterprise/rh/configuracoes')}
            className="w-full h-16 rounded-full bg-white border border-[#EFEAE5] text-[#999] font-bold text-[15px] active:scale-[0.98] transition-all"
          >
            Voltar
          </button>
        </section>

      </div>
    </EnterpriseRHLayout>
  );
}
