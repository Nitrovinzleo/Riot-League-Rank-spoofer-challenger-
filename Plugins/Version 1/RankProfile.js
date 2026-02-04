(function () {
  // === CONFIGURATION ===

  // Rang actuel (affiché sur la bannière du profil et dans le tooltip Solo/Duo)
  const rankData = {
    tier: 'CHALLENGER',      // utilisé pour l'attribut ranked-tier (majuscule)
    tierText: 'CHALLENGER',  // texte visible comme "Gold IV", "Platinum II", etc.
    wins: 296,
    lp: 1284            // shows Challenger 1284 LP , 296 wins 
  };

  // Rang de la saison précédente (dans le tooltip)
  const lastSeasonData = {
    tier: 'CHALLENGER',
    tierText: 'CHALLENGER'
  };

  // === PATCH PROFIL (hors-tooltip) ===
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
      // Essayer plusieurs sélecteurs pour le titre
      const titleSelectors = [
        '.style-profile-emblem-header-title',
        '.profile-emblem-header-title',
        '.ranked-emblem-header-title',
        '[class*="header-title"]',
        'div[class*="title"]'
      ];
      
      let title = null;
      for (const selector of titleSelectors) {
        title = wrapper.querySelector(selector);
        if (title) break;
      }

      // Essayer plusieurs sélecteurs pour le sous-titre
      const subtitleSelectors = [
        '.style-profile-emblem-header-subtitle',
        '.profile-emblem-header-subtitle',
        '.ranked-emblem-header-subtitle',
        '[class*="header-subtitle"]',
        'div[class*="subtitle"]'
      ];
      
      let subtitle = null;
      for (const selector of subtitleSelectors) {
        subtitle = wrapper.querySelector(selector);
        if (subtitle) break;
      }

      // Essayer plusieurs sélecteurs pour l'emblème
      const emblemSelectors = [
        'lol-regalia-emblem-element',
        '.regalia-emblem-element',
        '[class*="emblem-element"]'
      ];
      
      let emblem = null;
      for (const selector of emblemSelectors) {
        emblem = wrapper.parentElement?.querySelector(selector) || wrapper.querySelector(selector);
        if (emblem) break;
      }

      // Vérifier si c'est Solo/Duo (français ou anglais)
      if (!title) return;
      const titleText = title.textContent.trim().toLowerCase();
      if (titleText !== 'solo/duo' && titleText !== 'solo/duo' && !titleText.includes('solo')) return;

      // 1. Mettre à jour le texte du rang
      if (subtitle && rankData.tierText) {
        subtitle.textContent = rankData.tierText;
      }

      // 2. Mettre à jour l'emblème
      if (emblem) {
        emblem.setAttribute('ranked-tier', rankData.tier);
        const shadowEl = emblem.shadowRoot?.querySelector('.regalia-emblem');
        if (shadowEl) {
          shadowEl.setAttribute('ranked-tier', rankData.tier.toLowerCase());
        }
      }
    });
  }


  // === PATCH TOOLTIP SOLO/DUO + LAST SEASON ===
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

    // Méthode agressive : chercher tous les éléments qui pourraient être du rang
    const allRankElements = document.querySelectorAll('[class*="ranked"], [class*="rank"], [class*="emblem"], [class*="tier"]');
    allRankElements.forEach(element => {
      const text = element.textContent || '';
      if (text.includes('Last Season') || text.includes('SAISON') || text.includes('Season')) {
        // C'est probablement un élément de last season
        const tierElements = element.querySelectorAll('[class*="tier"], div[class*="rank"]');
        tierElements.forEach(tierEl => {
          if (tierEl.textContent.trim().length > 0 && !tierEl.textContent.includes('Wins') && !tierEl.textContent.includes('LP')) {
            tierEl.textContent = lastSeasonData.tierText;
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

        const data = isSoloDuo ? rankData : lastSeasonData;

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
          emblemElement.setAttribute('ranked-tier', data.tier);
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
          '[class*="queue-tier"]'
        ];

        let tierTextEl = null;
        for (const selector of tierSelectors) {
          tierTextEl = queue.querySelector(selector);
          if (tierTextEl) break;
        }

        if (tierTextEl) {
          tierTextEl.textContent = data.tierText;
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

          const html = `<span>${rankData.wins}</span> Wins <span>${rankData.lp}</span> LP`;

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
              spans[0].textContent = rankData.wins;
              spans[1].textContent = rankData.lp;
            } else {
              lpBlock.innerHTML = html;
            }
          }
        }
      });
    });
  }

  // === OBSERVER + INTERVAL ===
  const observer = new MutationObserver(() => {
    patchTooltipQueues();
    patchProfileBanner();
  });

  function initializePatching() {
    observer.observe(document.body, { childList: true, subtree: true });

    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      const tooltipContainers = document.querySelectorAll('.profile-ranked-emblem-tooltip-container');
      const emblemWrappers = document.querySelectorAll('.style-profile-emblem-wrapper');
      
      patchTooltipQueues();
      patchProfileBanner();
      
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
      patchTooltipQueues();
      patchProfileBanner();
    }, 1000);
  });
})();
