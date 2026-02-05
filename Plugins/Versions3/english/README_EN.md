# RANKMODIF - Rank Modification Plugin

## 📋 Description

RANKMODIF is a Pengu Loader plugin that allows modifying rank display in League of Legends using per-player configuration (PUUID). It supports banners, crests, tooltips, and LP/wins information.

## 🎯 Features

- **Per-player modification**: Individual configuration via PUUID
- **Custom banners**: Change rank banners
- **Complete crests**: Full crest attributes with animations
- **Enhanced tooltips**: Support Solo/Duo and Last Season
- **LP/Wins**: Custom wins and LP display
- **Aggressive method**: Robust rank element detection
- **Multi-language support**: Works in French and English

## ⚙️ Configuration

### 1. Find your PUUID

1. Go to your League of Legends profile
2. Press `Ctrl+Shift+I` (open developer tools)
3. Press `Ctrl+F` and search for `"puuid"`
4. Copy the found PUUID (ex: `f8cfb78f-66e6-5401-a710-02f1491b4c42`)

**Note**: If it's not your profile, search for the PUUID where `"is-searched"` is `false`.

### 2. Find banner links

Banner links can be found on CommunityDragon or used as follows:
```
/lol-game-data/assets/ASSETS/Regalia/BannerSkins/CHALLENGER.png
```

**Available ranks**: IRON, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, MASTER, GRANDMASTER, CHALLENGER

### 3. Configure players

Modify the `PLAYERS_CONFIG` section in the file:

```javascript
const PLAYERS_CONFIG = {
  "YOUR_PUUID": {
    tier: 'CHALLENGER',        // Rank (uppercase)
    div: "I",                  // Division (I, II, III, IV)
    text: 'Challenger',        // Displayed text
    wins: 327,                 // Number of wins
    lp: 1468,                  // League points
    banner: '/lol-game-data/assets/ASSETS/Regalia/BannerSkins/CHALLENGER.png'
  }, //  <--------DON'T FORGET THIS COMMA !!!!!!!!
  "OTHER_PUUID": {
    tier: 'GRANDMASTER',
    div: "I",
    text: 'Grandmaster',
    wins: 245,
    lp: 892,
    banner: '/lol-game-data/assets/ASSETS/Regalia/BannerSkins/GRANDMASTER.png'
  }
}
```

## 🚀 Installation

1. Place `RANKMODIF.js` in Pengu Loader's `plugins` folder
2. Configure your PUUIDs and ranks in the file
3. Restart League of Legends or reload the page
4. Changes will apply automatically

## 🔧 Configuration Options

### Rank Attributes

- `tier`: Main rank (ex: 'CHALLENGER')
- `div`: Division (I, II, III, IV or space for Master+)
- `text`: Displayed text (ex: 'Challenger')
- `wins`: Number of wins
- `lp`: League points
- `banner`: Banner URL

### Crest Attributes (automatic)

The plugin automatically adds:
- `crystal-level: 'DIAMOND'`
- `prestige-crest-id: '23'`
- `ranked-split-reward: '0'`
- `crest-sizing: 'huge'`
- `animations: 'true'`

## 🎮 Usage

### Modifying your profile

1. Find your PUUID as described above
2. Add your configuration in `PLAYERS_CONFIG`
3. The plugin will automatically detect your profile

### Modifying other profiles

1. Find the target player's PUUID
2. Add their configuration in `PLAYERS_CONFIG`
3. The plugin will apply changes when you visit their profile

### Last Season

Previous season rank is automatically deduced from the configured banner via the `getTierFromBanner()` function.

## 🐛 Troubleshooting

### Common Issues

**Rank not displaying correctly**
- Check that the PUUID is correct
- Ensure the comma is present after each configuration
- Verify that banner links are valid

**Tooltips not updating**
- Wait a few seconds (plugin uses intervals)
- Make sure you're on Solo/Duo

**Last Season not working**
- Check that your banner link matches the desired rank
- Last Season rank is automatically extracted from the banner filename

### Debug Mode

The plugin includes an aggressive method that searches all elements containing:
- `[class*="ranked"]`
- `[class*="rank"]`
- `[class*="emblem"]`
- `[class*="tier"]`

This ensures maximum rank element detection.

## ⚠️ Important Notes

- **Don't forget commas** between player configurations
- **PUUIDs must be in quotes**
- **Banner links must be valid**
- **Plugin works best with classic rank banners**
- **For non-classic banners, use RankedLobby.js**

## 🔄 Updates

The plugin automatically refreshes every 30ms to ensure quick application of changes.

## 📝 Complete Example

```javascript
//"PUUID (FOUND BY CTRL+SHIFT+I ON YOUR/THE PERSON'S PROFILE -> CTRL+F -> type 'PUUID'. IF NOT YOUR PROFILE SEARCH FOR THE ONE WHERE 'is-searched' IS FALSE": 
//'BANNER LINK (CAN BE FOUND ON COMMUNITYDRAGON) THE RANK OF THE BANNER CHANGES YOUR LAST SEASON RANK (MIGHT BE PROBLEMATIC WITH NON RANKED BANNERS : USE RANKEDLOBBY.JS)'

(function () {
  const PLAYERS_CONFIG = {
     //example of working profile
   "f8cfb78f-66e6-5401-a710-02f1491b4c42": {
      tier: 'Challenger',
      div: " ",
      text: 'Challenger',
      wins: 327,
      lp: 1468,
      banner:'/lol-game-data/assets/ASSETS/Regalia/BannerSkins/CHALLENGER.png'
   }, //  <--------DON'T FORGET THIS COMMA IF YOU PASTE MORE PROFILES !!!!!!!!!!!!
   "6c1fec8c-6741-5448-a1fa-5b9fc0afa6b4": {
      tier: 'Grandmaster',
      div: "I",
      text: 'Grandmaster',
      wins: 245,
      lp: 892,
      banner:'/lol-game-data/assets/ASSETS/Regalia/BannerSkins/GRANDMASTER.png'
   }
  }
  // ... rest of the code
})();
```

## 🔧 Advanced Configuration

### Multiple Players Support

The plugin supports unlimited players. Simply add more configurations:

```javascript
const PLAYERS_CONFIG = {
  "PLAYER1_PUUID": { tier: 'CHALLENGER', div: " ", text: 'Challenger', wins: 327, lp: 1468, banner: '...' },
  "PLAYER2_PUUID": { tier: 'GRANDMASTER', div: "I", text: 'Grandmaster', wins: 245, lp: 892, banner: '...' },
  "PLAYER3_PUUID": { tier: 'MASTER', div: " ", text: 'Master', wins: 156, lp: 423, banner: '...' }
}
```

### Banner Customization

You can use custom banner URLs from CommunityDragon:
- Find banner assets on CommunityDragon
- Copy the full URL path
- Update the `banner` field in your configuration

### Rank Display Options

- **Master+ ranks**: Use empty space for division (`div: " "`)
- **Lower ranks**: Use Roman numerals (`div: "I"`, `"II"`, `"III"`, `"IV"`)
- **Custom text**: Set any text in the `text` field

## 🎯 Tips & Tricks

1. **Test configurations**: Start with one player to verify setup
2. **Backup settings**: Keep a copy of your working configuration
3. **Check PUUIDs**: Double-check PUUIDs for accuracy
4. **Valid banners**: Ensure banner URLs are accessible
5. **Patience**: Allow a few seconds for changes to apply

## 🚀 Performance

- **Fast refresh**: 30ms update interval
- **Efficient detection**: Aggressive element scanning
- **Shadow DOM support**: Works with League's web components
- **Multi-language**: Automatic language detection

---

**Made with ❤️ for the League of Legends community**
