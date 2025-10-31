const articleDetails = {
'tshirt': { 
 aliases: ['t shirt', 't-shirt'], // <-- Synonymes
 styles: ['oversize', 'oversize premium', 'regular premium', 'regular', 'enfant'], 
  prix: { 'oversize': 950, 'oversize premium': 1150, 'regular premium': 790, 'regular': 620, 'enfant': 620 } 
}, 'hoodie': { 
 	 display: 'Hoodie', 
 	 aliases: ['sweat'], // <-- Synonyme
 	 styles: ['premium', 'enfant', 'standard'], // <-- Corrigé (orma premium -> premium)
 	 prix: { 'premium': 1650, 'enfant': 1300, 'standard': 1260 }   },
 'jogging': { 
	 display: 'Jogging', 
 	 aliases: [],
 	 styles: ['oversize elastiqué', 'elastiqué normal', 'open leg'], 
 	 prix: { 'oversize elastiqué': 1180, 'elastiqué normal': 1200, 'open leg': 1200 } 
 },
 'sac a dos': { 
	 display: 'Sac à dos', 
 	 aliases: ['sacados', 'sac à dos'], // <-- Synonymes
 	 styles: ['standard', 'premium'], 
 	 prix: { 'standard': 1150, 'premium': 1220 } 
 },
 'autre': { 
	 display: 'Autre', 
	 aliases: [],
 	 styles: [], 
	 prix: {} 
}
};