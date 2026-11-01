// ============================================================
// script.js — Le COMPORTEMENT du site
// ============================================================


// ---------- 1. RÉGLAGES : la seule chose à modifier ici ----------
// Numéro WhatsApp d'Ô'tiramisu (07 19 24 57 25) : 225 + numéro, sans espace, sans "+" ni "00".
// ⚠️ Vérifie avec la dame que c'est bien ce numéro qui a WhatsApp.
const NUMERO_WHATSAPP = "2250719245725";


// ---------- 2. Petite fonction réutilisable ----------
// Une "fonction" = un bout de code qu'on écrit une fois et qu'on appelle quand on veut.
// Celle-ci reçoit un message et renvoie le lien WhatsApp correspondant.
function lienWhatsapp(message) {
  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}


// ---------- 3. Tous les liens WhatsApp simples ----------
// On cherche tous les éléments avec la classe "lien-whatsapp"
// et on leur donne le bon lien, avec le message écrit dans data-message.
document.querySelectorAll(".lien-whatsapp").forEach(function (lien) {
  lien.href = lienWhatsapp(lien.dataset.message);
  lien.target = "_blank";
  lien.rel = "noopener";
});


// ---------- 4. Menu burger (téléphone) ----------
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");

burger.addEventListener("click", function () {
  menu.classList.toggle("ouvert");
});

menu.querySelectorAll("a").forEach(function (a) {
  a.addEventListener("click", function () {
    menu.classList.remove("ouvert");
  });
});


// ---------- 5. Ombre sous l'en-tête quand on descend ----------
const entete = document.getElementById("entete");

window.addEventListener("scroll", function () {
  // window.scrollY = de combien de pixels on a descendu
  if (window.scrollY > 20) {
    entete.classList.add("defile");
  } else {
    entete.classList.remove("defile");
  }
});


// ---------- 6. Boutons "Choisir" des cartes ----------
// Quand on clique "Choisir" sur un parfum : on le sélectionne dans le formulaire
// et on fait défiler la page jusqu'au formulaire.
const champParfum = document.getElementById("parfum");

document.querySelectorAll(".choisir").forEach(function (bouton) {
  bouton.addEventListener("click", function () {
    champParfum.value = bouton.dataset.parfum;
    document.getElementById("commander").scrollIntoView();
    indiquerPersonnalise();
  });
});


// ---------- 6 bis. Tiramisu personnalisé ----------
// Si la personne choisit "Personnalisé", on l'invite à décrire son tiramisu dans le champ "détail".
const champMessage = document.getElementById("message");
const textePlaceholder = champMessage.placeholder; // on garde le texte d'origine

function indiquerPersonnalise() {
  if (champParfum.value === "Personnalisé") {
    champMessage.placeholder = "Décrivez votre tiramisu : parfums, décoration, message à écrire...";
    champMessage.required = true;   // la description devient obligatoire
  } else {
    champMessage.placeholder = textePlaceholder;
    champMessage.required = false;
  }
}
// "change" = quand la personne choisit une autre option dans la liste
champParfum.addEventListener("change", indiquerPersonnalise);


// ---------- 7. Afficher / cacher le champ adresse ----------
// Si la personne choisit "Retrait sur place", pas besoin d'adresse.
const zoneAdresse = document.getElementById("zone-adresse");

document.querySelectorAll('input[name="mode"]').forEach(function (radio) {
  radio.addEventListener("change", function () {
    if (radio.value === "Livraison") {
      zoneAdresse.style.display = "block";
    } else {
      zoneAdresse.style.display = "none";
    }
  });
});


// ---------- 8. Date minimum = aujourd'hui ----------
// On empêche de choisir une date déjà passée.
const champDate = document.getElementById("date");
champDate.min = new Date().toISOString().split("T")[0]; // donne "2026-10-31"


// ---------- 9. Envoi du formulaire → message WhatsApp ----------
const formulaire = document.getElementById("formulaire");

formulaire.addEventListener("submit", function (evenement) {
  // Par défaut, un formulaire recharge la page. preventDefault() l'en empêche.
  evenement.preventDefault();

  // On récupère ce que la personne a écrit (.value = le contenu d'un champ)
  const nom = document.getElementById("nom").value;
  const parfum = champParfum.value;
  const quantite = document.getElementById("quantite").value;
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const adresse = document.getElementById("adresse").value;
  const message = document.getElementById("message").value;

  // On transforme la date "2026-11-05" en "05/11/2026", plus lisible
  const date = champDate.value.split("-").reverse().join("/");

  // On construit le texte ligne par ligne. "\n" = retour à la ligne.
  let texte = `Bonjour Ô'tiramisu ! Je voudrais commander :\n\n`;
  texte += `Nom : ${nom}\n`;
  texte += `Parfum : ${parfum}\n`;
  texte += `Nombre de pots : ${quantite}\n`;
  texte += `Pour le : ${date}\n`;
  texte += `Mode : ${mode}`;

  // On ajoute l'adresse seulement si c'est une livraison et qu'elle est remplie
  if (mode === "Livraison" && adresse !== "") {
    texte += ` à ${adresse}`;
  }

  if (message !== "") {
    texte += `\nNote : ${message}`;
  }

  // On ouvre WhatsApp avec le message tout prêt
  window.open(lienWhatsapp(texte), "_blank");
});


// ---------- 10. Animation d'apparition au défilement ----------
// IntersectionObserver "surveille" les éléments et nous prévient
// quand ils entrent dans l'écran. On leur ajoute alors la classe "visible".
const observateur = new IntersectionObserver(function (elements) {
  elements.forEach(function (element) {
    if (element.isIntersecting) {
      element.target.classList.add("visible");
      observateur.unobserve(element.target); // on arrête de le surveiller
    }
  });
}, { threshold: 0.15 }); // 0.15 = quand 15% de l'élément est visible

document.querySelectorAll(".apparition").forEach(function (el) {
  observateur.observe(el);
});


// ---------- 11. Année automatique ----------
document.getElementById("annee").textContent = new Date().getFullYear();
