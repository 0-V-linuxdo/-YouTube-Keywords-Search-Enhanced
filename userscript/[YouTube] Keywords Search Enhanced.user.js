// ==UserScript==
// @name         [YouTube] Keywords Search Enhanced [20251110] v1.0.1
// @namespace    0_V userscripts/[YouTube] Keywords Search Enhanced
// @description  Enhanced keyword search for YouTube with advanced filtering options (Upload Date, Type, Duration, Features, Sort By), customizable settings, adaptive UI for light/dark modes, multi-select for Features, custom color support for filter categories, tabbed settings modal, and responsive design for narrow screens.
// @version      [20251110] v1.0.1
// @update-log   Modular split + safety notice + module banner docs
//
// @match        *://*.youtube.com/*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
//
// @icon         https://github.com/0-V-linuxdo/-YouTube-Keywords-Search-Enhanced/raw/refs/heads/main/assets/main_icon.svg
// ==/UserScript==

/* ===================== IMPORTANT · NOTICE · START =====================
 *
 * 1. [编辑指引 | Edit Guidance]
 *    • ⚠️ 这是一个自动生成的文件：请在 `src/modules` 目录下的模块中进行修改，然后运行 `npm run build` 在 `dist/` 目录下重新生成。
 *    • ⚠️ This project bundles auto-generated artifacts. Make changes inside the modules under `src/modules`, then run `npm run build` to regenerate everything under `dist/`.
 *
 * ----------------------------------------------------------------------
 *
 * 2. [安全提示 | Safety Reminder]
 *    • ✅ 必须使用 `setTrustedHTML`，不得使用 `innerHTML`。
 *    • ✅ Always call `setTrustedHTML`; never rely on `innerHTML`.
 *
 * ====================== IMPORTANT · NOTICE · END ======================
 */

/* -------------------------------------------------------------------------- *
 * Module 01 · Runtime services (namespace, defaults, config bootstrap)
 * -------------------------------------------------------------------------- */

(async function() {
    'use strict';

    // Namespace for uniqueness
    const NAMESPACE = 'yt-kse';

    // Default keywords (without filters initially)
    const defaultKeywords = [
        { keyword: 'Music', filters: { uploadDate: '', type: '', duration: '', features: [], sortBy: 'relevance' } },
        { keyword: 'Movie Trailers', filters: { uploadDate: '', type: '', duration: '', features: [], sortBy: 'relevance' } },
        { keyword: 'Tech Reviews', filters: { uploadDate: '', type: '', duration: '', features: [], sortBy: 'relevance' } },
        { keyword: 'Cooking Tutorials', filters: { uploadDate: '', type: '', duration: '', features: [], sortBy: 'relevance' } },
        { keyword: 'Funny Clips', filters: { uploadDate: '', type: '', duration: '', features: [], sortBy: 'relevance' } }
    ];

    // Hardcoded filter configuration extracted from HTML (with fallback for updates) and default colors
    const filterConfig = {
        uploadDate: {
            name: 'Upload Date',
            options: [
                { id: 'lastHour', name: 'Last hour', sp: 'EgIIAQ%253D%253D', color: '#FF6F61' },
                { id: 'today', name: 'Today', sp: 'EgIIAg%253D%253D', color: '#FFB085' },
                { id: 'thisWeek', name: 'This week', sp: 'EgIIAw%253D%253D', color: '#FFD700' },
                { id: 'thisMonth', name: 'This month', sp: 'EgIIBA%253D%253D', color: '#9ACD32' },
                { id: 'thisYear', name: 'This year', sp: 'EgIIBQ%253D%253D', color: '#20B2AA' }
            ],
            defaultColor: '#FF4500'
        },
        type: {
            name: 'Type',
            options: [
                { id: 'video', name: 'Video', sp: 'EgIQAQ%253D%253D', color: '#FF1493' },
                { id: 'channel', name: 'Channel', sp: 'EgIQAg%253D%253D', color: '#9400D3' },
                { id: 'playlist', name: 'Playlist', sp: 'EgIQAw%253D%253D', color: '#4B0082' },
                { id: 'movie', name: 'Movie', sp: 'EgIQBA%253D%253D', color: '#00CED1' }
            ],
            defaultColor: '#FF69B4'
        },
        duration: {
            name: 'Duration',
            options: [
                { id: 'under4min', name: 'Under 4 minutes', sp: 'EgIYAQ%253D%253D', color: '#32CD32' },
                { id: '4to20min', name: '4 - 20 minutes', sp: 'EgIYAw%253D%253D', color: '#FFA500' },
                { id: 'over20min', name: 'Over 20 minutes', sp: 'EgIYAg%253D%253D', color: '#FF4500' }
            ],
            defaultColor: '#9ACD32'
        },
        features: {
            name: 'Features',
            options: [
                { id: 'live', name: 'Live', sp: 'EgJAAQ%253D%253D', color: '#FF0000' },
                { id: '4k', name: '4K', sp: 'EgJwAQ%253D%253D', color: '#800080' },
                { id: 'hd', name: 'HD', sp: 'EgIgAQ%253D%253D', color: '#0000FF' },
                { id: 'subtitles', name: 'Subtitles/CC', sp: 'EgIoAQ%253D%253D', color: '#008000' },
                { id: 'creativeCommons', name: 'Creative Commons', sp: 'EgIwAQ%253D%253D', color: '#FFA500' },
                { id: '360', name: '360°', sp: 'EgJ4AQ%253D%253D', color: '#FF4500' },
                { id: 'vr180', name: 'VR180', sp: 'EgPQAQE%253D', color: '#FF1493' },
                { id: '3d', name: '3D', sp: 'EgI4AQ%253D%253D', color: '#9400D3' },
                { id: 'hdr', name: 'HDR', sp: 'EgPIAQE%253D', color: '#4B0082' },
                { id: 'location', name: 'Location', sp: 'EgO4AQE%253D', color: '#00CED1' },
                { id: 'purchased', name: 'Purchased', sp: 'EgJIAQ%253D%253D', color: '#20B2AA' }
            ],
            defaultColor: '#32CD32'
        },
        sortBy: {
            name: 'Sort By',
            options: [
                { id: 'relevance', name: 'Relevance', sp: '', color: '#696969' },
                { id: 'uploadDate', name: 'Upload date', sp: 'CAISAA%253D%253D', color: '#FF6F61' },
                { id: 'viewCount', name: 'View count', sp: 'CAMSAA%253D%253D', color: '#FFB085' },
                { id: 'rating', name: 'Rating', sp: 'CAESAA%253D%253D', color: '#FFD700' }
            ],
            defaultColor: '#808080'
        }
    };

    // Default settings for filters and colors
    const defaultSettings = {
        defaultFilters: {
            uploadDate: '',
            type: '',
            duration: '',
            features: [],
            sortBy: 'relevance'
        },
        categoryColors: Object.keys(filterConfig).reduce((acc, groupId) => {
            acc[groupId] = filterConfig[groupId].defaultColor;
            acc.options = acc.options || {};
            filterConfig[groupId].options.forEach(opt => {
                acc.options[`${groupId}-${opt.id}`] = opt.color;
            });
            return acc;
        }, {})
    };


/* -------------------------------------------------------------------------- *
 * Module 02 · Persistence helpers (GM storage for keywords and settings)
 * -------------------------------------------------------------------------- */

// Storage functions
    async function getKeywords() {
        const stored = await GM.getValue('yt_keywords', null);
        if (stored && Array.isArray(stored) && stored.length > 0) {
            if (typeof stored[0] === 'string') {
                return stored.map(keyword => ({ keyword, filters: { uploadDate: '', type: '', duration: '', features: [], sortBy: 'relevance' } }));
            } else {
                return stored.map(item => ({
                    keyword: item.keyword,
                    filters: {
                        uploadDate: item.filters.uploadDate || '',
                        type: item.filters.type || '',
                        duration: item.filters.duration || '',
                        features: Array.isArray(item.filters.features) ? item.filters.features : (item.filters.features ? [item.filters.features] : []),
                        sortBy: item.filters.sortBy || 'relevance'
                    }
                }));
            }
        }
        return defaultKeywords;
    }

    async function saveKeywords(keywords) {
        await GM.setValue('yt_keywords', keywords);
    }

    async function getSettings() {
        const stored = await GM.getValue('yt_settings', null);
        if (stored) {
            const settings = JSON.parse(stored);
            settings.defaultFilters.features = Array.isArray(settings.defaultFilters.features) ? settings.defaultFilters.features : (settings.defaultFilters.features ? [settings.defaultFilters.features] : []);
            return settings;
        }
        return defaultSettings;
    }

    async function saveSettings(settings) {
        await GM.setValue('yt_settings', JSON.stringify(settings));
    }

    async function getCategoryColor(groupId) {
        const settings = await getSettings();
        return settings.categoryColors[groupId] || filterConfig[groupId]?.defaultColor || '#808080';
    }

    async function getOptionColor(groupId, optionId) {
        const settings = await getSettings();
        return settings.categoryColors.options[`${groupId}-${optionId}`] || filterConfig[groupId]?.options.find(opt => opt.id === optionId)?.color || '#808080';
    }


/* -------------------------------------------------------------------------- *
 * Module 03 · Utility helpers (string sanitization and shared helpers)
 * -------------------------------------------------------------------------- */

// Utility functions
    function sanitizeAttribute(str) {
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }


/* -------------------------------------------------------------------------- *
 * Module 04 · Shadow DOM host (container creation + styling shell)
 * -------------------------------------------------------------------------- */

// Shadow DOM container creation
    function createShadowContainer() {
        const container = document.createElement('div');
        container.id = `${NAMESPACE}-container`;
        container.style.cssText = 'all: initial; position: absolute; z-index: 999999;';
        document.body.appendChild(container);

        const shadowRoot = container.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = getStyles();
        shadowRoot.appendChild(style);

        const contentContainer = document.createElement('div');
        contentContainer.className = `${NAMESPACE}-content-container`;
        shadowRoot.appendChild(contentContainer);

        return { shadowRoot, contentContainer };
    }

    const { shadowRoot, contentContainer } = createShadowContainer();


/* -------------------------------------------------------------------------- *
 * Module 05 · Modal backdrop controls (create/show/hide + close helpers)
 * -------------------------------------------------------------------------- */

// Modal backdrop
    function createModalBackdrop() {
        const backdrop = document.createElement('div');
        backdrop.id = `${NAMESPACE}-modal-backdrop`;
        backdrop.classList.add(`${NAMESPACE}-modal-backdrop`);
        backdrop.style.display = 'none';

        backdrop.addEventListener('click', (e) => {
            const settingsModal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
            if (settingsModal && settingsModal.style.display === 'block') {
                hideImportExportButtons();
                e.stopPropagation();
                return;
            } else {
                closeAllModals();
            }
        });

        return backdrop;
    }

    const modalBackdrop = createModalBackdrop();
    contentContainer.appendChild(modalBackdrop);

    function showModalBackdrop() {
        modalBackdrop.style.display = 'block';
        requestAnimationFrame(() => { modalBackdrop.style.opacity = '1'; });

        const settingsButton = shadowRoot.getElementById(`${NAMESPACE}-settings-button`);
        const syncButton = shadowRoot.getElementById(`${NAMESPACE}-sync-button`);
        if (settingsButton) settingsButton.style.pointerEvents = 'none';
        if (syncButton) syncButton.style.pointerEvents = 'none';
    }

    function hideModalBackdrop() {
        modalBackdrop.style.opacity = '0';
        modalBackdrop.addEventListener('transitionend', () => {
            modalBackdrop.style.display = 'none';
        }, { once: true });

        const settingsButton = shadowRoot.getElementById(`${NAMESPACE}-settings-button`);
        const syncButton = shadowRoot.getElementById(`${NAMESPACE}-sync-button`);
        if (settingsButton) settingsButton.style.pointerEvents = 'auto';
        if (syncButton) syncButton.style.pointerEvents = 'auto';
    }

    function closeAllModals() {
        hideImportExportButtons();
        const settingsModal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
        if (settingsModal) settingsModal.style.display = 'none';
        hideModalBackdrop();
    }


/* -------------------------------------------------------------------------- *
 * Module 06 · Settings modal UI (tabs, color pickers, and footer actions)
 * -------------------------------------------------------------------------- */

// Settings modal with color customization and tabs - Refactored for modularity
    function createSettingsModal() {
        const settingsModal = document.createElement('div');
        settingsModal.id = `${NAMESPACE}-settings-modal`;
        settingsModal.classList.add(`${NAMESPACE}-sync-modal`, `${NAMESPACE}-centered-modal`);
        settingsModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.classList.add(`${NAMESPACE}-sync-modal-content`);

        const header = createModalHeader();
        modalContent.appendChild(header);

        const body = createModalBody();
        modalContent.appendChild(body);

        settingsModal.appendChild(modalContent);
        return settingsModal;
    }

    function createModalHeader() {
        const header = document.createElement('div');
        header.classList.add(`${NAMESPACE}-sync-modal-header`);
        const title = document.createElement('h2');
        title.textContent = 'Settings';
        header.appendChild(title);

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.classList.add(`${NAMESPACE}-sync-modal-close-btn`);
        closeButton.addEventListener('click', () => {
            const settingsModal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
            settingsModal.style.display = 'none';
            hideModalBackdrop();
        });
        header.appendChild(closeButton);
        return header;
    }

    function createModalBody() {
        const body = document.createElement('div');
        body.classList.add(`${NAMESPACE}-settings-modal-body`);

        const tabContainer = createTabNavigation();
        body.appendChild(tabContainer);

        const tabContentContainer = createTabContentContainer();
        body.appendChild(tabContentContainer);

        const buttonSection = createButtonSection();
        body.appendChild(buttonSection);

        return body;
    }

    function createTabNavigation() {
        const tabContainer = document.createElement('div');
        tabContainer.classList.add(`${NAMESPACE}-tab-container`);

        const filterTabButton = document.createElement('button');
        filterTabButton.textContent = 'Default Filter Settings';
        filterTabButton.classList.add(`${NAMESPACE}-tab-button`, `${NAMESPACE}-active-tab`);

        const colorTabButton = document.createElement('button');
        colorTabButton.textContent = 'Filter Category Colors';
        colorTabButton.classList.add(`${NAMESPACE}-tab-button`);

        tabContainer.appendChild(filterTabButton);
        tabContainer.appendChild(colorTabButton);

        filterTabButton.addEventListener('click', () => {
            filterTabButton.classList.add(`${NAMESPACE}-active-tab`);
            colorTabButton.classList.remove(`${NAMESPACE}-active-tab`);
            shadowRoot.querySelector(`.${NAMESPACE}-filter-tab-content`).style.display = 'block';
            shadowRoot.querySelector(`.${NAMESPACE}-color-tab-content`).style.display = 'none';
        });

        colorTabButton.addEventListener('click', () => {
            colorTabButton.classList.add(`${NAMESPACE}-active-tab`);
            filterTabButton.classList.remove(`${NAMESPACE}-active-tab`);
            shadowRoot.querySelector(`.${NAMESPACE}-color-tab-content`).style.display = 'block';
            shadowRoot.querySelector(`.${NAMESPACE}-filter-tab-content`).style.display = 'none';
        });

        return tabContainer;
    }

    function createTabContentContainer() {
        const tabContentContainer = document.createElement('div');
        tabContentContainer.classList.add(`${NAMESPACE}-tab-content-container`);

        const filterTabContent = createFilterTabContent();
        tabContentContainer.appendChild(filterTabContent);

        const colorTabContent = createColorTabContent();
        tabContentContainer.appendChild(colorTabContent);

        return tabContentContainer;
    }

    function createFilterTabContent() {
        const filterTabContent = document.createElement('div');
        filterTabContent.classList.add(`${NAMESPACE}-tab-content`, `${NAMESPACE}-filter-tab-content`);
        filterTabContent.style.display = 'block';

        const filterSection = document.createElement('div');
        filterSection.classList.add(`${NAMESPACE}-settings-section`);
        const filterTitle = document.createElement('h3');
        filterTitle.textContent = 'Default Filter Settings';
        filterTitle.classList.add(`${NAMESPACE}-settings-subtitle`);
        filterSection.appendChild(filterTitle);

        const filterGrid = createFilterGrid();
        filterSection.appendChild(filterGrid);
        filterTabContent.appendChild(filterSection);

        return filterTabContent;
    }

    function createFilterGrid() {
        const filterGrid = document.createElement('div');
        filterGrid.classList.add(`${NAMESPACE}-filter-grid`);

        ['uploadDate', 'type', 'duration', 'sortBy'].forEach(groupId => {
            const group = filterConfig[groupId];
            const filterItem = document.createElement('div');
            filterItem.classList.add(`${NAMESPACE}-filter-item`);

            const label = document.createElement('label');
            label.textContent = group.name + ':';
            label.classList.add(`${NAMESPACE}-settings-label`);

            const select = document.createElement('select');
            select.id = `${NAMESPACE}-default-${groupId}-select`;
            select.classList.add(`${NAMESPACE}-settings-select`);
            select.dataset.group = groupId;

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'None';
            select.appendChild(defaultOption);

            group.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.id;
                option.textContent = opt.name;
                select.appendChild(option);
            });

            filterItem.appendChild(label);
            filterItem.appendChild(select);
            filterGrid.appendChild(filterItem);
        });

        const featuresItem = createFeaturesItem();
        filterGrid.appendChild(featuresItem);

        return filterGrid;
    }

    function createFeaturesItem() {
        const featuresGroup = filterConfig['features'];
        const featuresItem = document.createElement('div');
        featuresItem.classList.add(`${NAMESPACE}-filter-item`, `${NAMESPACE}-multi-select-item`);

        const featuresLabel = document.createElement('label');
        featuresLabel.textContent = featuresGroup.name + ':';
        featuresLabel.classList.add(`${NAMESPACE}-settings-label`);

        const featuresContainer = document.createElement('div');
        featuresContainer.id = `${NAMESPACE}-default-features-container`;
        featuresContainer.classList.add(`${NAMESPACE}-checkbox-container`);

        featuresGroup.options.forEach(opt => {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.classList.add(`${NAMESPACE}-checkbox-wrapper`);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${NAMESPACE}-default-features-${opt.id}`;
            checkbox.value = opt.id;
            checkbox.classList.add(`${NAMESPACE}-feature-checkbox`);

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = opt.name;
            label.classList.add(`${NAMESPACE}-checkbox-label`);

            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            featuresContainer.appendChild(checkboxWrapper);
        });

        featuresItem.appendChild(featuresLabel);
        featuresItem.appendChild(featuresContainer);
        return featuresItem;
    }

    function createColorTabContent() {
        const colorTabContent = document.createElement('div');
        colorTabContent.classList.add(`${NAMESPACE}-tab-content`, `${NAMESPACE}-color-tab-content`);
        colorTabContent.style.display = 'none';

        const colorSection = document.createElement('div');
        colorSection.classList.add(`${NAMESPACE}-settings-section`);
        const colorTitle = document.createElement('h3');
        colorTitle.textContent = 'Filter Category Colors';
        colorTitle.classList.add(`${NAMESPACE}-settings-subtitle`);
        colorSection.appendChild(colorTitle);

        const colorGrid = createColorGrid();
        colorSection.appendChild(colorGrid);
        colorTabContent.appendChild(colorSection);

        return colorTabContent;
    }

    function createColorGrid() {
        const colorGrid = document.createElement('div');
        colorGrid.classList.add(`${NAMESPACE}-color-grid`);

        Object.entries(filterConfig).forEach(([groupId, group]) => {
            const colorItem = document.createElement('div');
            colorItem.classList.add(`${NAMESPACE}-color-item`);

            const labelColorContainer = document.createElement('div');
            labelColorContainer.classList.add(`${NAMESPACE}-label-color-container`);

            const colorLabel = document.createElement('label');
            colorLabel.textContent = group.name + ':';
            colorLabel.classList.add(`${NAMESPACE}-settings-label`);

            const tagPreview = document.createElement('div');
            tagPreview.classList.add(`${NAMESPACE}-tag-preview`);
            tagPreview.dataset.category = groupId;
            tagPreview.style.border = `1px solid ${group.defaultColor}`;

            const sampleText = document.createElement('span');
            sampleText.textContent = `🔍 Color Preview`;

            const categoryBadge = document.createElement('span');
            categoryBadge.classList.add(`${NAMESPACE}-preview-badge`);
            categoryBadge.textContent = group.name;
            categoryBadge.style.backgroundColor = group.defaultColor;

            tagPreview.appendChild(sampleText);
            tagPreview.appendChild(categoryBadge);

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = group.defaultColor;
            colorInput.dataset.category = groupId;
            colorInput.classList.add(`${NAMESPACE}-color-input`);

            const updatePreview = (color) => {
                categoryBadge.style.backgroundColor = color;
                tagPreview.style.borderColor = color;
            };

            colorInput.addEventListener('input', (e) => {
                updatePreview(e.target.value);
            });

            labelColorContainer.appendChild(colorLabel);
            labelColorContainer.appendChild(tagPreview);
            labelColorContainer.appendChild(colorInput);
            colorItem.appendChild(labelColorContainer);

            const optionsContainer = createOptionsContainer(groupId, group);
            colorItem.appendChild(optionsContainer);

            colorGrid.appendChild(colorItem);
        });

        return colorGrid;
    }

    function createOptionsContainer(groupId, group) {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add(`${NAMESPACE}-options-color-container`);

        group.options.forEach(opt => {
            const optItem = document.createElement('div');
            optItem.classList.add(`${NAMESPACE}-option-color-item`);

            const optLabel = document.createElement('label');
            optLabel.textContent = opt.name + ':';
            optLabel.classList.add(`${NAMESPACE}-option-settings-label`);

            const optTagPreview = document.createElement('div');
            optTagPreview.classList.add(`${NAMESPACE}-option-tag-preview`);
            optTagPreview.dataset.option = `${groupId}-${opt.id}`;
            optTagPreview.style.border = `1px solid ${opt.color}`;

            const optSampleText = document.createElement('span');
            let previewText = 'Preview';
            if (groupId === 'uploadDate') previewText = 'Date';
            else if (groupId === 'type') previewText = 'Type';
            else if (groupId === 'duration') previewText = 'Time';
            else if (groupId === 'features') previewText = 'Feature';
            else if (groupId === 'sortBy') previewText = 'Sort';
            optSampleText.textContent = `🔍 ${previewText}`;

            const optBadge = document.createElement('span');
            optBadge.classList.add(`${NAMESPACE}-option-preview-badge`);
            optBadge.textContent = opt.name;
            optBadge.style.backgroundColor = opt.color;

            optTagPreview.appendChild(optSampleText);
            optTagPreview.appendChild(optBadge);

            const optColorInput = document.createElement('input');
            optColorInput.type = 'color';
            optColorInput.value = opt.color;
            optColorInput.dataset.option = `${groupId}-${opt.id}`;
            optColorInput.classList.add(`${NAMESPACE}-option-color-input`);

            const updateOptPreview = (color) => {
                optBadge.style.backgroundColor = color;
                optTagPreview.style.borderColor = color;
            };

            optColorInput.addEventListener('input', (e) => {
                updateOptPreview(e.target.value);
            });

            optItem.appendChild(optLabel);
            optItem.appendChild(optTagPreview);
            optItem.appendChild(optColorInput);
            optionsContainer.appendChild(optItem);
        });

        return optionsContainer;
    }

    function createButtonSection() {
        const buttonSection = document.createElement('div');
        buttonSection.classList.add(`${NAMESPACE}-settings-footer`);

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Defaults';
        resetButton.classList.add(`${NAMESPACE}-settings-btn`, `${NAMESPACE}-reset-btn`);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Settings';
        saveButton.classList.add(`${NAMESPACE}-settings-btn`, `${NAMESPACE}-save-btn`);

        buttonSection.appendChild(resetButton);
        buttonSection.appendChild(saveButton);

        attachResetButtonHandler(resetButton);
        attachSaveButtonHandler(saveButton);

        return buttonSection;
    }

    function attachResetButtonHandler(resetButton) {
        resetButton.addEventListener('click', async () => {
            Object.keys(filterConfig).forEach(groupId => {
                if (groupId === 'features') {
                    const checkboxes = shadowRoot.querySelectorAll(`.${NAMESPACE}-feature-checkbox`);
                    checkboxes.forEach(checkbox => checkbox.checked = false);
                } else {
                    const select = shadowRoot.getElementById(`${NAMESPACE}-default-${groupId}-select`);
                    if (select) {
                        select.value = defaultSettings.defaultFilters[groupId] || '';
                    }
                }
            });

            const colorSection = shadowRoot.querySelector(`.${NAMESPACE}-settings-section`);
            const colorInputs = colorSection.querySelectorAll(`.${NAMESPACE}-color-input`);
            colorInputs.forEach(input => {
                const categoryId = input.dataset.category;
                const group = filterConfig[categoryId];
                if (group) {
                    input.value = group.defaultColor;
                    const tagPreview = colorSection.querySelector(`.${NAMESPACE}-tag-preview[data-category="${categoryId}"]`);
                    if (tagPreview) {
                        tagPreview.style.borderColor = group.defaultColor;
                        const badge = tagPreview.querySelector(`.${NAMESPACE}-preview-badge`);
                        if (badge) badge.style.backgroundColor = group.defaultColor;
                    }
                }
            });

            const optionColorInputs = colorSection.querySelectorAll(`.${NAMESPACE}-option-color-input`);
            optionColorInputs.forEach(input => {
                const optionKey = input.dataset.option;
                const [groupId, optId] = optionKey.split('-');
                const group = filterConfig[groupId];
                const opt = group?.options.find(o => o.id === optId);
                if (opt) {
                    input.value = opt.color;
                    const optTagPreview = colorSection.querySelector(`.${NAMESPACE}-option-tag-preview[data-option="${optionKey}"]`);
                    if (optTagPreview) {
                        optTagPreview.style.borderColor = opt.color;
                        const optBadge = optTagPreview.querySelector(`.${NAMESPACE}-option-preview-badge`);
                        if (optBadge) optBadge.style.backgroundColor = opt.color;
                    }
                }
            });
        });
    }

    function attachSaveButtonHandler(saveButton) {
        saveButton.addEventListener('click', async () => {
            const settings = {
                defaultFilters: {},
                categoryColors: {
                    options: {}
                }
            };

            Object.keys(filterConfig).forEach(groupId => {
                if (groupId === 'features') {
                    const checkboxes = shadowRoot.querySelectorAll(`.${NAMESPACE}-feature-checkbox:checked`);
                    settings.defaultFilters[groupId] = Array.from(checkboxes).map(cb => cb.value);
                } else {
                    const select = shadowRoot.getElementById(`${NAMESPACE}-default-${groupId}-select`);
                    if (select) {
                        settings.defaultFilters[groupId] = select.value;
                    }
                }
            });

            const colorSection = shadowRoot.querySelector(`.${NAMESPACE}-settings-section`);
            const colorInputs = colorSection.querySelectorAll(`.${NAMESPACE}-color-input`);
            colorInputs.forEach(input => {
                settings.categoryColors[input.dataset.category] = input.value;
            });

            const optionColorInputs = colorSection.querySelectorAll(`.${NAMESPACE}-option-color-input`);
            optionColorInputs.forEach(input => {
                settings.categoryColors.options[input.dataset.option] = input.value;
            });

            await saveSettings(settings);
            const settingsModal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
            settingsModal.style.display = 'none';
            hideModalBackdrop();

            const notification = document.createElement('div');
            notification.textContent = 'Settings saved';
            notification.classList.add(`${NAMESPACE}-notification`);
            contentContainer.appendChild(notification);

            setTimeout(() => {
                notification.classList.add(`${NAMESPACE}-notification-show`);
                setTimeout(() => {
                    notification.classList.remove(`${NAMESPACE}-notification-show`);
                    setTimeout(() => {
                        contentContainer.removeChild(notification);
                    }, 300);
                }, 2000);
            }, 10);

            const keywordList = shadowRoot.getElementById(`${NAMESPACE}-current-group-tags`);
            if (keywordList) {
                const tags = keywordList.querySelectorAll(`.${NAMESPACE}-tag-item`);
                tags.forEach(async (tag) => {
                    const badges = tag.querySelectorAll(`.${NAMESPACE}-filter-badge`);
                    badges.forEach(async badge => {
                        const text = badge.textContent;
                        for (const [groupId, group] of Object.entries(filterConfig)) {
                            const opt = group.options.find(o => o.name === text);
                            if (opt) {
                                const color = await getOptionColor(groupId, opt.id);
                                badge.style.backgroundColor = color;
                                break;
                            }
                        }
                    });
                });
            }

            const selects = shadowRoot.querySelectorAll(`.${NAMESPACE}-filter-select`);
            selects.forEach(async select => {
                const groupId = select.dataset.group;
                const options = select.querySelectorAll('option');
                options.forEach(async opt => {
                    if (opt.value && opt.value !== '') {
                        const color = await getOptionColor(groupId, opt.value);
                        opt.style.color = color;
                    }
                });
            });
        });
    }

    // Load settings into modal
    (async () => {
        const settingsModal = createSettingsModal();
        contentContainer.appendChild(settingsModal);

        const settings = await getSettings();
        Object.entries(settings.defaultFilters).forEach(([groupId, value]) => {
            if (groupId === 'features') {
                const featureValues = value || [];
                featureValues.forEach(val => {
                    const checkbox = shadowRoot.getElementById(`${NAMESPACE}-default-features-${val}`);
                    if (checkbox) checkbox.checked = true;
                });
            } else {
                const select = shadowRoot.getElementById(`${NAMESPACE}-default-${groupId}-select`);
                if (select) {
                    select.value = value || '';
                }
            }
        });

        const colorSection = shadowRoot.querySelector(`.${NAMESPACE}-settings-section`);
        const colorInputs = colorSection.querySelectorAll(`.${NAMESPACE}-color-input`);
        colorInputs.forEach(input => {
            const categoryId = input.dataset.category;
            if (settings.categoryColors?.[categoryId]) {
                input.value = settings.categoryColors[categoryId];
                const tagPreview = colorSection.querySelector(`.${NAMESPACE}-tag-preview[data-category="${categoryId}"]`);
                if (tagPreview) {
                    tagPreview.style.borderColor = settings.categoryColors[categoryId];
                    const badge = tagPreview.querySelector(`.${NAMESPACE}-preview-badge`);
                    if (badge) badge.style.backgroundColor = settings.categoryColors[categoryId];
                }
            }
        });

        const optionColorInputs = colorSection.querySelectorAll(`.${NAMESPACE}-option-color-input`);
        optionColorInputs.forEach(input => {
            const optionKey = input.dataset.option;
            if (settings.categoryColors?.options?.[optionKey]) {
                input.value = settings.categoryColors.options[optionKey];
                const optTagPreview = colorSection.querySelector(`.${NAMESPACE}-option-tag-preview[data-option="${optionKey}"]`);
                if (optTagPreview) {
                    optTagPreview.style.borderColor = settings.categoryColors.options[optionKey];
                    const optBadge = optTagPreview.querySelector(`.${NAMESPACE}-option-preview-badge`);
                    if (optBadge) optBadge.style.backgroundColor = settings.categoryColors.options[optionKey];
                }
            }
        });
    })();

    // Import/export buttons

/* -------------------------------------------------------------------------- *
 * Module 07 · Import / Export controls (keyword file interactions)
 * -------------------------------------------------------------------------- */

function createImportButton() {
        const importButton = document.createElement('button');
        importButton.id = `${NAMESPACE}-import-button`;
        importButton.classList.add(`${NAMESPACE}-icon-btn`, `${NAMESPACE}-import-export-btn`);
        importButton.title = 'Import Keywords';
        importButton.textContent = '📥';
        importButton.style.display = 'none';

        importButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json,application/json';
            fileInput.style.display = 'none';

            fileInput.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            fileInput.addEventListener('change', async (event) => {
                event.stopPropagation();
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const importedKeywords = JSON.parse(e.target.result);
                            if (Array.isArray(importedKeywords)) {
                                const formattedKeywords = importedKeywords.map(item => ({
                                    keyword: item.keyword || item,
                                    filters: {
                                        uploadDate: item.filters?.uploadDate || '',
                                        type: item.filters?.type || '',
                                        duration: item.filters?.duration || '',
                                        features: Array.isArray(item.filters?.features) ? item.filters.features : (item.filters?.features ? [item.filters.features] : []),
                                        sortBy: item.filters?.sortBy || 'relevance'
                                    }
                                }));
                                await saveKeywords(formattedKeywords);
                                alert('Keywords imported successfully!');
                                const keywordList = shadowRoot.getElementById(`${NAMESPACE}-current-group-tags`);
                                if (keywordList) {
                                    await renderKeywordList(keywordList);
                                }
                            } else {
                                alert('Invalid import file format!');
                            }
                        } catch (error) {
                            alert('Failed to parse import file!');
                        }
                    };
                    reader.readAsText(file);
                }
            });

            document.body.appendChild(fileInput);
            setTimeout(() => {
                fileInput.click();
                setTimeout(() => {
                    if (document.body.contains(fileInput)) {
                        document.body.removeChild(fileInput);
                    }
                }, 300);
            }, 0);
        });

        return importButton;
    }

    function createExportButton() {
        const exportButton = document.createElement('button');
        exportButton.id = `${NAMESPACE}-export-button`;
        exportButton.classList.add(`${NAMESPACE}-icon-btn`, `${NAMESPACE}-import-export-btn`);
        exportButton.title = 'Export Keywords';
        exportButton.textContent = '📤';
        exportButton.style.display = 'none';

        exportButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const keywords = await getKeywords();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(keywords, null, 4));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.href = dataStr;
            downloadAnchor.download = 'youtube_Keywords_Search.json';

            downloadAnchor.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
        });

        return exportButton;
    }

    function toggleImportExportButtons() {
        const importButton = shadowRoot.getElementById(`${NAMESPACE}-import-button`);
        const exportButton = shadowRoot.getElementById(`${NAMESPACE}-export-button`);

        if (importButton && exportButton) {
            const isVisible = importButton.style.display !== 'block';
            if (isVisible) {
                showImportExportButtons();
            } else {
                hideImportExportButtons();
            }
        }
    }

    function showImportExportButtons() {
        const importButton = shadowRoot.getElementById(`${NAMESPACE}-import-button`);
        const exportButton = shadowRoot.getElementById(`${NAMESPACE}-export-button`);

        if (importButton && exportButton) {
            importButton.style.display = 'block';
            exportButton.style.display = 'block';

            requestAnimationFrame(() => {
                importButton.style.opacity = '1';
                importButton.style.transform = 'translateY(0)';

                setTimeout(() => {
                    exportButton.style.opacity = '1';
                    exportButton.style.transform = 'translateY(0)';
                }, 50);
            });
        }
    }

    function hideImportExportButtons() {
        const importButton = shadowRoot.getElementById(`${NAMESPACE}-import-button`);
        const exportButton = shadowRoot.getElementById(`${NAMESPACE}-export-button`);

        if (importButton && exportButton) {
            exportButton.style.opacity = '0';
            exportButton.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                importButton.style.opacity = '0';
                importButton.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    importButton.style.display = 'none';
                    exportButton.style.display = 'none';
                }, 300);
            }, 50);
        }
    }


/* -------------------------------------------------------------------------- *
 * Module 08 · Action buttons (sync + settings toggles)
 * -------------------------------------------------------------------------- */

// Sync and settings buttons
    function createSyncButton() {
        const syncButton = document.createElement('button');
        syncButton.id = `${NAMESPACE}-sync-button`;
        syncButton.classList.add(`${NAMESPACE}-icon-btn`, `${NAMESPACE}-sync-external-btn`);
        syncButton.title = 'Sync';
        syncButton.textContent = '🔄';

        syncButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleImportExportButtons();

            const settingsModal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
            if (settingsModal && settingsModal.style.display === 'block') {
                settingsModal.style.display = 'none';
                hideModalBackdrop();
            }
        });

        return syncButton;
    }

    function createSettingsButton() {
        const settingsButton = document.createElement('button');
        settingsButton.id = `${NAMESPACE}-settings-button`;
        settingsButton.classList.add(`${NAMESPACE}-icon-btn`, `${NAMESPACE}-settings-external-btn`);
        settingsButton.title = 'Settings';
        settingsButton.textContent = '🛠️';

        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            hideImportExportButtons();
            const settingsModal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
            settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
            if (settingsModal.style.display === 'block') {
                showModalBackdrop();
            } else {
                hideModalBackdrop();
            }
        });

        return settingsButton;
    }


/* -------------------------------------------------------------------------- *
 * Module 09 · Keyword panel UI (list rendering + filter inputs)
 * -------------------------------------------------------------------------- */

// Keyword container with filter selection
    function createKeywordDiv() {
        const keywordDiv = document.createElement('div');
        keywordDiv.id = `${NAMESPACE}-keyword-search-container`;
        keywordDiv.classList.add(`${NAMESPACE}-keyword-search-container`);
        keywordDiv.style.display = 'none';

        const keywordList = document.createElement('ul');
        keywordList.id = `${NAMESPACE}-current-group-tags`;
        keywordList.classList.add(`${NAMESPACE}-tag-list`);

        async function renderKeywordList() {
            keywordList.replaceChildren();
            const keywords = await getKeywords();
            for (let i = 0; i < keywords.length; i++) {
                const item = keywords[i];
                const li = document.createElement('li');
                li.classList.add(`${NAMESPACE}-tag-item`);

                const span = document.createElement('span');
                const keywordLabel = typeof item.keyword === 'string' ? item.keyword : String(item.keyword ?? '');
                span.textContent = `🔍 ${keywordLabel}`;
                const badges = [];
                const addBadge = (groupId, optionValue, label) => {
                    const badge = document.createElement('span');
                    badge.classList.add(`${NAMESPACE}-filter-badge`);
                    badge.dataset.group = groupId;
                    badge.dataset.value = optionValue;
                    badge.textContent = label;
                    badges.push(badge);
                };

                Object.entries(item.filters).forEach(([group, value]) => {
                    if (group === 'features') {
                        const featureValues = Array.isArray(value) ? value : (value ? [value] : []);
                        featureValues.forEach(val => {
                            const opt = filterConfig[group]?.options.find(o => o.id === val);
                            if (opt) addBadge(group, val, opt.name);
                        });
                        return;
                    }

                    if (value && value !== 'relevance') {
                        const opt = filterConfig[group]?.options.find(o => o.id === value);
                        if (opt) addBadge(group, value, opt.name);
                    }
                });

                if (badges.length) {
                    span.append(' ');
                    badges.forEach(badge => span.appendChild(badge));
                }
                span.style.cursor = 'pointer';
                span.addEventListener('click', () => {
                    const newUrl = buildSearchUrl(item.keyword, item.filters);
                    window.location.href = newUrl;
                    closeModal();
                });

                setTimeout(async () => {
                    const badges = li.querySelectorAll(`.${NAMESPACE}-filter-badge`);
                    for (const badge of badges) {
                        const groupId = badge.dataset.group;
                        const value = badge.dataset.value;
                        const color = await getOptionColor(groupId, value);
                        badge.style.backgroundColor = color;
                    }
                }, 0);

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add(`${NAMESPACE}-delete-tag`);
                deleteBtn.textContent = '×';
                deleteBtn.title = 'Delete';
                deleteBtn.addEventListener('click', async () => {
                    const updatedKeywords = (await getKeywords()).filter((_, idx) => idx !== i);
                    await saveKeywords(updatedKeywords);
                    await renderKeywordList();
                });

                li.appendChild(span);
                li.appendChild(deleteBtn);
                keywordList.appendChild(li);
            }
        }

        renderKeywordList();
        keywordDiv.appendChild(keywordList);

        const inputContainer = document.createElement('div');
        inputContainer.classList.add(`${NAMESPACE}-input-container`);
        const addInput = document.createElement('textarea');
        addInput.placeholder = 'Add new keyword';
        addInput.classList.add(`${NAMESPACE}-modern-input`, `${NAMESPACE}-keyword-textarea`);
        addInput.id = `${NAMESPACE}-add-keyword-input`;
        addInput.maxLength = 100;
        addInput.rows = 1;

        let lastValue = '';
        ['input', 'keydown', 'keyup', 'focus', 'blur', 'compositionstart', 'compositionend'].forEach(eventType => {
            addInput.addEventListener(eventType, function() {
                if (lastValue !== this.value || eventType === 'focus') {
                    lastValue = this.value;
                    this.style.height = 'auto';
                    const newHeight = Math.min(this.scrollHeight, 120);
                    this.style.height = `${newHeight}px`;
                    this.style.overflowY = this.scrollHeight > 120 ? 'auto' : 'hidden';
                }
            }, true);
        });

        inputContainer.appendChild(addInput);
        keywordDiv.appendChild(inputContainer);

        const filterGroups = document.createElement('div');
        filterGroups.classList.add(`${NAMESPACE}-filter-groups`);
        filterGroups.id = `${NAMESPACE}-filter-groups`;

        ['uploadDate', 'type', 'duration', 'sortBy'].forEach(groupId => {
            const group = filterConfig[groupId];
            const filterGroup = document.createElement('div');
            filterGroup.classList.add(`${NAMESPACE}-filter-group`);

            const label = document.createElement('label');
            label.textContent = group.name + ':';
            label.classList.add(`${NAMESPACE}-filter-label`);

            const select = document.createElement('select');
            select.classList.add(`${NAMESPACE}-filter-select`);
            select.dataset.group = groupId;

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'None';
            select.appendChild(defaultOption);

            group.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.id;
                option.textContent = opt.name;
                select.appendChild(option);
            });

            setTimeout(async () => {
                const options = select.querySelectorAll('option');
                for (const opt of options) {
                    if (opt.value && opt.value !== '') {
                        const color = await getOptionColor(groupId, opt.value);
                        opt.style.color = color;
                    }
                }
            }, 0);

            filterGroup.appendChild(label);
            filterGroup.appendChild(select);
            filterGroups.appendChild(filterGroup);
        });

        const featuresGroup = filterConfig['features'];
        const featuresFilterGroup = document.createElement('div');
        featuresFilterGroup.classList.add(`${NAMESPACE}-filter-group`, `${NAMESPACE}-features-group`);

        const featuresLabel = document.createElement('label');
        featuresLabel.textContent = featuresGroup.name + ':';
        featuresLabel.classList.add(`${NAMESPACE}-filter-label`);

        const featuresContainer = document.createElement('div');
        featuresContainer.id = `${NAMESPACE}-features-container`;
        featuresContainer.classList.add(`${NAMESPACE}-checkbox-container`);

        featuresGroup.options.forEach(opt => {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.classList.add(`${NAMESPACE}-checkbox-wrapper`);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${NAMESPACE}-features-${opt.id}`;
            checkbox.value = opt.id;
            checkbox.classList.add(`${NAMESPACE}-feature-checkbox`);

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = opt.name;
            label.classList.add(`${NAMESPACE}-checkbox-label`);

            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            featuresContainer.appendChild(checkboxWrapper);
        });

        featuresFilterGroup.appendChild(featuresLabel);
        featuresFilterGroup.appendChild(featuresContainer);
        filterGroups.appendChild(featuresFilterGroup);

        keywordDiv.appendChild(filterGroups);

        const submitButtonContainer = document.createElement('div');
        submitButtonContainer.classList.add(`${NAMESPACE}-submit-button-container`);
        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.classList.add(`${NAMESPACE}-modern-btn`);
        addButton.id = `${NAMESPACE}-add-keyword-btn`;

        async function addKeyword() {
            const newKeyword = addInput.value.trim();
            if (newKeyword) {
                const keywords = await getKeywords();
                if (!keywords.some(item => item.keyword === newKeyword)) {
                    const filters = {
                        uploadDate: '',
                        type: '',
                        duration: '',
                        features: [],
                        sortBy: 'relevance'
                    };
                    Object.keys(filterConfig).forEach(groupId => {
                        if (groupId === 'features') {
                            const checkboxes = shadowRoot.querySelectorAll(`.${NAMESPACE}-feature-checkbox:checked`);
                            filters[groupId] = Array.from(checkboxes).map(cb => cb.value);
                        } else {
                            const select = shadowRoot.querySelector(`.${NAMESPACE}-filter-select[data-group="${groupId}"]`);
                            if (select) {
                                filters[groupId] = select.value || '';
                            }
                        }
                    });
                    keywords.push({ keyword: newKeyword, filters });
                    await saveKeywords(keywords);
                    await renderKeywordList();
                    addInput.value = '';
                    lastValue = '';
                    addInput.style.height = 'auto';
                    addInput.focus();
                    Object.keys(filterConfig).forEach(groupId => {
                        if (groupId === 'features') {
                            const checkboxes = shadowRoot.querySelectorAll(`.${NAMESPACE}-feature-checkbox`);
                            checkboxes.forEach(cb => cb.checked = false);
                        } else {
                            const select = shadowRoot.querySelector(`.${NAMESPACE}-filter-select[data-group="${groupId}"]`);
                            if (select) {
                                select.value = '';
                            }
                        }
                    });
                } else {
                    alert('Keyword already exists!');
                }
            }
        }

        addButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await addKeyword();
        });

        addInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                await addKeyword();
            }
        });

        submitButtonContainer.appendChild(addButton);
        keywordDiv.appendChild(submitButtonContainer);

        return keywordDiv;
    }


/* -------------------------------------------------------------------------- *
 * Module 10 · Search URL builder (priority-based sp parameter logic)
 * -------------------------------------------------------------------------- */

// Revised buildSearchUrl function to correctly handle multiple filter parameters
    // Issue: Original function only applied one filter due to YouTube's single 'sp' parameter limitation and strict priority
    // Solution: Prioritize filters logically and attempt to combine parameters where possible using YouTube's filter syntax
    function buildSearchUrl(keyword, filters) {
        let url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;

        // Array to store active filter 'sp' values based on priority
        const activeSpFilters = [];
        // Object to store additional filter parameters if supported by YouTube
        let additionalParams = [];

        // Priority 1: Sort By (highest priority as it often overrides other filters)
        if (filters['sortBy'] && filters['sortBy'] !== 'relevance') {
            const groupData = filterConfig['sortBy'];
            const opt = groupData?.options.find(o => o.id === filters['sortBy']);
            if (opt && opt.sp) {
                activeSpFilters.push(opt.sp);
                // Add sort-specific parameters if applicable
                if (filters['sortBy'] === 'uploadDate') {
                    additionalParams.push('sort=dd');
                } else if (filters['sortBy'] === 'viewCount') {
                    additionalParams.push('sort=vv');
                } else if (filters['sortBy'] === 'rating') {
                    additionalParams.push('sort=rr');
                }
            }
        }

        // Priority 2: Type (important for content filtering like 'video')
        if (filters['type'] && filters['type'] !== '') {
            const groupData = filterConfig['type'];
            const opt = groupData?.options.find(o => o.id === filters['type']);
            if (opt && opt.sp) {
                activeSpFilters.push(opt.sp);
                // Attempt to use YouTube's filter parameter for type if supported
                additionalParams.push(`filters=${filters['type']}`);
            }
        }

        // Priority 3: Upload Date
        if (filters['uploadDate'] && filters['uploadDate'] !== '') {
            const groupData = filterConfig['uploadDate'];
            const opt = groupData?.options.find(o => o.id === filters['uploadDate']);
            if (opt && opt.sp) {
                activeSpFilters.push(opt.sp);
            }
        }

        // Priority 4: Duration
        if (filters['duration'] && filters['duration'] !== '') {
            const groupData = filterConfig['duration'];
            const opt = groupData?.options.find(o => o.id === filters['duration']);
            if (opt && opt.sp) {
                activeSpFilters.push(opt.sp);
            }
        }

        // Priority 5: Features (lowest priority, multiple can be selected)
        if (filters['features'] && filters['features'].length > 0) {
            for (const featureId of filters['features']) {
                const groupData = filterConfig['features'];
                const opt = groupData?.options.find(o => o.id === featureId);
                if (opt && opt.sp) {
                    activeSpFilters.push(opt.sp);
                }
            }
        }

        // Apply filters to URL
        if (activeSpFilters.length > 0) {
            // YouTube primarily uses one 'sp' parameter at a time
            // We use the first (highest priority) filter's sp value
            // This ensures at least the most important filter is applied
            url += `&sp=${activeSpFilters[0]}`;
        }

        // Add any additional parameters if they exist
        if (additionalParams.length > 0) {
            url += '&' + additionalParams.join('&');
        }

        return url;
    }


/* -------------------------------------------------------------------------- *
 * Module 11 · Component wiring (instantiate controls into the shell)
 * -------------------------------------------------------------------------- */

const settingsButton = createSettingsButton();
    const syncButton = createSyncButton();
    const importButton = createImportButton();
    const exportButton = createExportButton();
    const keywordDiv = createKeywordDiv();

    contentContainer.appendChild(settingsButton);
    contentContainer.appendChild(syncButton);
    contentContainer.appendChild(importButton);
    contentContainer.appendChild(exportButton);
    contentContainer.appendChild(keywordDiv);


/* -------------------------------------------------------------------------- *
 * Module 12 · Layout helpers (position calculations + DOM ancestry checks)
 * -------------------------------------------------------------------------- */

function repositionPanel(keywordDiv, searchContainer, settingsButton, syncButton, importButton, exportButton) {
        if (!keywordDiv || !searchContainer) return;

        const searchContainerRect = searchContainer.getBoundingClientRect();
        const maxWidth = Math.min(searchContainerRect.width, window.innerWidth * 0.9);
        const leftOffset = Math.max(
            window.scrollX + Math.min(searchContainerRect.left, window.innerWidth - maxWidth - 20),
            window.scrollX + (window.innerWidth - maxWidth) / 2
        );

        const mainContainer = shadowRoot.getElementById(`${NAMESPACE}-container`);
        if (mainContainer) {
            mainContainer.style.position = 'absolute';
            mainContainer.style.top = `${searchContainerRect.bottom + window.scrollY + 10}px`;
            mainContainer.style.left = `${leftOffset}px`;
            mainContainer.style.width = `${maxWidth}px`;
        }
    }

    function isDescendantOrSelf(parent, child) {
        if (child === parent) {
            return true;
        }
        let node = child.parentNode;
        while (node != null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }


/* -------------------------------------------------------------------------- *
 * Module 13 · Config modal entry (open/close + default population)
 * -------------------------------------------------------------------------- */

async function openConfigModal() {
        const keywordDiv = shadowRoot.getElementById(`${NAMESPACE}-keyword-search-container`);
        if (!keywordDiv || keywordDiv.style.display === 'block') return;

        keywordDiv.style.display = 'block';
        const searchSelectors = ['input[name="search_query"]', '#search-form input#search', '.ytSearchboxComponentInputBox input'];
        const searchContainer = searchSelectors.map(s => document.querySelector(s)).find(el => el);
        repositionPanel(keywordDiv, searchContainer, settingsButton, syncButton, importButton, exportButton);
        requestAnimationFrame(() => {
            keywordDiv.style.opacity = '1';
            keywordDiv.style.transform = 'scale(1)';
            const addInput = shadowRoot.getElementById(`${NAMESPACE}-add-keyword-input`);
            if (addInput) setTimeout(() => addInput.focus(), 100);
        });

        const settings = await getSettings();
        Object.entries(settings.defaultFilters).forEach(([groupId, value]) => {
            if (groupId === 'features') {
                const featureValues = value || [];
                featureValues.forEach(val => {
                    const checkbox = shadowRoot.getElementById(`${NAMESPACE}-features-${val}`);
                    if (checkbox) checkbox.checked = true;
                });
            } else {
                const select = shadowRoot.querySelector(`.${NAMESPACE}-filter-select[data-group="${groupId}"]`);
                if (select) {
                    select.value = value || '';
                }
            }
        });

        Object.keys(filterConfig).forEach(async groupId => {
            if (groupId !== 'features') {
                const select = shadowRoot.querySelector(`.${NAMESPACE}-filter-select[data-group="${groupId}"]`);
                if (select) {
                    const options = select.querySelectorAll('option');
                    for (const opt of options) {
                        if (opt.value && opt.value !== '') {
                            const color = await getOptionColor(groupId, opt.value);
                            opt.style.color = color;
                        }
                    }
                }
            }
        });
    }

    function closeModal() {
        const keywordDiv = shadowRoot.getElementById(`${NAMESPACE}-keyword-search-container`);
        if (keywordDiv) {
            keywordDiv.style.opacity = '0';
            keywordDiv.style.transform = 'scale(0.95)';
            keywordDiv.addEventListener('transitionend', () => {
                keywordDiv.style.display = 'none';
            }, { once: true });
        }
        closeAllModals();
    }


/* -------------------------------------------------------------------------- *
 * Module 14 · Bootstrapper (attach keyword button + observers)
 * -------------------------------------------------------------------------- */

async function initScript() {
        if (!window.location.href.includes('youtube.com')) return;

        const searchSelectors = [
            'input[name="search_query"]',
            '#search-form input#search',
            '.ytSearchboxComponentInputBox input'
        ];

        for (const selector of searchSelectors) {
            const searchInput = document.querySelector(selector);
            if (!searchInput) continue;

            if (document.querySelector(`#${NAMESPACE}-keyword-tag-button`)) return;

            const searchContainer = searchInput.closest('form') || searchInput.parentElement;
            if (!searchContainer) continue;

            const keywordButton = document.createElement('button');
            keywordButton.type = 'button';
            keywordButton.id = `${NAMESPACE}-keyword-tag-button`;
            keywordButton.textContent = '🏷️';
            keywordButton.className = `${NAMESPACE}-modern-btn`;
            keywordButton.style.cssText = `
                background: none !important; border: none !important; cursor: pointer; font-size: 18px; touch-action: manipulation; color: var(--button-icon-color, #333); transition: color 0.3s ease; padding: 0; display: flex !important; align-items: center !important; justify-content: center !important; outline: none; box-shadow: none !important; position: absolute !important; top: 50% !important; transform: translateY(-50%) !important; height: auto !important; min-height: 24px !important; right: 10px !important; z-index: 2147483647 !important; margin-right: 25px;
            `;

            searchContainer.appendChild(keywordButton);

            function toggleKeywordDiv(show) {
                const isVisible = show !== undefined ? show : keywordDiv.style.display !== 'block';
                if (isVisible) {
                    const searchContainerRect = searchContainer.getBoundingClientRect();
                    const maxWidth = Math.min(searchContainerRect.width, window.innerWidth * 0.9);
                    const leftOffset = Math.max(
                        window.scrollX + Math.min(searchContainerRect.left, window.innerWidth - maxWidth - 20),
                        window.scrollY + (window.innerWidth - maxWidth) / 2
                    );

                    const mainContainer = document.getElementById(`${NAMESPACE}-container`);
                    if (mainContainer) {
                        mainContainer.style.position = 'absolute';
                        mainContainer.style.top = `${searchContainerRect.bottom + window.scrollY + 10}px`;
                        mainContainer.style.left = `${leftOffset}px`;
                        mainContainer.style.width = `${maxWidth}px`;
                    }

                    keywordDiv.style.position = 'relative';
                    keywordDiv.style.top = '0';
                    keywordDiv.style.left = '0';
                    keywordDiv.style.width = '100%';

                    settingsButton.style.position = 'absolute';
                    settingsButton.style.right = '-40px';
                    settingsButton.style.top = '0';
                    settingsButton.style.display = 'block';

                    syncButton.style.position = 'absolute';
                    syncButton.style.right = '-40px';
                    syncButton.style.top = '50px';
                    syncButton.style.display = 'block';

                    importButton.style.position = 'absolute';
                    importButton.style.right = '-40px';
                    importButton.style.top = '95px';

                    exportButton.style.position = 'absolute';
                    exportButton.style.right = '-40px';
                    exportButton.style.top = '140px';

                    importButton.style.display = 'none';
                    importButton.style.opacity = '0';
                    importButton.style.transform = 'translateY(-10px)';

                    exportButton.style.display = 'none';
                    exportButton.style.opacity = '0';
                    exportButton.style.transform = 'translateY(-10px)';

                    repositionPanel(keywordDiv, searchContainer, settingsButton, syncButton, importButton, exportButton);
                } else {
                    keywordDiv.style.opacity = '0';
                    keywordDiv.style.transform = 'scale(0.95)';
                    syncButton.style.display = 'none';
                    settingsButton.style.display = 'none';
                    hideImportExportButtons();
                }

                keywordDiv.style.display = isVisible ? 'block' : 'none';
                if (isVisible) {
                    requestAnimationFrame(() => {
                        keywordDiv.style.opacity = '1';
                        keywordDiv.style.transform = 'scale(1)';
                        const addInput = shadowRoot.getElementById(`${NAMESPACE}-add-keyword-input`);
                        if (addInput) setTimeout(() => addInput.focus(), 100);
                    });
                }
            }

            keywordButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleKeywordDiv();
            });

            document.addEventListener('click', (e) => {
                const target = e.target;
                const settingsModal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
                const isSettingsModalVisible = settingsModal && settingsModal.style.display === 'block';

                const isControlElement =
                    isDescendantOrSelf(keywordDiv, target) ||
                    isDescendantOrSelf(syncButton, target) ||
                    isDescendantOrSelf(importButton, target) ||
                    isDescendantOrSelf(exportButton, target) ||
                    isDescendantOrSelf(settingsButton, target) ||
                    (settingsModal && isDescendantOrSelf(settingsModal, target)) ||
                    target === keywordButton;

                if (!isControlElement) {
                    toggleKeywordDiv(false);
                    if (!isSettingsModalVisible) {
                        closeAllModals();
                    } else {
                        hideImportExportButtons();
                    }
                }
            });

            keywordDiv.addEventListener('click', (e) => e.stopPropagation());
            syncButton.addEventListener('click', (e) => e.stopPropagation());
            importButton.addEventListener('click', (e) => e.stopPropagation());
            exportButton.addEventListener('click', (e) => e.stopPropagation());
            settingsButton.addEventListener('click', (e) => e.stopPropagation());
            const settingsModal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
            if (settingsModal) settingsModal.addEventListener('click', (e) => e.stopPropagation());

            function handleMobileAdaptation() {
                const isMobile = window.innerWidth <= 768;
                const searchInput = searchContainer.querySelector('input[type="text"], .search-input-el');
                if (isMobile) {
                    keywordButton.style.cssText += `
                        font-size: 16px !important; right: 5px !important; width: 20px !important; height: 20px !important; min-width: 20px !important; min-height: 20px !important;
                    `;
                    if (searchInput) {
                        searchInput.style.cssText += `
                            padding-right: 35px !important; box-sizing: border-box !important; width: 100% !important;
                        `;
                    }
                    syncButton.style.top = '45px';
                    importButton.style.top = '85px';
                    exportButton.style.top = '125px';
                } else {
                    keywordButton.style.cssText += `
                        font-size: 18px !important; right: 10px !important; width: 24px !important; height: 24px !important; min-width: 24px !important; min-height: 24px !important;
                    `;
                    if (searchInput) {
                        searchInput.style.cssText += `
                            padding-right: 40px !important; box-sizing: border-box !important; width: 100% !important;
                        `;
                    }
                    syncButton.style.top = '50px';
                    importButton.style.top = '95px';
                    exportButton.style.top = '140px';
                }
                if (keywordDiv.style.display === 'block') {
                    repositionPanel(keywordDiv, searchContainer, settingsButton, syncButton, importButton, exportButton);
                }
            }

            handleMobileAdaptation();
            window.addEventListener('resize', handleMobileAdaptation);

            window.addEventListener('scroll', () => {
                if (keywordDiv.style.display === 'block') {
                    repositionPanel(keywordDiv, searchContainer, settingsButton, syncButton, importButton, exportButton);
                }
            });

            break;
        }
    }

    const observer = new MutationObserver(() => initScript());
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('load', () => initScript());
    if (typeof GM.registerMenuCommand !== 'undefined') {
        GM.registerMenuCommand('Manage Keywords', openConfigModal);
    }


/* -------------------------------------------------------------------------- *
 * Module 15 · Stylesheet generator (responsive CSS for the UI shell)
 * -------------------------------------------------------------------------- */

// Styles - Updated for better responsiveness
    function getStyles() {
        return `
        .${NAMESPACE}-content-container {
            --container-bg: white; --border-color: #ddd; --text-color: #000; --code-bg: #e0f7fa; --code-border: #b2ebf2; --code-color: #00796b; --code-active-bg: #b2ebf2; --modal-bg: #fff; --modal-text: #1a1a1a; --list-bg: #f8f9fa; --item-bg: #fff; --item-border: #e2e8f0; --item-text: #2d3748; --scroll-thumb: #cbd5e0; --scroll-track: #f1f1f1; --input-border: #e2e8f0; --input-bg: #fff; --input-text: #1a1a1a; --button-bg: #2563eb; --button-text: #fff; --button-icon-color: #333; --button-hover-color: #00796b; --button-hover-bg: #1a56db; --hover-bg: rgba(0, 0, 0, 0.1); --badge-bg: rgba(0, 0, 0, 0.08); --badge-color: #333; --backdrop-color: rgba(0, 0, 0, 0.5); --focus-color: #3b82f6; --focus-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15); --reset-button-bg: rgba(0, 0, 0, 0.05); --reset-button-hover-bg: rgba(0, 0, 0, 0.1); --tab-active-bg: #2563eb; --tab-active-text: #fff; --tab-inactive-bg: rgba(0, 0, 0, 0.05); --tab-inactive-text: #333; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: var(--text-color);
        }

        @media (prefers-color-scheme: dark) {
            .${NAMESPACE}-content-container {
                --container-bg: #2c2c2c; --border-color: #444; --text-color: #f0f0f0; --code-bg: #3a3a3a; --code-border: #555; --code-color: #a8e6cf; --code-active-bg: #555; --modal-bg: #1a1a1a; --modal-text: #f0f0f0; --list-bg: #2d2d2d; --item-bg: #333; --item-border: #404040; --item-text: #f0f0f0; --scroll-thumb: #666; --scroll-track: #2d2d2d; --input-border: #404040; --input-bg: #2d2d2d; --input-text: #f0f0f0; --button-bg: #2563eb; --button-text: #fff; --button-icon-color: #f0f0f0; --button-hover-color: #a8e6cf; --button-hover-bg: #1d4ed8; --hover-bg: rgba(255, 255, 255, 0.1); --badge-bg: rgba(255, 255, 255, 0.15); --badge-color: #f0f0f0; --backdrop-color: rgba(0, 0, 0, 0.7); --focus-color: #4f94fe; --focus-shadow: 0 0 0 2px rgba(79, 148, 254, 0.15); --reset-button-bg: rgba(255, 255, 255, 0.1); --reset-button-hover-bg: rgba(255, 255, 255, 0.15); --tab-active-bg: #2563eb; --tab-active-text: #fff; --tab-inactive-bg: rgba(255, 255, 255, 0.1); --tab-inactive-text: #f0f0f0;
            }
        }

        .${NAMESPACE}-modal-backdrop {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--backdrop-color); z-index: 1150; opacity: 0; transition: opacity 0.3s ease;
        }

        .${NAMESPACE}-keyword-search-container {
            display: none; position: relative; background-color: var(--container-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); width: 100%; padding: 16px; z-index: 1000; max-height: 75vh; overflow-y: auto; color: var(--text-color); transition: transform 0.3s ease, opacity 0.3s ease; transform: scale(0.95); opacity: 0; box-sizing: border-box; overflow-x: hidden;
        }

        .${NAMESPACE}-tag-list {
            list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 0;
        }

        .${NAMESPACE}-tag-item {
            display: flex; align-items: center; background: var(--code-bg); border-radius: 20px; padding: 6px 12px; font-size: 14px; color: var(--code-color); border: 1px solid var(--code-border); box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;
        }

        .${NAMESPACE}-tag-item:hover {
            background: var(--code-active-bg); transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
        }

        .${NAMESPACE}-delete-tag {
            background: none; border: none; color: var(--code-color); margin-left: 8px; cursor: pointer; font-size: 16px; padding: 0 4px; border-radius: 50%; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;
        }

        .${NAMESPACE}-delete-tag:hover {
            background: rgba(0, 0, 0, 0.1); transform: scale(1.1);
        }

        .${NAMESPACE}-filter-badge {
            background: var(--badge-bg); color: #fff; padding: 2px 6px; border-radius: 10px; font-size: 12px; margin-left: 6px; font-weight: 500; text-shadow: 0 1px 1px rgba(0,0,0,0.2);
        }

        .${NAMESPACE}-tag-preview {
            display: flex; align-items: center; background: var(--code-bg); border-radius: 20px; padding: 5px 10px; font-size: 13px; color: var(--code-color); border: 1px solid var(--code-border); margin-left: 10px; margin-right: 10px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); width: fit-content; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1;
        }

        .${NAMESPACE}-preview-badge {
            background: var(--badge-bg); color: #fff; padding: 1px 5px; border-radius: 10px; font-size: 11px; margin-left: 5px; font-weight: 500; text-shadow: 0 1px 1px rgba(0,0,0,0.2); white-space: nowrap;
        }

        .${NAMESPACE}-option-tag-preview {
            display: flex; align-items: center; background: var(--code-bg); border-radius: 20px; padding: 5px 10px; font-size: 13px; color: var(--code-color); border: 1px solid var(--code-border); margin-left: 10px; margin-right: 10px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); width: fit-content; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-shrink: 1;
        }

        .${NAMESPACE}-option-preview-badge {
            background: var(--badge-bg); color: #fff; padding: 1px 5px; border-radius: 10px; font-size: 11px; margin-left: 5px; font-weight: 500; text-shadow: 0 1px 1px rgba(0,0,0,0.2); white-space: nowrap;
        }

        .${NAMESPACE}-input-container {
            display: flex; flex-direction: row; gap: 8px; width: 100%; align-items: center; margin-top: 16px;
        }

        .${NAMESPACE}-modern-input.${NAMESPACE}-keyword-textarea {
            flex: 1; padding: 10px 16px; border: 2px solid var(--input-border); border-radius: 20px; font-size: 14px; transition: all 0.3s ease; background: var(--input-bg); color: var(--input-text); outline: none; box-sizing: border-box; resize: none; overflow-y: hidden; min-height: 42px; max-height: 120px; line-height: 1.5; font-family: inherit; -webkit-appearance: none; -moz-appearance: none; appearance: none;
        }

        .${NAMESPACE}-modern-input.${NAMESPACE}-keyword-textarea::placeholder {
            color: #999; opacity: 1; vertical-align: middle; line-height: 22px; padding-top: 0; padding-bottom: 0;
        }

        .${NAMESPACE}-modern-input.${NAMESPACE}-keyword-textarea:focus {
            border-color: var(--focus-color); box-shadow: var(--focus-shadow);
        }

        .${NAMESPACE}-submit-button-container {
            display: flex; justify-content: flex-end; margin-top: 16px;
        }

        .${NAMESPACE}-modern-btn {
            padding: 10px 20px; background: var(--button-bg) !important; color: #fff !important; border: none !important; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s ease; white-space: nowrap; height: 40px; box-sizing: border-box; min-width: 80px;
        }

        .${NAMESPACE}-modern-btn:hover {
            background: var(--button-hover-bg) !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 121, 107, 0.2);
        }

        .${NAMESPACE}-icon-btn {
            background: none !important; border: none !important; font-size: 18px; cursor: pointer; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--button-icon-color); transition: all 0.3s ease; min-width: 36px; min-height: 36px;
        }

        .${NAMESPACE}-icon-btn:hover {
            background: var(--hover-bg) !important; transform: scale(1.1);
        }

        .${NAMESPACE}-sync-external-btn, .${NAMESPACE}-settings-external-btn, .${NAMESPACE}-import-export-btn {
            position: absolute; width: 36px; height: 36px; border-radius: 50%; background: var(--container-bg) !important; color: var(--button-icon-color); border: 1px solid var(--border-color) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1100; display: none;
        }

        .${NAMESPACE}-sync-external-btn:hover, .${NAMESPACE}-settings-external-btn:hover, .${NAMESPACE}-import-export-btn:hover {
            background: var(--hover-bg) !important; transform: scale(1.1);
        }

        .${NAMESPACE}-import-export-btn {
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 0;
            transform: translateY(-10px);
        }

        .${NAMESPACE}-sync-modal {
            position: absolute; top: 0; right: -40px; width: 220px; background: var(--container-bg); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1200; padding: 0; box-sizing: border-box; overflow-x: hidden;
        }

        .${NAMESPACE}-centered-modal {
            position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; right: auto !important; width: 90vw !important; max-width: 450px !important; box-sizing: border-box !important; max-height: 90vh; overflow-y: auto; overflow-x: hidden;
        }

        .${NAMESPACE}-sync-modal-content {
            display: flex; flex-direction: column; width: 100%; box-sizing: border-box;
        }

        .${NAMESPACE}-sync-modal-header {
            display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid var(--border-color); box-sizing: border-box;
        }

        .${NAMESPACE}-sync-modal-header h2 {
            margin: 0; font-size: 16px;
        }

        .${NAMESPACE}-sync-modal-close-btn {
            background: none; border: none; font-size: 20px; line-height: 1; cursor: pointer; color: var(--button-icon-color); min-width: 30px; min-height: 30px;
        }

        .${NAMESPACE}-settings-modal-body {
            padding: 16px; display: flex; flex-direction: column; gap: 15px; max-height: 70vh; overflow-y: auto; box-sizing: border-box; overflow-x: hidden;
        }

        .${NAMESPACE}-settings-section {
            display: flex; flex-direction: column; gap: 8px; box-sizing: border-box;
        }

        .${NAMESPACE}-settings-subtitle {
            margin: 0 0 8px 0; font-size: 14px; font-weight: 500; color: var(--text-color);
        }

        .${NAMESPACE}-settings-label {
            font-size: 14px; color: var(--text-color); font-weight: normal; margin-right: 5px; white-space: nowrap; flex-shrink: 0; width: 120px; text-align: left; box-sizing: border-box;
        }

        .${NAMESPACE}-settings-select {
            padding: 8px; border-radius: 4px; border: 1px solid var(--input-border); background: var(--input-bg); color: var(--input-text); font-size: 14px; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; padding-right: 24px; transition: all 0.2s ease; max-width: 150px; min-width: 80px; flex: 1; box-sizing: border-box;
        }

        .${NAMESPACE}-settings-select:focus {
            border-color: var(--focus-color); box-shadow: var(--focus-shadow);
        }

        .${NAMESPACE}-filter-grid {
            display: flex; flex-direction: column; gap: 12px; box-sizing: border-box;
        }

        .${NAMESPACE}-filter-item {
            display: flex; align-items: center; gap: 12px; width: 100%; box-sizing: border-box;
        }

        .${NAMESPACE}-multi-select-item {
            align-items: flex-start;
        }

        .${NAMESPACE}-color-grid {
            display: flex; flex-direction: column; gap: 12px; box-sizing: border-box;
        }

        .${NAMESPACE}-color-item {
            display: flex; flex-direction: column; gap: 8px; width: 100%; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; box-sizing: border-box;
        }

        .${NAMESPACE}-label-color-container {
            display: flex; align-items: center; gap: 12px; width: 100%; box-sizing: border-box; flex-wrap: nowrap;
        }

        .${NAMESPACE}-color-input {
            width: 32px; height: 32px; padding: 0; border: 1px solid var(--input-border); border-radius: 4px; cursor: pointer; background: var(--input-bg); transition: all 0.2s ease; margin-left: auto; flex-shrink: 0; box-sizing: border-box;
        }

        .${NAMESPACE}-color-input:hover {
            transform: scale(1.05);
        }

        .${NAMESPACE}-options-color-container {
            display: flex; flex-direction: column; gap: 6px; margin-left: 20px; box-sizing: border-box;
        }

        .${NAMESPACE}-option-color-item {
            display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box; flex-wrap: nowrap;
        }

        .${NAMESPACE}-option-settings-label {
            font-size: 13px; color: var(--text-color); font-weight: normal; min-width: 100px; text-align: left; width: 120px; box-sizing: border-box; flex-shrink: 0;
        }

        .${NAMESPACE}-option-color-input {
            width: 28px; height: 28px; padding: 0; border: 1px solid var(--input-border); border-radius: 4px; cursor: pointer; background: var(--input-bg); transition: all 0.2s ease; margin-left: auto; flex-shrink: 0; box-sizing: border-box;
        }

        .${NAMESPACE}-option-color-input:hover {
            transform: scale(1.05);
        }

        .${NAMESPACE}-settings-footer {
            display: flex; justify-content: space-between; margin-top: 15px; box-sizing: border-box; gap: 10px;
        }

        .${NAMESPACE}-settings-btn {
            padding: 8px 16px; border-radius: 4px; font-size: 14px; cursor: pointer; transition: all 0.2s ease; min-width: 100px; box-sizing: border-box;
        }

        .${NAMESPACE}-reset-btn {
            background: var(--reset-button-bg) !important; border: 1px solid var(--border-color) !important; color: var(--text-color);
        }

        .${NAMESPACE}-reset-btn:hover {
            background: var(--reset-button-hover-bg) !important;
        }

        .${NAMESPACE}-save-btn {
            background: var(--button-bg) !important; border: none !important; color: white !important;
        }

        .${NAMESPACE}-save-btn:hover {
            background: var(--button-hover-bg) !important;
        }

        .${NAMESPACE}-notification {
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(100%); background: rgba(0, 0, 0, 0.7); color: white; padding: 10px 20px; border-radius: 4px; font-size: 14px; transition: transform 0.3s ease; z-index: 2000; box-sizing: border-box;
        }

        .${NAMESPACE}-notification-show {
            transform: translateX(-50%) translateY(0);
        }

        .${NAMESPACE}-filter-groups {
            margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 10px; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box;
        }

        #${NAMESPACE}-features-container {
            margin-left: 0px;
        }

        .${NAMESPACE}-filter-group {
            display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box;
        }

        .${NAMESPACE}-features-group {
            align-items: flex-start;
        }

        .${NAMESPACE}-filter-label {
            font-size: 14px; color: var(--text-color); font-weight: normal; min-width: 80px; white-space: nowrap; width: 120px; text-align: left; box-sizing: border-box;
        }

        .${NAMESPACE}-filter-select {
            flex: 1; padding: 8px; border: 1px solid var(--input-border); border-radius: 4px; background: var(--input-bg); color: var(--input-text); font-size: 14px; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; padding-right: 24px; box-sizing: border-box;
        }

        .${NAMESPACE}-filter-select:focus {
            border-color: var(--focus-color); box-shadow: var(--focus-shadow);
        }

        .${NAMESPACE}-checkbox-container {
            display: flex; flex-direction: column; gap: 6px; flex: 1; max-height: 120px; overflow-y: auto; box-sizing: border-box;
        }

        .${NAMESPACE}-checkbox-wrapper {
            display: flex; align-items: center; gap: 6px; box-sizing: border-box;
        }

        .${NAMESPACE}-feature-checkbox {
            margin: 0; cursor: pointer; box-sizing: border-box;
        }

        .${NAMESPACE}-checkbox-label {
            font-size: 14px; color: var(--text-color); cursor: pointer; box-sizing: border-box;
        }

        .${NAMESPACE}-tab-container {
            display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 10px; box-sizing: border-box;
        }

        .${NAMESPACE}-tab-button {
            padding: 10px 15px; background: var(--tab-inactive-bg) !important; color: var(--tab-inactive-text) !important; border: none !important; border-bottom: 2px solid transparent !important; cursor: pointer; font-size: 14px; transition: all 0.3s ease; flex: 1; text-align: center; border-radius: 4px 4px 0 0; box-sizing: border-box;
        }

        .${NAMESPACE}-tab-button.${NAMESPACE}-active-tab {
            background: var(--tab-active-bg) !important; color: var(--tab-active-text) !important; border-bottom: 2px solid var(--tab-active-bg) !important;
        }

        .${NAMESPACE}-tab-button:hover:not(.${NAMESPACE}-active-tab) {
            background: var(--hover-bg) !important;
        }

        .${NAMESPACE}-tab-content-container {
            display: flex; flex-direction: column; gap: 10px; flex: 1; box-sizing: border-box;
        }

        .${NAMESPACE}-tab-content {
            display: none; box-sizing: border-box;
        }

        @media (max-width: 768px) {
            .${NAMESPACE}-input-container {
                flex-direction: column; width: 100%; gap: 8px;
            }

            .${NAMESPACE}-modern-input.${NAMESPACE}-keyword-textarea {
                width: 100%; box-sizing: border-box;
            }

            .${NAMESPACE}-modern-input.${NAMESPACE}-keyword-textarea {
                max-height: 100px;
            }

            .${NAMESPACE}-submit-button-container {
                justify-content: center; margin-top: 12px;
            }

            .${NAMESPACE}-centered-modal {
                width: 90vw !important; max-width: 400px !important;
            }

            .${NAMESPACE}-settings-row {
                flex-direction: column !important; align-items: flex-start !important;
            }

            .${NAMESPACE}-settings-select {
                width: 100%; margin-top: 5px;
            }

            .${NAMESPACE}-filter-group {
                flex-direction: column; align-items: flex-start;
            }

            .${NAMESPACE}-filter-select {
                width: 100%; margin-top: 5px;
            }

            .${NAMESPACE}-filter-label {
                min-width: auto;
            }

            .${NAMESPACE}-sync-external-btn, .${NAMESPACE}-settings-external-btn, .${NAMESPACE}-import-export-btn {
                width: 32px; height: 32px; font-size: 16px;
            }

            .${NAMESPACE}-tag-preview, .${NAMESPACE}-option-tag-preview {
                font-size: 12px; padding: 4px 8px; flex-shrink: 1; max-width: 100%;
            }

            .${NAMESPACE}-preview-badge, .${NAMESPACE}-option-preview-badge {
                font-size: 10px; padding: 1px 4px;
            }

            .${NAMESPACE}-label-color-container {
                flex-wrap: wrap; gap: 8px;
            }

            .${NAMESPACE}-settings-label, .${NAMESPACE}-option-settings-label {
                min-width: auto; width: 100%; margin-bottom: 5px; flex-shrink: 0;
            }

            .${NAMESPACE}-tag-preview, .${NAMESPACE}-option-tag-preview {
                margin: 0; width: auto; flex-grow: 1; min-width: 120px;
            }

            .${NAMESPACE}-color-input, .${NAMESPACE}-option-color-input {
                margin-left: 0; margin-top: 0; flex-shrink: 0;
            }

            .${NAMESPACE}-option-color-item {
                flex-wrap: wrap; gap: 8px;
            }

            .${NAMESPACE}-tab-container {
                flex-direction: column;
            }

            .${NAMESPACE}-tab-button {
                border-radius: 4px; margin-bottom: 5px; flex: auto;
            }
        }

        @media (max-width: 480px) {
            .${NAMESPACE}-content-container {
                font-size: 12px;
            }

            .${NAMESPACE}-centered-modal {
                width: 90vw !important; max-width: 350px !important; padding: 10px !important;
            }

            .${NAMESPACE}-settings-modal-body {
                padding: 10px; gap: 10px;
            }

            .${NAMESPACE}-settings-subtitle {
                font-size: 13px;
            }

            .${NAMESPACE}-settings-label, .${NAMESPACE}-option-settings-label {
                font-size: 12px; width: 100%; min-width: auto; margin-right: 0; margin-bottom: 5px;
            }

            .${NAMESPACE}-settings-select {
                font-size: 12px; padding: 6px; padding-right: 20px; max-width: 100%;
            }

            .${NAMESPACE}-filter-item, .${NAMESPACE}-multi-select-item {
                flex-direction: column; align-items: flex-start; gap: 5px;
            }

            .${NAMESPACE}-color-item {
                gap: 5px; padding-bottom: 8px;
            }

            .${NAMESPACE}-label-color-container {
                flex-direction: column; align-items: flex-start; gap: 5px;
            }

            .${NAMESPACE}-options-color-container {
                margin-left: 0; gap: 5px;
            }

            .${NAMESPACE}-option-color-item {
                flex-direction: column; align-items: flex-start; gap: 5px;
            }

            .${NAMESPACE}-color-input {
                width: 28px; height: 28px; margin-top: 0;
            }

            .${NAMESPACE}-option-color-input {
                width: 24px; height: 24px; margin-top: 0;
            }

            .${NAMESPACE}-settings-footer {
                flex-direction: row; justify-content: space-between; gap: 5px; margin-top: 10px;
            }

            .${NAMESPACE}-settings-btn {
                padding: 6px 12px; font-size: 12px; min-width: 80px;
            }

            .${NAMESPACE}-checkbox-label {
                font-size: 12px;
            }

            .${NAMESPACE}-tab-button {
                padding: 8px 10px; font-size: 12px;
            }

            .${NAMESPACE}-sync-modal-header h2 {
                font-size: 14px;
            }

            .${NAMESPACE}-sync-modal-close-btn {
                font-size: 18px;
            }
        }

        @media (max-width: 360px) {
            .${NAMESPACE}-content-container {
                font-size: 11px;
            }

            .${NAMESPACE}-centered-modal {
                width: 92vw !important; max-width: 320px !important; padding: 8px !important;
            }

            .${NAMESPACE}-settings-modal-body {
                padding: 8px; gap: 8px;
            }

            .${NAMESPACE}-settings-subtitle {
                font-size: 12px;
            }

            .${NAMESPACE}-settings-label, .${NAMESPACE}-option-settings-label {
                font-size: 11px;
            }

            .${NAMESPACE}-settings-select {
                font-size: 11px; padding: 5px; padding-right: 18px;
            }

            .${NAMESPACE}-settings-btn {
                padding: 5px 10px; font-size: 11px; min-width: 70px;
            }

            .${NAMESPACE}-tab-button {
                padding: 6px 8px; font-size: 11px;
            }
        }

        .${NAMESPACE}-tag-list::-webkit-scrollbar, .${NAMESPACE}-keyword-textarea::-webkit-scrollbar, .${NAMESPACE}-checkbox-container::-webkit-scrollbar, .${NAMESPACE}-settings-modal-body::-webkit-scrollbar {
            width: 6px;
        }

        .${NAMESPACE}-tag-list::-webkit-scrollbar-track, .${NAMESPACE}-keyword-textarea::-webkit-scrollbar-track, .${NAMESPACE}-checkbox-container::-webkit-scrollbar-track, .${NAMESPACE}-settings-modal-body::-webkit-scrollbar-track {
            background: var(--scroll-track); border-radius: 3px;
        }

        .${NAMESPACE}-tag-list::-webkit-scrollbar-thumb, .${NAMESPACE}-keyword-textarea::-webkit-scrollbar-thumb, .${NAMESPACE}-checkbox-container::-webkit-scrollbar-thumb, .${NAMESPACE}-settings-modal-body::-webkit-scrollbar-thumb {
            background: var(--scroll-thumb); border-radius: 3px;
        }
        `;
    }
})();
