// Bible Teacher Searcher - JavaScript

// DOM Elements
const bookSelect = document.getElementById('bookSelect');
const chapterSelect = document.getElementById('chapterSelect');
const verseSelect = document.getElementById('verseSelect');
const searchBtn = document.getElementById('searchBtn');
const readChapterBtn = document.getElementById('readChapterBtn');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultsDiv = document.getElementById('results');
const translationSelect = document.getElementById('translationSelect');
const addTranslationBtn = document.getElementById('addTranslationBtn');
const activeTranslationsDiv = document.getElementById('activeTranslations');

// Translation IDs and names
const translationNames = {
    kjv: { name: 'King James Version', lang: 'English' },
    dra: { name: 'Douay-Rheims 1899', lang: 'English' },
    clementine: { name: 'Clementine Latin Vulgate', lang: 'Latin' },
    cherokee: { name: 'Cherokee New Testament', lang: 'Cherokee' },
    cuv: { name: 'Chinese Union Version', lang: 'Chinese' },
    bkr: { name: 'Bible kralická', lang: 'Czech' },
    asv: { name: 'American Standard Version (1901)', lang: 'English' },
    bbe: { name: 'Bible in Basic English', lang: 'English' },
    darby: { name: 'Darby Bible', lang: 'English' },
    web: { name: 'World English Bible', lang: 'English' },
    ylt: { name: "Young's Literal Translation", lang: 'English' },
    'oeb-cw': { name: 'Open English Bible (Commonwealth)', lang: 'English (UK)' },
    webbe: { name: 'World English Bible (British)', lang: 'English (UK)' },
    'oeb-us': { name: 'Open English Bible (US)', lang: 'English (US)' },
    almeida: { name: 'João Ferreira de Almeida', lang: 'Portuguese' },
    rccv: { name: 'Romanian Corrected Cornilescu Version', lang: 'Romanian' }
};

// Active translations (default 3)
let activeTranslations = ['kjv', 'dra', 'clementine'];

// Bible books with chapter counts
const bibleBooks = {
    'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
    'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
    '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10,
    'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
    'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
    'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9,
    'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3,
    'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
    'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
    'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
    'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6,
    '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
    '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
    'Jude': 1, 'Revelation': 22
};

// Approximate verse counts per chapter (we'll fetch actual count from API)
const verseEstimates = {
    'Genesis 1': 31, 'John 3': 36, 'Psalm 23': 6, 'Romans 8': 39, 'Matthew 5': 48
    // We'll dynamically get verse counts from the API
};

// Event Listeners
searchBtn.addEventListener('click', searchVerse);
readChapterBtn.addEventListener('click', readFullChapter);
bookSelect.addEventListener('change', onBookChange);
chapterSelect.addEventListener('change', onChapterChange);
addTranslationBtn.addEventListener('click', addTranslation);

// Initialize
populateBooks();
setupTranslationManager();

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Populate books dropdown
function populateBooks() {
    Object.keys(bibleBooks).forEach(book => {
        const option = document.createElement('option');
        option.value = book;
        option.textContent = book;
        bookSelect.appendChild(option);
    });
}

// Translation Manager Functions
function setupTranslationManager() {
    // Add event listeners to existing remove buttons
    updateRemoveButtons();
}

function addTranslation() {
    const selectedTranslation = translationSelect.value;
    
    if (!selectedTranslation) {
        return;
    }
    
    if (activeTranslations.includes(selectedTranslation)) {
        alert('This translation is already added!');
        return;
    }
    
    if (activeTranslations.length >= 8) {
        alert('Maximum 8 translations allowed at once!');
        return;
    }
    
    activeTranslations.push(selectedTranslation);
    renderTranslationChips();
    translationSelect.value = '';
}

function removeTranslation(translationId) {
    if (activeTranslations.length <= 1) {
        alert('You must have at least one translation active!');
        return;
    }
    
    activeTranslations = activeTranslations.filter(t => t !== translationId);
    renderTranslationChips();
}

function renderTranslationChips() {
    activeTranslationsDiv.innerHTML = '';
    
    activeTranslations.forEach(translationId => {
        const chip = document.createElement('div');
        chip.className = 'translation-chip';
        chip.setAttribute('data-translation', translationId);
        
        const translationInfo = translationNames[translationId];
        chip.innerHTML = `
            <span>${translationInfo.name}</span>
            <button class="remove-translation" data-translation="${translationId}">×</button>
        `;
        
        activeTranslationsDiv.appendChild(chip);
    });
    
    updateRemoveButtons();
}

function updateRemoveButtons() {
    document.querySelectorAll('.remove-translation').forEach(btn => {
        btn.addEventListener('click', function() {
            const translationId = this.getAttribute('data-translation');
            removeTranslation(translationId);
        });
    });
}

// Handle book selection
function onBookChange() {
    const selectedBook = bookSelect.value;
    
    // Reset and disable subsequent dropdowns
    chapterSelect.innerHTML = '<option value="">Select Chapter...</option>';
    verseSelect.innerHTML = '<option value="">Select Verse...</option>';
    verseSelect.disabled = true;
    searchBtn.disabled = true;
    
    if (selectedBook) {
        // Enable chapter select and populate chapters
        chapterSelect.disabled = false;
        const chapterCount = bibleBooks[selectedBook];
        
        for (let i = 1; i <= chapterCount; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Chapter ${i}`;
            chapterSelect.appendChild(option);
        }
    } else {
        chapterSelect.disabled = true;
    }
}

// Handle chapter selection
async function onChapterChange() {
    const selectedBook = bookSelect.value;
    const selectedChapter = chapterSelect.value;
    
    // Reset verse dropdown
    verseSelect.innerHTML = '<option value="">Select Verse...</option>';
    searchBtn.disabled = true;
    
    if (selectedBook && selectedChapter) {
        verseSelect.disabled = false;
        
        // Fetch the chapter to get verse count
        try {
            const reference = `${selectedBook} ${selectedChapter}`;
            const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`);
            const data = await response.json();
            
            if (data.verses && data.verses.length > 0) {
                const verseCount = data.verses.length;
                
                for (let i = 1; i <= verseCount; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `Verse ${i}`;
                    verseSelect.appendChild(option);
                }
            }
        } catch (error) {
            console.error('Error fetching verse count:', error);
            // Fallback: add 50 verses as default
            for (let i = 1; i <= 50; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Verse ${i}`;
                verseSelect.appendChild(option);
            }
        }
    } else {
        verseSelect.disabled = true;
    }
}

// Enable search button when verse is selected
verseSelect.addEventListener('change', () => {
    searchBtn.disabled = !verseSelect.value;
});

// Enable read chapter button when chapter is selected
chapterSelect.addEventListener('change', () => {
    if (chapterSelect.value) {
        readChapterBtn.disabled = false;
    } else {
        readChapterBtn.disabled = true;
    }
});

// Main search function
async function searchVerse() {
    const selectedBook = bookSelect.value;
    const selectedChapter = chapterSelect.value;
    const selectedVerse = verseSelect.value;
    
    if (!selectedBook || !selectedChapter || !selectedVerse) {
        showError('Please select a book, chapter, and verse');
        return;
    }

    const verseReference = `${selectedBook} ${selectedChapter}:${selectedVerse}`;

    // Show loading, hide error and results
    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');

    try {
        // Fetch all active translations
        const translationPromises = activeTranslations.map(translationId =>
            fetchVerse(verseReference, translationId)
        );
        
        const results = await Promise.allSettled(translationPromises);
        
        // Check if at least one translation succeeded
        const successfulResults = results.filter(r => r.status === 'fulfilled');
        if (successfulResults.length === 0) {
            throw new Error('Unable to fetch any translations. Please check the verse reference.');
        }
        
        // Show warning if some translations failed
        const failedCount = results.length - successfulResults.length;
        if (failedCount > 0) {
            const warningMsg = document.createElement('div');
            warningMsg.style.cssText = 'color: #f0ad4e; font-size: 1.1rem; margin: 10px 0 20px 0; padding: 12px; background: rgba(240, 173, 78, 0.15); border-left: 4px solid #f0ad4e; border-radius: 5px;';
            warningMsg.innerHTML = `⚠️ <strong>${failedCount}</strong> translation(s) not available for this verse`;
            resultsDiv.appendChild(warningMsg);
        }

        // Display results (only successful ones)
        displayResults(results);
        
        // Hide loading
        loading.classList.add('hidden');
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        loading.classList.add('hidden');
        showError(error.message);
    }
}

// Fetch verse from Bible API
async function fetchVerse(reference, translation) {
    try {
        const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`;
        console.log(`Fetching: ${url}`);
        const response = await fetch(url);
        
        const data = await response.json();
        
        // Check for various error conditions
        if (!response.ok || data.error || !data.text) {
            throw new Error(data.error || `HTTP ${response.status}` || 'No text available');
        }
        
        // Detect if translation is non-English and translate
        const translationInfo = translationNames[translation];
        let translatedText = null;
        
        if (data.text && translationInfo && !translationInfo.lang.includes('English')) {
            console.log(`Translating ${translationInfo.name} (${translationInfo.lang}) to English...`);
            try {
                // Map language to ISO code
                const langMap = {
                    'Latin': 'la',
                    'Chinese': 'zh',
                    'Czech': 'cs',
                    'Portuguese': 'pt',
                    'Romanian': 'ro',
                    'Cherokee': 'en' // Cherokee not supported, skip translation
                };
                const sourceLang = langMap[translationInfo.lang] || 'en';
                
                if (sourceLang !== 'en') {
                    translatedText = await translateText(data.text, 'en', sourceLang);
                    if (translatedText) {
                        console.log('Translation successful!');
                    } else {
                        console.warn('Translation returned null');
                    }
                }
            } catch (error) {
                console.error('Translation service error:', error);
                // Continue without translation
            }
        }
        
        return {
            translation: translation,
            reference: data.reference || reference,
            text: data.text,
            translatedText: translatedText,
            verses: data.verses || []
        };
    } catch (error) {
        console.error(`Error fetching ${translation} for ${reference}:`, error.message);
        throw error;
    }
}

// Translate text to English using MyMemory Translation API (free, no key required)
async function translateText(text, targetLang = 'en', sourceLang = 'la') {
    try {
        console.log(`Sending translation request... Text length: ${text.length}, Source: ${sourceLang}`);
        
        // Truncate text if too long (MyMemory has a limit)
        const maxLength = 500;
        const textToTranslate = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        
        // Using MyMemory Translation API (free, no key required)
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(url);
        
        console.log('Translation API response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Translation API error:', errorText);
            throw new Error(`Translation failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Translation response received, has translatedText:', !!data.responseData?.translatedText);
        
        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            console.warn('No translatedText in response:', data);
            return null;
        }
    } catch (error) {
        console.error('Translation error:', error);
        return null;
    }
}

// Display results in the cards
function displayResults(results) {
    resultsDiv.innerHTML = '';
    
    results.forEach((result, index) => {
        // Skip failed translations - they're handled by the warning message
        if (result.status === 'rejected') {
            return;
        }
        
        const translationId = activeTranslations[index];
        const translationInfo = translationNames[translationId];
        
        const card = document.createElement('div');
        card.className = `verse-card ${translationId}-card`;
        
        const data = result.value;
            
        // Build the text content
        let textContent = data.text || 'Text not available';
        
        // Add English translation if available
        if (data.translatedText) {
            textContent = `
                <div class="original-text">${data.text}</div>
                <div class="translation-divider">
                    <span class="translation-label">English Translation:</span>
                </div>
                <div class="translated-text">${data.translatedText}</div>
            `;
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${translationInfo.name}</h3>
                <span class="language-tag">${translationInfo.lang}</span>
            </div>
            <div class="card-content">
                <p class="verse-reference">${data.reference || 'Reference not found'}</p>
                <div class="verse-text">${textContent}</div>
            </div>
        `;
        
        resultsDiv.appendChild(card);
    });
    
    resultsDiv.classList.remove('hidden');
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    resultsDiv.classList.add('hidden');
}

// Read Full Chapter Function
async function readFullChapter() {
    const selectedBook = bookSelect.value;
    const selectedChapter = chapterSelect.value;
    
    if (!selectedBook || !selectedChapter) {
        showError('Please select a book and chapter');
        return;
    }

    const chapterReference = `${selectedBook} ${selectedChapter}`;

    // Show loading, hide error and results
    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');

    try {
        // Fetch all active translations for the entire chapter
        const translationPromises = activeTranslations.map(translationId =>
            fetchChapter(chapterReference, translationId)
        );
        
        const results = await Promise.allSettled(translationPromises);

        // Check if at least one translation succeeded
        const successfulResults = results.filter(r => r.status === 'fulfilled');
        if (successfulResults.length === 0) {
            throw new Error('Unable to fetch any translations. Please check the chapter reference.');
        }
        
        // Show warning if some translations failed
        const failedCount = results.length - successfulResults.length;
        if (failedCount > 0) {
            const warningMsg = document.createElement('div');
            warningMsg.style.cssText = 'color: #f0ad4e; font-size: 1.1rem; margin: 10px 0 20px 0; padding: 12px; background: rgba(240, 173, 78, 0.15); border-left: 4px solid #f0ad4e; border-radius: 5px;';
            warningMsg.innerHTML = `⚠️ <strong>${failedCount}</strong> translation(s) not available for this chapter`;
            resultsDiv.appendChild(warningMsg);
        }

        // Display full chapter results (only successful ones)
        displayChapterResults(results);
        
        // Hide loading
        loading.classList.add('hidden');
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        loading.classList.add('hidden');
        showError(error.message);
    }
}

// Fetch entire chapter from Bible API
async function fetchChapter(reference, translation) {
    try {
        const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`;
        console.log(`Fetching chapter: ${url}`);
        const response = await fetch(url);
        
        const data = await response.json();
        
        // Check for various error conditions
        if (!response.ok || data.error || !data.text) {
            throw new Error(data.error || `HTTP ${response.status}` || 'No text available');
        }
        
        // Detect if translation is non-English and translate
        const translationInfo = translationNames[translation];
        let translatedText = null;
        
        if (data.text && translationInfo && !translationInfo.lang.includes('English')) {
            console.log(`Translating ${translationInfo.name} (${translationInfo.lang}) chapter to English...`);
            try {
                // Map language to ISO code
                const langMap = {
                    'Latin': 'la',
                    'Chinese': 'zh',
                    'Czech': 'cs',
                    'Portuguese': 'pt',
                    'Romanian': 'ro',
                    'Cherokee': 'en' // Cherokee not supported, skip translation
                };
                const sourceLang = langMap[translationInfo.lang] || 'en';
                
                if (sourceLang !== 'en') {
                    translatedText = await translateText(data.text, 'en', sourceLang);
                    if (translatedText) {
                        console.log('Chapter translation successful!');
                    } else {
                        console.warn('Chapter translation returned null');
                    }
                }
            } catch (error) {
                console.error('Translation service error:', error);
                // Continue without translation
            }
        }
        
        return {
            translation: translation,
            reference: data.reference || reference,
            text: data.text,
            translatedText: translatedText,
            verses: data.verses || []
        };
    } catch (error) {
        console.error(`Error fetching chapter ${reference} for ${translation}:`, error.message);
        throw error;
    }
}

// Display full chapter results
function displayChapterResults(results) {
    resultsDiv.innerHTML = '';
    
    results.forEach((result, index) => {
        // Skip failed translations - they're handled by the warning message
        if (result.status === 'rejected') {
            return;
        }
        
        const translationId = activeTranslations[index];
        const translationInfo = translationNames[translationId];
        
        const card = document.createElement('div');
        card.className = `verse-card ${translationId}-card`;
        
        const data = result.value;
        
        // Format the chapter text
        let formattedText = formatChapterText(data.text, data.verses);
        
        // Add English translation if available
        if (data.translatedText) {
            formattedText = `
                <div class="original-text">${formatChapterText(data.text, data.verses)}</div>
                <div class="translation-divider">
                    <span class="translation-label">English Translation:</span>
                </div>
                <div class="translated-text">${data.translatedText}</div>
            `;
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${translationInfo.name}</h3>
                <span class="language-tag">${translationInfo.lang}</span>
            </div>
            <div class="card-content">
                <p class="verse-reference">${data.reference || 'Reference not found'}</p>
                <div class="verse-text">${formattedText}</div>
            </div>
        `;
        
        resultsDiv.appendChild(card);
    });
    
    resultsDiv.classList.remove('hidden');
    
    // Initialize highlighting after results are displayed
    setTimeout(() => {
        initializeHighlighting();
    }, 100);
}

// Format chapter text with verse numbers
function formatChapterText(text, verses) {
    if (!verses || verses.length === 0) {
        return text;
    }
    
    let formattedText = '';
    verses.forEach(verse => {
        formattedText += `<span class="verse-segment" data-verse="${verse.verse}"><sup style="font-weight: bold; color: #8b6f47;">${verse.verse}</sup> ${verse.text}</span> `;
    });
    
    return formattedText;
}

// Add highlighting functionality
function initializeHighlighting() {
    // Track which verses are highlighted and their color indices
    window.highlightedVerses = window.highlightedVerses || new Map();
    window.nextColorIndex = window.nextColorIndex || 1;
    
    // Add click handlers to verse numbers
    document.querySelectorAll('.verse-text sup').forEach(sup => {
        sup.addEventListener('click', function(e) {
            e.stopPropagation();
            const verseSegment = this.parentElement;
            const verseNumber = verseSegment.getAttribute('data-verse');
            
            if (verseNumber) {
                toggleHighlightAllVerses(verseNumber);
            }
        });
    });
}

// Toggle highlight for a specific verse number across all translations
function toggleHighlightAllVerses(verseNumber) {
    const allVerseSegments = document.querySelectorAll(`.verse-segment[data-verse="${verseNumber}"]`);
    
    // Check if this verse is currently highlighted
    if (window.highlightedVerses.has(verseNumber)) {
        // Remove highlight
        const colorIndex = window.highlightedVerses.get(verseNumber);
        allVerseSegments.forEach(segment => {
            segment.classList.remove(`highlight-${colorIndex}`);
        });
        window.highlightedVerses.delete(verseNumber);
    } else {
        // Add highlight with next color
        const colorIndex = window.nextColorIndex;
        allVerseSegments.forEach(segment => {
            segment.classList.add(`highlight-${colorIndex}`);
        });
        window.highlightedVerses.set(verseNumber, colorIndex);
        
        // Increment color index, cycle back to 1 after 40
        window.nextColorIndex = (window.nextColorIndex % 40) + 1;
    }
}

// Contact Modal Functionality
const contactModal = document.getElementById('contactModal');
const floatingMessageBtn = document.getElementById('floatingMessageBtn');
const closeContactModal = document.querySelector('.close-contact-modal');
const contactLinks = document.querySelectorAll('a[href="#contact"]');

// Open modal when floating button is clicked
floatingMessageBtn.addEventListener('click', () => {
    contactModal.classList.remove('hidden');
});

// Open modal when contact links are clicked
contactLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        contactModal.classList.remove('hidden');
    });
});

// Close modal when X is clicked
closeContactModal.addEventListener('click', () => {
    contactModal.classList.add('hidden');
});

// Close modal when clicking outside
contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
        contactModal.classList.add('hidden');
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !contactModal.classList.contains('hidden')) {
        contactModal.classList.add('hidden');
    }
});

// Handle form submission
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    // Form will be handled by Formspree
    // Add a success message after submission
    setTimeout(() => {
        alert('Thank you for your message! We will get back to you soon.');
        contactModal.classList.add('hidden');
        contactForm.reset();
    }, 100);
});


// Add animation on scroll for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe translation cards in about section
document.querySelectorAll('.translation-card').forEach(card => {
    observer.observe(card);
});

console.log('Bible Teacher Searcher initialized! 📖');
console.log('Supported translations: KJV, Douay-Rheims 1899, Latin Vulgate');
