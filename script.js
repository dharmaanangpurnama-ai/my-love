document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const nameInput = document.getElementById('nameInput');
    const loadingScreen = document.getElementById('loadingScreen');
    const screen1 = document.getElementById('screen1');
    const screen2 = document.getElementById('screen2');
    const displayName = document.getElementById('displayName');
    const bgMusic = document.getElementById('bgMusic');
    const backgroundContainer = document.querySelector('.background-container');
    const loadingProgress = document.getElementById('loadingProgress');

    let mediaList = [];
    
    // Create floating hearts background
    function createHearts() {
        for (let i = 0; i < 35; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            
            // Random properties for natural look
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDelay = Math.random() * 10 + 's';
            
            const duration = Math.random() * 10 + 8; // 8 to 18 seconds
            heart.style.setProperty('--duration', duration + 's');
            
            const scale = Math.random() * 0.6 + 0.4; // 0.4 to 1.0
            heart.style.setProperty('--scale', scale);
            
            backgroundContainer.appendChild(heart);
        }
    }

    createHearts();

    // Preload Media Logic
    function preloadAll() {
        const maxItems = 50; // Check up to 50 files
        let checked = 0;
        let validMedia = [];
        
        for (let i = 1; i <= maxItems; i++) {
            let resolved = false;
            const exts = ['.jpg', '.jpeg', '.png', '.mp4'];
            let currentExtIndex = 0;

            function checkNextExt() {
                if (currentExtIndex >= exts.length) {
                    if (!resolved) {
                        resolved = true;
                        checkDone();
                    }
                    return;
                }

                const ext = exts[currentExtIndex];
                const src = `assets/${i}${ext}`;

                if (ext === '.mp4') {
                    const vid = document.createElement('video');
                    vid.src = src;
                    vid.preload = 'auto';
                    
                    vid.onloadeddata = () => {
                        if (!resolved) {
                            resolved = true;
                            validMedia.push({ index: i, type: 'video', src: src });
                            checkDone();
                        }
                    };
                    
                    vid.onerror = () => {
                        if (!resolved) {
                            currentExtIndex++;
                            checkNextExt();
                        }
                    };
                    
                    // Fallback timeout for video load
                    setTimeout(() => {
                        if (!resolved) {
                            currentExtIndex++;
                            checkNextExt();
                        }
                    }, 1000); 
                } else {
                    const img = new Image();
                    img.src = src;
                    
                    img.onload = () => {
                        if (!resolved) {
                            resolved = true;
                            validMedia.push({ index: i, type: 'image', src: src });
                            checkDone();
                        }
                    };
                    
                    img.onerror = () => {
                        if (!resolved) {
                            currentExtIndex++;
                            checkNextExt();
                        }
                    };
                }
            }

            checkNextExt();
        }
        
        function checkDone() {
            checked++;
            
            // Update progress bar
            const progress = (checked / maxItems) * 100;
            loadingProgress.style.width = progress + '%';
            
            if (checked === maxItems) {
                // Sort validMedia by index so it plays in order
                validMedia.sort((a, b) => a.index - b.index);
                mediaList = validMedia;
                
                setTimeout(() => {
                    loadingScreen.classList.remove('active');
                    screen1.classList.add('active');
                }, 1000); // Wait 1s after reaching 100%
            }
        }
    }

    // Start preloading immediately
    preloadAll();

    startBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name === '') {
            alert('Isi namamu dulu ya biar spesial...');
            return;
        }

        displayName.textContent = name;
        
        // Play romantic background music
        bgMusic.volume = 0.6;
        bgMusic.play().catch(e => console.log("Autoplay blocked:", e));

        // Smooth transition to screen 2
        screen1.classList.remove('active');
        setTimeout(() => {
            screen2.classList.add('active');
            startStory();
        }, 1500); // Wait 1.5s for fade out before starting story
    });

    // Support for Enter key
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startBtn.click();
        }
    });

    function startStory() {
        const texts = document.querySelectorAll('.hidden-text');
        const photoContainer = document.getElementById('photoContainer');
        const storyImage = document.getElementById('storyImage');
        const storyVideo = document.getElementById('storyVideo');
        let currentIdx = 0;
        let currentMediaIdx = 0;

        function showNextMedia() {
            if (mediaList.length === 0) {
                photoContainer.classList.remove('show');
                setTimeout(() => {
                    photoContainer.style.display = 'none';
                }, 1500);
                return;
            }

            const media = mediaList[currentMediaIdx % mediaList.length];
            currentMediaIdx++;

            // Only animate and change if the source actually changed
            if (photoContainer.dataset.currentSrc !== media.src) {
                photoContainer.dataset.currentSrc = media.src;
                photoContainer.classList.remove('show');
                
                setTimeout(() => {
                    if (media.type === 'image') {
                        storyVideo.style.display = 'none';
                        storyVideo.pause();
                        storyImage.src = media.src;
                        storyImage.style.display = 'block';
                    } else {
                        storyImage.style.display = 'none';
                        storyVideo.src = media.src;
                        storyVideo.style.display = 'block';
                        storyVideo.play().catch(e => console.log(e));
                    }
                    
                    photoContainer.style.display = 'block';
                    setTimeout(() => {
                        photoContainer.classList.add('show');
                    }, 50);
                }, 800);
            }
        }

        function showNextText() {
            if (currentIdx >= texts.length) return;

            showNextMedia(); // Update photo/video to next sequential media

            const text = texts[currentIdx];
            text.style.display = 'block';
            
            // Allow DOM to update display:block before fading in
            setTimeout(() => {
                text.classList.add('show');
            }, 50);

            // Calculate reading duration based on text length
            const textLength = text.textContent.trim().length;
            // Base time 2.5s + 65ms per character. Minimum 4 seconds.
            const readingDuration = Math.max(4000, 2500 + (textLength * 65));

            // Wait, then fade out and show next
            setTimeout(() => {
                // If it's not the last text, fade it out
                if (currentIdx < texts.length - 1) {
                    text.classList.remove('show');
                    
                    // Wait for fade out animation (2s) to complete
                    setTimeout(() => {
                        text.style.display = 'none';
                        currentIdx++;
                        showNextText();
                    }, 2000); 
                }
            }, readingDuration); // Dynamic duration based on text length
        }

        // Start showing text after a short initial delay
        setTimeout(showNextText, 1000);
    }
});
