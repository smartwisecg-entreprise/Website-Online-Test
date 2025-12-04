// On importe les modules nécessaires de Node.js
const fs = require('fs'); // Pour interagir avec les fichiers (File System)
const path = require('path'); // Pour gérer les chemins de fichiers

// --- FONCTION UTILE ---
// Fonction pour transformer un titre en URL valide (ex: "Mon Titre" -> "mon-titre")
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Remplace les espaces par des -
        .replace(/[^\w\-]+/g, '')       // Enlève les caractères non valides
        .replace(/\-\-+/g, '-')         // Remplace plusieurs - par un seul
        .replace(/^-+/, '')             // Enlève les - au début
        .replace(/-+$/, '');            // Enlève les - à la fin
}

// --- SCRIPT PRINCIPAL ---
try {
    console.log('🚀 Démarrage de la génération des articles...');

    // 1. Définir les chemins
    const articlesJsonPath = path.join(__dirname, 'news.json');
    const templatePath = path.join(__dirname, 'template-article.html');
    const outputDir = path.join(__dirname, 'articles');

    // 2. Lire les fichiers sources
    const articlesData = JSON.parse(fs.readFileSync(articlesJsonPath, 'utf-8'));
    const templateHtml = fs.readFileSync(templatePath, 'utf-8');
    
    // S'assurer que le dossier de sortie existe
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // 3. Boucler sur chaque article et générer sa page
    articlesData.forEach(article => {
        // Formater la date comme dans votre script original
        const formattedDate = new Date(article.date).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Remplacer les marqueurs dans le template par les vraies données
        let articleHtml = templateHtml
            .replace(new RegExp('%%META_TITLE%%', 'g'), article.title_fr)
            // --- MODIFICATION APPLIQUÉE ICI ---
            // On utilise directement `article.image` car le chemin complet ("images/...") 
            // est maintenant défini dans le fichier news.json.
            // Cela évite de créer un chemin erroné comme "images/images/...".
            .replace(new RegExp('%%IMAGE_SRC%%', 'g'), article.image)
            .replace(new RegExp('%%TITLE%%', 'g'), article.title_fr)
            .replace(new RegExp('%%CATEGORY%%', 'g'), article.category_fr)
            .replace(new RegExp('%%DATE%%', 'g'), formattedDate)
            .replace(new RegExp('%%CONTENT%%', 'g'), article.content_fr);

        // 4. Créer le fichier HTML
        const slug = slugify(article.title_fr);
        const outputFilePath = path.join(outputDir, `${slug}.html`);
        fs.writeFileSync(outputFilePath, articleHtml);
        
        console.log(`✅ Article généré : ${slug}.html`);
    });

    console.log('🎉 Génération terminée avec succès !');

} catch (error) {
    console.error('❌ Une erreur est survenue lors de la génération des articles :');
    console.error(error);
}