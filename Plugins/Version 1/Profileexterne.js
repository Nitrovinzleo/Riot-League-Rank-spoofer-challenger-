(function () {
  'use strict';
  
  // === CONFIGURATION ===
  const config = {
    // Modifier ces valeurs pour changer le rang affiché
    rankedTier: 'CHALLENGER', // IRON, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, MASTER, GRANDMASTER, CHALLENGER
    rankedDivision: 'I', // I, II, III, IV
    summonerLevel: '467',
    crystalLevel: 'DIAMOND',
    prestigeCrestId: '23',
    rankedSplitReward: '0',
    crestType: 'ranked',
    
    // Configuration des assets
    bannerSrc: '/lol-game-data/assets/ASSETS/Regalia/BannerSkins/CHALLENGER.png',
    profileIcon: '/lol-game-data/assets/v1/profile-icons/29.jpg',
    
    // Configuration du script
    maxAttempts: 20,
    scanInterval: 300,
    enableLogging: true
  };

  // === UTILITAIRES ===
  function log(message) {
    if (config.enableLogging) {
      console.log('[RankLobby] ' + message);
    }
  }

  function isInsideOtherPlayer(el) {
    if (!el || !el.parentElement) return false;
    
    let current = el.parentElement;
    while (current) {
      if (current.classList && current.classList.contains('other-player')) {
        return true;
      }
      if (current.outerHTML && current.outerHTML.includes('other-player')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  function isValidElement(el) {
    return el && el.nodeType === Node.ELEMENT_NODE;
  }

  // === FONCTIONS DE PATCH ===
  function patchBanner(el) {
    if (!isValidElement(el) || isInsideOtherPlayer(el)) return false;

    if (el.tagName === 'IMG' && el.classList.contains('regalia-banner-asset-static-image')) {
      const currentSrc = el.getAttribute('src') || '';
      const targetBanner = `/lol-game-data/assets/ASSETS/Regalia/BannerSkins/${config.rankedTier}.png`;
      
      if (!currentSrc.includes(config.rankedTier.toLowerCase() + '.png')) {
        el.setAttribute('src', targetBanner);
        el.setAttribute('data-patched', 'true');
        log(`✅ Bannière remplacée par ${config.rankedTier}.png`);
        return true;
      }
    }
    return false;
  }

  function patchCrest(el) {
    if (!isValidElement(el) || isInsideOtherPlayer(el)) return false;

    const currentIcon = el.getAttribute('profile-icon-url');
    const currentLevel = el.getAttribute('summoner-level');

    log(`Patch crest sur élément: ${el.tagName}, icon: ${currentIcon}, level: ${currentLevel}`);

    // Appliquer les attributs du rang
    el.setAttribute('class', 'regalia-profile-crest-element regalia-crest-loaded');
    el.setAttribute('crest-sizing', 'huge');
    el.setAttribute('animations', 'true');
    el.setAttribute('crystal-level', config.crystalLevel);
    el.setAttribute('prestige-crest-id', config.prestigeCrestId);
    el.setAttribute('ranked-tier', config.rankedTier);
    el.setAttribute('ranked-division', config.rankedDivision);
    el.setAttribute('ranked-split-reward', config.rankedSplitReward);
    el.setAttribute('crest-type', config.crestType);

    // Appliquer l'icône si manquante
    if (!currentIcon || currentIcon.trim() === '') {
      el.setAttribute('profile-icon-url', config.profileIcon);
      log('✅ Icône manquante — appliquée par défaut');
    }

    // Appliquer le niveau si manquant
    if (!currentLevel || currentLevel.trim() === '') {
      el.setAttribute('summoner-level', config.summonerLevel);
      log('✅ Niveau manquant — appliqué par défaut');
    }

    el.setAttribute('data-patched', 'true');
    log(`✅ Crest modifié en ${config.rankedTier} ${config.rankedDivision}`);
    return true;
  }

  // === SCAN ET OBSERVATION ===
  function scanAndPatch(root) {
    if (!isValidElement(root)) return false;

    let patchedSomething = false;

    try {
      // Scanner les bannières
      const banners = root.querySelectorAll('img.regalia-banner-asset-static-image');
      banners.forEach(el => {
        if (patchBanner(el)) patchedSomething = true;
      });

      // Scanner les crests
      const crests = root.querySelectorAll('lol-regalia-crest-v2-element');
      crests.forEach(el => {
        if (patchCrest(el)) patchedSomething = true;
      });

      // Scanner les shadow roots
      const allElements = root.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.shadowRoot) {
          if (scanAndPatch(el.shadowRoot)) patchedSomething = true;
        }
      });

    } catch (error) {
      log(`❌ Erreur lors du scan: ${error.message}`);
    }

    return patchedSomething;
  }

  // === INITIALISATION ===
  function initialize() {
    log(`🚀 Initialisation avec rang: ${config.rankedTier} ${config.rankedDivision}`);

    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldScan = true;
        }
      });
      
      if (shouldScan) {
        scanAndPatch(document);
      }
    });

    // Démarrer l'observation
    observer.observe(document, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'src']
    });

    // Scan initial avec tentatives multiples
    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts++;
      const patched = scanAndPatch(document);
      
      if (!patched || attempts >= config.maxAttempts) {
        clearInterval(intervalId);
        log('🛠️ Scan initial terminé');
      }
    }, config.scanInterval);

    // Scan périodique pour les changements dynamiques
    setInterval(() => {
      scanAndPatch(document);
    }, 5000);

    log('✅ Script RankLobby chargé et actif');
  }

  // Démarrer le script
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
