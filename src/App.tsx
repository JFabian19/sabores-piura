import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Minus, ChevronRight, X, Trash2, Utensils, 
  MapPin, Loader2, Gift, Star, Phone, Sparkles, ZoomIn,
  Clock, Heart, Share2, CheckCircle2, ChevronLeft, BookOpen, Flame,
  Layers, Check, Image as ImageIcon, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchSheetData, submitSheetData, SheetDish, SheetCategory, SHEET_ID } from './services/googleSheets';
import { DEFAULT_MENU_DATA, Category, Dish, DishOption } from './data/menuData';
import { autoAssignDishImages, AutoAssignResult } from './services/imageSearchService';

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
  opcion?: string;
  precio: string;
  cantidad: number;
}

export const parsePrice = (priceVal: string | number | undefined): number => {
  if (typeof priceVal === 'number') return priceVal;
  if (!priceVal) return 0;
  const match = priceVal.toString().match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

export default function App() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_MENU_DATA);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(DEFAULT_MENU_DATA[0]?.id || "ceviches");
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);
  
  // Estado para modal de opciones múltiples
  const [selectedDishForOptions, setSelectedDishForOptions] = useState<Dish | null>(null);
  const [optionQuantities, setOptionQuantities] = useState<{ [optionName: string]: number }>({});

  // Estados para asignación automática de imágenes
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [autoAssignProgress, setAutoAssignProgress] = useState<{ processed: number; total: number; currentDish: string } | null>(null);
  const [autoAssignResult, setAutoAssignResult] = useState<AutoAssignResult | null>(null);

  // Estado para visualizador de carta física original
  const [showPhysicalMenu, setShowPhysicalMenu] = useState(false);
  const [activePhysicalPage, setActivePhysicalPage] = useState(0);

  // Estados para Modal de Checkout / Finalizar Pedido
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderType, setOrderType] = useState<'delivery' | 'tienda'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'visa' | 'mastercard' | 'efectivo'>('yape');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGpsLocation, setCustomerGpsLocation] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
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

  // Cargar datos persistidos o de Google Sheets / defecto
  useEffect(() => {
    const loadData = async () => {
      // 1. Verificar si hay menú guardado en localStorage
      const cached = localStorage.getItem('sabores_piura_menu_data_v3');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
            return;
          }
        } catch (e) {
          console.error("Error cargando caché de menú:", e);
        }
      }

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

  const handleStartAutoAssign = async () => {
    setShowAutoAssignModal(true);
    setIsAutoAssigning(true);
    setAutoAssignResult(null);

    try {
      const result = await autoAssignDishImages(categories, (processed, total, currentDish) => {
        setAutoAssignProgress({ processed, total, currentDish });
      });

      setCategories(result.updatedCategories);
      localStorage.setItem('sabores_piura_menu_data_v3', JSON.stringify(result.updatedCategories));
      setAutoAssignResult(result);
    } catch (error) {
      console.error("Error durante auto asignación:", error);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.cantidad, 0), [cart]);

  const addToCart = (dish: Dish, opcion?: DishOption) => {
    if (dish.opciones && dish.opciones.length > 1 && !opcion) {
      handleOpenOptionsModal(dish);
      return;
    }

    const opt = opcion || (dish.opciones && dish.opciones.length === 1 ? dish.opciones[0] : undefined);
    const itemNombre = dish.nombre;
    const itemOpcion = opt?.nombre;
    const itemPrecio = opt?.precio || dish.precio;

    setCart(prev => {
      const existing = prev.find(i => i.nombre === itemNombre && i.opcion === itemOpcion);
      if (existing) {
        return prev.map(i =>
          (i.nombre === itemNombre && i.opcion === itemOpcion)
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { nombre: itemNombre, opcion: itemOpcion, precio: itemPrecio, cantidad: 1 }];
    });
  };

  const updateQuantity = (nombre: string, precio: string, delta: number, opcion?: string) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.nombre === nombre && i.opcion === opcion) {
            const newQty = i.cantidad + delta;
            return newQty > 0 ? { ...i, cantidad: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const getDishTotalQuantity = (dish: Dish) => {
    return cart
      .filter(i => i.nombre === dish.nombre)
      .reduce((sum, item) => sum + item.cantidad, 0);
  };

  const handleOpenOptionsModal = (dish: Dish) => {
    const currentCounts: { [optionName: string]: number } = {};
    if (dish.opciones) {
      dish.opciones.forEach(opt => {
        const found = cart.find(i => i.nombre === dish.nombre && i.opcion === opt.nombre);
        currentCounts[opt.nombre] = found ? found.cantidad : 0;
      });
    }
    setOptionQuantities(currentCounts);
    setSelectedDishForOptions(dish);
  };

  const handleConfirmOptions = () => {
    if (!selectedDishForOptions || !selectedDishForOptions.opciones) return;
    
    const dish = selectedDishForOptions;
    setCart(prev => {
      // Remover variantes existentes de este plato
      let updated = prev.filter(i => i.nombre !== dish.nombre);
      
      // Agregar todas las opciones seleccionadas con cantidad > 0
      dish.opciones!.forEach(opt => {
        const qty = optionQuantities[opt.nombre] || 0;
        if (qty > 0) {
          updated.push({
            nombre: dish.nombre,
            opcion: opt.nombre,
            precio: opt.precio,
            cantidad: qty
          });
        }
      });
      
      return updated;
    });

    setSelectedDishForOptions(null);
  };

  const calculateOptionModalTotal = () => {
    if (!selectedDishForOptions || !selectedDishForOptions.opciones) return 0;
    return selectedDishForOptions.opciones.reduce((total, opt) => {
      const qty = optionQuantities[opt.nombre] || 0;
      const unitPrice = parsePrice(opt.precio);
      return total + unitPrice * qty;
    }, 0);
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => {
      const unitPrice = parsePrice(item.precio);
      return acc + unitPrice * item.cantidad;
    }, 0);
  };

  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        setCustomerGpsLocation(mapsLink);
        setIsGettingLocation(false);
      },
      (error) => {
        console.warn("Error obteniendo ubicación:", error);
        alert("No se pudo obtener la ubicación automáticamente. Puedes escribir tu dirección de referencia.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const sendToWhatsApp = () => {
    const total = calculateTotal();
    let message = `🍽️ *¡HOLA SABORES DE PIURA! DESEO REALIZAR UN PEDIDO:*\n\n`;
    
    if (customerName.trim()) {
      message += `👤 *Cliente:* ${customerName.trim()}\n`;
    }
    if (customerPhone.trim()) {
      message += `📞 *Teléfono:* ${customerPhone.trim()}\n`;
    }
    
    message += `📍 *Modalidad:* ${orderType === 'delivery' ? '🛵 Delivery a domicilio' : '🏪 Recojo en Tienda (Av. Los Ficus 134)'}\n`;
    
    if (orderType === 'delivery') {
      if (customerAddress.trim()) {
        message += `🏠 *Dirección/Referencia:* ${customerAddress.trim()}\n`;
      }
      if (customerGpsLocation) {
        message += `📍 *Ubicación GPS (Maps):* ${customerGpsLocation}\n`;
      }
    }

    const paymentLabels: Record<string, string> = {
      yape: '📱 Yape',
      visa: '💳 Tarjeta Visa',
      mastercard: '💳 Tarjeta Mastercard',
      efectivo: '💵 Efectivo'
    };
    message += `💳 *Método de Pago:* ${paymentLabels[paymentMethod] || 'Efectivo'}\n\n`;

    message += `📝 *DETALLE DEL PEDIDO:*\n`;
    cart.forEach(item => {
      const opcionTag = item.opcion ? ` [${item.opcion}]` : '';
      const unitPrice = parsePrice(item.precio);
      message += `• ${item.cantidad}x ${item.nombre}${opcionTag} - S/. ${(unitPrice * item.cantidad).toFixed(2)}\n`;
    });

    if (orderNotes.trim()) {
      message += `\n💬 *Notas / Indicaciones:* ${orderNotes.trim()}\n`;
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
                onClick={handleStartAutoAssign}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-sky-900/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all border border-sky-300"
              >
                <Sparkles size={15} className="text-amber-300" />
                <span>Buscar imágenes automáticamente</span>
              </button>

              <button
                onClick={() => setShowPhysicalMenu(true)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-amber-900/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all border border-amber-300"
              >
                <BookOpen size={16} />
                <span>Ver Carta Física</span>
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

      {/* 🧭 STICKY CATEGORY BAR */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md shadow-md border-b border-amber-200/50">
        <div className="max-w-4xl mx-auto px-4 py-2.5">
          
          {/* Category Tabs Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
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
        
        {/* ℹ️ Disclaimer general */}
        <div className="flex items-center justify-between pb-3 mb-2 text-slate-400 text-xs border-b border-slate-200/60">
          <span className="flex items-center gap-1">
            <Utensils size={13} className="text-[#0284C7]" />
            Nuestra Carta Digital
          </span>
          <span className="italic text-[11px] text-slate-400 font-medium">
            * Imágenes referenciales
          </span>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin text-[#0284C7] mb-3" size={40} />
            <p className="text-sm font-medium">Cargando la carta marina...</p>
          </div>
        ) : (
          categories.map((category) => (
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

              {/* Dish Cards Grid - 2 Columnas */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {category.items.map((dish, idx) => {
                  const hasMultipleOptions = Boolean(dish.opciones && dish.opciones.length > 1);
                  const totalQty = getDishTotalQuantity(dish);

                  return (
                    <motion.div
                      key={`${dish.nombre}-${idx}`}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col justify-between relative group hover:border-sky-200 h-full"
                    >
                      {/* Badge if available */}
                      {dish.etiqueta && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 backdrop-blur-md ${
                            dish.etiqueta.includes('Sábado') 
                              ? 'bg-amber-500/90 text-white border border-amber-300' 
                              : dish.etiqueta.includes('Tradición')
                              ? 'bg-orange-500/90 text-white border border-orange-300'
                              : 'bg-sky-600/90 text-white border border-sky-300'
                          }`}>
                            <Sparkles size={10} className="text-yellow-200" />
                            {dish.etiqueta}
                          </span>
                        </div>
                      )}

                      {/* 1. IMAGEN CUADRADA SUPERIOR */}
                      <div 
                        onClick={() => dish.imagen && setSelectedImage({ src: dish.imagen, title: dish.nombre })}
                        className="relative w-full aspect-square overflow-hidden cursor-pointer group/img bg-slate-100"
                      >
                        {dish.imagen ? (
                          <>
                            <img
                              src={dish.imagen}
                              alt={dish.nombre}
                              loading="lazy"
                              className="w-full h-full object-cover transform group-hover/img:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn size={22} className="text-white drop-shadow-md" />
                            </div>
                            <span className="absolute bottom-1 right-1.5 text-[9px] text-white/80 bg-black/40 backdrop-blur-xs px-1.5 py-0.2 rounded font-medium">
                              Foto referencial
                            </span>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                            <Utensils size={32} />
                            <span className="text-[10px] mt-1 font-medium text-slate-400">Sabores de Piura</span>
                          </div>
                        )}
                      </div>

                      {/* CONTENIDO DEL PLATO */}
                      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between">
                        <div className="flex-1">
                          {/* 2. NOMBRE DEL PLATO */}
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#0284C7] transition-colors leading-snug">
                            {dish.nombre}
                          </h3>

                          {/* 3. DESCRIPCIÓN COMPLETA */}
                          {dish.descripcion && (
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                              {dish.descripcion}
                            </p>
                          )}

                          {/* 4. ESPACIO PARA SELECCIÓN DE PRECIOS/OPCIONES SI TIENE VARIOS */}
                          {hasMultipleOptions && dish.opciones && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100">
                              <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                                Opciones disponibles:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {dish.opciones.map((opt, oIdx) => (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenOptionsModal(dish);
                                    }}
                                    className="text-[10px] sm:text-[11px] bg-sky-50 hover:bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded-md border border-sky-200 cursor-pointer transition-colors text-left"
                                  >
                                    <span className="text-slate-600">{opt.nombre}:</span> <strong className="text-[#0369A1]">{opt.precio}</strong>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 5. PRECIO + BOTÓN DE AGREGAR */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                              {hasMultipleOptions ? 'Desde' : 'Precio'}
                            </span>
                            <span className="text-sm sm:text-base font-black text-[#0369A1] font-dish leading-tight">
                              {hasMultipleOptions ? dish.opciones![0].precio : dish.precio}
                            </span>
                          </div>

                          {hasMultipleOptions ? (
                            <div className="flex items-center gap-1">
                              {totalQty > 0 && (
                                <span className="text-[11px] font-bold text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                                  {totalQty}
                                </span>
                              )}
                              <button
                                onClick={() => handleOpenOptionsModal(dish)}
                                className="flex items-center gap-1 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-sm shadow-sky-500/20 active:scale-95 transition-all"
                              >
                                <Plus size={13} />
                                <span>{totalQty > 0 ? 'Modificar' : 'Elegir'}</span>
                              </button>
                            </div>
                          ) : totalQty > 0 ? (
                            <div className="flex items-center gap-1 bg-sky-50 border border-sky-200 rounded-xl p-0.5 shadow-sm">
                              <button
                                onClick={() => updateQuantity(dish.nombre, (dish.opciones?.[0]?.precio || dish.precio), -1, dish.opciones?.[0]?.nombre)}
                                className="w-6 h-6 rounded-lg bg-white text-[#0284C7] hover:bg-sky-100 flex items-center justify-center font-bold shadow-xs transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold text-[#0369A1] min-w-[16px] text-center">
                                {totalQty}
                              </span>
                              <button
                                onClick={() => addToCart(dish)}
                                className="w-6 h-6 rounded-lg bg-[#0284C7] text-white hover:bg-[#0369A1] flex items-center justify-center font-bold shadow-xs transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(dish)}
                              className="flex items-center gap-1 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-sm shadow-sky-500/20 active:scale-95 transition-all"
                            >
                              <Plus size={13} />
                              <span>Agregar</span>
                            </button>
                          )}
                        </div>
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

      {/* 📋 CART DRAWER MODAL */}
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
                    <p className="text-[11px] text-sky-100">{cartCount} {cartCount === 1 ? 'plato seleccionado' : 'platos seleccionados'}</p>
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
                  cart.map((item, idx) => {
                    const unitPrice = parsePrice(item.precio);
                    const subtotalItem = unitPrice * item.cantidad;

                    return (
                      <div key={`${item.nombre}-${item.opcion || 'def'}-${idx}`} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-slate-800 text-sm">{item.nombre}</h4>
                            {item.opcion && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                                {item.opcion}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">{item.precio} c/u</span>
                            <span className="text-xs font-black text-[#0284C7]">Subtotal: S/. {subtotalItem.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.nombre, item.precio, -1, item.opcion)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center justify-center font-bold shadow-xs transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-slate-800 min-w-[20px] text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.nombre, item.precio, 1, item.opcion)}
                            className="w-6 h-6 rounded-lg bg-[#0284C7] text-white hover:bg-[#0369A1] flex items-center justify-center font-bold shadow-xs transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => updateQuantity(item.nombre, item.precio, -item.cantidad, item.opcion)}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                )}

                {/* Resumen del pedido */}
                {cart.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Total de platos:</span>
                      <span className="font-semibold text-slate-800">{cartCount} unidades</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Estado:</span>
                      <span className="font-semibold text-emerald-600">Listo para preparar</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total a Pagar:</span>
                      <span className="text-xl text-[#0369A1]">S/. {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Continuar */}
              {cart.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowSummary(false);
                      setShowCheckoutModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 via-[#F59E0B] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 active:scale-98 transition-all"
                  >
                    <span>Continuar con el Pedido</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛵 MODAL DE CHECKOUT / FINALIZAR PEDIDO */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckoutModal(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Header Checkout */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setShowSummary(true);
                    }}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div>
                    <h3 className="font-bold text-base leading-tight">Completar Pedido</h3>
                    <p className="text-[11px] text-sky-100">Total: S/. {calculateTotal().toFixed(2)} ({cartCount} platos)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                
                {/* 1. Modalidad de Pedido */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    1. ¿Cómo deseas tu pedido?
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                        orderType === 'delivery'
                          ? 'bg-sky-50/80 border-[#0284C7] text-[#0284C7] shadow-sm ring-1 ring-[#0284C7]'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl">🛵</span>
                      <span className="font-bold text-xs">Delivery a Domicilio</span>
                      <span className="text-[10px] text-slate-400">Te lo llevamos caliente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType('tienda')}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                        orderType === 'tienda'
                          ? 'bg-sky-50/80 border-[#0284C7] text-[#0284C7] shadow-sm ring-1 ring-[#0284C7]'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-2xl">🏪</span>
                      <span className="font-bold text-xs">Recoger en Tienda</span>
                      <span className="text-[10px] text-slate-400">Pasan a recoger al local</span>
                    </button>
                  </div>
                </div>

                {/* 2. Datos del cliente según modalidad */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    {orderType === 'delivery' ? '2. Datos de Entrega' : '2. Datos de Recojo'}
                  </label>

                  <div>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tu nombre completo *"
                      className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Teléfono / WhatsApp de contacto"
                      className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    />
                  </div>

                  {orderType === 'delivery' ? (
                    <>
                      <div>
                        <input
                          type="text"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Dirección exacta y referencia (ej. Av. Grau 123, frente al parque) *"
                          className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                        />
                      </div>

                      {/* Botón GPS */}
                      <button
                        type="button"
                        onClick={handleGetGpsLocation}
                        disabled={isGettingLocation}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          customerGpsLocation
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-white border-sky-300 text-sky-800 hover:bg-sky-50'
                        }`}
                      >
                        {isGettingLocation ? (
                          <>
                            <Loader2 size={15} className="animate-spin text-[#0284C7]" />
                            <span>Obteniendo ubicación GPS...</span>
                          </>
                        ) : customerGpsLocation ? (
                          <>
                            <CheckCircle2 size={15} className="text-emerald-600" />
                            <span>📍 Ubicación GPS adjuntada</span>
                            <span className="text-[10px] text-sky-600 underline ml-1">Actualizar</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={15} className="text-[#0284C7]" />
                            <span>📍 Adjuntar mi ubicación GPS actual (Opcional)</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <MapPin size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Dirección del Local:</p>
                        <p className="text-[11px] text-amber-800">Av. Los Ficus 134 Independencia</p>
                        <p className="text-[10px] text-amber-700 mt-0.5">¡Tu pedido estará listo y empacado para llevar!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Método de Pago */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    3. Método de Pago
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'yape', label: 'Yape', icon: '/icons/yape.svg', desc: 'Transferencia' },
                      { id: 'visa', label: 'Visa', icon: '/icons/visa.svg', desc: 'Tarjeta' },
                      { id: 'mastercard', label: 'Mastercard', icon: '/icons/mastercard.svg', desc: 'Tarjeta' },
                      { id: 'efectivo', label: 'Efectivo', icon: '/icons/efectivo.svg', desc: 'Contraentrega' },
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                          paymentMethod === p.id
                            ? 'bg-sky-50 border-[#0284C7] ring-2 ring-[#0284C7]/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <img src={p.icon} alt={p.label} className="w-8 h-8 object-contain rounded-md" />
                        <span className="font-bold text-xs text-slate-800 leading-tight">{p.label}</span>
                        <span className="text-[9px] text-slate-400">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Notas adicionales */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                    4. Indicaciones especiales (Opcional)
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Ej. Sin picante, ají aparte, pagar con billete de 100..."
                    className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                </div>

              </div>

              {/* Footer Checkout con Botón WhatsApp */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                  <span>Total Final:</span>
                  <span className="text-xl font-black text-[#0369A1]">
                    S/. {calculateTotal().toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={sendToWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all text-sm"
                >
                  <span>📱 Enviar Pedido a WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🍲 MODAL DE OPCIONES MÚLTIPLES DE PORCIÓN */}
      <AnimatePresence>
        {selectedDishForOptions && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDishForOptions(null)}
              className="fixed inset-0 bg-black/65 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#0369A1] to-[#0284C7] text-white">
                <div className="flex items-center gap-2">
                  <Layers size={20} className="text-amber-300" />
                  <div>
                    <h3 className="font-bold text-base leading-tight">Opciones del Plato</h3>
                    <p className="text-[11px] text-sky-100">Selecciona tu presentación</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDishForOptions(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {/* Dish preview */}
                <div className="flex gap-3.5 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {selectedDishForOptions.imagen && (
                    <img
                      src={selectedDishForOptions.imagen}
                      alt={selectedDishForOptions.nombre}
                      className="w-16 h-16 rounded-xl object-cover shadow-xs flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                      {selectedDishForOptions.nombre}
                    </h4>
                    {selectedDishForOptions.descripcion && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {selectedDishForOptions.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Elige porciones / presentaciones:
                    </span>
                    <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
                      Opción Múltiple
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedDishForOptions.opciones?.map((opcion, idx) => {
                      const count = optionQuantities[opcion.nombre] || 0;

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            count > 0 
                              ? 'bg-sky-50/80 border-[#0284C7] shadow-xs ring-1 ring-[#0284C7]/30' 
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {opcion.nombre}
                              </span>
                              {count > 0 && (
                                <span className="bg-[#0284C7] text-white text-[10px] font-black px-1.5 py-0.2 rounded-md">
                                  {count} en pedido
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-black text-[#0369A1] mt-0.5">
                              {opcion.precio}
                            </div>
                          </div>

                          {/* Stepper for this option */}
                          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setOptionQuantities(prev => ({
                                  ...prev,
                                  [opcion.nombre]: Math.max(0, (prev[opcion.nombre] || 0) - 1)
                                }));
                              }}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-colors ${
                                count > 0
                                  ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600'
                                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                              }`}
                              disabled={count <= 0}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold text-slate-800 min-w-[22px] text-center">
                              {count}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setOptionQuantities(prev => ({
                                  ...prev,
                                  [opcion.nombre]: (prev[opcion.nombre] || 0) + 1
                                }));
                              }}
                              className="w-7 h-7 rounded-lg bg-[#0284C7] text-white hover:bg-[#0369A1] flex items-center justify-center font-bold shadow-xs transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer with Subtotal & Confirm Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span>Subtotal selección:</span>
                  <span className="text-base font-black text-[#0369A1]">
                    S/. {calculateOptionModalTotal().toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleConfirmOptions()}
                  className="w-full bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#075985] hover:from-[#0369A1] hover:to-[#075985] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 active:scale-98 transition-all"
                >
                  <Check size={18} />
                  <span>Confirmar Selección</span>
                </button>
              </div>
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
                <p className="text-[10px] text-slate-400 italic mt-1.5">* Imagen referencial</p>
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

      {/* 🤖 MODAL: ASIGNACIÓN AUTOMÁTICA DE IMÁGENES */}
      <AnimatePresence>
        {showAutoAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isAutoAssigning && setShowAutoAssignModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {!isAutoAssigning && (
                <button
                  onClick={() => setShowAutoAssignModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={20} />
                </button>
              )}

              <div className="text-center mb-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner ${
                  isAutoAssigning ? 'bg-sky-100 text-[#0284C7]' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {isAutoAssigning ? (
                    <RefreshCw size={28} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={32} />
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  {isAutoAssigning ? "Buscando Imágenes en Internet" : "¡Búsqueda y Asignación Completa!"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAutoAssigning 
                    ? "Escaneando nombres de platos y optimizando fotos para la carta digital..." 
                    : "Los platos han sido actualizados con imágenes optimizadas."}
                </p>
              </div>

              {/* Progress State */}
              {isAutoAssigning && autoAssignProgress && (
                <div className="my-4 space-y-3 bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Progreso:</span>
                    <span className="text-[#0284C7]">
                      {autoAssignProgress.processed} / {autoAssignProgress.total} platos ({Math.round((autoAssignProgress.processed / autoAssignProgress.total) * 100)}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-[#0284C7] to-amber-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(autoAssignProgress.processed / autoAssignProgress.total) * 100}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 truncate pt-1">
                    <Loader2 size={14} className="animate-spin text-[#0284C7] flex-shrink-0" />
                    <span className="truncate">Plato actual: <strong className="text-slate-800">{autoAssignProgress.currentDish}</strong></span>
                  </div>
                </div>
              )}

              {/* Completed Results Summary */}
              {autoAssignResult && !isAutoAssigning && (
                <div className="overflow-y-auto flex-1 space-y-4 my-2 pr-1">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                      <div className="text-base font-black text-emerald-700">{autoAssignResult.totalUpdated}</div>
                      <div className="text-[11px] font-semibold text-emerald-800 leading-tight">Asignadas</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                      <div className="text-base font-black text-slate-700">{autoAssignResult.totalSkipped}</div>
                      <div className="text-[11px] font-semibold text-slate-600 leading-tight">Ya tenían foto</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                      <div className="text-base font-black text-amber-700">{autoAssignResult.totalErrors}</div>
                      <div className="text-[11px] font-semibold text-amber-800 leading-tight">Sin imagen</div>
                    </div>
                  </div>

                  {/* Logs list */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl p-2 bg-slate-50">
                    {autoAssignResult.logs.map((log, idx) => (
                      <div key={idx} className="pt-1.5 pb-1 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {log.imageUrl ? (
                            <img src={log.imageUrl} alt={log.dishName} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                              <ImageIcon size={14} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 truncate">{log.dishName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{log.categoryName}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                          log.status === 'updated' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : log.status === 'skipped'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status === 'updated' ? 'Nueva' : log.status === 'skipped' ? 'Conservada' : 'Omitida'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleStartAutoAssign}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={14} />
                      <span>Volver a buscar</span>
                    </button>
                    <button
                      onClick={() => setShowAutoAssignModal(false)}
                      className="flex-1 bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>Ver Carta Actualizada</span>
                    </button>
                  </div>
                </div>
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
