/* =========================================================
   NAMEFORGE — UNIVERSAL 21-STYLE CATALOG
   The same professional style selector is available on every generator.
========================================================= */
window.NameForgeStyles={
  list:[
    ['assassin',"🗡️ Assassin de l’ombre"],
    ['warrior',"⚔️ Guerrier héroïque"],
    ['high-elf',"🧝 Haut-Né Elfe"],
    ['dwarf-defender',"⛏️ Défenseur nain"],
    ['dragonkin',"🐉 Dragonkin"],
    ['orc-berserker',"🪓 Berserker orc"],
    ['dark-elf',"🏹 Elfe noir (Drow)"],
    ['demon-lord',"😈 Seigneur Démon"],
    ['seraph',"🪽 Séraphin angélique"],
    ['noble-vampire',"🦇 Noble Vampire"],
    ['fantasy-kingdom',"👑 Royaume fantastique"],
    ['fantasy-tavern',"🍺 Taverne Fantastique"],
    ['legendary-weapon',"⚔️ Arme légendaire"],
    ['arcane-mage',"🔮 Mage arcanique"],
    ['necromancer',"💀 Nécromancien"],
    ['samurai',"🌸 Samouraï"],
    ['ranger',"🏹 Rôdeur forestier"],
    ['celestial',"✨ Céleste mystique"],
    ['pirate',"🏴‍☠️ Pirate légendaire"],
    ['royal',"👑 Noble royal"],
    ['shadow-rogue',"🌑 Voleur des ombres"]
  ],
  aliases:{
    assassin:['ninja','rogue','dark','villain','hunter','demon'],
    warrior:['warrior','knight','hero','fighter','default'],
    'high-elf':['high','royal','elf','hero','magic'],
    'dwarf-defender':['dwarf','defender','warrior','knight','default'],
    dragonkin:['dragon','dragonkin','fire','ancient','default'],
    'orc-berserker':['orc','berserker','warrior','villain','default'],
    'dark-elf':['dark','shadow','darkelf','villain','rogue'],
    'demon-lord':['demon','dark','villain','darklord','default'],
    seraph:['angel','celestial','healer','royal','magic'],
    'noble-vampire':['noble','royal','vampire','ancient','default'],
    'fantasy-kingdom':['royal','kingdom','enchanted','default'],
    'fantasy-tavern':['tavern','fun','human','default'],
    'legendary-weapon':['weapon','warrior','samurai','knight','default'],
    'arcane-mage':['archmage','mage','magic','scholar','elemental','default'],
    necromancer:['dark','necromancer','villain','demon','default'],
    samurai:['samurai','warrior','hero','default'],
    ranger:['ranger','wood','hunter','rogue','default'],
    celestial:['celestial','magic','healer','royal','default'],
    pirate:['pirate','rogue','adventurer','fun','default'],
    royal:['royal','noble','kingdom','high','default'],
    'shadow-rogue':['rogue','ninja','dark','villain','default']
  },
  getOptions:function(){return this.list.map(function(x){return {key:x[0],label:x[1]};});},
  resolve:function(generator,key,data){
    var group=data&&data[generator]||{};
    var candidates=this.aliases[key]||[];
    for(var i=0;i<candidates.length;i++){if(group[candidates[i]]) return group[candidates[i]];}
    return group.default||Object.values(group)[0]||{label:key,icon:'✨',prefixes:['Ael'],suffixes:['dor'],descriptions:['A unique NameForge name.'],bestFor:'characters and fictional worlds'};
  }
};