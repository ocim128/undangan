import { progress } from './progress.js';
import { cache } from '../../connection/cache.js';

export const audio = (() => {

    const statePlay = '<i class="fa-solid fa-circle-pause spin-button"></i>';
    const statePause = '<i class="fa-solid fa-circle-play"></i>';

    /**
     * @param {boolean} [playOnOpen=true]
     * @returns {Promise<void>}
     */
    const load = async (playOnOpen = true) => {

        const url = document.body.getAttribute('data-audio');
        if (!url) {
            progress.complete('audio', true);
            return;
        }

        /**
         * @type {HTMLAudioElement|null}
         */
        let audioEl = null;

        try {
            // Preload audio with low priority
            audioEl = new Audio();
            audioEl.preload = 'metadata';
            audioEl.src = await cache('audio').get(url, progress.getAbort());
            audioEl.loop = true;
            audioEl.muted = true; // Start muted to prevent autoplay issues
            audioEl.autoplay = false;
            audioEl.controls = false;

            // Add event listeners for better error handling
            audioEl.addEventListener('error', (e) => {
                console.error('Audio loading error:', e);
                progress.invalid('audio');
            });

            audioEl.addEventListener('canplaythrough', () => {
                progress.complete('audio');
            });

            progress.complete('audio');
        } catch (err) {
            console.error('Audio initialization error:', err);
            progress.invalid('audio');
            return;
        }

        let isPlay = false;
        const music = document.getElementById('button-music');

        /**
         * @returns {Promise<void>}
         */
        const play = async () => {
            if (!navigator.onLine || !music) {
                return;
            }

            music.disabled = true;
            try {
                audioEl.muted = false; // Unmute when user initiates play
                await audioEl.play();
                isPlay = true;
                music.disabled = false;
                music.innerHTML = statePlay;
            } catch (err) {
                console.error('Audio playback error:', err);
                isPlay = false;
                audioEl.muted = true;
                alert('Unable to play audio. Please try again.');
            }
        };

        /**
         * @returns {void}
         */
        const pause = () => {
            isPlay = false;
            audioEl.pause();
            audioEl.muted = true; // Mute when paused
            music.innerHTML = statePause;
        };

        document.addEventListener('undangan.open', () => {
            music.classList.remove('d-none');

            if (playOnOpen) {
                play();
            }
        });

        music.addEventListener('offline', pause);
        music.addEventListener('click', () => isPlay ? pause() : play());
    };

    /**
     * @returns {object}
     */
    const init = () => {
        progress.add();

        return {
            load,
        };
    };

    return {
        init,
    };
})();