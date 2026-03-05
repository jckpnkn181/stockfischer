import type { BotConfig } from '../types'

import kungenAvatar from '../assets/avatars/kungen.svg'
import helpernAvatar from '../assets/avatars/helpern.svg'
import kaptenenAvatar from '../assets/avatars/kaptenen.svg'
import zorroAvatar from '../assets/avatars/zorro.svg'
import spionenAvatar from '../assets/avatars/spionen.svg'
import mafiosoAvatar from '../assets/avatars/mafioso.svg'
import draculaAvatar from '../assets/avatars/dracula.svg'
import anonymAvatar from '../assets/avatars/anonym.svg'
import narrenAvatar from '../assets/avatars/narren.svg'
import piratenAvatar from '../assets/avatars/piraten.svg'
import dykarenAvatar from '../assets/avatars/dykaren.svg'
import lumberjackAvatar from '../assets/avatars/lumberjack.svg'
import nunnanAvatar from '../assets/avatars/nunnan.svg'
import monocleAvatar from '../assets/avatars/monocle.svg'
import buddahAvatar from '../assets/avatars/buddah.svg'
import clownenAvatar from '../assets/avatars/clownen.svg'
import doktornAvatar from '../assets/avatars/doktorn.svg'
import tomtenAvatar from '../assets/avatars/tomten.svg'
import mimeAvatar from '../assets/avatars/mime.svg'
import kaurAvatar from '../assets/avatars/kaur.svg'
import vikingenAvatar from '../assets/avatars/vikingen.svg'
import singhniAvatar from '../assets/avatars/singhni.svg'
import professornAvatar from '../assets/avatars/professorn.svg'
import damenAvatar from '../assets/avatars/damen.svg'
import drottningenAvatar from '../assets/avatars/drottningen.svg'

export const bots: BotConfig[] = [
  // Nybörjare
  { id: 'kungen', name: 'Kungen', rating: 250, category: 'Nybörjare', avatar: kungenAvatar },
  { id: 'helpern', name: 'Helpern', rating: 400, category: 'Nybörjare', avatar: helpernAvatar },
  { id: 'kaptenen', name: 'Kaptenen', rating: 550, category: 'Nybörjare', avatar: kaptenenAvatar },
  { id: 'zorro', name: 'Zorro', rating: 700, category: 'Nybörjare', avatar: zorroAvatar },
  { id: 'spionen', name: 'Spionen', rating: 850, category: 'Nybörjare', avatar: spionenAvatar },
  // Medelsvår
  { id: 'mafioso', name: 'Mafioso', rating: 1000, category: 'Medelsvår', avatar: mafiosoAvatar },
  { id: 'dracula', name: 'Dracula', rating: 1100, category: 'Medelsvår', avatar: draculaAvatar },
  { id: 'anonym', name: 'Anonym', rating: 1200, category: 'Medelsvår', avatar: anonymAvatar },
  { id: 'narren', name: 'Narren', rating: 1300, category: 'Medelsvår', avatar: narrenAvatar },
  { id: 'piraten', name: 'Piraten', rating: 1400, category: 'Medelsvår', avatar: piratenAvatar },
  { id: 'dykaren', name: 'Dykaren', rating: 1500, category: 'Medelsvår', avatar: dykarenAvatar },
  // Avancerad
  { id: 'lumberjack', name: 'Lumberjack', rating: 1600, category: 'Avancerad', avatar: lumberjackAvatar },
  { id: 'nunnan', name: 'Nunnan', rating: 1700, category: 'Avancerad', avatar: nunnanAvatar },
  { id: 'monocle', name: 'Monocle', rating: 1800, category: 'Avancerad', avatar: monocleAvatar },
  { id: 'buddah', name: 'Buddah', rating: 1900, category: 'Avancerad', avatar: buddahAvatar },
  // Expert
  { id: 'clownen', name: 'Clownen', rating: 2000, category: 'Expert', avatar: clownenAvatar },
  { id: 'doktorn', name: 'Doktorn', rating: 2100, category: 'Expert', avatar: doktornAvatar },
  { id: 'tomten', name: 'Tomten', rating: 2200, category: 'Expert', avatar: tomtenAvatar },
  { id: 'mime', name: 'Mime', rating: 2300, category: 'Expert', avatar: mimeAvatar },
  // Mästare
  { id: 'kaur', name: 'Kaur', rating: 2400, category: 'Mästare', avatar: kaurAvatar },
  { id: 'vikingen', name: 'Vikingen', rating: 2500, category: 'Mästare', avatar: vikingenAvatar },
  // Grandmaster
  { id: 'singhni', name: 'Singhni', rating: 2600, category: 'Grandmaster', avatar: singhniAvatar },
  { id: 'professorn', name: 'Professorn', rating: 2700, category: 'Grandmaster', avatar: professornAvatar },
  // Super Grandmaster
  { id: 'damen', name: 'Damen', rating: 2900, category: 'Super Grandmaster', avatar: damenAvatar },
  // Maximal
  { id: 'drottningen', name: 'Drottningen', rating: 3200, category: 'Maximal', avatar: drottningenAvatar },
]

export function botsByCategory() {
  const categories: BotConfig['category'][] = [
    'Nybörjare', 'Medelsvår', 'Avancerad', 'Expert',
    'Mästare', 'Grandmaster', 'Super Grandmaster', 'Maximal',
  ]
  return categories
    .map(category => ({
      category,
      bots: bots.filter(b => b.category === category),
    }))
    .filter(g => g.bots.length > 0)
}
