//"PUUID (FOUND BY CTRL+MAJ+I ON YOUR/THE PERSON'S PROFILE -> CTRL+F -> type 'PUUID'. IF NOT YOUR PROFILE SEARCH FOR THE ONE WHERE 'is-seached' IS FALSE": 
//'BANNER LINK (CAN BE FOUND ON COMUNITYDRAGON) THE RANK OF THE BANNER CHANGES YOUR LAST SEASON RANK (MIGHT BE PROBLEMATIC WITH NON RANKED BANNERS : USE RANKEDLOBBY.JS)'



(function () {
  const PLAYERS_CONFIG = {
     //exemple of working profile
   "f8cfb78f-66e6-5401-a710-02f1491b4c42": {
      tier: 'Challenger',
      div: " ",
      text: 'Challenger',
      wins: 327,
      lp: 1468,
      banner:'/lol-game-data/assets/ASSETS/Regalia/BannerSkins/CHALLENGER.png'
   },"6c1fec8c-6741-5448-a1fa-5b9fc0afa6b4": {
      tier: 'Challenger',
      div: " ",
      text: 'Challenger',
      wins: 327,
      lp: 1468,
      banner:'/lol-game-data/assets/ASSETS/Regalia/BannerSkins/CHALLENGER.png'
   }

  }

  // Cache pour les sélecteurs et éléments
  const SELECTORS = {
    profile: [
      '.style-profile-emblem-wrapper',
      '.profile-emblem-wrapper',
      '.ranked-emblem-wrapper',
      '[class*="profile-emblem"]',
      '[class*="ranked-emblem"]'
    ],
    title: [
      '.style-profile-emblem-header-title',
      '.profile-emblem-header-title',
      '.ranked-emblem-header-title',
      '[class*="header-title"]',
      'div[class*="title"]'
    ],
    subtitle: [
      '.style-profile-emblem-header-subtitle',
      '.profile-emblem-header-subtitle',
      '.ranked-emblem-header-subtitle',
      '[class*="header-subtitle"]',
      'div[class*="subtitle"]'
    ],
    emblem: [
      'lol-regalia-emblem-element',
      '.regalia-emblem-element',
      '[class*="emblem-element"]'
    ]
  };

  // Throttling pour éviter les exécutions trop fréquentes
  let isThrottled = false;
  function throttle(func, delay) {
    return function() {
      if (isThrottled) return;
      isThrottled = true;
      func.apply(this, arguments);
      setTimeout(() => { isThrottled = false; }, delay);
    };
  }

  // Petite fonction pour extraire "MASTER" de ".../MASTER.png"
  function getTierFromBanner(url) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1]; // "CHALLENGER.png"
    return filename.split('.')[0].toUpperCase(); // "CHALLENGER"
  }

  function getContextConf(el) {
    let curr = el;
    while (curr) {
      const p = curr.getAttribute?.('puuid');
      if (p && PLAYERS_CONFIG[p]) return PLAYERS_CONFIG[p];
      curr = curr.parentElement || (curr.parentNode && curr.parentNode.host);
    }
    return null;
  }

  function getPageAuth() {
    const profiles = document.querySelectorAll('lol-regalia-profile-v2-element');
    if (!profiles.length) return null;
    let auth = null, foreign = false;
    for (let p of profiles) {
      const puuid = p.getAttribute('puuid');
      if (puuid && PLAYERS_CONFIG[puuid]) auth = PLAYERS_CONFIG[puuid];
      else if (p.getAttribute('is-searched') === 'false') auth = PLAYERS_CONFIG["71ed307f-1646-5073-8a63-443aa9af747b"];
      else if (p.getAttribute('is-searched') === 'true') foreign = true;
    }
    return foreign ? null : auth;
  }

  // === PATCH PROFIL (hors-tooltip) AVEC LOGIQUE PUUID ===
  function patchProfileBanner() {
    // Essayer plusieurs sélecteurs possibles pour les emblèmes de profil
    const possibleSelectors = [
      '.style-profile-emblem-wrapper',
      '.profile-emblem-wrapper',
      '.ranked-emblem-wrapper',
      '[class*="profile-emblem"]',
      '[class*="ranked-emblem"]'
    ];

    let foundElements = [];
    possibleSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        foundElements = foundElements.concat(Array.from(elements));
      }
    });

    foundElements.forEach(wrapper => {
      // Récupérer la config du joueur pour ce wrapper
      const wrapperConfig = getContextConf(wrapper) || getPageAuth();
      if (!wrapperConfig) return;

      // Utiliser les sélecteurs optimisés
      let title = null;
      for (const selector of SELECTORS.title) {
        title = wrapper.querySelector(selector);
        if (title) break;
      }

      let subtitle = null;
      for (const selector of SELECTORS.subtitle) {
        subtitle = wrapper.querySelector(selector);
        if (subtitle) break;
      }

      let emblem = null;
      for (const selector of SELECTORS.emblem) {
        emblem = wrapper.parentElement?.querySelector(selector) || wrapper.querySelector(selector);
        if (emblem) break;
      }

      // Vérifier si c'est Solo/Duo (français ou anglais)
      if (!title) return;
      const titleText = title.textContent.trim().toLowerCase();
      if (titleText !== 'solo/duo' && titleText !== 'solo/duo' && !titleText.includes('solo')) return;

      // 1. Mettre à jour le texte du rang avec la config du joueur
      if (subtitle && wrapperConfig.text) {
        subtitle.textContent = wrapperConfig.text;
      }

      // 2. Mettre à jour l'emblème avec la config du joueur
      if (emblem) {
        emblem.setAttribute('ranked-tier', wrapperConfig.tier.toUpperCase());
        emblem.setAttribute('ranked-division', wrapperConfig.div);
        emblem.setAttribute('crest-type', 'ranked');
        // Attributs crest additionnels
        emblem.setAttribute('crystal-level', 'DIAMOND');
        emblem.setAttribute('prestige-crest-id', '23');
        emblem.setAttribute('ranked-split-reward', '0');
        emblem.setAttribute('crest-sizing', 'huge');
        emblem.setAttribute('animations', 'true');
        
        const shadowEl = emblem.shadowRoot?.querySelector('.regalia-emblem');
        if (shadowEl) {
          shadowEl.setAttribute('ranked-tier', wrapperConfig.tier.toLowerCase());
        }
      }
    });
  }

  // === PATCH TOOLTIP SOLO/DUO + LAST SEASON AVEC LOGIQUE PUUID ===
  function patchTooltipQueues() {
    // Essayer plusieurs sélecteurs pour les conteneurs de tooltips
    const tooltipSelectors = [
      '.profile-ranked-emblem-tooltip-container',
      '.ranked-emblem-tooltip-container',
      '.tooltip-container',
      '[class*="tooltip-container"]',
      '[class*="ranked-tooltip"]'
    ];

    let tooltipContainers = [];
    tooltipSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        tooltipContainers = tooltipContainers.concat(Array.from(elements));
      }
    });

    // MÉTHODE AGRESSIVE : chercher tous les éléments qui pourraient être du rang
    const allRankElements = document.querySelectorAll('[class*="ranked"], [class*="rank"], [class*="emblem"], [class*="tier"]');
    allRankElements.forEach(element => {
      const text = element.textContent || '';
      if (text.includes('Last Season') || text.includes('SAISON') || text.includes('Season')) {
        // Récupérer la config du joueur pour cet élément
        const elementConfig = getContextConf(element) || getPageAuth();
        if (!elementConfig) return;
        
        // Extraire le rang depuis la bannière pour Last Season
        const bannerTierU = getTierFromBanner(elementConfig.banner);
        
        // C'est probablement un élément de last season
        const tierElements = element.querySelectorAll('[class*="tier"], div[class*="rank"]');
        tierElements.forEach(tierEl => {
          if (tierEl.textContent.trim().length > 0 && !tierEl.textContent.includes('Wins') && !tierEl.textContent.includes('LP')) {
            tierEl.textContent = bannerTierU;
          }
        });
      }
    });

    tooltipContainers.forEach(container => {
      // Essayer plusieurs sélecteurs pour les blocs de queue
      const queueSelectors = [
        '.ranked-tooltip-queue',
        '.ranked-tooltip-last-season',
        '.tooltip-queue',
        '[class*="tooltip-queue"]',
        '[class*="ranked-queue"]',
        '[class*="last-season"]',
        '[class*="lastseason"]'
      ];

      let queueBlocks = [];
      queueSelectors.forEach(selector => {
        const elements = container.querySelectorAll(selector);
        if (elements.length > 0) {
          queueBlocks = queueBlocks.concat(Array.from(elements));
        }
      });

      queueBlocks.forEach(queue => {
        // Récupérer la config du joueur pour ce bloc de queue
        const queueConfig = getContextConf(queue) || getPageAuth();
        if (!queueConfig) return;

        // Essayer plusieurs sélecteurs pour le nom de la queue
        const nameSelectors = [
          '.ranked-tooltip-queue-name',
          '.ranked-tooltip-last-season-queue-name',
          '.tooltip-queue-name',
          '[class*="queue-name"]',
          '[class*="tooltip-name"]'
        ];

        let queueName = null;
        for (const selector of nameSelectors) {
          queueName = queue.querySelector(selector)?.textContent?.trim();
          if (queueName) break;
        }

        const isSoloDuo = queueName === 'Solo/Duo' || queueName === 'SOLO/DUO' || (queueName && queueName.toLowerCase().includes('solo'));
        const isLastSeason = queueName === "Last Season's Rank" || queueName === "RANG DE LA SAISON PRÉCÉDENTE" || queueName === "RANG DE LA SAISON PRÉCÉDENTE" || (queueName && (queueName.toLowerCase().includes('last') || queueName.toLowerCase().includes('saison') || queueName.toLowerCase().includes('season')));
        if (!isSoloDuo && !isLastSeason) return;

        // Utiliser la config du joueur pour les données
        const data = isSoloDuo ? queueConfig : {
          tier: getTierFromBanner(queueConfig.banner),
          tierText: getTierFromBanner(queueConfig.banner)
        };

        // 1. Modifier emblème
        const emblemSelectors = [
          'lol-regalia-emblem-element[ranked-tier]',
          '.regalia-emblem-element',
          '[class*="emblem-element"]'
        ];

        let emblemElement = null;
        for (const selector of emblemSelectors) {
          emblemElement = queue.querySelector(selector);
          if (emblemElement) break;
        }

        if (emblemElement) {
          emblemElement.setAttribute('ranked-tier', data.tier.toUpperCase());
          const shadowEl = emblemElement.shadowRoot?.querySelector('.regalia-emblem');
          if (shadowEl) {
            shadowEl.setAttribute('ranked-tier', data.tier.toLowerCase());
          }
        }

        // 2. Texte du rang
        const tierSelectors = [
          '.ranked-tooltip-queue-tier',
          '.ranked-tooltip-last-season-queue-tier',
          '.tooltip-tier',
          '[class*="tooltip-tier"]',
          '[class*="queue-tier"]',
          'div[class*="tier"]',
          'span[class*="tier"]'
        ];

        let tierTextEl = null;
        for (const selector of tierSelectors) {
          tierTextEl = queue.querySelector(selector);
          if (tierTextEl) break;
        }

        // Si aucun élément trouvé, chercher plus agressivement
        if (!tierTextEl) {
          const allDivs = queue.querySelectorAll('div, span');
          for (const div of allDivs) {
            const text = div.textContent?.trim();
            if (text && text.length > 0 && !text.includes('Wins') && !text.includes('LP') && 
                !text.includes('Solo/Duo') && !text.includes('Last') && !text.includes('Season')) {
              // Vérifier si le texte ressemble à un rang (ex: "GOLD", "PLATINUM", etc.)
              if (text.length <= 15 && /^[A-Z]+$/.test(text.toUpperCase())) {
                tierTextEl = div;
                break;
              }
            }
          }
        }

        if (tierTextEl) {
          const tierText = data.tierText || data.tier || queueConfig.tier;
          if (tierText) {
            tierTextEl.textContent = tierText;
          }
        }

        // 3. LP/Victoires (uniquement pour Solo/Duo actuel)
        if (isSoloDuo) {
          const lpSelectors = [
            '.style-profile-ranked-crest-tooltip-lp',
            '.ranked-crest-tooltip-lp',
            '.tooltip-lp',
            '[class*="tooltip-lp"]'
          ];

          let lpBlock = null;
          for (const selector of lpSelectors) {
            lpBlock = queue.querySelector(selector);
            if (lpBlock) break;
          }
          const tierHtml = `<span>${queueConfig.tier}</span> ${queueConfig.div} <span>${queueConfig.text}</span>`;
          const html = `<span>${queueConfig.wins}</span> Wins <span>${queueConfig.lp}</span> LP`;

          if (!lpBlock) {
            lpBlock = document.createElement('div');
            lpBlock.className = 'style-profile-ranked-crest-tooltip-lp';
            lpBlock.innerHTML = html;
            if (tierTextEl && tierTextEl.parentNode) {
              tierTextEl.parentNode.insertBefore(lpBlock, tierTextEl.nextSibling);
            }
          } else {
            const spans = lpBlock.querySelectorAll('span');
            if (spans.length >= 2) {
              spans[0].textContent = queueConfig.wins;
              spans[1].textContent = queueConfig.lp;
            } else {
              lpBlock.innerHTML = html;
            }
          }
        }
      });
    });
  }

  // === PATCH BANNIÈRES ET CREST ===
  function patchBannersAndCrests(root) {
    root.querySelectorAll('lol-regalia-crest-v2-element, img.regalia-banner-asset-static-image').forEach(el => {
      const c = getContextConf(el);
      if (c) {
        if (el.tagName === 'IMG') {
          if (!el.src.includes(c.tier.toLowerCase())) el.src = c.banner;
        } else {
          const tU = c.tier.toUpperCase();
          if (el.getAttribute('ranked-tier') !== tU) {
            el.setAttribute('ranked-tier', tU);
            el.setAttribute('ranked-division', c.div);
            el.setAttribute('crest-type', 'ranked');
            // Attributs crest additionnels
            el.setAttribute('crystal-level', 'DIAMOND');
            el.setAttribute('prestige-crest-id', '23');
            el.setAttribute('ranked-split-reward', '0');
            el.setAttribute('crest-sizing', 'huge');
            el.setAttribute('animations', 'true');
          }
        }
      }
    });
  }

  function patch(root) {
    if (root._isPatching) return;
    root._isPatching = true;

    // 1. BANNIÈRES ET CREST
    patchBannersAndCrests(root);

    // 2. PATCH PROFIL ET TOOLTIPS avec méthodes agressives
    patchProfileBanner();
    patchTooltipQueues();

    // 3. RÉCURSION
    root.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot && !el._patched) {
        if (el.tagName.startsWith('LOL-') || el.classList.contains('ember-view')) {
          el._patched = true;
          patch(el.shadowRoot);
          setTimeout(() => { el._patched = false; }, 50);
        }
      }
    });
    root._isPatching = false;
  }

  // === OBSERVER + INTERVAL AMÉLIORÉ ===
  const observer = new MutationObserver(() => {
    patchProfileBanner();
    patchTooltipQueues();
    patchBannersAndCrests(document);
  });

  function initializePatching() {
    observer.observe(document.body, { childList: true, subtree: true });

    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      const tooltipContainers = document.querySelectorAll('.profile-ranked-emblem-tooltip-container');
      const emblemWrappers = document.querySelectorAll('.style-profile-emblem-wrapper');
      
      patchProfileBanner();
      patchTooltipQueues();
      patchBannersAndCrests(document);
      
      attempts++;
      if (attempts >= maxAttempts || (tooltipContainers.length > 0 && emblemWrappers.length > 0)) {
        clearInterval(interval);
      }
    }, 300);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePatching);
  } else {
    initializePatching();
  }

  // Also try on window load as fallback
  window.addEventListener('load', () => {
    setTimeout(() => {
      patchProfileBanner();
      patchTooltipQueues();
      patchBannersAndCrests(document);
    }, 1000);
  });

  // Garder l'intervalle optimisé (moins gourmand)
  const throttledPatch = throttle(() => patch(document), 200);
  setInterval(throttledPatch, 200);
})();
