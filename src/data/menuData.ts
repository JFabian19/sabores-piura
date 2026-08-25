export interface Dish {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: string;
  destacado?: boolean;
  etiqueta?: string;
}

export interface Category {
  id: string;
  nombre: string;
  icono?: string;
  subtitulo?: string;
  items: Dish[];
}

export const DEFAULT_MENU_DATA: Category[] = [
  {
    id: "ceviches",
    nombre: "Ceviches",
    icono: "🐟",
    subtitulo: "Frescura marina con auténtico limón norteño y ají limo",
    items: [
      {
        nombre: "Ceviche de Pescado del Día",
        descripcion: "Pescado fresco del día cortado en dados, marinado con limón norteño al instante, ají limo, cebolla roja, camote glaseado, choclo y canchita chulpi.",
        precio: "S/. 25.00",
        destacado: true,
        etiqueta: "Plato Estrella",
        imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Ceviche Mixto",
        descripcion: "Pescado del día con mixtura de mariscos frescos (pulpo, calamar, langostinos) marinados al punto con limón de Chulucanas y ají limo.",
        precio: "S/. 30.00",
        destacado: true,
        etiqueta: "Favorito",
        imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Ceviche de Caballa",
        descripcion: "Tradicional y sabroso ceviche de caballa norteña con zarandaja fresca, camote, choclo y cebolla morada crujiente.",
        precio: "S/. 30.00",
        etiqueta: "Tradición Piurana",
        imagen: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Ceviche de Conchas Negras",
        descripcion: "Fresquísimas conchas negras marinas al instante con limón, cebollita picada, ají limo y canchita chulpi. Puro poder afrodisíaco.",
        precio: "S/. 25.00",
        destacado: true,
        etiqueta: "Especial",
        imagen: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Causa Acevichada",
        descripcion: "Masa de papa amarilla prensada con ají amarillo y limón, rellena y coronada con un generoso ceviche fresco del día y salsa acevichada.",
        precio: "S/. 18.00",
        imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Leche de Tigre",
        descripcion: "Concentrado vigoroso de ceviche con trozos de pescado, mariscos crujientes, choclo desgranado y canchita norteña.",
        precio: "S/. 18.00",
        imagen: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "chicharrones-y-jaleas",
    nombre: "Chicharrones y Jaleas",
    icono: "🍤",
    subtitulo: "Frituras crocantes y doradas acompañadas de yucas y sarsa criolla",
    items: [
      {
        nombre: "Chicharrón de Pescado",
        descripcion: "Trozos de pescado blanco marinados y fritos al punto crocante, acompañados de yucas doradas, salsa tártara y ensalada criolla norteña.",
        precio: "S/. 25.00",
        destacado: true,
        imagen: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Chicharrón Mixto",
        descripcion: "Pescado y mariscos seleccionados (calamar, langostinos) rebozados y fritos, con yucas fritas y abundante salsa tártara casera.",
        precio: "S/. 30.00",
        imagen: "https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Jalea de Cabrilla",
        descripcion: "Cabrilla entera norteña frita bien crocante, cubierta de mixtura marina frita, yucas doradas, chifles y sarsa criolla.",
        precio: "S/. 40.00",
        etiqueta: "Recomendado",
        imagen: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Jalea Mixta",
        descripcion: "Gran jalea familiar con abundante pescado y mariscos fritos crocantes, acompañada de yucas fritas, chifles y salsa criolla piurana.",
        precio: "S/. 45.00",
        destacado: true,
        etiqueta: "Para Compartir",
        imagen: "https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "arroces",
    nombre: "Arroces Marinos",
    icono: "🍚",
    subtitulo: "Salteados al fuego vivo y aderezos con sabor norteño",
    items: [
      {
        nombre: "Arroz con Mariscos",
        descripcion: "Arroz al wok con crema de ají amarillo, vino blanco, culantro y generosos mariscos frescos, decorado con queso parmesano y sarsa criolla.",
        precio: "S/. 25.00",
        destacado: true,
        etiqueta: "Especialidad",
        imagen: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Chaufa de Pescado",
        descripcion: "Arroz chaufa al wok estilo fusión norteña con trozos dorados de pescado fresco, cebollita china, huevo y aceite de ajonjolí.",
        precio: "S/. 25.00",
        imagen: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Chaufa de Mariscos",
        descripcion: "Arroz salteado a fuego alto con variedad de mariscos frescos (calamar, langostino, pulpo), salsa de soya especial y pimientos.",
        precio: "S/. 25.00",
        imagen: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Arroz con Tortilla de Mariscos",
        descripcion: "Jugosa y esponjosa tortilla rellena de mariscos seleccionados, servida sobre una generosa cama de arroz norteño sazonado.",
        precio: "S/. 20.00",
        imagen: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "piura-tradicion",
    nombre: "Piura Tradición",
    icono: "🏺",
    subtitulo: "Sábados y Domingos • La auténtica sazón de nuestras raíces piuranas",
    items: [
      {
        nombre: "Arroz con Pato",
        descripcion: "Tierno pato criollo macerado en chicha de jora norteña y culantro piurano, servido con arroz verde aromático y salsa criolla.",
        precio: "S/. 25.00",
        destacado: true,
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Cabrito con Tamalito Verde",
        descripcion: "Tierno cabrito norteño estofado a fuego lento con chicha de jora, loche y culantro, servido con tamalito verde criollo, frijoles y arroz.",
        precio: "S/. 25.00",
        destacado: true,
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Seco de Chabelo",
        descripcion: "El plato bandera de Piura: plátano verde bellaco majado al batan, salteado con cecina aliñada, cebolla, tomate, ají amarillo y culantro fresco.",
        precio: "S/. 25.00",
        destacado: true,
        etiqueta: "Tradición Piurana",
        imagen: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Majado de Yuca con Carne Aliñada",
        descripcion: "Yuca fresca sancochada y majada con aderezo picantero, servida con sabrosa carne aliñada frita y sarsa criolla con zarandaja.",
        precio: "S/. 25.00",
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Mallarabia",
        descripcion: "Potaje tradicional piurano: majado de plátano maduro con queso fresco norteño, arroz blanco, frejol bayo y pescado en sudado.",
        precio: "S/. 28.00",
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Carne Seca con Chifles",
        descripcion: "Clásica carne cecina seca piurana frita al punto crocante, servida con abundante porción de chifles piuranos artesanales y salsa criolla.",
        precio: "S/. 25.00",
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Chanchito con Patacones",
        descripcion: "Crocantes y tiernos trozos de chancho dorado acompañados de patacones de plátano verde recién fritos y salsa criolla.",
        precio: "S/. 25.00",
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Frito Piurano",
        descripcion: "Costilla de cerdo adobada con achiote, ají panca y especias norteñas, servida con arroz amarillo, tamal y salsa criolla.",
        precio: "S/. 25.00",
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Toyito",
        descripcion: "Delicioso toyito guisado con aderezo picantero tradicional de Piura, servido con arroz blanco, menestra y sarsa.",
        precio: "S/. 20.00",
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Ronda Criolla",
        descripcion: "¡La gran fiesta piurana para compartir! Seco de Chabelo + Majado de Yuca + Chicharrón de Chancho + Rellenita + Chorizo con chifles y sarsa.",
        precio: "S/. 85.00",
        destacado: true,
        etiqueta: "Para 3 a 4 Personas",
        imagen: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "pescados",
    nombre: "Pescados",
    icono: "🐟",
    subtitulo: "Pescados enteros y filetes fritos y encebollados",
    items: [
      {
        nombre: "Cachema Frita",
        descripcion: "Cachema entera fresca de la costa norteña, frita bien dorada y crocante, servida con yucas, chifles y salsa criolla.",
        precio: "S/. 25.00",
        imagen: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Cabrilla Frita",
        descripcion: "Cabrilla entera norteña frita a la perfección con piel crujiente y carne tierna, con yucas sancochadas, chifles y sarsa.",
        precio: "S/. 35.00",
        destacado: true,
        imagen: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Cachema Encebollada",
        descripcion: "Cachema frita bañada con generoso salteado criollo de cebollas, tomates jugosos, ají amarillo y culantro fresco.",
        precio: "S/. 30.00",
        imagen: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Filete de Pescado",
        descripcion: "Filete de pescado fresco dorado a la plancha o frito, servido con arroz blanco, papas doradas o yucas y ensalada fresca.",
        precio: "S/. 25.00",
        imagen: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Caballa Frita",
        descripcion: "Caballa entera frita y dorada con auténtica zarandaja piurana, chifles crocantes y ensalada criolla.",
        precio: "S/. 35.00",
        imagen: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "sudados",
    nombre: "Sudados",
    icono: "🍲",
    subtitulo: "Guisados a fuego lento con chicha de jora, ajíes y hierbas aromáticas",
    items: [
      {
        nombre: "Sudado de Filete",
        descripcion: "Filete de pescado cocinado en su propio jugo con chicha de jora, tomate, cebolla, ají amarillo, culantro y yuca sancochada.",
        precio: "S/. 30.00",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Sudado de Caballa",
        descripcion: "Caballa fresca sudada con aderezo norteño, chicha de jora, cebolla en gajos, tomate y yucas tiernas.",
        precio: "S/. 30.00",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Sudado de Cachema",
        descripcion: "Cachema entera cocinada en caldo concentrado con chicha de jora, ají mirasol, culantro y yuca.",
        precio: "S/. 30.00",
        destacado: true,
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Sudado de Cabrilla",
        descripcion: "Exquisita cabrilla entera sudada en aderezo de la casa, chicha de jora, tomate, ají amarillo y yucas sancochadas.",
        precio: "S/. 35.00",
        destacado: true,
        etiqueta: "Recomendado",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "parihuelas",
    nombre: "Parihuelas",
    icono: "🦞",
    subtitulo: "Sopas marinas concentradas y revitalizantes",
    items: [
      {
        nombre: "Parihuela de Filete",
        descripcion: "Sustancioso caldo marino a base de filete de pescado, mixtura de mariscos, cangrejo, chicha de jora y ajíes peruanos.",
        precio: "S/. 30.00",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Parihuela de Cabrilla",
        descripcion: "La reina de las parihuelas: cabrilla entera con mariscos surtidos, cangrejo y toque secreto de pisco y chicha.",
        precio: "S/. 40.00",
        destacado: true,
        etiqueta: "Levanta Muertos",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "pasaditos",
    nombre: "Pasaditos",
    icono: "🌊",
    subtitulo: "Especialidad tradicional de la costa de Piura",
    items: [
      {
        nombre: "Pasadito de Caballa por Agua",
        descripcion: "Auténtica receta piurana: caballa fresca pasada suavemente por agua caliente aromatizada con hierbas, servida con yucas, zarandaja, limón y ají.",
        precio: "S/. 35.00",
        etiqueta: "Picantero",
        imagen: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Pasadito de Cabrilla",
        descripcion: "Cabrilla fresca cocinada suavemente al vapor aromatizado, acompañada de yuca cocida, salsa de cebolla con limón y ají limo.",
        precio: "S/. 35.00",
        imagen: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "duos-marinos",
    nombre: "Dúos Marinos",
    icono: "✨",
    subtitulo: "¡Combina lo mejor del mar a un precio insuperable!",
    items: [
      {
        nombre: "Dúo Marino: Ceviche + Arroz con Mariscos",
        descripcion: "La combinación marina perfecta: delicioso ceviche fresco de pescado del día acompañado de caliente y jugoso arroz con mariscos.",
        precio: "S/. 25.00",
        destacado: true,
        etiqueta: "Super Promo",
        imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Dúo Marino: Ceviche + Chicharrón de Pescado",
        descripcion: "Fresco ceviche de pescado del día servido junto a crujientes chicharrones de pescado con tártara y yucas fritas.",
        precio: "S/. 25.00",
        destacado: true,
        etiqueta: "Super Promo",
        imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Dúo Marino: Ceviche + Chaufa de Mariscos",
        descripcion: "Ceviche tradicional de pescado acompañado de sabroso arroz chaufa de mariscos salteado al fuego vivo.",
        precio: "S/. 25.00",
        etiqueta: "Super Promo",
        imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "trios-marinos",
    nombre: "Tríos Marinos",
    icono: "👑",
    subtitulo: "Tres clásicos marinos en un solo plato",
    items: [
      {
        nombre: "Trío Marino: Ceviche + Chicharrón + Arroz con Mariscos",
        descripcion: "El favorito de todos: generosa porción de ceviche de pescado, chicharrón de pescado crocante con tártara y arroz con mariscos.",
        precio: "S/. 30.00",
        destacado: true,
        etiqueta: "El Más Pedido",
        imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Trío Marino: Ceviche + Chicharrón + Chaufa con Mariscos",
        descripcion: "Trío supremo: ceviche de pescado del día, chicharrón crocante con salsa tártara y chaufa de mariscos al wok.",
        precio: "S/. 30.00",
        destacado: true,
        etiqueta: "El Más Pedido",
        imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "fuentes",
    nombre: "Fuentes Familiares",
    icono: "🥘",
    subtitulo: "Fuentes medianas y grandes para compartir en familia y amigos",
    items: [
      {
        nombre: "Fuente Mediana: Ceviche de Pescado",
        descripcion: "Gran fuente mediana de ceviche de pescado del día con abundante camote, choclo desgranado y canchita chulpi.",
        precio: "S/. 45.00",
        etiqueta: "Fuente Mediana",
        imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Fuente Mediana: Ceviche de Caballa",
        descripcion: "Fuente mediana con abundante ceviche de caballa norteña, zarandaja y camote glaseado.",
        precio: "S/. 45.00",
        etiqueta: "Fuente Mediana",
        imagen: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Fuente Mediana: Ceviche Mixto",
        descripcion: "Fuente mediana de ceviche mixto con pescado y variedad de mariscos frescos al limón norteño.",
        precio: "S/. 45.00",
        etiqueta: "Fuente Mediana",
        imagen: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Fuente Mediana: Jalea Mixta",
        descripcion: "Fuente mediana de crocante jalea mixta con pescado, mariscos rebozados, yucas doradas y salsa tártara.",
        precio: "S/. 45.00",
        destacado: true,
        etiqueta: "Fuente Mediana",
        imagen: "https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Fuente Grande: Sudado de Pescado",
        descripcion: "Gran fuente familiar de sudado de pescado en su jugo aromático con chicha de jora, hierbas y yucas.",
        precio: "S/. 70.00",
        destacado: true,
        etiqueta: "Fuente Grande",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Fuente Grande: Parihuelas",
        descripcion: "Fuente grande de reconfortante parihuela marina con pescado y mariscos para toda la mesa.",
        precio: "S/. 70.00",
        etiqueta: "Fuente Grande",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Fuente Grande: Chaufa de Mariscos",
        descripcion: "Gran fuente familiar de arroz chaufa salteado al wok con generosos mariscos frescos.",
        precio: "S/. 70.00",
        etiqueta: "Fuente Grande",
        imagen: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Fuente Grande: Arroz con Mariscos",
        descripcion: "Generosa fuente grande familiar de arroz con mariscos al estilo norteño con toque de queso y cilantro.",
        precio: "S/. 70.00",
        destacado: true,
        etiqueta: "Fuente Grande",
        imagen: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "caldos",
    nombre: "Caldos",
    icono: "🥣",
    subtitulo: "Sábados y Domingos • Caldos reconfortantes preparados con tradición",
    items: [
      {
        nombre: "Caldo de Gallina",
        descripcion: "Sustancioso caldo caliente de gallina criolla con fideos, papa amarilla, huevo duro, cebolla china y canchita chulpi.",
        precio: "S/. 16.00",
        destacado: true,
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Caldo de Pata",
        descripcion: "Tradicional y nutritivo caldo de pata de res con mote tierno, hierbabuena y aderezo especial de la casa.",
        precio: "S/. 20.00",
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "platos-criollos",
    nombre: "Platos Criollos",
    icono: "🥩",
    subtitulo: "Carnes, pollos y especialidades tradicionales peruanas",
    items: [
      {
        nombre: "Lomo Saltado",
        descripcion: "Jugosos trozos de lomo de res salteados al wok con cebolla morada, tomates, ají amarillo y culantro, servido con papas fritas y arroz.",
        precio: "S/. 22.00",
        destacado: true,
        etiqueta: "Clásico",
        imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Saltado de Pollo",
        descripcion: "Trocitos de pechuga de pollo salteados al fuego vivo con cebolla, tomate, ají amarillo, papas fritas doradas y arroz blanco.",
        precio: "S/. 18.00",
        imagen: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Pechuga a la Plancha",
        descripcion: "Jugosa pechuga de pollo marinada y dorada a la plancha, servida con papas fritas o arroz y ensalada fresca.",
        precio: "S/. 18.00",
        imagen: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Chicharrón de Pollo",
        descripcion: "Crocantes trozos de pollo rebozados y sazonados con especias criollas, acompañados de papas fritas y cremas de la casa.",
        precio: "S/. 20.00",
        imagen: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Trucha Frita (Sábado y Domingo)",
        descripcion: "Trucha fresca entera frita bien dorada y crocante, servida con papas doradas, arroz blanco y ensalada fresca.",
        precio: "S/. 28.00",
        etiqueta: "Sábados y Domingos",
        imagen: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Cuy Chactado (Medio)",
        descripcion: "Medio cuy frito a la piedra bien crocante y dorado, servido con papas doradas andinas, maíz y salsa criolla.",
        precio: "S/. 35.00",
        etiqueta: "Especialidad Andina",
        imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Cuy Chactado (Entero)",
        descripcion: "Cuy entero frito a la piedra crocante al estilo tradicional, servido con papas doradas, choclo y salsas artesanales.",
        precio: "S/. 70.00",
        destacado: true,
        etiqueta: "Especialidad",
        imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Pollada",
        descripcion: "Generosa presa de pollo macerada en ají panca, chicha y condimentos criollos, frita al punto con papa cocida y ensalada.",
        precio: "S/. 20.00",
        imagen: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Parrilla",
        descripcion: "Sabrosos cortes de carne sazonados a la parrilla con aroma ahumado, servidos con papas fritas doradas y ensalada criolla.",
        precio: "S/. 22.00",
        imagen: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"
      }
    ]
  },
  {
    id: "bebidas",
    nombre: "Bebidas",
    icono: "🥤",
    subtitulo: "Chichas tradicionales norteñas, cervezas heladas y refrescos",
    items: [
      {
        nombre: "Chicha Morada 1 Lt.",
        descripcion: "Jarra de 1 Litro de deliciosa chicha morada artesanal preparada con maíz morado, piña, manzana, canela y clavo.",
        precio: "S/. 8.00",
        destacado: true,
        etiqueta: "Casera",
        imagen: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Chicha de Jora 1 Lt.",
        descripcion: "Jarra de 1 Litro de tradicional chicha de jora piurana fermentada en olla de barro, fresca y aromática.",
        precio: "S/. 8.00",
        destacado: true,
        etiqueta: "Tradición Piurana",
        imagen: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Clarito Helado 1 Lt.",
        descripcion: "Jarra de 1 Litro del famoso clarito piurano helado, la esencia más suave y refrescante de la chicha de jora.",
        precio: "S/. 8.00",
        destacado: true,
        etiqueta: "Típico de Piura",
        imagen: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Cerveza Pilsen",
        descripcion: "Botella de Cerveza Pilsen Callao bien helada (630ml / personal), ideal para acompañar tus platos marinos.",
        precio: "S/. 9.00",
        imagen: "https://images.unsplash.com/photo-1608270174093-16a75066a506?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Cerveza Cristal",
        descripcion: "Botella de Cerveza Cristal heladita al polo para compartir con tus platos criollos y marinos.",
        precio: "S/. 8.50",
        imagen: "https://images.unsplash.com/photo-1608270174093-16a75066a506?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Gaseosa Personal",
        descripcion: "Botella personal de 500ml (Inca Kola, Coca Cola, Sprite o Fanta) bien helada.",
        precio: "S/. 4.00",
        imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Gaseosa de 1 Lt.",
        descripcion: "Botella de 1 Litro de Inca Kola o Coca Cola bien helada.",
        precio: "S/. 9.00",
        imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80"
      },
      {
        nombre: "Agua Mineral",
        descripcion: "Botella de agua mineral con o sin gas de 500ml bien fresca.",
        precio: "S/. 2.00",
        imagen: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80"
      }
    ]
  }
];
