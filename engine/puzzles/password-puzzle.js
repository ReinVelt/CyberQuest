/**
 * Password Puzzle System
 * Reusable password/cipher puzzle for various game challenges
 * Used for: frequency passwords, access codes, cipher decryption
 */

class PasswordPuzzle {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.currentPuzzle = null;
    }

    /**
     * Show a password puzzle
     * @param {Object} config - Puzzle configuration
     * @param {string} config.id - Unique puzzle identifier
     * @param {string} config.title - Puzzle title
     * @param {string} config.description - Description/instructions
     * @param {string|Array} config.correctAnswer - Correct password(s)
     * @param {boolean} config.caseSensitive - Whether password is case-sensitive (default: false)
     * @param {string} config.hint - Optional hint text
     * @param {string} config.placeholder - Input placeholder text
     * @param {Function} config.onSuccess - Callback when solved
     * @param {Function} config.onFailure - Optional callback on wrong answer
     * @param {number} config.maxAttempts - Optional max attempts (0 = unlimited)
     * @param {string} config.inputType - 'text' or 'number' (default: 'text')
     */
    show(config) {
        if (this.isActive) {
            this.close();
        }

        this.currentPuzzle = {
            ...config,
            attempts: 0,
            maxAttempts: config.maxAttempts || 0,
            caseSensitive: config.caseSensitive !== undefined ? config.caseSensitive : false,
            inputType: config.inputType || 'text',
            correctAnswer: Array.isArray(config.correctAnswer) ? config.correctAnswer : [config.correctAnswer]
        };

        this.createPuzzleUI();
        this.isActive = true;
        this.game.isPuzzleActive = true;

        // Focus input after a short delay
        setTimeout(() => {
            const input = document.getElementById('password-input');
            if (input) input.focus();
        }, 100);
    }

    /**
     * Create the puzzle UI overlay
     */
    createPuzzleUI() {
        // Remove existing puzzle if any
        const existing = document.getElementById('password-puzzle');
        if (existing) {
            existing.remove();
        }

        const puzzle = document.createElement('div');
        puzzle.id = 'password-puzzle';
        puzzle.innerHTML = this.getPuzzleHTML();
        
        this.applyStyles(puzzle);
        document.body.appendChild(puzzle);

        // Attach event listeners
        this.attachEventListeners();

        // Prevent clicks from propagating
        puzzle.addEventListener('click', (e) => {
            if (e.target.id === 'password-puzzle') {
                // Don't close on overlay click - force user to cancel or solve
            }
            e.stopPropagation();
        });
    }

    /**
     * Generate HTML for the puzzle
     */
    getPuzzleHTML() {
        const puzzle = this.currentPuzzle;
        
        let attemptsHTML = '';
        if (puzzle.maxAttempts > 0) {
            attemptsHTML = `
                <div class="pp-attempts">
                    Attempts: <span id="pp-attempt-count">${puzzle.attempts}</span> / ${puzzle.maxAttempts}
                </div>
            `;
        }

        let hintHTML = '';
        if (puzzle.hint) {
            hintHTML = `
                <div class="pp-hint">
                    <span class="pp-hint-icon">💡</span>
                    <span class="pp-hint-text">${puzzle.hint}</span>
                </div>
            `;
        }

        return `
            <div class="pp-container">
                <div class="pp-header">
                    <div class="pp-title">${puzzle.title}</div>
                    <button class="pp-close" id="pp-close-btn">✕</button>
                </div>
                <div class="pp-content">
                    <div class="pp-description">${puzzle.description}</div>
                    ${hintHTML}
                    <div class="pp-input-group">
                        <input 
                            type="${puzzle.inputType}" 
                            id="password-input" 
                            class="pp-input" 
                            placeholder="${puzzle.placeholder || 'Enter password...'}"
                            autocomplete="off"
                        />
                        <button class="pp-submit" id="pp-submit-btn">Submit</button>
                    </div>
                    ${attemptsHTML}
                    <div class="pp-feedback" id="pp-feedback"></div>
                </div>
            </div>
        `;
    }

    /**
     * Apply CSS styles
     */
    applyStyles(puzzle) {
        puzzle.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Courier New', monospace;
            animation: fadeIn 0.3s ease;
        `;

        // Add embedded styles
        const styleSheet = document.createElement('style');
        styleSheet.id = 'password-puzzle-styles';
        styleSheet.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }

            .pp-container {
                background: #1a1a1a;
                border: 3px solid #00ff88;
                border-radius: 10px;
                width: 90%;
                max-width: 600px;
                box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .pp-header {
                background: #0a0a0a;
                padding: 20px;
                border-bottom: 2px solid #00ff88;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .pp-title {
                color: #00ff88;
                font-size: 1.5rem;
                font-weight: bold;
                text-transform: uppercase;
            }

            .pp-close {
                background: #ff3333;
                color: white;
                border: none;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
                transition: all 0.2s;
            }

            .pp-close:hover {
                background: #ff5555;
                transform: scale(1.1);
            }

            .pp-content {
                padding: 30px;
            }

            .pp-description {
                color: #ffffff;
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: 20px;
            }

            .pp-hint {
                background: rgba(0, 255, 136, 0.1);
                border-left: 4px solid #00ff88;
                padding: 15px;
                margin: 20px 0;
                display: flex;
                gap: 10px;
                align-items: flex-start;
            }

            .pp-hint-icon {
                font-size: 1.3rem;
            }

            .pp-hint-text {
                color: #00ff88;
                flex: 1;
                line-height: 1.5;
            }

            .pp-input-group {
                display: flex;
                gap: 10px;
                margin: 25px 0;
            }

            .pp-input {
                flex: 1;
                background: #0a0a0a;
                border: 2px solid #333;
                color: #00ff88;
                padding: 15px;
                font-size: 1.2rem;
                font-family: 'Courier New', monospace;
                border-radius: 5px;
                transition: all 0.3s;
            }

            .pp-input:focus {
                outline: none;
                border-color: #00ff88;
                box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
            }

            .pp-input.error {
                animation: shake 0.5s;
                border-color: #ff3333;
            }

            .pp-submit {
                background: #00ff88;
                color: #000;
                border: none;
                padding: 15px 35px;
                font-size: 1.1rem;
                font-weight: bold;
                font-family: 'Courier New', monospace;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s;
                text-transform: uppercase;
            }

            .pp-submit:hover {
                background: #00dd77;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
            }

            .pp-submit:active {
                transform: translateY(0);
            }

            .pp-attempts {
                color: #ffaa00;
                font-size: 0.9rem;
                text-align: right;
                margin: 10px 0;
            }

            .pp-feedback {
                min-height: 30px;
                padding: 10px;
                border-radius: 5px;
                font-size: 1rem;
                font-weight: bold;
                text-align: center;
                transition: all 0.3s;
            }

            .pp-feedback.error {
                background: rgba(255, 51, 51, 0.2);
                border: 1px solid #ff3333;
                color: #ff3333;
            }

            .pp-feedback.success {
                background: rgba(0, 255, 136, 0.2);
                border: 1px solid #00ff88;
                color: #00ff88;
            }
        `;
        
        // Remove old styles if they exist
        const oldStyles = document.getElementById('password-puzzle-styles');
        if (oldStyles) oldStyles.remove();
        
        document.head.appendChild(styleSheet);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const closeBtn = document.getElementById('pp-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        const submitBtn = document.getElementById('pp-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.checkAnswer());
        }

        const input = document.getElementById('password-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
        }

        // ESC to close
        const escHandler = (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.close();
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Check if the entered answer is correct
     */
    checkAnswer() {
        const input = document.getElementById('password-input');
        const feedback = document.getElementById('pp-feedback');
        const attemptCount = document.getElementById('pp-attempt-count');
        
        if (!input || !feedback) return;

        let answer = input.value.trim();
        if (!this.currentPuzzle.caseSensitive) {
            answer = answer.toLowerCase();
        }

        // Normalize correct answers
        const correctAnswers = this.currentPuzzle.correctAnswer.map(ans => 
            this.currentPuzzle.caseSensitive ? ans : ans.toLowerCase()
        );

        this.currentPuzzle.attempts++;
        if (attemptCount) {
            attemptCount.textContent = this.currentPuzzle.attempts;
        }

        // Check if correct
        if (correctAnswers.includes(answer)) {
            this.onCorrectAnswer(feedback);
        } else {
            this.onWrongAnswer(input, feedback);
        }
    }

    /**
     * Handle correct answer
     */
    onCorrectAnswer(feedback) {
        feedback.className = 'pp-feedback success';
        feedback.textContent = '✓ Correct! Access granted.';

        // Play success sound if available
        this.playSound('success');

        // Call success callback after short delay
        setTimeout(() => {
            if (this.currentPuzzle.onSuccess) {
                this.currentPuzzle.onSuccess(this.game);
            }
            this.close();
        }, 1500);
    }

    /**
     * Handle wrong answer
     */
    onWrongAnswer(input, feedback) {
        feedback.className = 'pp-feedback error';
        
        const remaining = this.currentPuzzle.maxAttempts > 0 
            ? this.currentPuzzle.maxAttempts - this.currentPuzzle.attempts 
            : -1;

        if (remaining === 0) {
            feedback.textContent = '✗ Maximum attempts reached. Access denied.';
            input.disabled = true;
            
            // Play failure sound
            this.playSound('failure');

            setTimeout(() => {
                if (this.currentPuzzle.onFailure) {
                    this.currentPuzzle.onFailure(this.game);
                }
                this.close();
            }, 2000);
        } else {
            const attemptsText = remaining > 0 ? ` (${remaining} attempts left)` : '';
            feedback.textContent = `✗ Incorrect password.${attemptsText}`;
            
            // Shake animation
            input.classList.add('error');
            setTimeout(() => input.classList.remove('error'), 500);
            
            // Clear input
            input.value = '';
            input.focus();

            // Play error sound
            this.playSound('error');

            // Call failure callback if provided
            if (this.currentPuzzle.onFailure) {
                this.currentPuzzle.onFailure(this.game, false); // false = not max attempts
            }
        }
    }

    /**
     * Play sound effect (if available)
     */
    playSound(type) {
        // Hook for future sound system integration
        // For now, just log
        console.log(`[Sound] ${type}`);
    }

    /**
     * Close the puzzle
     */
    close() {
        const puzzle = document.getElementById('password-puzzle');
        if (puzzle) {
            puzzle.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => puzzle.remove(), 300);
        }

        // Remove styles
        const styles = document.getElementById('password-puzzle-styles');
        if (styles) styles.remove();

        this.isActive = false;
        this.game.isPuzzleActive = false;
        this.currentPuzzle = null;
    }

    /**
     * Check if puzzle has been solved
     */
    isSolved(puzzleId) {
        return this.game.getFlag(`puzzle_${puzzleId}_solved`);
    }

    /**
     * Mark puzzle as solved
     */
    markSolved(puzzleId) {
        this.game.setFlag(`puzzle_${puzzleId}_solved`, true);
    }
}

// Add fadeOut animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(fadeOutStyle);

// Export for use
window.PasswordPuzzle = PasswordPuzzle;
