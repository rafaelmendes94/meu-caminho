import React from 'react';

const RevealFooter = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#0B0908] text-white py-12 lg:py-16 px-6 lg:px-24 z-0 pointer-events-auto h-[600px] md:h-[400px] flex flex-col justify-between">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 border-b border-white/10 pb-16">
        <div className="space-y-6">
          <h3 className="text-2xl font-playfair font-bold text-white">Meu Caminho</h3>
          <p className="text-white/50 font-montserrat text-sm leading-relaxed max-w-xs">
            A maior plataforma de inteligência emocional e desenvolvimento humano do Brasil, baseada na Teoria da Inteligência Multifocal.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Plataforma</h4>
            <nav className="flex flex-col gap-2">
              <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Conteúdo</a>
              <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Enterprise</a>
              <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Suporte</a>
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Legal</h4>
            <nav className="flex flex-col gap-2">
              <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Termos</a>
              <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Cookies</a>
            </nav>
          </div>
        </div>

        <div className="space-y-6 flex flex-col items-start md:items-end">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">Redes Sociais</div>
          <div className="flex gap-6">
             <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Instagram</a>
             <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">LinkedIn</a>
             <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 text-[10px] font-montserrat text-white/30 tracking-[0.2em] uppercase">
        <p>© 2026 MEU CAMINHO — AUGUSTO CURY. ALL RIGHTS RESERVED.</p>
        <p className="italic">DESIGNED FOR EXCELLENCE</p>
      </div>
    </footer>
  );
};

export default RevealFooter;