// ============================================================
// script.js — Le COMPORTEMENT du site
// ============================================================


// ---------- 1. RÉGLAGES : les seules choses à modifier ici ----------
// Numéro WhatsApp d'Ô'tiramisu (07 19 24 57 25) : 225 + numéro, sans espace, sans "+" ni "00".
// ⚠️ Vérifie avec la dame que c'est bien ce numéro qui a WhatsApp.
const NUMERO_WHATSAPP = "2250719245725";
const PRIX_POT = 1000; // prix d'un pot en FCFA


// ---------- 2. Petites fonctions réutilisables ----------
// Fabrique le lien WhatsApp avec un message déjà écrit.
function lienWhatsapp(message) {
  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

// Écrit un nombre avec un espace tous les 3 chiffres : 12000 -> "12 000"
function formaterPrix(nombre) {
  return String(nombre).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// "1 pot" ou "3 pots" : on ajoute un s seulement au pluriel
function texteNombrePots(n) {
  return n + (n > 1 ? " pots" : " pot");
}


// ---------- 3. Tous les liens WhatsApp simples ----------
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
  entete.classList.toggle("defile", window.scrollY > 20);
});


// ============================================================
// ---------- 6. LE PANIER ----------
// Le panier est un "objet" : pour chaque parfum, le nombre de pots.
// Exemple : { "Oreo": 3, "Mangue": 2 }
// ============================================================
let panier = {};

// La liste des parfums est lue directement sur les cartes de la carte :
// si tu ajoutes une carte dans index.html, elle apparaît toute seule dans le panier.
const parfums = Array.from(document.querySelectorAll(".carte .compteur")).map(function (c) {
  return c.dataset.parfum;
});

// 6a. On remplit le panier du formulaire : une ligne par parfum, avec son compteur.
const zonePanier = document.getElementById("panier");
parfums.forEach(function (parfum) {
  const ligne = document.createElement("div");   // on crée un nouvel élément HTML
  ligne.className = "panier-ligne";
  ligne.innerHTML = `
    <span class="panier-nom">${parfum}</span>
    <div class="compteur" data-parfum="${parfum}">
      <button type="button" class="moins" aria-label="Retirer un pot ${parfum}">−</button>
      <span class="nombre">0</span>
      <button type="button" class="plus" aria-label="Ajouter un pot ${parfum}">+</button>
    </div>`;
  zonePanier.appendChild(ligne);                 // on l'ajoute dans la page
});

// 6b. Mémoriser le panier dans le navigateur, pour le retrouver si la page est rechargée.
// try/catch : si le navigateur refuse (navigation privée), on continue sans mémoriser.
function sauvegarderPanier() {
  try { localStorage.setItem("panier-otiramisu", JSON.stringify(panier)); } catch (e) {}
}
function chargerPanier() {
  try {
    const enregistre = JSON.parse(localStorage.getItem("panier-otiramisu"));
    if (enregistre) panier = enregistre;
  } catch (e) {}
  // on retire les parfums qui n'existent plus sur la carte
  Object.keys(panier).forEach(function (p) {
    if (!parfums.includes(p)) delete panier[p];
  });
}

// 6c. Ajouter ou retirer un pot
function changerQuantite(parfum, difference) {
  const nouveau = (panier[parfum] || 0) + difference;
  if (nouveau <= 0) {
    delete panier[parfum];          // 0 pot = on enlève le parfum du panier
  } else {
    panier[parfum] = Math.min(nouveau, 99);
  }
  sauvegarderPanier();
  afficherPanier();
}

// 6d. Calculer le nombre total de pots
function totalPots() {
  return Object.values(panier).reduce(function (somme, n) { return somme + n; }, 0);
}

// 6e. Mettre à jour tout ce qui affiche le panier (cartes, formulaire, barre)
const champMessage = document.getElementById("message");
const textePlaceholder = champMessage.placeholder;

function afficherPanier() {
  // les compteurs (il y en a 2 par parfum : sur la carte et dans le formulaire)
  document.querySelectorAll(".compteur").forEach(function (c) {
    const n = panier[c.dataset.parfum] || 0;
    c.querySelector(".nombre").textContent = n;
    c.classList.toggle("actif", n > 0);          // le compteur devient doré
    const carte = c.closest(".carte");
    if (carte) carte.classList.toggle("choisie", n > 0);
  });

  const n = totalPots();
  const texte = `${texteNombrePots(n)} · ${formaterPrix(n * PRIX_POT)} FCFA`;
  document.getElementById("total").textContent = texte;
  document.getElementById("barre-texte").textContent = texte;
  document.getElementById("barre-panier").hidden = n === 0;
  document.body.classList.toggle("avec-panier", n > 0);


  if (n > 0) document.getElementById("panier-erreur").hidden = true;

  // Tiramisu personnalisé : on demande au client de le décrire
  if (panier["Personnalisé"]) {
    champMessage.placeholder = "Décrivez votre tiramisu personnalisé : parfums, décoration, message à écrire...";
    champMessage.required = true;
  } else {
    champMessage.placeholder = textePlaceholder;
    champMessage.required = false;
  }
}

// 6f. Un seul "écouteur" pour TOUS les boutons + et − de la page.
// closest() remonte jusqu'au bouton, puis jusqu'au compteur pour lire le parfum.
document.addEventListener("click", function (evenement) {
  const bouton = evenement.target.closest(".plus, .moins");
  if (!bouton) return;                       // le clic n'était pas sur un + ou un −
  const parfum = bouton.closest(".compteur").dataset.parfum;
  changerQuantite(parfum, bouton.classList.contains("plus") ? 1 : -1);
});

chargerPanier();
afficherPanier();


// ---------- 7. Cacher la barre du panier quand on est déjà sur le formulaire ----------
const sectionCommande = document.getElementById("commander");
new IntersectionObserver(function (elements) {
  document.body.classList.toggle("sur-formulaire", elements[0].isIntersecting);
}, { threshold: 0.2 }).observe(sectionCommande);


// ---------- 8. Afficher / cacher le champ adresse ----------
const zoneAdresse = document.getElementById("zone-adresse");
document.querySelectorAll('input[name="mode"]').forEach(function (radio) {
  radio.addEventListener("change", function () {
    zoneAdresse.style.display = radio.value === "Livraison" ? "block" : "none";
  });
});


// ---------- 9. Date minimum = aujourd'hui ----------
const champDate = document.getElementById("date");
champDate.min = new Date().toISOString().split("T")[0];


// ---------- 10. Envoi du formulaire → message WhatsApp ----------
document.getElementById("formulaire").addEventListener("submit", function (evenement) {
  evenement.preventDefault();   // empêche la page de se recharger

  // Panier vide : on affiche le message d'erreur et on s'arrête là
  if (totalPots() === 0) {
    const erreur = document.getElementById("panier-erreur");
    erreur.hidden = false;
    erreur.scrollIntoView({ block: "center" });
    return;
  }

  const nom = document.getElementById("nom").value;
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const adresse = document.getElementById("adresse").value;
  const message = champMessage.value;
  const date = champDate.value.split("-").reverse().join("/");   // "2026-11-05" -> "05/11/2026"

  let texte = `Bonjour Ô'tiramisu ! Je voudrais commander :\n\n`;
  // une ligne par parfum, dans l'ordre de la carte
  parfums.forEach(function (parfum) {
    if (panier[parfum]) texte += `${panier[parfum]} × ${parfum}\n`;
  });
  texte += `\nTotal : ${texteNombrePots(totalPots())}, ${formaterPrix(totalPots() * PRIX_POT)} FCFA\n\n`;
  texte += `Nom : ${nom}\n`;
  texte += `Pour le : ${date}\n`;
  texte += `Mode : ${mode}`;
  if (mode === "Livraison" && adresse !== "") texte += ` à ${adresse}`;
  if (message !== "") texte += `\nNote : ${message}`;

  window.open(lienWhatsapp(texte), "_blank");
});


// ---------- 11. Animation d'apparition au défilement ----------
const observateur = new IntersectionObserver(function (elements) {
  elements.forEach(function (element) {
    if (element.isIntersecting) {
      element.target.classList.add("visible");
      observateur.unobserve(element.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".apparition").forEach(function (el) {
  observateur.observe(el);
});


// ---------- 12. Année automatique ----------
document.getElementById("annee").textContent = new Date().getFullYear();
