/**
 * CyberQuest - Player Character System
 * Handles Ryan's movement, animations, and thoughts
 */

class PlayerCharacter {
    constructor(game) {
        this.game = game;
        this.element = null;
        this.thoughtBubble = null;
        
        // Position (percentage of scene)
        this.x = 50;  // Center
        this.y = 85;  // Near bottom
        
        // Size (percentage of scene height) - Ryan is big/tall
        this.height = 30;
        
        // State
        this.isWalking = false;
        this.isThinking = false;
        this.facing = 'right'; // 'left' or 'right'
        this.walkSpeed = 15; // pixels per frame at 60fps
        
        // Animation
        this.walkAnimationFrame = 0;
        this.animationInterval = null;
        
        // Idle thoughts - Ryan thinks out loud randomly (South Park style: short and punchy)
        this.idleThoughts = [
            "Need. More. Coffee.",
            "What the hell was that signal?",
            "This is gonna be a weird day...",
            "I void warranties for a living.",
            "Screw it, let's hack something.",
            "Germans make weird stuff sometimes.",
        ];
        this.lastIdleThought = 0;
        this.idleThoughtInterval = null;
        
        // Walking queue
        this.targetX = null;
        this.targetY = null;
        this.onArrival = null;
    }
    
    init() {
        this.createElement();
        this.createThoughtBubble();
        this.startIdleThoughts();
    }
    
    createElement() {
        // Create character container
        this.element = document.createElement('div');
        this.element.id = 'player-character';
        this.element.className = 'player-character southpark-style';
        this.element.innerHTML = `
            <img src="assets/images/characters/ryan_southpark.svg" alt="Ryan" class="character-sprite">
        `;
        
        // Add to scene
        const container = document.getElementById('scene-characters');
        if (container) {
            container.appendChild(this.element);
        }
        
        this.updatePosition();
    }
    
    createThoughtBubble() {
        this.thoughtBubble = document.createElement('div');
        this.thoughtBubble.id = 'thought-bubble';
        this.thoughtBubble.className = 'thought-bubble hidden';
        this.thoughtBubble.innerHTML = `
            <div class="thought-dots">
                <span></span><span></span><span></span>
            </div>
            <div class="thought-text"></div>
        `;
        
        const container = document.getElementById('scene-characters');
        if (container) {
            container.appendChild(this.thoughtBubble);
        }
    }
    
    updatePosition() {
        if (!this.element) return;
        
        // Calculate position based on percentages
        this.element.style.left = `${this.x}%`;
        this.element.style.bottom = `${100 - this.y}%`;
        this.element.style.height = `${this.height}%`;
        
        // Update facing direction
        const sprite = this.element.querySelector('.character-sprite');
        if (sprite) {
            sprite.style.transform = this.facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
        }
        
        // Update thought bubble position
        if (this.thoughtBubble) {
            this.thoughtBubble.style.left = `${this.x}%`;
            this.thoughtBubble.style.bottom = `${100 - this.y + this.height - 5}%`;
        }
    }
    
    // Walk to a position
    walkTo(targetX, targetY, callback = null) {
        // Clamp target to valid range
        this.targetX = Math.max(5, Math.min(95, targetX));
        this.targetY = Math.max(60, Math.min(92, targetY)); // Keep in walkable area
        this.onArrival = callback;
        
        // Determine facing direction
        if (this.targetX < this.x) {
            this.facing = 'left';
        } else if (this.targetX > this.x) {
            this.facing = 'right';
        }
        
        this.isWalking = true;
        this.element.classList.add('walking');
        
        // Start walk animation
        this.startWalkAnimation();
    }
    
    startWalkAnimation() {
        if (this.animationInterval) {
            cancelAnimationFrame(this.animationInterval);
        }
        
        const animate = () => {
            if (!this.isWalking) return;
            
            // Calculate distance to target
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Arrival threshold
            if (distance < 1) {
                this.stopWalking();
                return;
            }
            
            // Move towards target
            const moveSpeed = 0.5; // percent per frame
            const ratio = moveSpeed / distance;
            
            this.x += dx * ratio;
            this.y += dy * ratio;
            
            // Update visual position
            this.updatePosition();
            
            // Bob animation
            this.walkAnimationFrame++;
            const bobOffset = Math.sin(this.walkAnimationFrame * 0.3) * 0.5;
            this.element.style.transform = `translateY(${bobOffset}%)`;
            
            this.animationInterval = requestAnimationFrame(animate);
        };
        
        this.animationInterval = requestAnimationFrame(animate);
    }
    
    stopWalking() {
        this.isWalking = false;
        this.element.classList.remove('walking');
        this.element.style.transform = '';
        
        if (this.animationInterval) {
            cancelAnimationFrame(this.animationInterval);
            this.animationInterval = null;
        }
        
        // Execute callback
        if (this.onArrival) {
            const callback = this.onArrival;
            this.onArrival = null;
            callback();
        }
    }
    
    // Think out loud with voice
    think(thought, duration = 4000) {
        if (this.isThinking) return;
        
        this.isThinking = true;
        
        // Show thought bubble
        const textEl = this.thoughtBubble.querySelector('.thought-text');
        textEl.textContent = thought;
        this.thoughtBubble.classList.remove('hidden');
        this.thoughtBubble.classList.add('visible');
        
        // Speak the thought
        this.game.speakText(thought, "Ryan's Thoughts");
        
        // Hide after duration
        setTimeout(() => {
            this.thoughtBubble.classList.remove('visible');
            this.thoughtBubble.classList.add('hidden');
            this.isThinking = false;
        }, duration);
    }
    
    // Random idle thoughts
    startIdleThoughts() {
        // Think randomly every 30-60 seconds when idle
        this.idleThoughtInterval = setInterval(() => {
            if (!this.isWalking && !this.isThinking && !this.game.isDialogueActive) {
                // 20% chance to think out loud
                if (Math.random() < 0.2) {
                    const thought = this.idleThoughts[Math.floor(Math.random() * this.idleThoughts.length)];
                    this.think(thought);
                }
            }
        }, 15000);
    }
    
    stopIdleThoughts() {
        if (this.idleThoughtInterval) {
            clearInterval(this.idleThoughtInterval);
            this.idleThoughtInterval = null;
        }
    }
    
    // Set scene-specific idle thoughts
    setIdleThoughts(thoughts) {
        this.idleThoughts = thoughts;
    }
    
    // Face a direction
    face(direction) {
        this.facing = direction;
        this.updatePosition();
    }
    
    // Teleport to position (no walking)
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.updatePosition();
    }
    
    // Hide character (for cutscenes, etc)
    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
    }
    
    // Show character
    show() {
        if (this.element) {
            this.element.classList.remove('hidden');
        }
    }
    
    // Cleanup
    destroy() {
        this.stopIdleThoughts();
        this.stopWalking();
        if (this.element) {
            this.element.remove();
        }
        if (this.thoughtBubble) {
            this.thoughtBubble.remove();
        }
    }
}

// Export for use
window.PlayerCharacter = PlayerCharacter;
