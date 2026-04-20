(async function() {
  const scriptTag = document.currentScript;
  const companyId = scriptTag.getAttribute("data-company-id");
  const theme = scriptTag.getAttribute("data-theme") || "light";
  const limit = parseInt(scriptTag.getAttribute("data-limit")) || 0;

  // Custom colors via data-attributes
  const cardBg = scriptTag.getAttribute("data-card-bg") || (theme === "dark" ? "#1f2937" : "#ffffff");
  const cardBorder = scriptTag.getAttribute("data-card-border") || (theme === "dark" ? "#374151" : "#e5e7eb");
  const textColor = scriptTag.getAttribute("data-text-color") || (theme === "dark" ? "#f9fafb" : "#111827");
  const btnBg = scriptTag.getAttribute("data-btn-bg") || "#FB4D3D";
  const btnHoverBg = scriptTag.getAttribute("data-btn-hover-bg") || "#e73b2b";
  const tagBg = scriptTag.getAttribute("data-tag-bg") || (theme === "dark" ? "#374151" : "#f3f4f6");
  const tagColor = scriptTag.getAttribute("data-tag-color") || (theme === "dark" ? "#e5e7eb" : "#003844");
  const btnTextColor = scriptTag.getAttribute("data-btn-text-color") || "#ffffff";
  const btnTextColorhover = scriptTag.getAttribute("data-btn-text-color-hover") || "#ffffff";
  const target = document.getElementById("career-widget");
  if (!target) return;

  try {
    const res = await fetch(
      `https://taraki-widget-proxy.developer-205.workers.dev/?constraints=[{"key":"Related Company","constraint_type":"equals","value":"${companyId}"},{"key":"Job Status","constraint_type":"equals","value":"Active"}]&include_keys=Location,Created Date`
    );
    const data = await res.json();
    let jobs = data.response?.results || [];

    jobs = jobs.sort((a, b) => {
        const dateA = Date.parse(a["Created Date"]);
        const dateB = Date.parse(b["Created Date"]);
        if (isNaN(dateA) || isNaN(dateB)) {
            console.error("Invalid date found:", a["Created Date"], b["Created Date"]);
            return 0;
        }
        return dateB - dateA;
    });

    if (limit > 0) jobs = jobs.slice(0, limit);

    // Styling
    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
      .taraki-job-list {
        display: grid;
        gap: 18px;
        font-family: Inter, Arial, sans-serif;
        color: ${textColor};
      }
      .taraki-job-card {
        border: 1px solid ${cardBorder};
        border-radius: 12px;
        background: ${cardBg};
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: box-shadow 0.2s ease;
      }
      .taraki-job-card:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.12); }
      .taraki-job-info { flex: 1; }
      .taraki-job-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 6px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: ${textColor};
        text-decoration: none !important;
      }
      .taraki-job-meta { font-size: 0.9rem; font-family: 'Plus Jakarta Sans', sans-serif; color: ${textColor}; padding: 8px 0; }
      .taraki-tags-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
      .taraki-tags { display: flex; flex-wrap: wrap; gap: 6px; }
      .taraki-tags span { background: ${tagBg}; color: ${tagColor}; font-size: 0.8rem; padding: 4px 10px; border-radius: 9999px; font-family: 'Plus Jakarta Sans', sans-serif; }
      .taraki-apply-btn {
        background-color: ${btnBg};
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: ${btnTextColor};
        font-weight: 500;
        border: none;
        border-radius: 8px;
        padding: 7px 14px;
        text-decoration: none !important;
        transition: background-color 0.2s ease, transform 0.1s ease;
      }
      .taraki-apply-btn:hover,
      .taraki-apply-btn:visited,
      .taraki-apply-btn:active { background-color: ${btnHoverBg}; color: ${btnTextColorhover}; transform: translateY(-1px); }
      .taraki-powered-by { text-align: center; margin-top: 20px; font-size: 0.75rem; font-family: 'Plus Jakarta Sans', sans-serif; color: ${theme === "dark" ? "#d1d5db" : "#848484ff"}; }
      .taraki-powered-by img { height: 20px; vertical-align: middle; border-radius: 4px; margin-left: 6px; }
    `;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);

    // Build HTML
    let html = `<div class="taraki-job-list">`;
    if (!jobs.length) {
      html += `<p>No open positions right now.</p>`;
    } else {
      html += jobs.map(j => {
        const title = j.Title || "Untitled Role";
        const jobType = j["Job Type"] || "";
        const workplace = j["Workplace Type"] || "";
        const experience = j["Experience Level"] || "";
        const slug = j.Slug || "";

        // let location = "";
        // if (typeof j.Location === "string") location = j.Location;
        // else if (typeof j.Location === "object") location = j.Location.display || j.Location.address || j.Location.city || j.Location.name || "";
        // if (!location && j.City) location = j.City;
        // if (!location) location = "Location not specified";

      let location = "";
      if (typeof j.Location === "string") {
        location = j.Location;
      } else if (typeof j.Location === "object" && j.Location !== null) {
        location = j.Location.display || j.Location.address || j.Location.city || j.Location.name || "";
      }
      if (!location && j.City) location = j.City;
      
      // Extract City, Country intelligently
      if (location) {
        const parts = location.split(",").map(p => p.trim()).filter(Boolean);
        
        if (parts.length >= 2) {
          // Filter out: postal codes (all digits), plus codes (contain +)
          const meaningfulParts = parts.filter(p => !/^\d+$/.test(p) && !p.includes("+"));
          
          if (meaningfulParts.length >= 2) {
            // Last = Country, Second last = City
            const country = meaningfulParts[meaningfulParts.length - 1];
            const city = meaningfulParts[meaningfulParts.length - 2];
            location = `${city}, ${country}`;
          } else if (meaningfulParts.length === 1) {
            location = meaningfulParts[0];
          }
        }
      }

if (!location) location = "Location not specified";

        const applyLink = `https://app.taraki.co/home/jobs?view=${encodeURIComponent(slug)}`;

        return `
          <div class="taraki-job-card">
            <div class="taraki-job-info">
              <a class="taraki-job-title" href="${applyLink}" target="_blank">${title}</a>
              <div class="taraki-job-meta">${location}</div>
              <div class="taraki-tags-row">
                <div class="taraki-tags">
                  ${workplace ? `<span>${workplace}</span>` : ""}
                  ${jobType ? `<span>${jobType}</span>` : ""}
                  ${experience ? `<span>${experience}</span>` : ""}
                </div>
                <a class="taraki-apply-btn" href="${applyLink}" target="_blank">Apply Now</a>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }
    html += `</div>`;

    // Powered by Taraki
    html += `
      <div class="taraki-powered-by">
        Powered by:
        <a href="https://www.taraki.co/" target="_blank">
          <img src="https://59ec4803f701f00d30844b42b08d0cae.cdn.bubble.io/f1762863411813x966011538071729200/Logo%20%283%29.svg" />
        </a>
      </div>
    `;

    target.innerHTML = html;

  } catch (err) {
    console.error("Widget error:", err);
    target.innerHTML = `<p>⚠️ Unable to load jobs right now.</p>`;
  }
})();
