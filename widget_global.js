(async function () {
  const scriptTag = document.currentScript;

  if (!scriptTag) {
    console.error("Taraki widget: script tag could not be detected.");
    return;
  }

  const companyId = scriptTag.getAttribute("data-company-id");
  const theme = scriptTag.getAttribute("data-theme") || "light";
  const parsedLimit = parseInt(scriptTag.getAttribute("data-limit"), 10);
  const limit = Number.isNaN(parsedLimit) ? 0 : parsedLimit;

  if (!companyId) {
    console.error("Taraki widget: data-company-id is required.");
    return;
  }

  // Custom colors from data attributes
  const cardBg =
    scriptTag.getAttribute("data-card-bg") ||
    (theme === "dark" ? "#1f2937" : "#ffffff");

  const cardBorder =
    scriptTag.getAttribute("data-card-border") ||
    (theme === "dark" ? "#374151" : "#e5e7eb");

  const textColor =
    scriptTag.getAttribute("data-text-color") ||
    (theme === "dark" ? "#f9fafb" : "#111827");

  const btnBg =
    scriptTag.getAttribute("data-btn-bg") || "#FB4D3D";

  const btnHoverBg =
    scriptTag.getAttribute("data-btn-hover-bg") || "#e73b2b";

  const tagBg =
    scriptTag.getAttribute("data-tag-bg") ||
    (theme === "dark" ? "#374151" : "#f3f4f6");

  const tagColor =
    scriptTag.getAttribute("data-tag-color") ||
    (theme === "dark" ? "#e5e7eb" : "#003844");

  const btnTextColor =
    scriptTag.getAttribute("data-btn-text-color") || "#ffffff";

  const btnTextColorHover =
    scriptTag.getAttribute("data-btn-text-color-hover") || "#ffffff";

  const target = document.getElementById("career-widget");

  if (!target) {
    console.error(
      'Taraki widget: element with id "career-widget" was not found.'
    );
    return;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getLocation(job) {
    if (typeof job.Location === "string" && job.Location.trim()) {
      return job.Location.trim();
    }

    if (job.Location && typeof job.Location === "object") {
      return (
        job.Location.display ||
        job.Location.address ||
        job.Location.city ||
        job.Location.name ||
        ""
      );
    }

    if (typeof job.City === "string" && job.City.trim()) {
      return job.City.trim();
    }

    return "Location not specified";
  }

  function injectStyles() {
    const styleId = "taraki-career-widget-global-styles";

    if (document.getElementById(styleId)) {
      return;
    }

    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

      #career-widget,
      #career-widget * {
        box-sizing: border-box;
      }

      #career-widget {
        width: 100%;
        max-width: 100%;
        min-width: 0;
      }

      #career-widget .taraki-job-list {
        display: grid;
        gap: 18px;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        font-family: 'Plus Jakarta Sans', Inter, Arial, sans-serif;
        color: ${textColor};
      }

      #career-widget .taraki-job-card {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        border: 1px solid ${cardBorder};
        border-radius: 12px;
        background: ${cardBg};
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: box-shadow 0.2s ease;
      }

      #career-widget .taraki-job-card:hover {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
      }

      #career-widget .taraki-job-info {
        flex: 1;
        min-width: 0;
      }

      #career-widget .taraki-job-title {
        display: inline-block;
        max-width: 100%;
        margin: 0 0 6px;
        padding: 0;
        color: ${textColor};
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.35;
        overflow-wrap: anywhere;
        text-decoration: none !important;
      }

      #career-widget .taraki-job-title:hover,
      #career-widget .taraki-job-title:visited,
      #career-widget .taraki-job-title:active {
        color: ${textColor};
        text-decoration: none !important;
      }

      #career-widget .taraki-job-meta {
        padding: 8px 0;
        color: ${textColor};
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.9rem;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }

      #career-widget .taraki-tags-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        width: 100%;
      }

      #career-widget .taraki-tags {
        display: flex;
        flex: 1 1 auto;
        flex-wrap: wrap;
        gap: 6px;
        min-width: 0;
      }

      #career-widget .taraki-tags span {
        display: inline-flex;
        align-items: center;
        background: ${tagBg};
        color: ${tagColor};
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.8rem;
        line-height: 1.2;
        padding: 4px 10px;
        border-radius: 9999px;
        white-space: nowrap;
      }

      #career-widget .taraki-apply-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        background-color: ${btnBg};
        color: ${btnTextColor};
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 500;
        line-height: 1.2;
        border: none;
        border-radius: 8px;
        padding: 7px 14px;
        text-decoration: none !important;
        white-space: nowrap;
        transition:
          background-color 0.2s ease,
          transform 0.1s ease;
      }

      #career-widget .taraki-apply-btn:hover,
      #career-widget .taraki-apply-btn:visited,
      #career-widget .taraki-apply-btn:active {
        background-color: ${btnHoverBg};
        color: ${btnTextColorHover};
        text-decoration: none !important;
        transform: translateY(-1px);
      }

      #career-widget .taraki-empty-state,
      #career-widget .taraki-error-state {
        margin: 0;
        padding: 16px 0;
        color: ${textColor};
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.95rem;
      }

      #career-widget .taraki-powered-by {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;

        width: 100% !important;
        max-width: 100% !important;

        margin: 20px auto 0 !important;
        padding: 0 !important;

        position: static !important;
        inset: auto !important;
        transform: none !important;
        float: none !important;

        text-align: center !important;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.75rem;
        line-height: 1.2;
        color: ${theme === "dark" ? "#d1d5db" : "#848484"};

        box-sizing: border-box !important;
      }

      #career-widget .taraki-powered-by-text {
        display: inline-block !important;
        width: auto !important;
        max-width: none !important;

        margin: 0 !important;
        padding: 0 !important;

        position: static !important;
        inset: auto !important;
        transform: none !important;
        float: none !important;

        flex: 0 0 auto !important;
        color: inherit !important;
        font: inherit !important;
        line-height: inherit !important;
        white-space: nowrap;
      }

      #career-widget .taraki-powered-by-link {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;

        width: auto !important;
        max-width: none !important;

        margin: 0 !important;
        padding: 0 !important;

        position: static !important;
        inset: auto !important;
        transform: none !important;
        float: none !important;

        flex: 0 0 auto !important;
        line-height: 1 !important;
        text-decoration: none !important;
      }

      #career-widget .taraki-powered-by-link:hover,
      #career-widget .taraki-powered-by-link:visited,
      #career-widget .taraki-powered-by-link:active {
        text-decoration: none !important;
      }

      #career-widget .taraki-powered-by-logo {
        display: block !important;

        width: auto !important;
        max-width: 90px !important;
        height: 20px !important;
        min-height: 20px !important;

        margin: 0 !important;
        padding: 0 !important;

        position: static !important;
        inset: auto !important;
        transform: none !important;
        float: none !important;

        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        object-fit: contain !important;
      }

      @media screen and (max-width: 767px) {
        #career-widget .taraki-job-card {
          padding: 16px;
        }

        #career-widget .taraki-tags-row {
          align-items: flex-start;
        }

        #career-widget .taraki-apply-btn {
          width: 100%;
          margin-top: 4px;
        }

        #career-widget .taraki-powered-by {
          gap: 6px !important;
          margin-top: 16px !important;
        }

        #career-widget .taraki-powered-by-logo {
          max-width: 80px !important;
          height: 18px !important;
          min-height: 18px !important;
        }
      }
    `;

    const styleTag = document.createElement("style");
    styleTag.id = styleId;
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }

  try {
    injectStyles();

    const constraints = [
      {
        key: "Related Company",
        constraint_type: "equals",
        value: companyId
      },
      {
        key: "Job Status",
        constraint_type: "equals",
        value: "Active"
      }
    ];

    const apiUrl =
      "https://app.taraki.co/api/1.1/obj/job" +
      `?constraints=${encodeURIComponent(JSON.stringify(constraints))}` +
      "&include_keys=Location,Created Date";

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `Taraki jobs request failed with status ${response.status}.`
      );
    }

    const data = await response.json();
    let jobs = Array.isArray(data.response?.results)
      ? data.response.results
      : [];

    jobs.sort((a, b) => {
      const dateA = Date.parse(a["Created Date"]);
      const dateB = Date.parse(b["Created Date"]);

      if (Number.isNaN(dateA) && Number.isNaN(dateB)) {
        return 0;
      }

      if (Number.isNaN(dateA)) {
        return 1;
      }

      if (Number.isNaN(dateB)) {
        return -1;
      }

      return dateB - dateA;
    });

    if (limit > 0) {
      jobs = jobs.slice(0, limit);
    }

    let html = '<div class="taraki-job-list">';

    if (!jobs.length) {
      html += `
        <p class="taraki-empty-state">
          No open positions right now.
        </p>
      `;
    } else {
      html += jobs
        .map((job) => {
          const title = escapeHtml(job.Title || "Untitled Role");
          const jobType = escapeHtml(job["Job Type"] || "");
          const workplace = escapeHtml(job["Workplace Type"] || "");
          const experience = escapeHtml(job["Experience Level"] || "");
          const location = escapeHtml(getLocation(job));
          const slug = String(job.Slug || "").trim();

          const applyLink =
            `https://app.taraki.co/home/jobs?view=` +
            encodeURIComponent(slug);

          return `
            <article class="taraki-job-card">
              <div class="taraki-job-info">
                <a
                  class="taraki-job-title"
                  href="${applyLink}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${title}
                </a>

                <div class="taraki-job-meta">
                  ${location}
                </div>

                <div class="taraki-tags-row">
                  <div class="taraki-tags">
                    ${workplace ? `<span>${workplace}</span>` : ""}
                    ${jobType ? `<span>${jobType}</span>` : ""}
                    ${experience ? `<span>${experience}</span>` : ""}
                  </div>

                  <a
                    class="taraki-apply-btn"
                    href="${applyLink}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </article>
          `;
        })
        .join("");
    }

    html += "</div>";

    html += `
      <div class="taraki-powered-by">
        <span class="taraki-powered-by-text">
          Powered by:
        </span>

        <a
          class="taraki-powered-by-link"
          href="https://www.taraki.co/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Taraki"
        >
          <img
            class="taraki-powered-by-logo"
            src="https://59ec4803f701f00d30844b42b08d0cae.cdn.bubble.io/f1762863411813x966011538071729200/Logo%20%283%29.svg"
            alt="Taraki"
          />
        </a>
      </div>
    `;

    target.innerHTML = html;
  } catch (error) {
    console.error("Taraki widget error:", error);

    target.innerHTML = `
      <p class="taraki-error-state">
        Unable to load jobs right now.
      </p>
    `;
  }
})();
