(function () {
  const PLAYERS_CONFIG = {
    //exemple of working profile
    "71ed307f-1646-5073-8a63-443aa9af747b": {
      tier: 'DIAMOND',
      div: 'IV',
      text: 'DIAMOND IV',
      wins: 16,
      lp: 12,
      banner: '/lol-game-data/assets/ASSETS/Regalia/BannerSkins/DIAMOND.png'
   }, // DONT FORGET THIS COMA IF U PASTE MORE PROFILES !!!!!!!!!!!!
    "PUUID (FOUND BY CTRL+MAJ+I ON YOUR/THE PERSON'S PROFILE -> CTRL+F -> type 'PUUID'. IF NOT YOUR PROFILE SEARCH FOR THE ONE WHERE 'is-seached' IS FALSE": {
      tier: 'BORDER RANK',
      div: 'DIVISION (BORDER) (PUT "NA" FOR APEX TIERS)',
      text: 'RANKED SOLO DUO RANK TEXT',
      wins: NUMBER OF WINS,
      lp: AMOUNT OF LP,
      banner: 'BANNER LINK (CAN BE FOUND ON COMUNITYDRAGON) THE RANK OF THE BANNER CHANGES YOUR LAST SEASON RANK (MIGHT BE PROBLEMATIC WITH NON RANKED BANNERS : USE RANKEDLOBBY.JS)'
   }
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
      if (curr.getAttribute?.('is-searched') === 'false') return PLAYERS_CONFIG[curr.getAttribute?.('puuid')];
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

  function patch(root) {
    if (root._isPatching) return;
    root._isPatching = true;

    // 1. BANNIÈRES ET CREST
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
          }
        }
      }
    });

    // 2. TOOLTIPS (Synchronisation Last Season avec le fichier de la Banner)
    const pageConfig = getPageAuth();
    if (pageConfig) {
      root.querySelectorAll('.ranked-tooltip-queue, .style-profile-emblem-wrapper, .ranked-tooltip-last-season').forEach(block => {
        const blockConfig = getContextConf(block) || pageConfig;
        
        // On extrait le rang directement depuis le lien "banner" de la config
        const bannerTierU = getTierFromBanner(blockConfig.banner); // Ex: "CHALLENGER"
        const bannerTierL = bannerTierU.toLowerCase(); // Ex: "challenger"

        const isSoloDuo = block.textContent.includes('Solo/Duo') || block.querySelector('.style-profile-emblem-header-title')?.textContent.includes('Solo/Duo');
        const isLastSeason = block.classList.contains('ranked-tooltip-last-season');

        if (isSoloDuo || isLastSeason) {
          // Pour Last Season, on utilise le rang extrait de l'URL de la bannière
          const targetText = isLastSeason ? bannerTierU : blockConfig.text;
          const targetTierU = isLastSeason ? bannerTierU : blockConfig.tier.toUpperCase();
          const targetTierL = isLastSeason ? bannerTierL : blockConfig.tier.toLowerCase();

          // Texte du rang
          const txt = block.querySelector('.ranked-tooltip-queue-tier, .style-profile-emblem-header-subtitle');
          if (txt && txt.textContent !== targetText) txt.textContent = targetText;

          // LP (Uniquement Solo/Duo)
          if (isSoloDuo) {
            const lp = block.querySelector('.style-profile-ranked-crest-tooltip-lp');
            if (lp) lp.innerHTML = `<span>${blockConfig.wins}</span> Wins <span>${blockConfig.lp}</span> LP`;
          }

          // Emblèmes (Alignés sur le rang de la bannière si c'est Last Season)
          block.querySelectorAll('lol-regalia-emblem-element, .regalia-emblem').forEach(el => {
            const tier = el.tagName.includes('-') ? targetTierU : targetTierL;
            if (el.getAttribute('ranked-tier') !== tier) {
              el.setAttribute('ranked-tier', tier);
              if (el.tagName.includes('-')) el.setAttribute('ranked-division', blockConfig.div);
            }
          });
        }
      });
    }

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

  setInterval(() => patch(document), 60);
})();