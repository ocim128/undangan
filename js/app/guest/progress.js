export const progress = (() => {
    /**
     * @type {HTMLElement|null}
     */
    let info = null;

    /**
     * @type {HTMLElement|null}
     */
    let bar = null;

    let total = 0;
    let loaded = 0;
    let valid = true;
    let lastUpdate = 0;
    const UPDATE_INTERVAL = 100; // Minimum time between updates in ms

    /**
     * @type {Promise<void>|null}
     */
    let cancelProgress = null;

    /**
     * @returns {void}
     */
    const add = () => {
        total += 1;
        updateProgress();
    };

    /**
     * @returns {string}
     */
    const showInformation = () => {
        return `(${loaded}/${total}) [${parseInt((loaded / total) * 100).toFixed(0)}%]`;
    };

    /**
     * Updates the progress bar with throttling
     */
    const updateProgress = () => {
        const now = Date.now();
        if (now - lastUpdate < UPDATE_INTERVAL) {
            return;
        }
        lastUpdate = now;

        if (info && bar) {
            info.innerText = showInformation();
            bar.style.width = Math.min((loaded / total) * 100, 100).toString() + '%';
        }
    };

    /**
     * @param {string} type
     * @param {boolean} [skip=false]
     * @returns {void}
     */
    const complete = (type, skip = false) => {
        if (!valid) {
            return;
        }

        loaded += 1;
        if (info) {
            info.innerText = `Loading ${type} ${skip ? 'skipped' : 'complete'} ${showInformation()}`;
        }
        updateProgress();

        if (loaded === total) {
            document.dispatchEvent(new Event('undangan.progress.done'));
        }
    };

    /**
     * @param {string} type
     * @returns {void}
     */
    const invalid = (type) => {
        if (valid) {
            valid = false;
            if (bar) {
                bar.style.backgroundColor = 'red';
            }
            if (info) {
                info.innerText = `Error loading ${type} ${showInformation()}`;
            }
            document.dispatchEvent(new Event('undangan.progress.invalid'));
        }
    };

    /**
     * @returns {Promise<void>|null}
     */
    const getAbort = () => cancelProgress;

    /**
     * @returns {void}
     */
    const init = () => {
        info = document.getElementById('progress-info');
        bar = document.getElementById('progress-bar');
        if (info) {
            info.classList.remove('d-none');
        }
        cancelProgress = new Promise((res) => document.addEventListener('undangan.progress.invalid', res));
    };

    return {
        add,
        complete,
        invalid,
        getAbort,
        init,
    };
})();