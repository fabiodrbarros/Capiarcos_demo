/* ═══════════════════════════════════════════════════════
   CAPIARCOS — SHARED JS
   i18n PT/EN/FR · nav · animations · forms
   All text content sourced from the real Capiarcos website
═══════════════════════════════════════════════════════ */

const T = {
  pt: {
    nav: { home: 'Home', empresa: 'Empresa e Serviços', catalogo: 'Catálogo', contactos: 'Contactos', quote: 'Pedir Orçamento' },

    /* ── HOME ── */
    home: {
      eyebrow: 'Desde 1998 · Arcos de Valdevez',
      h1: 'Carpintaria\nfeita à <em>medida</em>.',
      sub: 'Fábrica própria. Cozinhas, roupeiros, escadas, pavimentos e mobiliário interior — fabricados por nós, do esboço à montagem.',
      cta_quote: 'Pedir Orçamento',
      cta_more: 'Conhecer a empresa',
      stamp_year: '1998',
      stamp_label: 'fundada em',

      commit_tag: 'O nosso compromisso',
      commit_t: 'Profissionalismo e qualidade.',
      commit_s: 'Fabricamos tudo por medida, com vários designers — pode escolher qualquer pormenor, cor, madeira ou acabamento. Acompanhamos o seu projeto da planificação à montagem.',

      areas_tag: 'Áreas de atuação',
      areas_h2: 'Tudo o que faz uma casa única',
      areas_sub: 'Especializados em fabricação de mobiliário por medida para qualquer divisão.',
      areas: [
        { name: 'Cozinhas', desc: 'Cozinhas por medida, acessórios e bancos.' },
        { name: 'Roupeiros', desc: 'Roupeiros com acessórios integrados.' },
        { name: 'Salas e Quartos', desc: 'Modernos, rústicos, mesas, cadeiras, sofás.' },
        { name: 'Casas de Banho', desc: 'Móveis de banho resistentes e elegantes.' },
        { name: 'Pavimentos & Portas', desc: 'Soalho, forros, portas e escadas.' },
        { name: 'Especialidades', desc: 'Sapateiras, escritórios, bibliotecas, consolas, vitrais.' },
      ],
      areas_cta: 'Ver tudo',

      intl_tag: 'Internacional',
      intl_h: 'Exportação e colocação\npara <em>França</em>.',

      cta_t: 'Vamos começar o seu projeto?',
      cta_s: 'Conte-nos o que precisa. Respondemos a cada pedido com atenção.',
      cta_btn: 'Pedir Orçamento',
    },

    /* ── EMPRESA E SERVIÇOS ── */
    empresa: {
      crumb: 'Empresa',
      page_h1: 'A nossa empresa',
      page_sub: 'Carpintaria com fábrica própria desde 1998.',

      about_tag: 'Quem somos',
      about_h2: 'Carpintaria por medida,\ndesde <em>1998</em>.',
      about_p1: 'Capiarcos – Sociedade Unipessoal de Carpintaria, Lda, fundada em 4 de Maio de 1998, é uma empresa dinâmica, direccionada para o ramo de carpintaria, com fábrica própria.',
      about_p2: 'Somos uma empresa que fabrica tudo por medida e com vários designers, o que possibilita ao cliente escolher qualquer tipo de pormenor, cor, madeira, utensílios, etc.',
      about_quote: 'Profissionalismo e qualidade — o nosso compromisso.',

      diff_tag: 'Diferenciais',
      diff_h2: 'O que nos distingue',
      diff: [
        { t: 'Rapidez', d: 'Resposta e execução com prazos curtos.' },
        { t: 'Atendimento personalizado', d: 'Cada cliente, cada projeto, único.' },
        { t: 'Capacidade de resposta', d: 'Equipa preparada para os seus desafios.' },
        { t: 'Qualidade nas matérias-primas', d: 'Materiais e acabamentos selecionados.' },
        { t: 'Exclusividade e versatilidade', d: 'Soluções únicas, em qualquer estilo.' },
        { t: 'Inovação', d: 'Designers que acompanham as tendências.' },
        { t: 'Relação qualidade-preço', d: 'Elevada relação valor para o cliente.' },
        { t: 'Cumprimento de prazos', d: 'Compromisso com datas de entrega.' },
      ],

      svc_tag: 'Áreas de fabricação',
      svc_h2: 'Especialistas em todas as áreas',
      svc_sub: 'Profissionais especializados em fabricação de mobiliário.',
      svc: [
        { t: 'Cozinhas', s: 'Cozinhas, acessórios, bancos' },
        { t: 'Roupeiros', s: 'Roupeiros e acessórios' },
        { t: 'Salas', s: 'Modernas, rústicas, cadeiras, mesas, sofás' },
        { t: 'Quartos', s: 'Crianças, modernos, rústicos' },
        { t: 'Casas de Banho', s: 'Móveis por medida' },
        { t: 'Pavimentos', s: 'Soalho e forros' },
        { t: 'Tampos', s: 'Granitos, compactado, quartzo' },
        { t: 'Portas', s: 'Interiores e exteriores' },
        { t: 'Escadas', s: 'Em madeira maciça' },
        { t: 'Sapateiras', s: 'Por medida' },
        { t: 'Escritórios e Bibliotecas', s: 'Mobiliário integrado' },
        { t: 'Consolas e Vitrais', s: 'Trabalhos exclusivos' },
      ],

      intl_tag: 'Internacional',
      intl_h2: 'Exportação e colocação\npara França',
      intl_p: 'Fazemos exportação e colocação para França. A qualidade portuguesa, levada além-fronteiras.',
    },

    /* ── CATÁLOGO ── */
    catalogo: {
      crumb: 'Catálogo',
      page_h1: 'Catálogo',
      page_sub: 'Uma amostra dos nossos trabalhos.',
      gal_filters: ['Todos', 'Cozinhas', 'Roupeiros', 'Salas', 'Quartos', 'Pavimentos', 'Portas'],
      placeholder: 'imagem real aqui',
    },

    /* ── CONTACTOS ── */
    contactos: {
      crumb: 'Contactos',
      page_h1: 'Contactos',
      page_sub: 'Estamos à disposição para o seu projeto.',
      addr: 'Morada', phone: 'Telefone', mobile: 'Telemóveis', fax: 'Fax', email: 'Email',
      call: 'Ligar', send_email: 'Enviar email', maps: 'Ver no mapa',
      form_t: 'Envie-nos uma mensagem', form_s: 'Preencha o formulário e entraremos em contacto.',
      fn: 'Nome', fn_ph: 'O seu nome',
      fe: 'Email', fe_ph: 'O seu email',
      fp: 'Telefone', fp_ph: 'Telefone (opcional)',
      fs: 'Assunto', fs_ph: 'Assunto',
      fm: 'Mensagem', fm_ph: 'Descreva o seu pedido...',
      send: 'Enviar mensagem',
      ok_t: 'Mensagem enviada!', ok_s: 'Entraremos em contacto consigo brevemente.',
    },

    /* ── 404 ── */
    nf404: {
      tag: 'Página não encontrada',
      title: 'Esta página não existe.',
      sub: 'O endereço que procura pode ter sido movido ou nunca existiu. Volte à página inicial ou veja os nossos trabalhos.',
      cta_home: 'Voltar à home',
      cta_cat: 'Ver catálogo',
    },

    /* ── FOOTER ── */
    ft: {
      tagline: 'Carpintaria por medida desde 1998. Fábrica própria em Arcos de Valdevez.',
      links: 'Navegação',
      contacto: 'Contactos',
      copy: '© 2026 Capiarcos — Todos os direitos reservados.',
      complaints_book: 'Livro de Reclamações',
      mobile_call: '(Chamada para rede móvel nacional)',
      landline_call: '(Chamada para rede fixa nacional)',
      design: 'Design',
    },
  },

  en: {
    nav: { home: 'Home', empresa: 'Company & Services', catalogo: 'Catalogue', contactos: 'Contact', quote: 'Get a Quote' },
    home: {
      eyebrow: 'Since 1998 · Arcos de Valdevez',
      h1: 'Carpentry\nmade to <em>measure</em>.',
      sub: 'Our own factory. Kitchens, wardrobes, stairs, flooring and interior furniture — built by us, from sketch to installation.',
      cta_quote: 'Get a Quote', cta_more: 'About the company',
      stamp_year: '1998', stamp_label: 'founded in',
      commit_tag: 'Our commitment',
      commit_t: 'Professionalism and quality.',
      commit_s: 'We build everything to measure, with multiple designers — you can choose every detail, colour, wood or finish. We follow your project from planning to installation.',
      areas_tag: 'Areas of work',
      areas_h2: 'Everything that makes a home unique',
      areas_sub: 'Specialised in custom-made furniture for any room.',
      areas: [
        { name: 'Kitchens', desc: 'Custom kitchens, accessories and benches.' },
        { name: 'Wardrobes', desc: 'Wardrobes with integrated accessories.' },
        { name: 'Living rooms & Bedrooms', desc: 'Modern, rustic, tables, chairs, sofas.' },
        { name: 'Bathrooms', desc: 'Durable and elegant bathroom furniture.' },
        { name: 'Flooring & Doors', desc: 'Hardwood floors, doors and stairs.' },
        { name: 'Specialties', desc: 'Shoe cabinets, offices, libraries, consoles.' },
      ],
      areas_cta: 'See all',

      intl_tag: 'International',
      intl_h: 'We export and install\nin <em>France</em>.',

      cta_t: 'Shall we start your project?',
      cta_s: 'Tell us what you need. Every enquiry gets our full attention.',
      cta_btn: 'Get a Quote',
    },
    empresa: {
      crumb: 'Company',
      page_h1: 'Our company',
      page_sub: 'Carpentry with our own factory since 1998.',
      about_tag: 'Who we are',
      about_h2: 'Custom carpentry,\nsince <em>1998</em>.',
      about_p1: 'Capiarcos – Sociedade Unipessoal de Carpintaria, Lda, founded on 4 May 1998, is a dynamic carpentry company with its own factory.',
      about_p2: 'We manufacture everything to measure, working with several designers — letting the client choose every detail: colour, wood, fittings and more.',
      about_quote: 'Professionalism and quality — our commitment.',
      diff_tag: 'What we stand for',
      diff_h2: 'What sets us apart',
      diff: [
        { t: 'Speed', d: 'Quick response and short lead times.' },
        { t: 'Personal service', d: 'Every client, every project, unique.' },
        { t: 'Responsiveness', d: 'A team ready for any challenge.' },
        { t: 'Quality raw materials', d: 'Selected materials and finishes.' },
        { t: 'Exclusivity & versatility', d: 'Unique solutions, in any style.' },
        { t: 'Innovation', d: 'Designers in tune with trends.' },
        { t: 'Value for money', d: 'Strong value for the client.' },
        { t: 'On-time delivery', d: 'We commit to delivery dates.' },
      ],
      svc_tag: 'Manufacturing areas',
      svc_h2: 'Specialists in every area',
      svc_sub: 'Skilled professionals in furniture manufacturing.',
      svc: [
        { t: 'Kitchens', s: 'Kitchens, accessories, benches' },
        { t: 'Wardrobes', s: 'Wardrobes and accessories' },
        { t: 'Living rooms', s: 'Modern, rustic, chairs, tables, sofas' },
        { t: 'Bedrooms', s: 'Children, modern, rustic' },
        { t: 'Bathrooms', s: 'Custom furniture' },
        { t: 'Flooring', s: 'Hardwood floors and cladding' },
        { t: 'Worktops', s: 'Granite, compact, quartz' },
        { t: 'Doors', s: 'Interior and exterior' },
        { t: 'Stairs', s: 'Solid wood' },
        { t: 'Shoe cabinets', s: 'Made to measure' },
        { t: 'Offices & Libraries', s: 'Integrated furniture' },
        { t: 'Consoles & Stained glass', s: 'Exclusive work' },
      ],
      intl_tag: 'International',
      intl_h2: 'Export and installation\nto France',
      intl_p: 'We export and install in France. Portuguese quality, taken beyond borders.',
    },
    catalogo: {
      crumb: 'Catalogue',
      page_h1: 'Catalogue',
      page_sub: 'A sample of our work.',
      gal_filters: ['All', 'Kitchens', 'Wardrobes', 'Living rooms', 'Bedrooms', 'Flooring', 'Doors'],
      placeholder: 'real image here',
    },
    contactos: {
      crumb: 'Contact',
      page_h1: 'Contact',
      page_sub: 'We are here for your project.',
      addr: 'Address', phone: 'Phone', mobile: 'Mobile', fax: 'Fax', email: 'Email',
      call: 'Call', send_email: 'Send email', maps: 'View on map',
      form_t: 'Send us a message', form_s: 'Fill in the form and we will get back to you.',
      fn: 'Name', fn_ph: 'Your name',
      fe: 'Email', fe_ph: 'Your email',
      fp: 'Phone', fp_ph: 'Phone (optional)',
      fs: 'Subject', fs_ph: 'Subject',
      fm: 'Message', fm_ph: 'Describe your enquiry...',
      send: 'Send message',
      ok_t: 'Message sent!', ok_s: 'We will be in touch shortly.',
    },
    nf404: {
      tag: 'Page not found',
      title: 'This page doesn\'t exist.',
      sub: 'The address you\'re looking for may have been moved or never existed. Head back to the home page or explore our work.',
      cta_home: 'Back to home',
      cta_cat: 'View portfolio',
    },
    ft: {
      tagline: 'Custom carpentry since 1998. Own factory in Arcos de Valdevez.',
      links: 'Navigation', contacto: 'Contact',
      copy: '© 2026 Capiarcos — All rights reserved.',
      complaints_book: 'Complaints Book',
      mobile_call: '(Call to national mobile network)',
      landline_call: '(Call to national landline)',
      design: 'Design',
    },
  },

  fr: {
    nav: { home: 'Accueil', empresa: 'Entreprise & Services', catalogo: 'Catalogue', contactos: 'Contact', quote: 'Demander un devis' },
    home: {
      eyebrow: 'Depuis 1998 · Arcos de Valdevez',
      h1: 'Menuiserie\nsur <em>mesure</em>.',
      sub: 'Atelier propre. Cuisines, dressings, escaliers, parquets et mobilier intérieur — fabriqués par nous, du croquis à la pose.',
      cta_quote: 'Demander un devis', cta_more: 'Notre entreprise',
      stamp_year: '1998', stamp_label: 'fondée en',
      commit_tag: 'Notre engagement',
      commit_t: 'Professionnalisme et qualité.',
      commit_s: 'Nous fabriquons tout sur mesure, avec plusieurs designers — vous choisissez chaque détail, couleur, bois ou finition. Nous suivons votre projet de la planification à la pose.',
      areas_tag: 'Domaines d\'activité',
      areas_h2: 'Tout ce qui rend une maison unique',
      areas_sub: 'Spécialisés dans le mobilier sur mesure pour toutes les pièces.',
      areas: [
        { name: 'Cuisines', desc: 'Cuisines sur mesure, accessoires, plans.' },
        { name: 'Dressings', desc: 'Dressings avec accessoires intégrés.' },
        { name: 'Salons & Chambres', desc: 'Modernes, rustiques, tables, chaises, canapés.' },
        { name: 'Salles de bain', desc: 'Mobilier de bain durable et élégant.' },
        { name: 'Parquets & Portes', desc: 'Parquets, lambris, portes, escaliers.' },
        { name: 'Spécialités', desc: 'Meubles à chaussures, bureaux, bibliothèques, consoles.' },
      ],
      areas_cta: 'Tout voir',

      intl_tag: 'International',
      intl_h: 'Export et pose\nen <em>France</em>.',

      cta_t: 'On commence votre projet ?',
      cta_s: 'Parlez-nous de votre besoin. Chaque demande reçoit toute notre attention.',
      cta_btn: 'Demander un devis',
    },
    empresa: {
      crumb: 'Entreprise',
      page_h1: 'Notre entreprise',
      page_sub: 'Menuiserie avec atelier propre depuis 1998.',
      about_tag: 'Qui nous sommes',
      about_h2: 'Menuiserie sur mesure,\ndepuis <em>1998</em>.',
      about_p1: 'Capiarcos – Sociedade Unipessoal de Carpintaria, Lda, fondée le 4 mai 1998, est une entreprise dynamique de menuiserie avec son propre atelier.',
      about_p2: 'Nous fabriquons tout sur mesure, avec plusieurs designers — permettant au client de choisir chaque détail : couleur, bois, accessoires, etc.',
      about_quote: 'Professionnalisme et qualité — notre engagement.',
      diff_tag: 'Nos valeurs',
      diff_h2: 'Ce qui nous distingue',
      diff: [
        { t: 'Rapidité', d: 'Réponse rapide et délais courts.' },
        { t: 'Service personnalisé', d: 'Chaque client, chaque projet, unique.' },
        { t: 'Réactivité', d: 'Une équipe prête pour vos défis.' },
        { t: 'Qualité des matières', d: 'Matériaux et finitions sélectionnés.' },
        { t: 'Exclusivité et polyvalence', d: 'Des solutions uniques, dans tous les styles.' },
        { t: 'Innovation', d: 'Designers à l\'écoute des tendances.' },
        { t: 'Rapport qualité-prix', d: 'Une excellente valeur pour le client.' },
        { t: 'Délais respectés', d: 'Engagement sur les dates de livraison.' },
      ],
      svc_tag: 'Domaines de fabrication',
      svc_h2: 'Spécialistes dans chaque domaine',
      svc_sub: 'Professionnels qualifiés en fabrication de mobilier.',
      svc: [
        { t: 'Cuisines', s: 'Cuisines, accessoires, plans' },
        { t: 'Dressings', s: 'Dressings et accessoires' },
        { t: 'Salons', s: 'Modernes, rustiques, chaises, tables, canapés' },
        { t: 'Chambres', s: 'Enfants, modernes, rustiques' },
        { t: 'Salles de bain', s: 'Mobilier sur mesure' },
        { t: 'Parquets', s: 'Parquets et lambris' },
        { t: 'Plans de travail', s: 'Granit, compact, quartz' },
        { t: 'Portes', s: 'Intérieures et extérieures' },
        { t: 'Escaliers', s: 'Bois massif' },
        { t: 'Meubles à chaussures', s: 'Sur mesure' },
        { t: 'Bureaux & Bibliothèques', s: 'Mobilier intégré' },
        { t: 'Consoles & Vitraux', s: 'Travaux exclusifs' },
      ],
      intl_tag: 'International',
      intl_h2: 'Export et pose\nen France',
      intl_p: 'Nous exportons et installons en France. La qualité portugaise, au-delà des frontières.',
    },
    catalogo: {
      crumb: 'Catalogue',
      page_h1: 'Catalogue',
      page_sub: 'Un aperçu de nos réalisations.',
      gal_filters: ['Tous', 'Cuisines', 'Dressings', 'Salons', 'Chambres', 'Parquets', 'Portes'],
      placeholder: 'image réelle ici',
    },
    contactos: {
      crumb: 'Contact',
      page_h1: 'Contact',
      page_sub: 'Nous sommes à votre disposition.',
      addr: 'Adresse', phone: 'Téléphone', mobile: 'Mobile', fax: 'Fax', email: 'Email',
      call: 'Appeler', send_email: 'Envoyer un email', maps: 'Voir sur la carte',
      form_t: 'Envoyez-nous un message', form_s: 'Remplissez le formulaire et nous vous recontacterons.',
      fn: 'Nom', fn_ph: 'Votre nom',
      fe: 'Email', fe_ph: 'Votre email',
      fp: 'Téléphone', fp_ph: 'Téléphone (optionnel)',
      fs: 'Sujet', fs_ph: 'Sujet',
      fm: 'Message', fm_ph: 'Décrivez votre demande...',
      send: 'Envoyer le message',
      ok_t: 'Message envoyé !', ok_s: 'Nous vous recontacterons sous peu.',
    },
    nf404: {
      tag: 'Page introuvable',
      title: 'Cette page n\'existe pas.',
      sub: 'L\'adresse que vous cherchez a peut-être été déplacée ou n\'a jamais existé. Revenez à l\'accueil ou découvrez nos réalisations.',
      cta_home: 'Retour à l\'accueil',
      cta_cat: 'Voir le portfolio',
    },
    ft: {
      tagline: 'Menuiserie sur mesure depuis 1998. Atelier propre à Arcos de Valdevez.',
      links: 'Navigation', contacto: 'Contact',
      copy: '© 2026 Capiarcos — Tous droits réservés.',
      complaints_book: 'Livre de Réclamations',
      mobile_call: '(Appel vers réseau mobile national)',
      landline_call: '(Appel vers réseau fixe national)',
      design: 'Design',
    },
  },
};

/* ── helpers ──────────────────────────────────────────── */
function get(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : (isNaN(k) ? o[k] : o[parseInt(k)])), obj);
}

let lang = localStorage.getItem('cap-lang') || 'pt';

function applyLang(l) {
  lang = l;
  localStorage.setItem('cap-lang', l);
  document.documentElement.lang = l;
  const t = T[l];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = get(t, el.dataset.i18n);
    if (v == null) return;
    const html = String(v);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = html;
    } else if (/<em>|\n/.test(html)) {
      el.innerHTML = html.replace(/\n/g, '<br>');
    } else {
      el.textContent = html;
    }
  });

  document.querySelectorAll('[data-ph]').forEach(el => {
    const v = get(t, el.dataset.ph);
    if (v != null) el.placeholder = v;
  });

  document.querySelectorAll('[data-lang]').forEach(b => {
    b.classList.toggle('on', b.dataset.lang === l);
  });
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-lang]');
  if (b) applyLang(b.dataset.lang);
});

/* ── nav scroll ───────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('s', window.scrollY > 40);
}, { passive: true });

/* ── mobile menu ─────────────────────────────────────── */
function initMobile() {
  const mob = document.getElementById('mob');
  const ham = document.getElementById('ham');
  const close = document.getElementById('mob-close');
  if (!mob || !ham) return;
  ham.addEventListener('click', () => { mob.classList.add('open'); document.body.style.overflow = 'hidden'; });
  if (close) close.addEventListener('click', () => { mob.classList.remove('open'); document.body.style.overflow = ''; });
  mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { mob.classList.remove('open'); document.body.style.overflow = ''; }));
}

/* ── scroll reveal ───────────────────────────────────── */
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
  });
}, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  document.querySelectorAll('.r, .r-l, .r-r').forEach(el => ro.observe(el));
}

/* ── subtle 3D tilt on diff-cards ────────────────────── */
function initTilt() {
  if (!window.matchMedia('(min-width: 769px) and (hover: hover)').matches) return;
  document.querySelectorAll('.diff-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ── gallery filters ─────────────────────────────────── */
function initGallery() {
  const fbs = document.querySelectorAll('.fb');
  const gis = document.querySelectorAll('.gi');
  if (!fbs.length || !gis.length) return;
  fbs.forEach(btn => {
    btn.addEventListener('click', () => {
      fbs.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const f = btn.dataset.f;
      gis.forEach(it => {
        const show = f === 'all' || it.dataset.c === f;
        if (show) {
          it.style.display = '';
          requestAnimationFrame(() => requestAnimationFrame(() => {
            it.style.opacity = '1';
            it.style.transform = '';
          }));
        } else {
          it.style.opacity = '0';
          it.style.transform = 'scale(.96)';
          setTimeout(() => { it.style.display = 'none'; }, 320);
        }
      });
    });
  });
}

/* ── form submit (demo) ──────────────────────────────── */
function doSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('cf');
  const ok = document.getElementById('form-ok');
  if (!form || !ok) return;
  form.style.cssText = 'opacity:0;pointer-events:none;transition:opacity .3s';
  setTimeout(() => {
    form.style.display = 'none';
    ok.classList.add('show');
  }, 300);
}

/* ── smooth scroll for in-page anchors ───────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const t = document.querySelector(href);
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }
    });
  });
}

/* ── boot ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyLang(lang);
  initMobile();
  initReveal();
  initTilt();
  initGallery();
  initSmoothScroll();
});
