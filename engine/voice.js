/**
 * CyberQuest - Voice System
 * Text-to-speech with multiple character voices
 * Falls back to visual text display when TTS unavailable
 */

class VoiceManager {
    constructor() {
        this.synth = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
        this.voices = [];
        this.enabled = true;
        this.volume = 0.8;
        this.currentUtterance = null;
        this.voicesLoaded = false;
        this.useFallback = false;
        this.subtitleTimeout = null;
        this._utteranceTimeout = null; // Chrome long-utterance safety timeout
        
        // Try to load voices multiple times
        this.loadVoicesWithRetry();
        
        // Voice archetypes to reduce duplication
        const britishMale = { voicePreference: ['Google UK English Male', 'Microsoft David', 'Daniel', 'male'], lang: 'en-GB' };
        const britishFemale = { voicePreference: ['Google UK English Female', 'Microsoft Zira', 'Samantha', 'Karen', 'female'], lang: 'en-GB' };
        const americanFemale = { voicePreference: ['Google US English Female', 'Microsoft Zira', 'Samantha', 'female'], lang: 'en-US' };

        // Character voice profiles (pitch, rate, voice preference)
        this.characterProfiles = {
            // Main protagonist - Dutch male, mature
            'Ryan':                { ...britishMale, pitch: 0.9, rate: 0.95 },
            "Ryan's Thoughts":     { ...britishMale, pitch: 0.85, rate: 0.9 },
            'Ryan observes':       { ...britishMale, pitch: 0.9, rate: 0.85 },
            'Ryan analyzes':       { ...britishMale, pitch: 0.9, rate: 0.85 },
            
            // German female intelligence agent
            'Eva':                 { ...britishFemale, pitch: 1.15, rate: 0.9 },
            'Eva Weber':           { ...britishFemale, pitch: 1.15, rate: 0.9 },
            
            // Chris Kubecka - American female expert
            'Chris':               { ...americanFemale, pitch: 1.1, rate: 1.0 },
            'Chris Kubecka':       { ...americanFemale, pitch: 1.1, rate: 1.0 },
            
            // Dmitri Volkov - Russian antagonist (deep, menacing)
            'Volkov':              { ...britishMale, pitch: 0.7, rate: 0.85 },
            'Dmitri Volkov':       { ...britishMale, pitch: 0.7, rate: 0.85 },
            
            // Dutch friends - varied male voices
            'David Prinsloo':      { ...britishMale, pitch: 0.95, rate: 1.0 },
            'Pieter':              { ...britishMale, pitch: 1.05, rate: 0.95 },
            'Cees Bassa':          { ...britishFemale, pitch: 1.2, rate: 0.95 },
            
            // Ryan's wife - Dutch female, warm voice
            'Ies':                 { ...britishFemale, pitch: 1.15, rate: 0.95 },
            
            // Scene voices
            'Meeting':             { ...britishMale, pitch: 1.0, rate: 0.9 },
            'Infiltration':        { ...britishMale, pitch: 0.95, rate: 0.95 },
            'Confrontation':       { ...britishMale, pitch: 0.9, rate: 0.9 },
            'Team Check-in':       { ...britishMale, pitch: 1.0, rate: 0.95 },
            'Epilogue':            { ...britishMale, pitch: 0.95, rate: 0.85 },
            
            // Narrator - neutral, clear voice
            '':                    { ...britishFemale, pitch: 1.0, rate: 0.9 },
            'Narrator':            { ...britishFemale, pitch: 1.0, rate: 0.9 },
            
            // System messages
            'System':              { ...britishFemale, pitch: 1.0, rate: 1.0, voicePreference: ['Google UK English Female', 'Microsoft Zira', 'female'] }
        };
        
        // Default profile for unknown speakers
        this.defaultProfile = {
            pitch: 1.0,
            rate: 0.95,
            voicePreference: ['Google UK English Male', 'Microsoft David', 'male'],
            lang: 'en-GB'
        };
    }
    
    loadVoicesWithRetry() {
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryLoad = () => {
            if (this.synth) {
                this.voices = this.synth.getVoices();
            }
            
            if (this.voices.length > 0) {
                this.voicesLoaded = true;
                this.useFallback = false;
                
                // Count English voices
                const englishVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith('en'));
                
                console.log(`✓ Voice system loaded: ${this.voices.length} voices available`);
                console.log(`  English voices: ${englishVoices.length}`);
                
                if (englishVoices.length > 0) {
                    console.log('Available English voices:');
                    englishVoices.slice(0, 3).forEach((voice, i) => {
                        console.log(`  ${i + 1}. ${voice.name} (${voice.lang})`);
                    });
                    if (englishVoices.length > 3) {
                        console.log(`  ... and ${englishVoices.length - 3} more`);
                    }
                } else {
                    console.warn('⚠ No English voices available - speech may be in wrong language');
                }
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(tryLoad, 500);
                } else {
                    console.log('════════════════════════════════════════════════════════');
                    console.log('ℹ️  CyberQuest is running in TEXT MODE');
                    console.log('════════════════════════════════════════════════════════');
                    console.log('No browser TTS voices detected (this is normal on Linux).');
                    console.log('');
                    console.log('📖 All dialogue will be displayed as text - the game is');
                    console.log('   fully playable and designed to work in text mode.');
                    console.log('');
                    console.log('Note: Even with speech-dispatcher installed, Chrome/');
                    console.log('Chromium on Linux often cannot access voices through the');
                    console.log('Web Speech API. This is a browser limitation, not a bug.');
                    console.log('════════════════════════════════════════════════════════');
                    this.useFallback = true;
                    
                    // Show friendly notification to user
                    if (typeof window !== 'undefined' && window.game) {
                        setTimeout(() => {
                            window.game.showNotification('📖 Text Mode Active (No TTS voices available)');
                        }, 2000);
                    }
                }
            }
        };
        
        // Initial load attempt
        tryLoad();
        
        // Also listen for voiceschanged event
        if (this.synth && typeof this.synth.onvoiceschanged !== 'undefined') {
            this.synth.onvoiceschanged = () => {
                this.voices = this.synth.getVoices();
                if (this.voices.length > 0) {
                    this.voicesLoaded = true;
                    this.useFallback = false;
                    
                    const englishVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith('en'));
                    console.log(`✓ Voice system loaded via event: ${this.voices.length} voices (${englishVoices.length} English)`);
                }
            };
        }
    }
    
    loadVoices() {
        // Legacy method - now handled by loadVoicesWithRetry
        this.loadVoicesWithRetry();
    }
    
    getVoiceForCharacter(character) {
        const profile = this.characterProfiles[character] || this.defaultProfile;
        
        // Filter voices to English only first (en-US, en-GB, etc.)
        const englishVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        const searchVoices = englishVoices.length > 0 ? englishVoices : this.voices;
        
        // Try to find a matching voice from preferred list
        for (const pref of profile.voicePreference) {
            // Try exact match first
            let voice = searchVoices.find(v => v.name === pref);
            if (voice) return { voice, profile };
            
            // Try partial match (case-insensitive)
            voice = searchVoices.find(v => 
                v.name.toLowerCase().includes(pref.toLowerCase())
            );
            if (voice) return { voice, profile };
            
            // Try gender match with English voices
            if (pref === 'male' || pref === 'female') {
                voice = searchVoices.find(v => {
                    const nameLower = v.name.toLowerCase();
                    if (pref === 'female') {
                        return nameLower.includes('female') || 
                               nameLower.includes('zira') ||
                               nameLower.includes('samantha') ||
                               nameLower.includes('karen') ||
                               nameLower.includes('moira') ||
                               nameLower.includes('fiona') ||
                               nameLower.includes('victoria') ||
                               nameLower.includes('kate');
                    } else {
                        return nameLower.includes('male') ||
                               nameLower.includes('david') ||
                               nameLower.includes('daniel') ||
                               nameLower.includes('alex') ||
                               nameLower.includes('james') ||
                               nameLower.includes('mark') ||
                               nameLower.includes('tom');
                    }
                });
                if (voice) return { voice, profile };
            }
        }
        
        // Try to match by specific language from profile
        let voice = searchVoices.find(v => v.lang.startsWith(profile.lang));
        if (voice) return { voice, profile };
        
        // Try to match by language family (en-* for English)
        voice = searchVoices.find(v => v.lang.startsWith(profile.lang.split('-')[0]));
        if (voice) return { voice, profile };
        
        // Fall back to first English voice
        if (englishVoices.length > 0) {
            console.warn(`No matching voice for ${character}, using first English voice: ${englishVoices[0].name}`);
            return { voice: englishVoices[0], profile };
        }
        
        // Last resort: use first available voice (but warn about language mismatch)
        if (this.voices.length > 0) {
            console.warn(`No English voice found! Using ${this.voices[0].name} (${this.voices[0].lang}) - may sound wrong`);
            return { voice: this.voices[0], profile };
        }
        
        // No voices at all
        return { voice: null, profile };
    }
    
    speak(text, character = '') {
        if (!this.enabled) {
            return Promise.resolve();
        }
        
        // Clean text for display/speech
        const cleanText = text
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/---/g, '')
            .replace(/\.\.\./g, '...')
            .trim();
        
        if (!cleanText) {
            return Promise.resolve();
        }
        
        // Always show subtitle for accessibility
        //this.showSubtitle(cleanText, character);
        
        // Try TTS if voices are available
        if (this.synth && this.voices.length > 0) {
            return this.speakWithTTS(cleanText, character);
        }
        
        // No TTS - just rely on subtitle
        return Promise.resolve();
    }
    
    speakWithTTS(cleanText, character) {
        return new Promise((resolve) => {
            this.synth.cancel();
            
            // Clear any previous safety timeout
            if (this._utteranceTimeout) {
                clearTimeout(this._utteranceTimeout);
                this._utteranceTimeout = null;
            }
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            const { voice, profile } = this.getVoiceForCharacter(character);
            
            if (voice) {
                utterance.voice = voice;
                utterance.lang = voice.lang; // Explicitly set language from voice
            } else {
                // No voice available, set English as default
                utterance.lang = 'en-US';
            }
            
            utterance.pitch = profile.pitch;
            utterance.rate = profile.rate;
            utterance.volume = this.volume;
            
            const cleanup = () => {
                this.currentUtterance = null;
                if (this._utteranceTimeout) {
                    clearTimeout(this._utteranceTimeout);
                    this._utteranceTimeout = null;
                }
                resolve();
            };
            
            utterance.onend = cleanup;
            
            utterance.onerror = (e) => {
                if (e.error !== 'canceled' && e.error !== 'interrupted') {
                    console.warn('TTS error:', e.error);
                }
                cleanup();
            };
            
            this.currentUtterance = utterance;
            
            // Chrome safety: resolve after max duration if onend never fires
            // Estimate ~150ms per word as max speaking time
            const wordCount = cleanText.split(/\s+/).length;
            const maxDuration = Math.max(10000, wordCount * 300);
            this._utteranceTimeout = setTimeout(() => {
                if (this.currentUtterance === utterance) {
                    console.warn('TTS utterance timed out (Chrome bug workaround)');
                    try { this.synth.cancel(); } catch (e) { /* ignore */ }
                    cleanup();
                }
            }, maxDuration);
            
            setTimeout(() => {
                try {
                    if (this.synth.paused) this.synth.resume();
                    this.synth.speak(utterance);
                } catch (err) {
                    cleanup();
                }
            }, 50);
        });
    }
    
    showSubtitle(text, character = '') {
        // Create or get subtitle container
        let container = document.getElementById('voice-subtitle');
        if (!container) {
            container = document.createElement('div');
            container.id = 'voice-subtitle';
            container.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                max-width: 80%;
                background: rgba(0, 0, 0, 0.85);
                color: #fff;
                padding: 15px 25px;
                border-radius: 8px;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 18px;
                line-height: 1.5;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.1);
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        
        // Speaker name styling
        const speakerColor = this.getSpeakerColor(character);
        const speakerHtml = character ? 
            `<span style="color: ${speakerColor}; font-weight: bold;">${character}:</span> ` : '';
        
        container.innerHTML = speakerHtml + text;
        container.style.opacity = '1';
        
        // Clear previous timeout
        if (this.subtitleTimeout) {
            clearTimeout(this.subtitleTimeout);
        }
        
        // Calculate display time based on text length
        const wordCount = text.split(' ').length;
        const displayTime = Math.max(2000, wordCount * 300); // ~300ms per word, min 2s
        
        this.subtitleTimeout = setTimeout(() => {
            container.style.opacity = '0';
        }, displayTime);
    }
    
    getSpeakerColor(character) {
        const colors = {
            'Ryan': '#4a9eff',
            "Ryan's Thoughts": '#88bbff',
            'Ryan observes': '#88bbff',
            'Ryan analyzes': '#88bbff',
            'Eva': '#ff6b9d',
            'Eva Weber': '#ff6b9d',
            'Chris': '#ffa726',
            'Chris Kubecka': '#ffa726',
            'Volkov': '#ff4444',
            'Dmitri Volkov': '#ff4444',
            'David Prinsloo': '#66bb6a',
            'Pieter': '#ab47bc',
            'Cees Bassa': '#26c6da',
            'Narrator': '#ffd54f',
            '': '#ffd54f'
        };
        return colors[character] || '#ffffff';
    }
    
    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
        this.currentUtterance = null;
        
        // Clear utterance safety timeout
        if (this._utteranceTimeout) {
            clearTimeout(this._utteranceTimeout);
            this._utteranceTimeout = null;
        }
        
        // Clear subtitle timeout
        if (this.subtitleTimeout) {
            clearTimeout(this.subtitleTimeout);
            this.subtitleTimeout = null;
        }
        
        // Also hide subtitle
        const subtitle = document.getElementById('voice-subtitle');
        if (subtitle) {
            subtitle.style.opacity = '0';
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stop();
        }
        return this.enabled;
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!this.enabled) {
            this.stop();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    isSpeaking() {
        return this.synth && this.synth.speaking;
    }
    
    // Diagnostic method to check system status
    diagnose() {
        const report = {
            speechSynthesisAvailable: !!this.synth,
            voicesLoaded: this.voicesLoaded,
            voiceCount: this.voices.length,
            enabled: this.enabled,
            useFallback: this.useFallback,
            currentlySpeaking: this.isSpeaking()
        };
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('🔍 Voice System Diagnostics');
        console.log('═══════════════════════════════════════════════════════');
        console.log('Speech Synthesis API:', report.speechSynthesisAvailable ? '✓ Available' : '✗ Not available');
        console.log('Voices Loaded:', report.voicesLoaded ? '✓ Yes' : '✗ No');
        console.log('Voice Count:', report.voiceCount);
        console.log('TTS Enabled:', report.enabled ? '✓ Yes' : '✗ No');
        console.log('Text Mode:', report.useFallback ? 'Yes (game shows text dialogue)' : 'No (using TTS)');
        console.log('Currently Speaking:', report.currentlySpeaking ? 'Yes' : 'No');
        console.log('───────────────────────────────────────────────────────');
        
        if (this.voices.length > 0) {
            console.log('📢 Available Voices:');
            
            // Show English voices first
            const englishVoices = this.voices.filter(v => v.lang.toLowerCase().startsWith('en'));
            const otherVoices = this.voices.filter(v => !v.lang.toLowerCase().startsWith('en'));
            
            if (englishVoices.length > 0) {
                console.log(`\n  ✓ English Voices (${englishVoices.length}):`);
                englishVoices.forEach((voice, i) => {
                    console.log(`    ${i + 1}. ${voice.name} (${voice.lang}) ${voice.default ? '[DEFAULT]' : ''}`);
                });
            } else {
                console.warn('  ⚠ No English voices found!');
            }
            
            if (otherVoices.length > 0) {
                console.log(`\n  Other Languages (${otherVoices.length}):`);
                otherVoices.slice(0, 5).forEach((voice, i) => {
                    console.log(`    ${i + 1}. ${voice.name} (${voice.lang})`);
                });
                if (otherVoices.length > 5) {
                    console.log(`    ... and ${otherVoices.length - 5} more`);
                }
            }
        } else {
            console.log('ℹ️  Status: TEXT MODE (No voices available)');
            console.log('');
            console.log('This is NORMAL for Linux browsers. The game works');
            console.log('perfectly in text mode - all dialogue is displayed.');
            console.log('');
            console.log('Technical note:');
            console.log('Even though your system has speech-dispatcher and');
            console.log('espeak installed, Chrome/Chromium on Linux typically');
            console.log('cannot access these through the Web Speech API.');
            console.log('This is a known browser limitation.');
        }
        
        console.log('═══════════════════════════════════════════════════════');
        return report;
    }
}

// Create global instance
window.voiceManager = new VoiceManager();

// Provide helpful console message
console.log('🎮 CyberQuest Voice System initialized');
console.log('💡 Type voiceManager.diagnose() in console for detailed status');

// Try to unlock TTS on first user interaction
const unlockVoice = () => {
    if (window.voiceManager && window.voiceManager.synth) {
        const voices = window.voiceManager.synth.getVoices();
        if (voices.length > 0) {
            window.voiceManager.voices = voices;
            window.voiceManager.voicesLoaded = true;
            window.voiceManager.useFallback = false;
            
            const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
            console.log(`✓ Voice system unlocked: ${voices.length} voices (${englishVoices.length} English)`);
            
            // Update notification
            if (window.game) {
                if (englishVoices.length > 0) {
                    window.game.showNotification('🔊 Text-to-Speech Activated!');
                } else {
                    window.game.showNotification('⚠ TTS Active (No English voices - may sound wrong)');
                }
            }
        }
    }
};

document.addEventListener('click', unlockVoice, { once: true });
document.addEventListener('touchstart', unlockVoice, { once: true });
