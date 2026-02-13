/**
 * Evidence Viewer System
 * Displays documents, images, schematics in an overlay interface
 * Supports multiple document types: text, image, schematic, email
 */

class EvidenceViewer {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.currentDocument = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.documentHistory = []; // Track viewed documents for quests
    }

    /**
     * Show a document in the viewer
     * @param {Object} documentData - Document configuration
     * @param {string} documentData.id - Unique document identifier
     * @param {string} documentData.type - Document type: 'text', 'image', 'schematic', 'email', 'report'
     * @param {string} documentData.title - Document title
     * @param {string|Array} documentData.content - Content (string or array of pages)
     * @param {string} documentData.author - Optional author
     * @param {string} documentData.date - Optional date
     * @param {Function} documentData.onRead - Optional callback when document is read
     */
    showDocument(documentData) {
        if (this.isOpen) {
            this.close();
        }

        this.currentDocument = documentData;
        this.currentPage = 1;
        
        // Calculate pages for text documents
        if (documentData.type === 'text' || documentData.type === 'report') {
            if (Array.isArray(documentData.content)) {
                this.totalPages = documentData.content.length;
            } else {
                this.totalPages = 1;
            }
        } else {
            this.totalPages = 1;
        }

        this.createViewerUI();
        this.isOpen = true;

        // Track as viewed
        if (!this.documentHistory.includes(documentData.id)) {
            this.documentHistory.push(documentData.id);
            if (documentData.onRead) {
                documentData.onRead(this.game);
            }
        }
    }

    /**
     * Create the viewer overlay UI
     */
    createViewerUI() {
        // Remove existing viewer if any
        const existing = document.getElementById('evidence-viewer');
        if (existing) {
            existing.remove();
        }

        const viewer = document.createElement('div');
        viewer.id = 'evidence-viewer';
        viewer.innerHTML = this.getViewerHTML();
        
        this.applyStyles(viewer);
        document.body.appendChild(viewer);

        // Add event listeners
        this.attachEventListeners();

        // Prevent clicks from propagating to game
        viewer.addEventListener('click', (e) => e.stopPropagation());
    }

    /**
     * Generate HTML for the viewer based on document type
     */
    getViewerHTML() {
        const doc = this.currentDocument;
        const content = this.getCurrentPageContent();

        let headerHTML = `
            <div class="ev-header">
                <div class="ev-title">
                    <span class="ev-icon">${this.getIconForType(doc.type)}</span>
                    <span class="ev-title-text">${doc.title}</span>
                </div>
                <button class="ev-close" id="ev-close-btn">✕</button>
            </div>
        `;

        let metaHTML = '';
        if (doc.author || doc.date) {
            metaHTML = `
                <div class="ev-meta">
                    ${doc.author ? `<span class="ev-author">Author: ${doc.author}</span>` : ''}
                    ${doc.date ? `<span class="ev-date">Date: ${doc.date}</span>` : ''}
                </div>
            `;
        }

        let contentHTML = '';
        switch (doc.type) {
            case 'text':
            case 'report':
                contentHTML = `<div class="ev-text-content">${this.formatTextContent(content)}</div>`;
                break;
            case 'email':
                contentHTML = this.formatEmailContent(content);
                break;
            case 'image':
                contentHTML = `<div class="ev-image-content"><img src="${content}" alt="${doc.title}" /></div>`;
                break;
            case 'schematic':
                contentHTML = this.formatSchematicContent(content);
                break;
            default:
                contentHTML = `<div class="ev-text-content">${content}</div>`;
        }

        let footerHTML = '';
        if (this.totalPages > 1) {
            footerHTML = `
                <div class="ev-footer">
                    <button class="ev-nav-btn" id="ev-prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>← Previous</button>
                    <span class="ev-page-info">Page ${this.currentPage} of ${this.totalPages}</span>
                    <button class="ev-nav-btn" id="ev-next-btn" ${this.currentPage === this.totalPages ? 'disabled' : ''}>Next →</button>
                </div>
            `;
        }

        return `
            <div class="ev-container">
                ${headerHTML}
                ${metaHTML}
                <div class="ev-content">
                    ${contentHTML}
                </div>
                ${footerHTML}
            </div>
        `;
    }

    /**
     * Get current page content
     */
    getCurrentPageContent() {
        const content = this.currentDocument.content;
        if (Array.isArray(content)) {
            return content[this.currentPage - 1];
        }
        return content;
    }

    /**
     * Format text content with paragraphs
     */
    formatTextContent(text) {
        // Convert newlines to paragraphs
        return text
            .split('\n\n')
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('');
    }

    /**
     * Format email content
     */
    formatEmailContent(email) {
        return `
            <div class="ev-email">
                <div class="ev-email-header">
                    <div class="ev-email-row"><strong>From:</strong> ${email.from}</div>
                    <div class="ev-email-row"><strong>To:</strong> ${email.to}</div>
                    <div class="ev-email-row"><strong>Subject:</strong> ${email.subject}</div>
                    <div class="ev-email-row"><strong>Date:</strong> ${email.date}</div>
                </div>
                <div class="ev-email-body">
                    ${this.formatTextContent(email.body)}
                </div>
            </div>
        `;
    }

    /**
     * Format schematic content
     */
    formatSchematicContent(schematic) {
        return `
            <div class="ev-schematic">
                <div class="ev-schematic-header">
                    <span class="ev-schematic-label">Classification: ${schematic.classification || 'CONFIDENTIAL'}</span>
                </div>
                <div class="ev-schematic-image">
                    <img src="${schematic.image}" alt="Schematic diagram" />
                </div>
                ${schematic.notes ? `<div class="ev-schematic-notes"><strong>Notes:</strong> ${schematic.notes}</div>` : ''}
                ${schematic.warning ? `<div class="ev-schematic-warning">⚠️ ${schematic.warning}</div>` : ''}
            </div>
        `;
    }

    /**
     * Get icon for document type
     */
    getIconForType(type) {
        const icons = {
            text: '📄',
            email: '✉️',
            image: '🖼️',
            schematic: '📐',
            report: '📊'
        };
        return icons[type] || '📄';
    }

    /**
     * Apply CSS styles to viewer
     */
    applyStyles(viewer) {
        viewer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Courier New', monospace;
        `;

        // Add embedded styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .ev-container {
                background: #1a1a1a;
                border: 2px solid #00ff88;
                border-radius: 8px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            }

            .ev-header {
                background: #0a0a0a;
                padding: 15px 20px;
                border-bottom: 2px solid #00ff88;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ev-title {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .ev-icon {
                font-size: 24px;
            }

            .ev-title-text {
                color: #00ff88;
                font-size: 18px;
                font-weight: bold;
            }

            .ev-close {
                background: #ff3333;
                color: white;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                transition: background 0.2s;
            }

            .ev-close:hover {
                background: #ff5555;
            }

            .ev-meta {
                background: #0f0f0f;
                padding: 10px 20px;
                border-bottom: 1px solid #333;
                display: flex;
                gap: 20px;
                color: #888;
                font-size: 12px;
            }

            .ev-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #0a0a0a;
                color: #ffffff;
                line-height: 1.6;
            }

            .ev-content::-webkit-scrollbar {
                width: 10px;
            }

            .ev-content::-webkit-scrollbar-track {
                background: #1a1a1a;
            }

            .ev-content::-webkit-scrollbar-thumb {
                background: #00ff88;
                border-radius: 5px;
            }

            .ev-text-content p {
                margin: 0 0 15px 0;
            }

            .ev-email {
                background: #0f0f0f;
                border: 1px solid #333;
                border-radius: 4px;
                overflow: hidden;
            }

            .ev-email-header {
                background: #1a1a1a;
                padding: 15px;
                border-bottom: 1px solid #333;
            }

            .ev-email-row {
                margin: 5px 0;
                color: #ccc;
            }

            .ev-email-row strong {
                color: #00ff88;
                min-width: 80px;
                display: inline-block;
            }

            .ev-email-body {
                padding: 15px;
            }

            .ev-schematic {
                text-align: center;
            }

            .ev-schematic-header {
                background: #ff9900;
                color: #000;
                padding: 5px;
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 15px;
            }

            .ev-schematic-image img {
                max-width: 100%;
                height: auto;
                border: 1px solid #333;
            }

            .ev-schematic-notes {
                margin-top: 15px;
                padding: 10px;
                background: #0f0f0f;
                border-left: 3px solid #00ff88;
                text-align: left;
            }

            .ev-schematic-warning {
                margin-top: 10px;
                padding: 10px;
                background: #ff3333;
                color: white;
                border-radius: 4px;
                font-weight: bold;
            }

            .ev-image-content {
                text-align: center;
            }

            .ev-image-content img {
                max-width: 100%;
                max-height: 70vh;
                border: 1px solid #333;
            }

            .ev-footer {
                background: #0a0a0a;
                border-top: 2px solid #00ff88;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ev-nav-btn {
                background: #00ff88;
                color: #000;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: background 0.2s;
            }

            .ev-nav-btn:hover:not(:disabled) {
                background: #00dd77;
            }

            .ev-nav-btn:disabled {
                background: #333;
                color: #666;
                cursor: not-allowed;
            }

            .ev-page-info {
                color: #00ff88;
                font-size: 14px;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    /**
     * Attach event listeners to buttons
     */
    attachEventListeners() {
        const closeBtn = document.getElementById('ev-close-btn');
        if (closeBtn) {
            const closeHandler = (e) => { e.preventDefault(); this.close(); };
            closeBtn.addEventListener('click', closeHandler);
            closeBtn.addEventListener('touchend', closeHandler);
        }

        const prevBtn = document.getElementById('ev-prev-btn');
        if (prevBtn) {
            const prevHandler = (e) => { e.preventDefault(); this.previousPage(); };
            prevBtn.addEventListener('click', prevHandler);
            prevBtn.addEventListener('touchend', prevHandler);
        }

        const nextBtn = document.getElementById('ev-next-btn');
        if (nextBtn) {
            const nextHandler = (e) => { e.preventDefault(); this.nextPage(); };
            nextBtn.addEventListener('click', nextHandler);
            nextBtn.addEventListener('touchend', nextHandler);
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Navigate to previous page
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.createViewerUI();
        }
    }

    /**
     * Navigate to next page
     */
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.createViewerUI();
        }
    }

    /**
     * Close the viewer
     */
    close() {
        const viewer = document.getElementById('evidence-viewer');
        if (viewer) {
            viewer.remove();
        }
        this.isOpen = false;
        this.currentDocument = null;
    }

    /**
     * Check if a document has been viewed
     */
    hasViewed(documentId) {
        return this.documentHistory.includes(documentId);
    }

    /**
     * Get list of viewed documents
     */
    getViewedDocuments() {
        return [...this.documentHistory];
    }
}

// Export for use
window.EvidenceViewer = EvidenceViewer;
