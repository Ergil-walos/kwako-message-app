// ===========================================
// Importations Firebase depuis CDN (pour une utilisation directe sans npm/bundler)
// ===========================================
// Assurez-vous que la version (ici 10.12.0) est à jour ou celle que vous souhaitez utiliser.
// Vous pouvez trouver la dernière version sur https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, doc, getDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ===========================================
// Configuration Firebase (VOS VALEURS SPÉCIFIQUES)
// Ces valeurs proviennent de votre console Firebase
// ===========================================
const firebaseConfig = {
    apiKey: "AIzaSyD0C_7vwDA8zCXiZdQm2PLBd1grKOVvleY",
    authDomain: "kwako-2915d.firebaseapp.com",
    projectId: "kwako-2915d",
    storageBucket: "kwako-2915d.firebasestorage.app",
    messagingSenderId: "255153226540",
    appId: "1:255153226540:web:b32f2925e83f76dad72289",
    measurementId: "G-6FTVDTRFZM"
};

// ===========================================
// Initialisation de Firebase
// ===========================================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Référence à la collection 'messages' dans votre base de données Firestore
const messagesCollection = collection(db, "messages");


// ===========================================
// Votre code JavaScript principal
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements
    const creatorView = document.getElementById('creator-view');
    const linkView = document.getElementById('link-view');
    const recipientView = document.getElementById('recipient-view');

    const form = document.getElementById('wish-form');
    const nameInput = document.getElementById('recipient-name');
    const recipientPhotoInput = document.getElementById('recipient-photo');
    const photoPreviewText = document.getElementById('photo-preview-text');

    const kwakoSurpriseRadio = document.getElementById('kwako-surprise');
    const writeOwnRadio = document.getElementById('write-own');
    const kwakoOptionsGroup = document.getElementById('kwako-options');
    const customMessageGroup = document.getElementById('custom-message-group');
    const customMessageTextarea = document.getElementById('custom-message');

    const messageTypeSelect = document.getElementById('message-type');
    const themeSelect = document.getElementById('theme-select');
    const generatedLinkInput = document.getElementById('generated-link');
    const copyButton = document.getElementById('copy-button');
    const copyFeedback = document.getElementById('copy-feedback');

    const recipientTitle = document.getElementById('recipient-title');
    const displayedRecipientPhoto = document.getElementById('displayed-recipient-photo');
    const recipientPhotoContainer = document.getElementById('recipient-photo-container');
    const wishMessageContainer = document.getElementById('wish-message');

    const backgroundMusic = document.getElementById('background-music');
    const toggleMusicButton = document.getElementById('toggle-music-button');

    const downloadMessageButton = document.getElementById('download-message');
    const createNewMessageRecipientButton = document.getElementById('create-new-message-recipient');
    const createNewMessageLinkButton = document.getElementById('create-new-message');

    let base64Photo = '';

    const defaultMusicPath = 'audio/music.mp3';

    // MODIFICATION ICI : Chaque catégorie contient maintenant exactement 5 messages
    const messages = {
        love: [
            "Tu es mon étoile, celle qui guide mes nuits et illumine mes jours. ✨",
            "Dans le jardin de ma vie, tu es la plus belle des fleurs. 🌸",
            "Chaque moment passé avec toi est un trésor que je garde précieusement. 💖",
            "Ton sourire a le pouvoir d'effacer tous mes soucis. 😊",
            "Mon amour pour toi est plus vaste que l'océan et plus profond que le ciel. 💙"
        ],
        birthday: [
            "Joyeux anniversaire ! Que cette journée t'apporte joie, amour, et de merveilleux souvenirs. 🎂🎉",
            "Passe un très joyeux anniversaire ! Que tous tes vœux se réalisent. 🎁",
            "Un an de plus, une sagesse nouvelle, et toujours plus d'éclat. Joyeux anniversaire ! ✨",
            "Que cette journée spéciale soit remplie de rires, de cadeaux, et de tout ce qui te rend heureux(se). 😂🎁🥳",
            "Joyeux anniversaire à une personne incroyable ! Célèbre chaque moment. 🥂"
        ],
        friendship: [
            "Merci d'être un(e) ami(e) si précieux(se). Notre amitié est un cadeau. 🫂",
            "Les meilleurs amis sont rares, et je suis tellement chanceux(se) de t'avoir. 🌟",
            "À travers les hauts et les bas, tu es toujours là. Merci pour tout. 💪",
            "L'amitié, c'est un lien invisible qui nous unit. Heureux(se) de partager le mien avec toi. 🤗",
            "Que notre amitié continue de briller et de nous apporter tant de joie. 😄"
        ],
        family: [
            "La famille est le cœur de tout. Je suis reconnaissant(e) de t'avoir. ❤️🏡",
            "Dans cette famille, l'amour est notre plus grande force. 💖👨‍👩‍👧‍👦",
            "Des liens du sang aux liens du cœur, notre famille est unique et précieuse. 👨‍👩‍👧‍👦✨",
            "Merci pour les rires, le soutien et les souvenirs que nous partageons en famille. 😁🫶",
            "Tu es une partie essentielle de ma famille, et je t'envoie tout mon amour. 💕"
        ],
        encouragement: [
            "Crois en toi. Tu es plus fort(e) que tu ne le penses. ✨",
            "Chaque défi est une opportunité de grandir. Tiens bon ! 🚀",
            "N'abandonne jamais. Tes efforts finiront par payer. Persévère 💪",
            "Je crois en ton potentiel. Tu as tout ce qu'il faut pour réussir. 🌟",
            "Même les plus petits pas en avant sont des progrès. Continue d'avancer. 🚶‍♂️➡️"
        ]
    };

    // Router: Manages which view to display on page load
    const handleRouting = async () => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('id')) { // Vérifie si l'ID du message est présent
            const messageId = params.get('id');
            await displayWish(messageId); // Passe l'ID du message à displayWish
        } else {
            showView('creator-view');
        }
    };

    // Function to display a view and hide others
    const showView = (viewId) => {
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        if (viewId !== 'recipient-view' && !backgroundMusic.paused) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
            if (toggleMusicButton) {
                toggleMusicButton.textContent = '🎶 Activer la musique 🎶';
                toggleMusicButton.classList.remove('paused');
            }
        }
    };

    // Function to apply the visual theme
    const applyTheme = (themeName) => {
        document.body.className = '';
        if (themeName) {
            document.body.classList.add(`theme-${themeName}`);
        }
    };

    // Function to display the message to the recipient (MODIFIÉE POUR FIREBASE ET UN SEUL MESSAGE)
    const displayWish = async (messageId) => {
        try {
            const docSnap = await getDoc(doc(db, "messages", messageId)); // Récupère le document

            if (docSnap.exists()) {
                const messageData = docSnap.data(); // Récupère les données du message

                applyTheme(messageData.theme);

                recipientTitle.textContent = `Pour toi, ${messageData.name}...`;

                if (messageData.photo) {
                    displayedRecipientPhoto.src = messageData.photo;
                    recipientPhotoContainer.classList.remove('hidden');
                } else {
                    recipientPhotoContainer.classList.add('hidden');
                }

                wishMessageContainer.innerHTML = '';

                let messageToDisplay = ''; // Variable pour stocker le message unique

                if (messageData.mode === 'custom') {
                    messageToDisplay = messageData.customMessage;
                } else {
                    const selectedMessageTypeMessages = messages[messageData.type] || messages.love;
                    // MODIFICATION ICI : On récupère directement le message via son index unique
                    const messageIndex = messageData.contentIndex; // Renommé de contentIndexes à contentIndex
                    messageToDisplay = selectedMessageTypeMessages[messageIndex];
                }

                backgroundMusic.src = defaultMusicPath;
                backgroundMusic.load();

                // MODIFICATION ICI : Affichage d'un seul message avec l'effet de frappe
                const p = document.createElement('p');
                p.textContent = messageToDisplay;
                p.classList.add('typing-effect');
                wishMessageContainer.appendChild(p);

                p.addEventListener('animationend', () => {
                    p.classList.remove('typing-effect');
                });


                showView('recipient-view');

            } else {
                console.log("Aucun message trouvé pour cet ID ou message expiré !");
                alert("Oups ! Ce message n'existe plus ou a expiré.");
                showView('creator-view');
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du message depuis Firestore:", error);
            alert("Une erreur est survenue lors de la récupération du message.");
            showView('creator-view');
        }
    };

    // Handles recipient photo upload by the creator
    recipientPhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert("Veuillez sélectionner un fichier image.");
                base64Photo = '';
                photoPreviewText.textContent = 'Aucune photo sélectionnée';
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const MAX_WIDTH = 500;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                        if (width / MAX_WIDTH > height / MAX_HEIGHT) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        } else {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    base64Photo = canvas.toDataURL('image/jpeg', 0.7);
                    photoPreviewText.textContent = `Photo sélectionnée: ${file.name} (redimensionnée)`;
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            base64Photo = '';
            photoPreviewText.textContent = 'Aucune photo sélectionnée';
        }
    });

    // Handles message type selection (Kwako or custom)
    kwakoSurpriseRadio.addEventListener('change', () => {
        if (kwakoSurpriseRadio.checked) {
            kwakoOptionsGroup.classList.remove('hidden');
            customMessageGroup.classList.add('hidden');
            customMessageTextarea.removeAttribute('required');
            messageTypeSelect.setAttribute('required', 'required');
        }
    });

    writeOwnRadio.addEventListener('change', () => {
        if (writeOwnRadio.checked) {
            kwakoOptionsGroup.classList.add('hidden');
            customMessageGroup.classList.remove('hidden');
            customMessageTextarea.setAttribute('required', 'required');
            messageTypeSelect.removeAttribute('required');
        }
    });

    // Handles form submission (MODIFIÉE POUR FIREBASE ET UN SEUL MESSAGE)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const selectedTheme = themeSelect.value;
        const messageMode = document.querySelector('input[name="message-mode"]:checked').value;

        if (name === "") {
            alert("Veuillez entrer le nom du destinataire.");
            return;
        }

        let messageData = {
            name: name,
            mode: messageMode,
            theme: selectedTheme,
            timestamp: new Date()
        };

        if (base64Photo) {
            messageData.photo = base64Photo;
        }

        if (messageMode === 'surprise') {
            const selectedMessageType = messageTypeSelect.value;
            const availableMessages = messages[selectedMessageType];
            // Modification ICI : On s'assure qu'il y a au moins 5 messages pour choisir un unique index
            if (!availableMessages || availableMessages.length < 5) {
                alert("Pas assez de messages pour ce thème (il faut au moins 5 messages). Veuillez choisir un autre thème ou écrire votre propre message.");
                return;
            }

            // MODIFICATION ICI : Sélectionne un seul index aléatoire
            const randomIndex = Math.floor(Math.random() * availableMessages.length);
            
            messageData.type = selectedMessageType;
            messageData.contentIndex = randomIndex; // Stocke un seul index
        } else { // custom message
            const customMsg = customMessageTextarea.value.trim();
            if (customMsg === "") {
                alert("Veuillez écrire votre message personnalisé.");
                return;
            }
            messageData.customMessage = customMsg;
        }

        try {
            // Enregistrer le message dans Firestore
            const docRef = await addDoc(messagesCollection, messageData);
            const messageId = docRef.id; // Récupère l'ID unique généré par Firestore

            const baseURL = window.location.href.split('?')[0]; // Garde la base de l'URL
            const link = `${baseURL}?id=${messageId}`; // Le nouveau lien court avec l'ID

            generatedLinkInput.value = link;
            showView('link-view');
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du message dans Firestore:", error);
            alert("Impossible de créer le message. Veuillez réessayer.");
        }
    });

    // Handles the "Copy" button
    copyButton.addEventListener('click', () => {
        generatedLinkInput.select();
        generatedLinkInput.setSelectionRange(0, 99999);

        try {
            document.execCommand('copy');
            copyFeedback.textContent = 'Copié !';
            copyFeedback.classList.add('show');
            setTimeout(() => {
                copyFeedback.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Erreur de copie : ', err);
            copyFeedback.textContent = 'Échec de la copie.';
            copyFeedback.classList.add('show');
            setTimeout(() => {
                copyFeedback.classList.remove('show');
            }, 2000);
        }
    });

    // Handles the "Download This Message" button (html2canvas)
    downloadMessageButton.addEventListener('click', () => {
        toggleMusicButton.style.display = 'none';
        downloadMessageButton.style.display = 'none';
        if (createNewMessageRecipientButton) {
            createNewMessageRecipientButton.style.display = 'none';
        }

        html2canvas(recipientView, {
            scale: 2,
            useCORS: true
        }).then(canvas => {
            toggleMusicButton.style.display = 'block';
            downloadMessageButton.style.display = 'block';
            if (createNewMessageRecipientButton) {
                createNewMessageRecipientButton.style.display = 'block';
            }

            const link = document.createElement('a');
            link.download = 'message-kwako.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error("Erreur lors de la capture d'écran:", err);
            alert("Impossible de télécharger le message. Veuillez réessayer.");

            toggleMusicButton.style.display = 'block';
            downloadMessageButton.style.display = 'block';
            if (createNewMessageRecipientButton) {
                createNewMessageRecipientButton.style.display = 'block';
            }
        });
    });

    // Handles "Create New Message" button on the link view
    createNewMessageLinkButton.addEventListener('click', () => {
        showView('creator-view');
        form.reset();
        base64Photo = '';
        photoPreviewText.textContent = 'Aucune photo sélectionnée';
        kwakoSurpriseRadio.checked = true;
        kwakoSurpriseRadio.dispatchEvent(new Event('change'));
    });

    // Handles the new "Create New Message" button on the recipient view
    if (createNewMessageRecipientButton) {
        createNewMessageRecipientButton.addEventListener('click', () => {
            showView('creator-view');
            form.reset();
            base64Photo = '';
            photoPreviewText.textContent = 'Aucune photo sélectionnée';
            kwakoSurpriseRadio.checked = true;
            kwakoSurpriseRadio.dispatchEvent(new Event('change'));
        });
    }

    // Event for music control button
    if (toggleMusicButton) {
        toggleMusicButton.addEventListener('click', () => {
            if (backgroundMusic.paused) {
                backgroundMusic.volume = 0.5;
                backgroundMusic.play()
                    .then(() => {
                        toggleMusicButton.textContent = '⏸️ Mettre en pause';
                        toggleMusicButton.classList.remove('paused');
                    })
                    .catch(e => {
                        console.error("Erreur lors de la lecture de la musique:", e);
                        alert("Le navigateur a empêché la lecture automatique de la musique. Veuillez cliquer sur 'Activer la musique' une deuxième fois si le problème persiste.");
                    });
            } else {
                backgroundMusic.pause();
                toggleMusicButton.textContent = '🎶 Activer la musique 🎶';
                toggleMusicButton.classList.add('paused');
            }
        });
    }

    // Initialize form state on load
    kwakoSurpriseRadio.dispatchEvent(new Event('change'));

    // Start the router on load
    handleRouting();
});

// ... (début de votre script.js existant) ...

document.addEventListener('DOMContentLoaded', () => {
    // Select DOM elements (AJOUTEZ LES NOUVEAUX ÉLÉMENTS ICI)
    const creatorView = document.getElementById('creator-view');
    const linkView = document.getElementById('link-view');
    const recipientView = document.getElementById('recipient-view');

    const form = document.getElementById('wish-form');
    const nameInput = document.getElementById('recipient-name');
    const recipientPhotoInput = document.getElementById('recipient-photo');
    const photoPreviewText = document.getElementById('photo-preview-text');

    const kwakoSurpriseRadio = document.getElementById('kwako-surprise');
    const writeOwnRadio = document.getElementById('write-own');
    const kwakoOptionsGroup = document.getElementById('kwako-options');
    const customMessageGroup = document.getElementById('custom-message-group');
    const customMessageTextarea = document.getElementById('custom-message');

    const messageTypeSelect = document.getElementById('message-type');
    const themeSelect = document.getElementById('theme-select');
    const generatedLinkInput = document.getElementById('generated-link');
    const copyButton = document.getElementById('copy-button');
    const copyFeedback = document.getElementById('copy-feedback');

    // Nouveaux éléments pour les icônes de partage
    const shareWhatsappButton = document.getElementById('share-whatsapp');
    const shareFacebookButton = document.getElementById('share-facebook');
    const shareSmsButton = document.getElementById('share-sms');
    const shareTwitterButton = document.getElementById('share-twitter');
    const shareSnapchatButton = document.getElementById('share-snapchat'); // Note: Snapchat est plus complexe à partager directement via URL

    const recipientTitle = document.getElementById('recipient-title');
    const displayedRecipientPhoto = document.getElementById('displayed-recipient-photo');
    const recipientPhotoContainer = document.getElementById('recipient-photo-container');
    const wishMessageContainer = document.getElementById('wish-message');

    const backgroundMusic = document.getElementById('background-music');
    const toggleMusicButton = document.getElementById('toggle-music-button');

    const downloadMessageButton = document.getElementById('download-message');
    const createNewMessageRecipientButton = document.getElementById('create-new-message-recipient');
    const createNewMessageLinkButton = document.getElementById('create-new-message');

    let base64Photo = '';

    const defaultMusicPath = 'audio/music.mp3';

    // Votre tableau de messages (déjà mis à jour avec 5 messages par catégorie)
    const messages = {
        love: [
            "Tu es mon étoile, celle qui guide mes nuits et illumine mes jours. ✨",
            "Dans le jardin de ma vie, tu es la plus belle des fleurs. 🌸",
            "Chaque moment passé avec toi est un trésor que je garde précieusement. 💖",
            "Ton sourire a le pouvoir d'effacer tous mes soucis. 😊",
            "Mon amour pour toi est plus vaste que l'océan et plus profond que le ciel. 💙"
        ],
        birthday: [
            "Joyeux anniversaire ! Que cette journée t'apporte joie, amour, et de merveilleux souvenirs. 🎂🎉",
            "Passe un très joyeux anniversaire ! Que tous tes vœux se réalisent. 🎁",
            "Un an de plus, une sagesse nouvelle, et toujours plus d'éclat. Joyeux anniversaire ! ✨",
            "Que cette journée spéciale soit remplie de rires, de cadeaux, et de tout ce qui te rend heureux(se). 😂🎁🥳",
            "Joyeux anniversaire à une personne incroyable ! Célèbre chaque moment. 🥂"
        ],
        friendship: [
            "Merci d'être un(e) ami(e) si précieux(se). Notre amitié est un cadeau. 🫂",
            "Les meilleurs amis sont rares, et je suis tellement chanceux(se) de t'avoir. 🌟",
            "À travers les hauts et les bas, tu es toujours là. Merci pour tout. 💪",
            "L'amitié, c'est un lien invisible qui nous unit. Heureux(se) de partager le mien avec toi. 🤗",
            "Que notre amitié continue de briller et de nous apporter tant de joie. 😄"
        ],
        family: [
            "La famille est le cœur de tout. Je suis reconnaissant(e) de t'avoir. ❤️🏡",
            "Dans cette famille, l'amour est notre plus grande force. 💖👨‍👩‍👧‍👦",
            "Des liens du sang aux liens du cœur, notre famille est unique et précieuse. 👨‍👩‍👧‍👦✨",
            "Merci pour les rires, le soutien et les souvenirs que nous partageons en famille. 😁🫶",
            "Tu es une partie essentielle de ma famille, et je t'envoie tout mon amour. 💕"
        ],
        encouragement: [
            "Crois en toi. Tu es plus fort(e) que tu ne le penses. ✨",
            "Chaque défi est une opportunité de grandir. Tiens bon ! 🚀",
            "N'abandonne jamais. Tes efforts finiront par payer. Persévère 💪",
            "Je crois en ton potentiel. Tu as tout ce qu'il faut pour réussir. 🌟",
            "Même les plus petits pas en avant sont des progrès. Continue d'avancer. 🚶‍♂️➡️"
        ]
    };

    // ... (Reste de votre code existant : handleRouting, showView, applyTheme, displayWish, etc.) ...

    // Fonction pour ouvrir une fenêtre de partage
    const openShareWindow = (url) => {
        window.open(url, '_blank', 'width=600,height=400');
    };

    // Écouteurs d'événements pour les boutons de partage
    if (shareWhatsappButton) {
        shareWhatsappButton.addEventListener('click', (e) => {
            e.preventDefault();
            const link = generatedLinkInput.value;
            const message = `Regarde le message surprise Kwako que je t'ai envoyé ! 🎁\n${link}`;
            openShareWindow(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`);
        });
    }

    if (shareFacebookButton) {
        shareFacebookButton.addEventListener('click', (e) => {
            e.preventDefault();
            const link = generatedLinkInput.value;
            // Utilisez l'URL de partage de Facebook pour les liens
            openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`);
        });
    }

    if (shareSmsButton) {
        shareSmsButton.addEventListener('click', (e) => {
            e.preventDefault();
            const link = generatedLinkInput.value;
            const message = `Voici ton message surprise Kwako ! ${link}`;
            // Utilise 'sms:' pour Android/iOS. 'body' est pour le message.
            window.location.href = `sms:?body=${encodeURIComponent(message)}`;
        });
    }

    if (shareTwitterButton) { // Renommé pour X/Twitter
        shareTwitterButton.addEventListener('click', (e) => {
            e.preventDefault();
            const link = generatedLinkInput.value;
            const text = `Découvre ton message surprise Kwako ! #KwakoApp`;
            openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`);
        });
    }

    // Pour Snapchat, le partage direct via URL est très limité et ne permet pas d'ouvrir l'appli avec un contenu précis.
    // L'icône renverra juste vers le site de Snapchat ou l'utilisateur devra copier-coller.
    // Vous pouvez laisser le href existant vers snapchat.com ou ne pas ajouter de logique spécifique ici.
    // Si vous souhaitez une interaction plus profonde, cela nécessiterait des SDK spécifiques à Snapchat, qui ne sont pas pour le web standard.

    // ... (Reste de votre code existant : handleRouting, showView, applyTheme, displayWish, etc.
    // jusqu'à la fin de document.addEventListener('DOMContentLoaded', ...) ) ...

});