import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Minus, ChevronRight, X, Trash2, Utensils, 
  MapPin, Loader2, Gift, Star, Phone, Sparkles, ZoomIn, Search,
  Clock, Heart, Share2, CheckCircle2, ChevronLeft, BookOpen, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSheetData, submitSheetData, SheetDish, SheetCategory, SHEET_ID } from './services/googleSheets';
import { DEFAULT_MENU_DATA, Category, Dish } from './data/menuData';

// ==========================================
// 📋 CONFIGURACIÓN DE SABORES DE PIURA
// ==========================================
const RESTAURANTE_NAME = "Picantería Sabores de Piura";
const RESTAURANTE_SUBTITLE = "Cevichería & Picantería Tradicional";
const RESTAURANTE_SLOGAN = "Frescura que viene del mar, sabor que nace de nuestra tierra.";
const RESTAURANTE_DIRECCION = "Av. Los Ficus 134 Independencia";
const WHATSAPP_NUMBER = "51913150281"; // 913150281
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Av.+Los+Ficus+134+Independencia";
const LOGO_PATH = "/logo.png";
const COVER_PATH = "/carta_portada.jpg";
const MARQUEE_TEXT = "🐟 ¡BIENVENIDOS A PICANTERÍA SABORES DE PIURA! • CEVICHES, CHICHARRONES, SUDADOS Y TRADICIÓN PIURANA • ATENCIÓN DE LUNES A DOMINGO • PEDIDOS AL 913150281 • AV. LOS FICUS 134 INDEPENDENCIA • ";

// Galería de la carta física original escaneada
const PHYSICAL_MENU_PAGES = [
  { id: 'cover', title: 'Portada - Sabores de Piura', src: '/carta_portada.jpg' },
  { id: 'pag1', title: 'Página 1: Ceviches, Chicharrones, Arroces y Piura Tradición', src: '/carta_pag1.jpg' },
  { id: 'pag2', title: 'Página 2: Pescados, Sudados, Parihuelas, Dúos y Tríos', src: '/carta_pag2.png' },
  { id: 'pag3', title: 'Página 3: Fuentes, Caldos, Platos Criollos y Bebidas', src: '/carta_pag3.jpg' },
];

interface CartItem {
  nombre: string;
  precio: string;
  cantidad: number;
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_MENU_DATA);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(DEFAULT_MENU_DATA[0]?.id || "ceviches");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);
  
  // Estado para visualizador de carta física original
  const [showPhysicalMenu, setShowPhysicalMenu] = useState(false);
  const [activePhysicalPage, setActivePhysicalPage] = useState(0);

  // Formulario de pedido
  const [orderType, setOrderType] = useState<'delivery' | 'llevar' | 'mesa'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // States for Birthday Form
  const [showBirthdayForm, setShowBirthdayForm] = useState(false);
  const [isSubmittingBirthday, setIsSubmittingBirthday] = useState(false);
  const [birthdaySuccess, setBirthdaySuccess] = useState(false);
  const [birthdayData, setBirthdayData] = useState({
    nombre: '',
    telefono: '',
    fechaNacimiento: '',
    distrito: '',
    correo: ''
  });

  // States for Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewData, setReviewData] = useState({
    estrellasMozo: 5,
    estrellasComida: 5,
    comentario: ''
  });

  // Cargar datos de Google Sheets si existe configuración
  useEffect(() => {
    const loadData = async () => {
      if (!SHEET_ID) {
        setCategories(DEFAULT_MENU_DATA);
        return;
      }

      setLoading(true);
      try {
        const [cats, dishes] = await Promise.all([
          fetchSheetData<SheetCategory>('Categorías'),
          fetchSheetData<SheetDish>('Platos')
        ]);

        if (cats.length === 0 && dishes.length === 0) {
          setCategories(DEFAULT_MENU_DATA);
          return;
        }

        const formattedCategories: Category[] = cats.map(c => ({
          id: c.nombre.toLowerCase().replace(/\s+/g, '-'),
          nombre: c.nombre,
          items: dishes
            .filter(d => d.categoría === c.nombre)
            .map(d => ({
              nombre: d['nombre del plato'],
              descripcion: d.descripción,
              precio: d.precio,
              imagen: d['URL de imagen'] || undefined
            }))
        }));

        setCategories(formattedCategories);
      } catch (error) {
        console.error("Error loading sheet data:", error);
        setCategories(DEFAULT_MENU_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.cantidad, 0), [cart]);

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(i => i.nombre === dish.nombre && i.precio === dish.precio);
      if (existing) {
        return prev.map(i =>
          (i.nombre === dish.nombre && i.precio === dish.precio)
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { nombre: dish.nombre, precio: dish.precio, cantidad: 1 }];
    });
  };

  const updateQuantity = (nombre: string, precio: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.nombre === nombre && i.precio === precio) {
            const newQty = i.cantidad + delta;
            return newQty > 0 ? { ...i, cantidad: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const getItemQuantity = (dish: Dish) => {
    const item = cart.find(i => i.nombre === dish.nombre && i.precio === dish.precio);
    return item ? item.cantidad : 0;
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const cleanPrice = item.precio.replace(/^[^\d.]*/, '');
      const num = parseFloat(cleanPrice) || 0;
      return acc + num * item.cantidad;
    }, 0);
  };

  const sendToWhatsApp = () => {
    const total = calculateTotal();
    let message = `🍽️ *¡HOLA SABORES DE PIURA! DESEO REALIZAR UN PEDIDO:*\n\n`;
    
    if (customerName.trim()) {
      message += `👤 *Cliente:* ${customerName.trim()}\n`;
    }
    
    message += `📍 *Modalidad:* ${
      orderType === 'delivery' ? `Delivery (${customerAddress || 'Por indicar'})` :
      orderType === 'llevar' ? 'Para Llevar / Recojo en Local' :
      `Consumo en Mesa (${customerAddress || 'Mesa por asignar'})`
    }\n\n`;

    message += `📝 *DETALLE DEL PEDIDO:*\n`;
    cart.forEach(item => {
      message += `• ${item.cantidad}x ${item.nombre} (${item.precio})\n`;
    });

    if (orderNotes.trim()) {
      message += `\n💬 *Notas/Preferencias:* ${orderNotes.trim()}\n`;
    }

    message += `\n💵 *TOTAL A PAGAR: S/. ${total.toFixed(2)}*\n\n`;
    message += `¡Muchas gracias por su atención! 🌊🐟`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const el = document.getElementById(`cat-${catId}`);
    if (el) {
      const yOffset = -130;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();

    return categories
      .map(cat => {
        const matchingDishes = cat.items.filter(
          dish =>
            dish.nombre.toLowerCase().includes(query) ||
            (dish.descripcion && dish.descripcion.toLowerCase().includes(query)) ||
            (dish.etiqueta && dish.etiqueta.toLowerCase().includes(query))
        );
        return {
          ...cat,
          items: matchingDishes
        };
      })
      .filter(cat => cat.items.length > 0);
  }, [categories, searchQuery]);

  const handleBirthdaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBirthday(true);
    const success = await submitSheetData('Cumpleaños', {
      timestamp: new Date().toLocaleString('es-PE'),
      nombre: birthdayData.nombre,
      telefono: birthdayData.telefono,
      fechaNacimiento: birthdayData.fechaNacimiento,
      distrito: birthdayData.distrito,
      correo: birthdayData.correo || 'No indicado'
    });
    
    setIsSubmittingBirthday(false);
    if (success) {
      setBirthdaySuccess(true);
      setTimeout(() => {
        setShowBirthdayForm(false);
        setBirthdaySuccess(false);
        setBirthdayData({ nombre: '', telefono: '', fechaNacimiento: '', distrito: '', correo: '' });
      }, 2500);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    const success = await submitSheetData('Reseñas', {
      timestamp: new Date().toLocaleString('es-PE'),
      estrellasMozo: reviewData.estrellasMozo.toString(),
      estrellasComida: reviewData.estrellasComida.toString(),
      comentario: reviewData.comentario || 'Sin comentario'
    });

    setIsSubmittingReview(false);
    if (success) {
      setReviewSuccess(true);
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccess(false);
        setReviewData({ estrellasMozo: 5, estrellasComida: 5, comentario: '' });
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0F172A] pb-28 font-sans selection:bg-[#0284C7] selection:text-white">
      
      {/* 🌊 TOP MARQUEE ANNOUNCEMENT */}
      <div className="bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#075985] text-white py-2 overflow-hidden shadow-sm text-xs md:text-sm font-semibold tracking-wide border-b border-sky-400/30">
        <div className="animate-marquee whitespace-nowrap">
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
        </div>
      </div>

      {/* 🌟 HERO HEADER */}
      <header className="relative bg-gradient-to-b from-[#075985] via-[#0369A1] to-[#0284C7] text-white pt-6 pb-12 px-4 shadow-xl overflow-hidden">
        {/* Background Decorative Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-300/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            
            {/* 🏷️ OFICIAL LOGO EMBEDDED */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="relative mb-3 group"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-amber-400/80 transform group-hover:scale-105 transition-transform duration-300 overflow-hidden flex items-center justify-center">
                <img 
                  src={LOGO_PATH} 
                  alt="Sabores de Piura Logo" 
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    // Fallback visual si el logo demora en cargar
                    e.currentTarget.src = "/carta_portada.jpg";
                  }}
                />
              </div>
              <span className="absolute -bottom-1 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md border border-white flex items-center gap-1">
                <Sparkles size={11} className="text-yellow-200" /> 100% Piurano
              </span>
            </motion.div>

            {/* Restaurant Title & Slogan */}
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-title text-white drop-shadow-md">
              {RESTAURANTE_NAME}
            </h1>
            <p className="text-amber-300 font-semibold text-sm md:text-base mt-1 tracking-wider uppercase">
              {RESTAURANTE_SUBTITLE}
            </p>
            <p className="text-sky-100 text-xs md:text-sm italic mt-1 max-w-md px-2">
              "{RESTAURANTE_SLOGAN}"
            </p>

            {/* Quick Info Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <a 
                href={MAPS_URL} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full text-white hover:bg-white/25 transition-all border border-white/20"
              >
                <MapPin size={14} className="text-amber-300" />
                <span>{RESTAURANTE_DIRECCION}</span>
              </a>

              <a 
                href={`tel:${WHATSAPP_NUMBER.replace('51', '')}`}
                className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full text-white hover:bg-white/25 transition-all border border-white/20"
              >
                <Phone size={14} className="text-emerald-300" />
                <span>913 150 281</span>
              </a>

              <span className="flex items-center gap-1.5 bg-emerald-500/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-medium border border-emerald-300/40">
                <Clock size={14} />
                <span>Atendiendo Ahora</span>
              </span>
            </div>

            {/* Top Interactive Buttons */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-5">
              <button
                onClick={() => setShowPhysicalMenu(true)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-amber-900/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all border border-amber-300"
              >
                <BookOpen size={16} />
                <span>Ver Carta Física Original</span>
              </button>

              <button
                onClick={() => setShowBirthdayForm(true)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold border border-white/30 transition-all"
              >
                <Gift size={15} className="text-amber-300" />
                <span>Cumpleaños</span>
              </button>

              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold border border-white/30 transition-all"
              >
                <Star size={15} className="text-yellow-300 fill-yellow-300" />
                <span>Calificar</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 🔍 STICKY SEARCH & CATEGORY BAR */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md shadow-md border-b border-amber-200/50">
        <div className="max-w-4xl mx-auto px-4 pt-3 pb-2">
          
          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ceviche, seco de chabelo, arroz con pato, cabrilla..."
              className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent text-sm shadow-inner transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Tabs Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id && !searchQuery;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSearchQuery('');
                    scrollToCategory(cat.id);
                  }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white shadow-md shadow-sky-500/20 scale-105'
                      : 'bg-white text-slate-700 hover:bg-sky-50 border border-slate-200/80'
                  }`}
                >
                  <span>{cat.icono || '🍽️'}</span>
                  <span>{cat.nombre}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cat.items.length}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 🍽️ MAIN MENU CONTENT */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin text-[#0284C7] mb-3" size={40} />
            <p className="text-sm font-medium">Cargando la carta marina...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-200 mt-4">
            <Utensils className="mx-auto text-slate-300 mb-3" size={48} />
            <h3 className="text-lg font-bold text-slate-800">No encontramos resultados</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No hay platos que coincidan con "<span className="font-semibold text-slate-700">{searchQuery}</span>". Prueba buscando otro plato o revisa las categorías.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 bg-[#0284C7] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md"
            >
              Ver toda la carta
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section 
              key={category.id} 
              id={`cat-${category.id}`} 
              className="mb-10 scroll-mt-36"
            >
              {/* Category Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icono || '🍲'}</span>
                  <h2 className="text-xl md:text-2xl font-bold text-[#075985] font-category tracking-tight">
                    {category.nombre}
                  </h2>
                </div>
                {category.subtitulo && (
                  <p className="text-xs text-slate-500 mt-0.5 ml-8">
                    {category.subtitulo}
                  </p>
                )}
                <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-[#0284C7] rounded-full mt-2 ml-8"></div>
              </div>

              {/* Dish Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((dish, idx) => {
                  const qty = getItemQuantity(dish);

                  return (
                    <motion.div
                      key={`${dish.nombre}-${idx}`}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col justify-between relative group hover:border-sky-200"
                    >
                      {/* Badge if available */}
                      {dish.etiqueta && (
                        <div className="absolute -top-2.5 left-4 z-10">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 ${
                            dish.etiqueta.includes('Sábado') 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : dish.etiqueta.includes('Tradición')
                              ? 'bg-orange-100 text-orange-900 border border-orange-300'
                              : 'bg-sky-100 text-sky-900 border border-sky-300'
                          }`}>
                            <Sparkles size={10} className="text-amber-500" />
                            {dish.etiqueta}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-3.5 items-start">
                        {/* Dish Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-[#0284C7] transition-colors leading-snug">
                            {dish.nombre}
                          </h3>

                          {dish.descripcion && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {dish.descripcion}
                            </p>
                          )}

                          <div className="mt-2.5 flex items-baseline gap-2">
                            <span className="text-lg font-black text-[#0369A1] font-dish">
                              {dish.precio}
                            </span>
                          </div>
                        </div>

                        {/* Dish Image */}
                        {dish.imagen && (
                          <div 
                            onClick={() => setSelectedImage({ src: dish.imagen!, title: dish.nombre })}
                            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer group/img shadow-inner bg-slate-100"
                          >
                            <img
                              src={dish.imagen}
                              alt={dish.nombre}
                              loading="lazy"
                              className="w-full h-full object-cover transform group-hover/img:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn size={18} className="text-white drop-shadow" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons / Add to Cart */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {dish.destacado ? '⭐ Muy solicitado' : 'Sabor del norte'}
                        </span>

                        {qty > 0 ? (
                          <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl p-1 shadow-sm">
                            <button
                              onClick={() => updateQuantity(dish.nombre, dish.precio, -1)}
                              className="w-7 h-7 rounded-lg bg-white text-[#0284C7] hover:bg-sky-100 flex items-center justify-center font-bold shadow-xs transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold text-[#0369A1] min-w-[20px] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => addToCart(dish)}
                              className="w-7 h-7 rounded-lg bg-[#0284C7] text-white hover:bg-[#0369A1] flex items-center justify-center font-bold shadow-xs transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(dish)}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm shadow-sky-500/20 active:scale-95 transition-all"
                          >
                            <Plus size={14} />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* 🛍️ FLOATING CART BUTTON */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-5 left-4 right-4 z-40 max-w-lg mx-auto"
          >
            <button
              onClick={() => setShowSummary(true)}
              className="w-full bg-gradient-to-r from-amber-500 via-[#F59E0B] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3.5 px-5 rounded-2xl shadow-2xl shadow-amber-900/30 flex items-center justify-between font-bold border-2 border-white/80 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative bg-white/20 p-2 rounded-xl">
                  <ShoppingBag size={20} />
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-amber-700 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider text-amber-100">Ver tu pedido</div>
                  <div className="text-sm font-extrabold">{cartCount} {cartCount === 1 ? 'plato' : 'platos'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight">
                  S/. {calculateTotal().toFixed(2)}
                </span>
                <ChevronRight size={20} className="animate-pulse" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📋 CART & CHECKOUT DRAWER MODAL */}
      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSummary(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header Drawer */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} className="text-amber-300" />
                  <div>
                    <h3 className="font-bold text-base leading-tight">Tu Pedido</h3>
                    <p className="text-[11px] text-sky-100">Picantería Sabores de Piura</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSummary(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items List */}
              <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <ShoppingBag size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Tu pedido está vacío</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.nombre}</h4>
                        <span className="text-xs text-[#0284C7] font-semibold">{item.precio}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.nombre, item.precio, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center justify-center font-bold shadow-xs transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold text-slate-800 min-w-[18px] text-center">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.nombre, item.precio, 1)}
                          className="w-6 h-6 rounded-lg bg-[#0284C7] text-white hover:bg-[#0369A1] flex items-center justify-center font-bold shadow-xs transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => updateQuantity(item.nombre, item.precio, -item.cantidad)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}

                {/* Modalidad de Pedido */}
                {cart.length > 0 && (
                  <div className="pt-4 mt-2">
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      ¿Cómo deseas tu pedido?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'delivery', label: '🛵 Delivery' },
                        { id: 'llevar', label: '🛍️ Para Llevar' },
                        { id: 'mesa', label: '🍽️ En Mesa' },
                      ].map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setOrderType(type.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                            orderType === type.id
                              ? 'bg-sky-50 border-[#0284C7] text-[#0284C7] shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {/* Customer Inputs */}
                    <div className="space-y-2 mt-3">
                      <div>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Tu nombre completo (opcional)"
                          className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                        />
                      </div>

                      {orderType !== 'llevar' && (
                        <div>
                          <input
                            type="text"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder={orderType === 'delivery' ? "Dirección de entrega y referencia" : "Número de mesa"}
                            className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                          />
                        </div>
                      )}

                      <div>
                        <input
                          type="text"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          placeholder="Notas (ej. sin picante, ají aparte, etc.)"
                          className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Total & WhatsApp Button */}
              {cart.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-base font-black text-slate-800">
                    <span>Total a Pagar:</span>
                    <span className="text-xl text-[#0369A1]">
                      S/. {calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={sendToWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
                  >
                    <span>📱 Enviar Pedido a WhatsApp</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📖 MODAL: VER CARTA FÍSICA ORIGINAL */}
      <AnimatePresence>
        {showPhysicalMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPhysicalMenu(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="p-3.5 bg-gradient-to-r from-[#075985] to-[#0284C7] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-300" />
                  <div>
                    <h3 className="font-bold text-sm">Carta Física Original</h3>
                    <p className="text-[11px] text-sky-100">{PHYSICAL_MENU_PAGES[activePhysicalPage].title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPhysicalMenu(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Image Viewer with Navigation */}
              <div className="relative flex-1 bg-slate-900 overflow-auto flex items-center justify-center p-2 min-h-[350px]">
                <img
                  src={PHYSICAL_MENU_PAGES[activePhysicalPage].src}
                  alt={PHYSICAL_MENU_PAGES[activePhysicalPage].title}
                  className="max-h-[65vh] w-auto object-contain rounded shadow-lg"
                />

                {/* Left Arrow */}
                <button
                  onClick={() => setActivePhysicalPage((prev) => (prev > 0 ? prev - 1 : PHYSICAL_MENU_PAGES.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                >
                  <ChevronLeft size={22} />
                </button>

                {/* Right Arrow */}
                <button
                  onClick={() => setActivePhysicalPage((prev) => (prev < PHYSICAL_MENU_PAGES.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                >
                  <ChevronRight size={22} />
                </button>
              </div>

              {/* Thumbnails Navigator */}
              <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-center gap-2 overflow-x-auto">
                {PHYSICAL_MENU_PAGES.map((page, idx) => (
                  <button
                    key={page.id}
                    onClick={() => setActivePhysicalPage(idx)}
                    className={`relative rounded-lg overflow-hidden w-16 h-16 border-2 transition-all flex-shrink-0 ${
                      activePhysicalPage === idx
                        ? 'border-[#0284C7] ring-2 ring-sky-300 scale-105'
                        : 'border-slate-300 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={page.src} alt={page.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                      Pág {idx === 0 ? 'Port.' : idx}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🖼️ MODAL: FULLSCREEN DISH IMAGE PREVIEW */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl z-10"
            >
              <div className="relative aspect-4/3 bg-slate-900">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 bg-white text-center">
                <h4 className="font-bold text-slate-800 text-base">{selectedImage.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Picantería Sabores de Piura</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🎁 MODAL: BIRTHDAY REGISTRATION */}
      <AnimatePresence>
        {showBirthdayForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBirthdayForm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10"
            >
              <button
                onClick={() => setShowBirthdayForm(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Gift size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">¡Celebra tu Cumpleaños!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Regístrate y recibe un plato especial o cortesía de la casa en el mes de tu onomástico.
                </p>
              </div>

              {birthdaySuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <p className="font-bold text-sm">¡Registro exitoso!</p>
                  <p className="text-xs text-emerald-600">Te esperamos para festejar a lo grande con el auténtico sabor piurano.</p>
                </div>
              ) : (
                <form onSubmit={handleBirthdaySubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={birthdayData.nombre}
                      onChange={(e) => setBirthdayData({ ...birthdayData, nombre: e.target.value })}
                      placeholder="Ej. Juan Pérez"
                      className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={birthdayData.telefono}
                        onChange={(e) => setBirthdayData({ ...birthdayData, telefono: e.target.value })}
                        placeholder="Ej. 987654321"
                        className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Fecha Nacimiento *</label>
                      <input
                        type="date"
                        required
                        value={birthdayData.fechaNacimiento}
                        onChange={(e) => setBirthdayData({ ...birthdayData, fechaNacimiento: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Distrito</label>
                    <input
                      type="text"
                      value={birthdayData.distrito}
                      onChange={(e) => setBirthdayData({ ...birthdayData, distrito: e.target.value })}
                      placeholder="Ej. Independencia, Piura, etc."
                      className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingBirthday}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmittingBirthday ? <Loader2 className="animate-spin" size={16} /> : <span>Registrar Cumpleaños</span>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⭐ MODAL: REVIEW / CALIFÍCANOS */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReviewForm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10"
            >
              <button
                onClick={() => setShowReviewForm(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Star size={28} className="fill-yellow-500 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">¿Cómo fue tu experiencia?</h3>
                <p className="text-xs text-slate-500 mt-1">Tu opinión nos ayuda a mantener el auténtico sabor y la mejor atención.</p>
              </div>

              {reviewSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <p className="font-bold text-sm">¡Muchas gracias por calificarnos!</p>
                  <p className="text-xs text-emerald-600">En Sabores de Piura trabajamos con el corazón para ti.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Atención del Personal</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewData({ ...reviewData, estrellasMozo: star })}
                          className="p-1 text-2xl transform hover:scale-125 transition-transform"
                        >
                          <Star
                            size={24}
                            className={star <= reviewData.estrellasMozo ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Sabor y Calidad de la Comida</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewData({ ...reviewData, estrellasComida: star })}
                          className="p-1 text-2xl transform hover:scale-125 transition-transform"
                        >
                          <Star
                            size={24}
                            className={star <= reviewData.estrellasComida ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Comentario o sugerencia</label>
                    <textarea
                      rows={3}
                      value={reviewData.comentario}
                      onChange={(e) => setReviewData({ ...reviewData, comentario: e.target.value })}
                      placeholder="Cuéntanos qué plato te gustó más..."
                      className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? <Loader2 className="animate-spin" size={16} /> : <span>Enviar Calificación</span>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚓ FOOTER */}
      <footer className="mt-16 bg-gradient-to-b from-[#075985] to-[#0c4a6e] text-white pt-10 pb-16 px-4 border-t-4 border-amber-400">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          
          <div className="w-20 h-20 mx-auto rounded-full bg-white p-1 shadow-lg ring-2 ring-amber-400 overflow-hidden flex items-center justify-center">
            <img 
              src={LOGO_PATH} 
              alt="Logo Sabores de Piura" 
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                e.currentTarget.src = "/carta_portada.jpg";
              }}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold font-title text-white">{RESTAURANTE_NAME}</h3>
            <p className="text-xs text-amber-300 mt-0.5">{RESTAURANTE_SLOGAN}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-sky-100">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-amber-400" />
              <span>{RESTAURANTE_DIRECCION}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-emerald-400" />
              <span>WhatsApp / Pedidos: 913150281</span>
            </div>
          </div>

          <p className="text-[11px] text-sky-200/70 max-w-sm mx-auto pt-4 border-t border-sky-600/40">
            © {new Date().getFullYear()} Picantería Sabores de Piura. Todos los derechos reservados.
          </p>
        </div>
      </footer>

    </div>
  );
}
