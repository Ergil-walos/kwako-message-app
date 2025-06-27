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
    // Nouveau bouton spécifique pour "Créer un nouveau message" sur la page du destinataire
    const createNewMessageRecipientButton = document.getElementById('create-new-message-recipient');
    // Le bouton existant pour "Créer un nouveau message" sur la page du lien
    const createNewMessageLinkButton = document.getElementById('create-new-message');

    let base64Photo = '';

    // Define the single music file path for all categories
    const defaultMusicPath = 'audio/music.mp3'; // Path to your music.mp3 file

    // Database of messages by theme with emojis
    const messages = {
        love: [
            "Tu es mon étoile, celle qui guide mes nuits et illumine mes jours. ✨",
            "Dans le jardin de ma vie, tu es la plus belle des fleurs. 🌸",
            "Chaque moment passé avec toi est un trésor que je garde précieusement. 💖",
            "Ton sourire a le pouvoir d'effacer tous mes soucis. 😊",
            "Être avec toi, c'est comme écouter la plus douce des mélodies. 🎶",
            "Tu as transformé mon monde en un conte de fées. 🧚‍♀️",
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
            "N'abandonne jamais. Tes efforts finiront par payer. Persevere 💪",
            "Je crois en ton potentiel. Tu as tout ce qu'il faut pour réussir. 🌟",
            "Même les plus petits pas en avant sont des progrès. Continue d'avancer. 🚶‍♂️➡️"
        ]
    };

    // Router: Manages which view to display on page load
    const handleRouting = () => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('n') && params.has('mode') && params.has('c')) {
            const messageMode = atob(params.get('mode'));
            if ((messageMode === 'surprise' && params.has('m') && params.has('t')) ||
                (messageMode === 'custom' && params.has('msg'))) {
                displayWish(params);
            } else {
                showView('creator-view');
            }
        } else {
            showView('creator-view');
        }
    };

    // Function to display a view and hide others
    const showView = (viewId) => {
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        // If exiting the recipient view, pause music and reset button
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

    // Function to display the message to the recipient
    const displayWish = (params) => {
        const name = atob(params.get('n'));
        const messageMode = atob(params.get('mode'));
        const theme = atob(params.get('c'));
        const photoData = params.has('p') ? atob(params.get('p')) : '';

        applyTheme(theme);

        recipientTitle.textContent = `Pour toi, ${name}...`;

        // Show/hide the photo container based on photo data
        if (photoData) {
            displayedRecipientPhoto.src = photoData;
            recipientPhotoContainer.classList.remove('hidden'); // Show the container
        } else {
            recipientPhotoContainer.classList.add('hidden'); // Hide the container
        }

        // Clear previous messages
        wishMessageContainer.innerHTML = '';

        let messagesToDisplay = [];

        if (messageMode === 'custom') {
            const customMessage = atob(params.get('msg'));
            messagesToDisplay = customMessage.split('\n').filter(Boolean);
        } else {
            const messageType = atob(params.get('t'));
            const messageIndexes = atob(params.get('m')).split(',');
            const selectedMessageTypeMessages = messages[messageType] || messages.love;
            messagesToDisplay = messageIndexes.map(index => selectedMessageTypeMessages[parseInt(index)]);
        }

        // Set unique music source
        backgroundMusic.src = defaultMusicPath;
        backgroundMusic.load(); // Reload audio source

        messagesToDisplay.forEach((msg, i) => {
            setTimeout(() => {
                const p = document.createElement('p');
                p.textContent = msg;
                // Add a class that can be animated by CSS for the typing effect
                p.classList.add('typing-effect');
                wishMessageContainer.appendChild(p);

                // When the animation ends, remove the typing class to stop cursor
                p.addEventListener('animationend', () => {
                    p.classList.remove('typing-effect');
                });
            }, i * 3000); // 3 seconds delay for each message
        });

        showView('recipient-view');
    };

    // Handles recipient photo upload by the creator
    // CORRECTION : Ajout de la logique de redimensionnement de l'image
    recipientPhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // Vérifier si le fichier est une image
            if (!file.type.startsWith('image/')) {
                alert("Veuillez sélectionner un fichier image.");
                base64Photo = '';
                photoPreviewText.textContent = 'Aucune photo sélectionnée';
                event.target.value = ''; // Réinitialise l'input file pour permettre une nouvelle sélection
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Définir les dimensions maximales pour l'image redimensionnée
                    const MAX_WIDTH = 500; // Largeur max en pixels
                    const MAX_HEIGHT = 400; // Hauteur max en pixels
                    let width = img.width;
                    let height = img.height;

                    // Redimensionner si l'image dépasse les dimensions maximales
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

                    // Convertir en Base64 JPEG avec une qualité de 70% pour une bonne compression
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

    // Handles form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const selectedTheme = themeSelect.value;
        const messageMode = document.querySelector('input[name="message-mode"]:checked').value;

        if (name === "") {
            alert("Veuillez entrer le nom du destinataire.");
            return;
        }

        let encodedContent = '';
        let encodedMessageTypeOrMode = '';

        if (messageMode === 'surprise') {
            const selectedMessageType = messageTypeSelect.value;
            const availableMessages = messages[selectedMessageType];
            if (!availableMessages || availableMessages.length < 3) {
                alert("Pas assez de messages pour ce thème. Veuillez choisir un autre thème ou écrire votre propre message.");
                return;
            }

            const selectedMessageIndexes = new Set();
            while(selectedMessageIndexes.size < 3) {
                const randomIndex = Math.floor(Math.random() * availableMessages.length);
                selectedMessageIndexes.add(randomIndex);
            }
            encodedContent = btoa(Array.from(selectedMessageIndexes).join(','));
            encodedMessageTypeOrMode = btoa(selectedMessageType);
        } else { // custom message
            const customMsg = customMessageTextarea.value.trim();
            if (customMsg === "") {
                alert("Veuillez écrire votre message personnalisé.");
                return;
            }
            encodedContent = btoa(customMsg);
            encodedMessageTypeOrMode = btoa('custom');
        }

        const encodedName = btoa(name);
        const encodedTheme = btoa(selectedTheme);
        // base64Photo contient déjà la version redimensionnée si une photo a été sélectionnée
        const encodedPhoto = base64Photo ? btoa(base64Photo) : ''; 

        const baseURL = window.location.href.split('?')[0];
        let link = `${baseURL}?n=${encodedName}&mode=${btoa(messageMode)}&c=${encodedTheme}&t=${encodedMessageTypeOrMode}`;

        if (messageMode === 'surprise') {
            link += `&m=${encodedContent}`;
        } else {
            link += `&msg=${encodedContent}`;
        }

        if (encodedPhoto) {
            link += `&p=${encodedPhoto}`;
        }

        generatedLinkInput.value = link;
        showView('link-view');
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
        // Temporarily hide buttons on the recipient view for capture
        toggleMusicButton.style.display = 'none';
        downloadMessageButton.style.display = 'none';
        if (createNewMessageRecipientButton) {
            createNewMessageRecipientButton.style.display = 'none';
        }

        html2canvas(recipientView, {
            scale: 2,
            useCORS: true
        }).then(canvas => {
            // Restore button display
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

            // Restore button display even on error
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
        kwakoSurpriseRadio.dispatchEvent(new Event('change')); // Trigger change to show Kwako options
    });

    // Handles the new "Create New Message" button on the recipient view
    if (createNewMessageRecipientButton) {
        createNewMessageRecipientButton.addEventListener('click', () => {
            showView('creator-view');
            form.reset();
            base64Photo = '';
            photoPreviewText.textContent = 'Aucune photo sélectionnée';
            kwakoSurpriseRadio.checked = true;
            kwakoSurpriseRadio.dispatchEvent(new Event('change')); // Trigger change to show Kwako options
        });
    }

    // Event for music control button
    if (toggleMusicButton) {
        toggleMusicButton.addEventListener('click', () => {
            if (backgroundMusic.paused) {
                backgroundMusic.volume = 0.5; // Default volume
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