import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Bell, 
  BookOpen, 
  ChevronRight, 
  Lock,
  Bookmark,
  Play,
  Clock,
  LayoutGrid
} from "lucide-react";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";

const serif = { fontFamily: "'Playfair Display', Georgia, serif" } as const;

type Book = {
  id: string;
  title: string;
  cover: string;
  accent: string;
  bg: string;
  progress?: number;
  duration?: string;
  isNew?: boolean;
  locked?: boolean;
  category: string;
};

const BOOKS: Book[] = [
  { 
    id: "vendedor", 
    title: "O Vendedor de Sonhos", 
    cover: "linear-gradient(180deg,#FBE7C7 0%,#F5C786 50%,#C25A2A 100%)", 
    accent: "#5B2A12", 
    bg: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=70&auto=format&fit=crop", 
    progress: 72, 
    duration: "5h 20min", 
    isNew: true, 
    category: "Liderança" 
  },
  { 
    id: "ansiedade", 
    title: "Ansiedade", 
    cover: "linear-gradient(180deg,#D8E4EA 0%,#7C9AAE 60%,#3B5567 100%)", 
    accent: "#0E2230", 
    bg: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=600&q=70&auto=format&fit=crop", 
    progress: 48, 
    duration: "6h 40min", 
    isNew: true, 
    category: "Foco" 
  },
  { 
    id: "homem", 
    title: "O Homem Mais Inteligente da História", 
    cover: "linear-gradient(180deg,#E8D7BE 0%,#B89770 60%,#6E4F33 100%)", 
    accent: "#3A2616", 
    bg: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=70&auto=format&fit=crop", 
    progress: 25, 
    duration: "7h 10min", 
    category: "Relacional" 
  },
  { 
    id: "gestao", 
    title: "Gestão da Emoção", 
    cover: "linear-gradient(180deg,#EFEBE2 0%,#C9C0B0 60%,#7B7367 100%)", 
    accent: "#2E2A22", 
    bg: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=70&auto=format&fit=crop", 
    progress: 90, 
    duration: "4h 50min", 
    category: "Liderança" 
  },
  { 
    id: "multifocal", 
    title: "Inteligência Multifocal", 
    cover: "linear-gradient(180deg,#E8DABF 0%,#B58F62 55%,#5C3D26 100%)", 
    accent: "#3A2614", 
    bg: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=70&auto=format&fit=crop", 
    progress: 33, 
    duration: "6h 30min", 
    category: "Foco" 
  },
];

const CATEGORIES = ["Todos", "Liderança", "Foco", "Relacional", "Criatividade"];

export default function EnterpriseLibraryScreen() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = BOOKS.filter(book => {
    const matchesCategory = selectedCategory === "Todos" || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <EnterpriseUserLayout title="Biblioteca">
      <main className="flex-1 max-w-full mx-auto lg:py-4">
        {/* Search */}
        <div className="px-6 lg:px-0 py-6 lg:pt-0">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#999] group-focus-within:text-[#F88A2B] transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Buscar obras e conceitos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white rounded-2xl border border-black/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 text-[14px] placeholder:text-[#999] transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 lg:px-0 mb-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar lg:-mx-0 px-6 lg:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-5 h-9 rounded-full text-[13px] font-bold transition-all ${
                  selectedCategory === cat 
                    ? "bg-[#111] text-white shadow-lg" 
                    : "bg-white text-[#666] border border-black/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Card */}
        {selectedCategory === "Todos" && !searchQuery && (
          <div className="px-6 lg:px-0 mb-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="relative min-h-[240px] lg:h-[300px] rounded-[32px] overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-end">
              <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80&auto=format&fit=crop" 
                alt="Destaque" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="relative z-10 p-5 lg:p-8">
                <span className="inline-block px-3 py-1 rounded-full bg-[#F88A2B] text-black text-[9px] font-extrabold uppercase tracking-widest mb-2">Especial Enterprise</span>
                <h2 style={serif} className="text-[18px] lg:text-[28px] font-bold text-white leading-tight mb-1">Decifrando a Liderança Emocional</h2>
                <p className="text-[12px] lg:text-[15px] text-white/70 leading-relaxed max-w-[240px] lg:max-w-md">Domine as ferramentas da Inteligência Multifocal.</p>
              </div>
            </div>
          </div>
        )}

        {/* Books Grid */}
        <div className="px-6 lg:px-0 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold tracking-wider text-[#999] uppercase">Sua curadoria</h3>
            <span className="text-[12px] font-medium text-[#666]">{filteredBooks.length} resultados</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 lg:gap-x-6 gap-y-8 lg:gap-y-10">
            {filteredBooks.map((book, idx) => (
              <div 
                key={book.id} 
                className="animate-fade-up group cursor-pointer"
                style={{ animationDelay: `${200 + idx * 100}ms` }}
                onClick={() => navigate(`/biblioteca/detalhe?livro=${book.id}`)}
              >
                <div className="relative aspect-[3/4.2] rounded-[20px] overflow-hidden shadow-sm mb-3 transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                  <div className="absolute inset-0" style={{ background: book.cover }} />
                  <img src={book.bg} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-soft-light opacity-60" />
                  
                  {/* Progress overlay if any */}
                  {book.progress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                      <div className="h-full bg-white/60" style={{ width: `${book.progress}%` }} />
                    </div>
                  )}

                  {/* Title centered on cover */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-3 text-center">
                    <p style={{ ...serif, color: book.accent }} className="text-[12px] font-bold uppercase tracking-tighter leading-tight">
                      {book.title}
                    </p>
                  </div>

                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Bookmark className="h-3.5 w-3.5 text-[#111]" />
                  </div>
                </div>
                <h4 className="text-[14px] font-bold text-[#111] line-clamp-1 mb-1">{book.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#F88A2B] px-2 py-0.5 rounded-md bg-[#F88A2B]/10">{book.category}</span>
                  <span className="flex items-center gap-1 text-[10px] text-[#999] font-medium">
                    <Clock className="h-2.5 w-2.5" />
                    {book.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cury Insights Section */}
        <section className="mt-12 px-6 lg:px-0">
          <div className="bg-[#111] rounded-[32px] p-8 text-[#111] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B] opacity-10 rounded-full -translate-y-12 translate-x-12 blur-3xl" />
            <BookOpen className="h-8 w-8 text-[#F88A2B] mb-6" />
            <h3 style={serif} className="text-[20px] font-bold leading-tight mb-4">
              "A leitura é para a mente o que o exercício é para o corpo."
            </h3>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-black/10">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=70&auto=format&fit=crop" alt="Cury" className="w-full h-full object-cover" />
              </div>
              <span className="text-[12px] font-bold text-[#666]">— Augusto Cury</span>
            </div>
          </div>
        </section>

      </main>
    </EnterpriseUserLayout>
  );
}
