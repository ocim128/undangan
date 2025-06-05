(() => {
  // Configuration Object - Edit this to personalize your wedding invitation
  const config = {
    coupleNames: {
      groom: "Wahyu",
      bride: "Riski",
    },
    weddingDate: "2023-03-15 10:00",
    venue: {
      name: "Desa Pajerukan",
      address: "RT 10 RW 02, Desa Pajerukan, Kec. Kalibagor, Kab. Banyumas, Jawa Tengah 53191",
    },
    messages: {
      welcome: "Welcome to our wedding invitation!",
      commentPrompt: "Leave a comment to wish us well!",
      sharePrompt: {
        id: "📢 Yuk, share undangan ini biar makin rame komentarnya! 🎉",
        en: "📢 Let's share this invitation to get more comments! 🎉",
      },
    },
    api: {
      baseUrl: "/api",
      tenorKey: "your_tenor_api_key", // Replace with your Tenor API key if using GIFs
    },
    features: {
      confetti: true, // Toggle confetti animation
      audio: true,    // Toggle background audio
      gifSupport: true, // Toggle GIF support in comments
    },
  };

  // Progress Manager - Handles loading progress display
  const progressManager = (() => {
    let progressInfo = null;
    let progressBar = null;
    let totalTasks = 0;
    let completedTasks = 0;
    let isValid = true;
    let abortPromise = null;

    const updateProgress = () => `${completedTasks}/${totalTasks} [${Math.round((completedTasks / totalTasks) * 100)}%]`;

    return {
      init: () => {
        progressInfo = document.getElementById("progress-info");
        progressBar = document.getElementById("progress-bar");
        progressInfo.classList.remove("d-none");
        abortPromise = new Promise((resolve) =>
          document.addEventListener("undangan.progress.invalid", resolve)
        );
      },
      add: () => totalTasks++,
      invalid: (resource) => {
        if (isValid) {
          isValid = false;
          progressBar.style.backgroundColor = "red";
          progressInfo.innerText = `Error loading ${resource} ${updateProgress()}`;
          document.dispatchEvent(new Event("undangan.progress.invalid"));
        }
      },
      complete: (resource, skipped = false) => {
        if (isValid) {
          completedTasks++;
          progressInfo.innerText = `Loading ${resource} ${skipped ? "skipped" : "complete"} ${updateProgress()}`;
          progressBar.style.width = `${Math.min((completedTasks / totalTasks) * 100, 100)}%`;
          if (completedTasks === totalTasks) {
            document.dispatchEvent(new Event("undangan.progress.done"));
          }
        }
      },
      getAbort: () => abortPromise,
    };
  })();

  // API Client - Handles HTTP requests
  const apiClient = (method, endpoint) => {
    const controller = new AbortController();
    const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
    const options = { signal: controller.signal, headers, method: method.toUpperCase() };
    let cacheDuration = 0;
    let retries = 0;
    let retryDelay = 0;

    // ... (rest of the API logic remains similar but with clearer variable names)

    return {
      send: (transform = null) => {
        const url = new URL(endpoint, document.body.getAttribute("data-url"));
        return fetch(url, options)
          .then((response) =>
            response.json().then((data) => {
              if (data.error) throw new Error(data.error[0]);
              return transform ? { code: response.status, data: transform(data) } : data;
            })
          )
          .catch((error) => {
            if (error.name === "AbortError") console.warn("Fetch aborted:", error);
            else alert(error);
            throw error;
          });
      },
      withCache: (duration) => {
        cacheDuration = duration;
        return this;
      },
      // ... (other methods like withRetry, withCancel, etc.)
    };
  };

  // Utility Functions - General helpers
  const utils = (() => {
    const escapeHtml = (str) =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    return {
      escapeHtml,
      // ... (other utility functions like debounce, timeOut, etc.)
    };
  })();

  // Main Website Logic
  const weddingWebsite = (() => {
    const storage = (key) => {
      const get = (field = null) => {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        return field ? data[field] : data;
      };
      const set = (field, value) => {
        const data = get();
        data[field] = value;
        localStorage.setItem(key, JSON.stringify(data));
      };
      return { get, set };
    };

    const infoStorage = storage("information");

    const updateCountdown = () => {
      const weddingTime = new Date(config.weddingDate.replace(" ", "T")).getTime();
      const pad = (num) => (num < 10 ? `0${num}` : num);
      const update = () => {
        const diff = Math.abs(weddingTime - Date.now());
        document.getElementById("day").textContent = pad(Math.floor(diff / (1000 * 60 * 60 * 24)));
        document.getElementById("hour").textContent = pad(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        document.getElementById("minute").textContent = pad(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
        document.getElementById("second").textContent = pad(Math.floor((diff % (1000 * 60)) / 1000));
        utils.timeOut(update, 1000 - (Date.now() % 1000));
      };
      utils.timeOut(update);
    };

    const init = () => {
      progressManager.init();
      updateCountdown();

      // Welcome message
      document.getElementById("welcome").innerText = config.messages.welcome;

      // Calendar link
      const formatDate = (date) => new Date(date + ":00Z").toISOString().replace(/[-:]/g, "").split(".")[0];
      const calendarUrl = new URL("https://calendar.google.com/calendar/render");
      calendarUrl.search = new URLSearchParams({
        action: "TEMPLATE",
        text: `The Wedding of ${config.coupleNames.groom} and ${config.coupleNames.bride}`,
        dates: `${formatDate(config.weddingDate)}/${formatDate(config.weddingDate.replace("10:00", "11:00"))}`,
        details: "Tanpa mengurangi rasa hormat, kami mengundang Anda untuk berkenan menghadiri acara pernikahan kami.",
        location: config.venue.address,
      }).toString();
      document.querySelector("#home button")?.addEventListener("click", () => window.open(calendarUrl, "_blank"));

      // ... (initialize other components like imageHandler, audioController, etc.)
    };

    return { init };
  })();

  // Bootstrap the application
  window.undangan = weddingWebsite.init();
})();