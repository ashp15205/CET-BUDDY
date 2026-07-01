let allColleges = [];
let fullData = [];
let currentPage = 1;
const rowsPerPage = 10;
const PREDICTOR_STORAGE_KEY = "cetBuddyPredictorSession";

const DISTRICT_MAP = {
  'Mumbai': ['Mumbai', 'Bandra', 'Andheri', 'Sion', 'Matunga', 'Kurla', 'Chembur', 'Vidyavihar', 'Ghatkopar', 'Mahim', 'Borivali', 'Dadar', 'Vile Parle', "Svkm's", "Bhagubhai Mafatlal", 'Navjeevan', 'Somaiya'],
  'Mumbai Suburban': ['Mumbai Suburban'],
  'Pune': ['Pune', 'Pimpri', 'Chinchwad', 'Ravet', 'Talegaon', 'Pisoli', 'Ambegaon', 'Narhe', 'Sasewadi', 'Indapur', 'Baramati', 'Lonavala', 'Akurdi', 'Wagholi', 'Bhor', 'Khed', 'Shirur', 'Junnar', 'Dhankavdi', 'Katraj', 'Kothrud', 'Karvenagar', 'Hadapsar', 'Bavdhan', 'Nigdi', 'Alandi', 'Dapodi', 'Avasari Khurd', 'Dumbarwadi', 'Someshwar Nagar', 'Navsahyadri', 'Lakhewadi', 'JSPM', 'Nextgen', 'LOHIA', 'COEP', 'DNYANVILAS', 'Samarth', 'Imperial College', 'Rajgad', 'Jaihind', 'Sinhgad', "PVG's"],
  'Thane': ['Thane', 'Badlapur', 'Kalyan', 'Dombivli', 'Ulhasnagar', 'Ambernath', 'Bhiwandi', 'Mumbra', 'Shahapur', 'Titwala', 'Bhayandar', 'Bhayinder', 'Pravin Rohidas', 'Devi Mahalaxmi'],
  'Navi Mumbai': ['Navi Mumbai', 'Vashi', 'Nerul', 'Belapur', 'Kharghar', 'Panvel', 'Kopar Khairane', 'Airoli', 'Sanpada'],
  'Palghar': ['Palghar', 'Vasai', 'Virar', 'Boisar', 'Dahanu', 'Wada', 'Nalasopara', 'Gokhiware', 'Thakur Shree DPS', 'Viva Institute'],
  'Raigad': ['Raigad', 'Karjat', 'Lonere', 'Panvel', 'Khopoli', 'Alibag', 'Mangaon', 'Pen', 'Roha', 'Mahad', 'Bhivpuri', 'Tasgaonkar'],
  'Nashik': ['Nashik', 'Sinnar', 'Malegaon', 'Igatpuri', 'Ozar', 'Pimpalgaon', 'Chandwad', 'Nandgaon', 'Manmad', 'Matoshri Aasarabai'],
  'Ahmednagar': ['Ahmednagar', 'Shrirampur', 'Kopargaon', 'Sangamner', 'Loni', 'Rahuri', 'Shrigonda', 'Shrigondha', 'Parner', 'Shevgaon', 'Pathardi', 'Ashok Institute', 'Parikrama', 'Malwadi', 'Atma Malik', 'VAMANRAO ITHAPE', 'Phulepimpalgaon', 'V.K. Patil'],
  'Solapur': ['Solapur', 'Barshi', 'Pandharpur', 'Akkalkot', 'Sangola', 'Karmala', 'Madha', 'Mangalwedha', 'Akluj', 'Paniv', 'Karmayogi'],
  'Kolhapur': ['Kolhapur', 'Ichalkaranji', 'Jaysingpur', 'Hatkanangle', 'Shirol', 'Panhala', 'Gadhinglaj', 'Warananagar', 'Gargoti', 'Sanjay Ghodawat', 'Ashokrao Mane', 'Sanjeevan', 'Abitkar', 'Tatyasaheb Kore', 'Yelur'],
  'Sangli': ['Sangli', 'Miraj', 'Islampur', 'Tasgaon', 'Vita', 'Palus', 'Shirala', 'Walva', 'Sangali'],
  'Satara': ['Satara', 'Karad', 'Phaltan', 'Wai', 'Mahabaleshwar', 'Khandala', 'Patan', 'Koregaon', 'Wadwadi'],
  'Nagpur': ['Nagpur', 'Ramtek', 'Kamptee', 'Umred', 'Katol', 'Hingna', 'Savner'],
  'Amravati': ['Amravati', 'Badnera', 'Achalpur', 'Anjangaon', 'Morshi', 'Warud', 'Daryapur'],
  'Akola': ['Akola', 'Akot', 'Balapur', 'Murtizapur', 'Telhara'],
  'Buldhana': ['Buldhana', 'Khamgaon', 'Shegaon', 'Malkapur', 'Chikhli', 'Mehkar'],
  'Washim': ['Washim', 'Karanja', 'Mangrulpir', 'Risod'],
  'Yavatmal': ['Yavatmal', 'Pusad', 'Darwha', 'Digras', 'Umarkhed', 'Wani'],
  'Wardha': ['Wardha', 'Hinganghat', 'Arvi', 'Sevagram', 'Deoli'],
  'Chandrapur': ['Chandrapur', 'Ballarpur', 'Bhadravati', 'Rajura', 'Warora', 'Bramhapuri'],
  'Gadchiroli': ['Gadchiroli', 'Desaiganj', 'Aheri'],
  'Bhandara': ['Bhandara', 'Tumsar', 'Pauni'],
  'Gondia': ['Gondia', 'Tirora'],
  'Aurangabad': ['Aurangabad', 'Chhatrapati Sambhajinagar', 'Paithan', 'Vaijapur', 'Sillod', 'Kannad', 'Sant Eknath', 'Ohar', 'ICEEM', 'CDS', 'Mangaldeep'],
  'Jalna': ['Jalna', 'Ambad', 'Bhokardan', 'Partur'],
  'Beed': ['Beed', 'Ambejogai', 'Parli', 'Ashti', 'Majalgaon', 'Georai', 'Kada'],
  'Osmanabad': ['Osmanabad', 'Dharashiv', 'Tuljapur', 'Omerga', 'Bhum', 'Paranda', 'Kalamb'],
  'Latur': ['Latur', 'Udgir', 'Ausa', 'Nilanga', 'Ahmedpur'],
  'Nanded': ['Nanded', 'Degloor', 'Mukhed', 'Kinwat', 'Loha'],
  'Parbhani': ['Parbhani', 'Pathri', 'Jintur', 'Gangakhed', 'Sailu'],
  'Hingoli': ['Hingoli', 'Basmath', 'Kalamnuri'],
  'Jalgaon': ['Jalgaon', 'Bhusawal', 'Amalner', 'Chalisgaon', 'Pachora', 'Raver', 'Jamner', 'Faizpur'],
  'Dhule': ['Dhule', 'Shirpur', 'Dondaicha', 'Sakri'],
  'Nandurbar': ['Nandurbar', 'Shahada', 'Navapur'],
  'Ratnagiri': ['Ratnagiri', 'Chiplun', 'Dapoli', 'Khed', 'Guhagar', 'Rajapur', 'Ambav Deorukh'],
  'Sindhudurg': ['Sindhudurg', 'Kankavli', 'Malvan', 'Sawantwadi', 'Kudal', 'Devgad', 'Vengurla']
};

function getDistrict(collegeName) {
  if (!collegeName) return "Other";
  const nameLower = collegeName.toLowerCase();

  // Try checking the last part after the comma first (usually city/town)
  const parts = collegeName.split(',');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].toLowerCase();
    for (const [district, keywords] of Object.entries(DISTRICT_MAP)) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`);
        if (regex.test(lastPart)) {
          return district;
        }
      }
    }
  }

  // Fallback: check the entire name
  for (const [district, keywords] of Object.entries(DISTRICT_MAP)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`);
      if (regex.test(nameLower)) {
        return district;
      }
    }
  }

  return "Other";
}

// Maps (year, round) → { file, label }
// 2025-26: Rounds 1-4 | 2024-25: Rounds 1-3 | 2023-24: Rounds 1-3
const ROUND_CONFIG = {
  "2025-1": { file: "cutoff-25-26.csv", label: "2025-26 CAP Round 1" },
  "2025-2": { file: "cutoff-cap-round-2-25-26.csv", label: "2025-26 CAP Round 2" },
  "2025-3": { file: "cutoff-cap-round-3-25-26.csv", label: "2025-26 CAP Round 3" },
  "2025-4": { file: "cutoff-cap-round-4-25-26.csv", label: "2025-26 CAP Round 4" },
  "2024-1": { file: "cutoff-24-25.csv", label: "2024-25 CAP Round 1" },
  "2024-2": { file: "cutoff-cap-round-2-24-25.csv", label: "2024-25 CAP Round 2" },
  "2024-3": { file: "cutoff-cap-round-3-24-25.csv", label: "2024-25 CAP Round 3" },
  "2023-1": { file: "cutoff-23-24.csv", label: "2023-24 CAP Round 1" },
  "2023-2": { file: "cutoff-cap-round-2-23-24.csv", label: "2023-24 CAP Round 2" },
  "2023-3": { file: "cutoff-cap-round-3-23-24.csv", label: "2023-24 CAP Round 3" },
};

function getRoundConfig(year, round) {
  const key = `${year}-${round}`;
  return ROUND_CONFIG[key] || ROUND_CONFIG["2025-1"];
}

// Which rounds are available per year
const AVAILABLE_ROUNDS = {
  "2025": [1, 2, 3, 4],
  "2024": [1, 2, 3],
  "2023": [1, 2, 3],
};

function updateRoundOptions() {
  const year = document.getElementById("year")?.value || "2025";
  const roundSelect = document.getElementById("round");
  if (!roundSelect) return;

  const available = AVAILABLE_ROUNDS[year] || [1];
  const currentRound = parseInt(roundSelect.value, 10);

  [...roundSelect.options].forEach((opt) => {
    const roundNum = parseInt(opt.value, 10);
    opt.disabled = !available.includes(roundNum);
    opt.style.color = opt.disabled ? "#aaa" : "";
  });

  // If current selection is now disabled, reset to Round 1
  if (!available.includes(currentRound)) {
    roundSelect.value = "1";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  updateRoundOptions();
  await loadCSVandPrepareDropdowns();

  document.getElementById("predict-form").addEventListener("submit", handleFormSubmit);
  document.getElementById("download-pdf").addEventListener("click", downloadPDF);

  document.getElementById("year").addEventListener("change", async () => {
    updateRoundOptions();
    await loadCSVandPrepareDropdowns();
  });

  document.getElementById("round").addEventListener("change", async () => {
    await loadCSVandPrepareDropdowns();
  });

  const branchEl = document.getElementById("branch");
  const categoryEl = document.getElementById("category");
  document.getElementById("city")?.addEventListener("change", updateCollegeDropdown);

  const donationModal = document.getElementById("donation-modal");
  if (donationModal) {
    document.getElementById("close-modal")?.addEventListener("click", () => {
      donationModal.style.display = "none";
    });
    document.getElementById("skip-donation")?.addEventListener("click", () => {
      donationModal.style.display = "none";
    });
    // Close modal on clicking outside
    donationModal.addEventListener("click", (e) => {
      if (e.target === donationModal) {
        donationModal.style.display = "none";
      }
    });
  }

  await restoreSessionInputs();
});

async function restoreSessionInputs() {
  const raw = sessionStorage.getItem(PREDICTOR_STORAGE_KEY);
  if (!raw) return;

  let savedState;
  try {
    savedState = JSON.parse(raw);
  } catch (error) {
    sessionStorage.removeItem(PREDICTOR_STORAGE_KEY);
    return;
  }

  const form = document.getElementById("predict-form");
  if (!form) return;

  const yearSelect = document.getElementById("year");
  const roundSelect = document.getElementById("round");

  if (savedState.year && yearSelect && yearSelect.value !== savedState.year) {
    yearSelect.value = savedState.year;
    updateRoundOptions();
  }

  if (savedState.round && roundSelect) {
    const opt = [...roundSelect.options].find(o => o.value === savedState.round && !o.disabled);
    if (opt) roundSelect.value = savedState.round;
  }

  await loadCSVandPrepareDropdowns();

  const fields = ["percentile", "branch", "category", "college", "city"];
  fields.forEach((field) => {
    const element = document.getElementById(field);
    const value = savedState[field];
    if (element && typeof value === "string" && value) {
      const hasOption = element.tagName !== "SELECT" || [...element.options].some((option) => option.value === value);
      if (hasOption) {
        element.value = value;
      }
    }
  });

  if (savedState.autoSubmit && document.getElementById("percentile")?.value) {
    sessionStorage.setItem(PREDICTOR_STORAGE_KEY, JSON.stringify({ ...savedState, autoSubmit: false }));
    form.requestSubmit();
  }
}

async function loadCSVandPrepareDropdowns() {
  const year = document.getElementById("year")?.value || "2025";
  const round = document.getElementById("round")?.value || "1";
  const { file } = getRoundConfig(year, round);

  return new Promise((resolve) => {
    Papa.parse(file, {
      download: true,
      header: true,
      complete(results) {
        fullData = results.data.filter((row) => row["Percentile"]);

        const excludedCategories = ["S", "H", "MI", "PWDROBC.1"];
        const categories = [...new Set(
          fullData
            .map((d) => d["Category"])
            .filter((cat) => cat && !excludedCategories.includes(cat.trim()))
        )].sort();

        const branches = [...new Set(fullData.map((d) => d["Branch"]).filter(Boolean))].sort();

        const cities = [...new Set(fullData.map((d) => getDistrict(d["College Name"])).filter(Boolean))].sort();

        populateSelect(document.getElementById("category"), categories, "Select Category");
        populateSelect(document.getElementById("branch"), branches, "Select Branch");
        populateSelect(document.getElementById("city"), cities, "Select District");

        updateCollegeDropdown();

        resolve();
      }
    });
  });
}

function updateCollegeDropdown() {
  const selectedCity = document.getElementById("city")?.value;
  let filteredColleges = fullData.map((d) => d["College Name"]).filter(Boolean);
  if (selectedCity) {
    filteredColleges = filteredColleges.filter((name) => {
      return getDistrict(name) === selectedCity;
    });
  }
  const colleges = [...new Set(filteredColleges)].sort();
  populateSelect(document.getElementById("college"), colleges, "Select College");
}

function populateSelect(selectEl, items, placeholder) {
  if (!selectEl) return;
  const currentValue = selectEl.value; // Store the previous value

  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    selectEl.appendChild(option);
  });

  // Restore previous value if it is still a valid option
  if (currentValue && items.includes(currentValue)) {
    selectEl.value = currentValue;
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  showLoader();

  const form = new FormData(event.target);
  const payload = Object.fromEntries(form.entries());
  sessionStorage.setItem(PREDICTOR_STORAGE_KEY, JSON.stringify({ ...payload, autoSubmit: false }));

  const percentile = parseFloat(payload.percentile);
  const year = payload.year || "2025";
  const round = payload.round || "1";
  const { label: roundLabel } = getRoundConfig(year, round);

  if (isNaN(percentile) || percentile < 0 || percentile > 100) {
    alert("Please enter a valid percentile between 0 and 100.");
    hideLoader();
    return;
  }

  let filtered = fullData.filter((row) => {
    const value = parseFloat(row["Percentile"]);
    return !isNaN(value) && value !== -1.0 && value <= percentile;
  });

  if (payload.category) {
    filtered = filtered.filter((row) =>
      row["Category"]?.toUpperCase() === payload.category.toUpperCase()
    );
  }

  if (payload.branch) {
    filtered = filtered.filter((row) =>
      row["Branch"]?.toLowerCase().includes(payload.branch.toLowerCase())
    );
  }

  if (payload.college) {
    filtered = filtered.filter((row) =>
      row["College Name"]?.toLowerCase().includes(payload.college.toLowerCase())
    );
  }

  if (payload.city) {
    filtered = filtered.filter((row) => {
      return getDistrict(row["College Name"]) === payload.city;
    });
  }

  allColleges = filtered.sort((a, b) =>
    parseFloat(b["Percentile"]) - parseFloat(a["Percentile"])
  );
  currentPage = 1;

  hideLoader();

  const resultsDiv = document.getElementById("results");

  if (allColleges.length === 0) {
    resultsDiv.innerHTML = `<h2>Eligible Colleges</h2><p>No colleges found for ${roundLabel}.<br>Try changing filters or round.</p>`;
    resultsDiv.style.display = "block";
    document.getElementById("download-pdf").style.display = "none";
    scrollToResults();
    return;
  }

  renderTablePage(allColleges, currentPage, roundLabel);
  resultsDiv.style.display = "block";
  document.getElementById("download-pdf").style.display = "inline-flex";
  scrollToResults();
}

function renderTablePage(data, page, roundLabel) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  let tableHTML = `
    <h2>Eligible Colleges</h2>
    <p class="results-meta">${data.length} result${data.length !== 1 ? "s" : ""} for <strong>${roundLabel}</strong></p>
    <div class="results-table-wrap">
      <table id="college-table">
        <thead>
          <tr>
            <th>College Name</th>
            <th>Branch</th>
            <th>Category</th>
            <th>Percentile</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
  `;

  paginatedData.forEach((college) => {
    const percentileValue = college["Percentile"];
    const percentileDisplay = percentileValue === "-1.0" || percentileValue === -1.0 ? "Not Available" : (percentileValue || "N/A");
    const rankValue = college["Rank"];
    const rankDisplay = rankValue === "-1" || rankValue === -1 ? "Not Available" : (rankValue || "N/A");

    tableHTML += `
          <tr>
            <td data-label="College Name">${college["College Name"] || "N/A"}</td>
            <td data-label="Branch">${college["Branch"] || "N/A"}</td>
            <td data-label="Category">${college["Category"] || "N/A"}</td>
            <td data-label="Percentile (${roundLabel})">${percentileDisplay}</td>
            <td data-label="Rank">${rankDisplay}</td>
          </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </div>
    <div class="pagination">
      <button id="prev-page" aria-label="Previous page" ${page === 1 ? "disabled" : ""}><i class="fa-solid fa-chevron-left"></i></button>
      <span>Page ${page} of ${Math.ceil(data.length / rowsPerPage)}</span>
      <button id="next-page" aria-label="Next page" ${end >= data.length ? "disabled" : ""}><i class="fa-solid fa-chevron-right"></i></button>
    </div>
  `;

  document.getElementById("results").innerHTML = tableHTML;

  document.getElementById("prev-page").onclick = () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderTablePage(allColleges, currentPage, roundLabel);
    }
  };

  document.getElementById("next-page").onclick = () => {
    if (currentPage * rowsPerPage < allColleges.length) {
      currentPage += 1;
      renderTablePage(allColleges, currentPage, roundLabel);
    }
  };
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const year = document.getElementById("year")?.value || "2025";
  const round = document.getElementById("round")?.value || "1";
  const { label: roundLabel } = getRoundConfig(year, round);

  doc.setFontSize(16);
  doc.text("MHT-CET Eligible Colleges", 14, 20);

  const headers = ["College Name", "Branch", "Category", `Percentile (${roundLabel})`, "Rank"];
  const rows = allColleges.map((row) => [
    row["College Name"] || "N/A",
    row["Branch"] || "N/A",
    row["Category"] || "N/A",
    row["Percentile"] === "-1.0" || row["Percentile"] === -1.0 ? "Not Available" : (row["Percentile"] || "N/A"),
    row["Rank"] === "-1" || row["Rank"] === -1 ? "Not Available" : (row["Rank"] || "N/A")
  ]);

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 30,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 }
  });

  doc.save("mhtcet_colleges.pdf");

}

function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}

function goToHome() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "index.html";
  }
}

function scrollToResults() {
  const resultsSection = document.getElementById("results");
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
