let allColleges = [];
let fullData = [];
let currentPage = 1;
const rowsPerPage = 10;

document.addEventListener("DOMContentLoaded", async () => {
  await loadCSVandPrepareDropdowns();

  document.getElementById("predict-form").addEventListener("submit", handleFormSubmit);
  document.getElementById("download-pdf").addEventListener("click", downloadPDF);
  document.getElementById("round").addEventListener("change", async () => {
    await loadCSVandPrepareDropdowns(); // reload data on round change
  });
});

// Load CSV based on selected round
async function loadCSVandPrepareDropdowns() {
  const selectedRound = document.getElementById("round")?.value || "2024";
  const file = selectedRound === "2023" ? "cutoff-23-24.csv" : "cutoff-24-25.csv";

  return new Promise((resolve) => {
    Papa.parse(file, {
      download: true,
      header: true,
      complete: function (results) {
        fullData = results.data.filter(row => row["Percentile"]);

        const excludedCategories = ["S", "H", "MI", "PWDROBC.1"];
const categories = [...new Set(
  fullData
    .map(d => d["Category"])
    .filter(cat => cat && !excludedCategories.includes(cat.trim()))
)].sort();

        const branches = [...new Set(fullData.map(d => d["Branch"]).filter(Boolean))].sort();
        const colleges = [...new Set(fullData.map(d => d["College Name"]).filter(Boolean))].sort();

        populateSelect(document.getElementById("category"), categories, "Select Category");
        populateSelect(document.getElementById("branch"), branches, "Select Branch");
        populateSelect(document.getElementById("college"), colleges, "Select College");

        resolve();
      }
    });
  });
}

function populateSelect(selectEl, items, placeholder) {
  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    selectEl.appendChild(option);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  showLoader();

  const form = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());

  const percentile = parseFloat(payload.percentile);
  const roundYear = payload.round;
  const roundLabel = roundYear === "2023" ? "2023–24" : "2024–25";

  if (isNaN(percentile) || percentile < 0 || percentile > 100) {
    alert("❌ Please enter a valid percentile between 0 and 100.");
    hideLoader();
    return;
  }

  // Filter valid percentiles
  let filtered = fullData.filter(row => {
    const p = parseFloat(row["Percentile"]);
    return !isNaN(p) && p !== -1.0 && p <= percentile;
  });

  if (payload.category) {
    filtered = filtered.filter(row =>
      row["Category"]?.toUpperCase() === payload.category.toUpperCase()
    );
  }

  if (payload.branch) {
    filtered = filtered.filter(row =>
      row["Branch"]?.toLowerCase().includes(payload.branch.toLowerCase())
    );
  }

  if (payload.college) {
    filtered = filtered.filter(row =>
      row["College Name"]?.toLowerCase().includes(payload.college.toLowerCase())
    );
  }

  allColleges = filtered.sort((a, b) =>
    parseFloat(b["Percentile"]) - parseFloat(a["Percentile"])
  );
  currentPage = 1;

  hideLoader();

  const resultsDiv = document.getElementById("results");

  if (allColleges.length === 0) {
    resultsDiv.innerHTML = `<h2>🎓 Eligible Colleges</h2><p>🚫 No colleges found for CAP Round ${roundLabel}.<br>Try changing filters or round.</p>`;
    resultsDiv.style.display = "block";
    document.getElementById("download-pdf").style.display = "none";
    scrollToResults();
    return;
  }

  renderTablePage(allColleges, currentPage, roundLabel);
  resultsDiv.style.display = "block";
  document.getElementById("download-pdf").style.display = "inline-block";
  scrollToResults();
}

function renderTablePage(data, page, roundLabel) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  let tableHTML = `
    <h2>🎓 Eligible Colleges</h2>
    <table id="college-table">
      <thead>
        <tr>
          <th>College Name</th>
          <th>Branch</th>
          <th>Category</th>
          <th>Percentile (${roundLabel})</th>
        </tr>
      </thead>
      <tbody>
  `;

  paginatedData.forEach(college => {
    const value = college["Percentile"];
    const display = value === "-1.0" || value === -1.0 ? "Not Available" : (value || "N/A");

    tableHTML += `
      <tr>
        <td>${college["College Name"] || "N/A"}</td>
        <td>${college["Branch"] || "N/A"}</td>
        <td>${college["Category"] || "N/A"}</td>
        <td>${display}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
    <div class="pagination">
      <button id="prev-page" ${page === 1 ? 'disabled' : ''}>⬅️</button>
      <span>Page ${page} of ${Math.ceil(data.length / rowsPerPage)}</span>
      <button id="next-page" ${end >= data.length ? 'disabled' : ''}>➡️</button>
    </div>
  `;

  document.getElementById("results").innerHTML = tableHTML;

  document.getElementById("prev-page").onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTablePage(allColleges, currentPage, roundLabel);
    }
  };

  document.getElementById("next-page").onclick = () => {
    if (currentPage * rowsPerPage < allColleges.length) {
      currentPage++;
      renderTablePage(allColleges, currentPage, roundLabel);
    }
  };
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const selectedRound = document.getElementById("round")?.value || "2024";
  const roundLabel = selectedRound === "2023" ? "2023–24" : "2024–25";

  doc.setFontSize(16);
  doc.text("MHT-CET Eligible Colleges", 14, 20);

  const headers = ["College Name", "Branch", "Category", `Percentile (${roundLabel})`];
  const rows = allColleges.map(row => [
    row["College Name"] || "N/A",
    row["Branch"] || "N/A",
    row["Category"] || "N/A",
    (row["Percentile"] === "-1.0" || row["Percentile"] === -1.0) ? "Not Available" : (row["Percentile"] || "N/A")
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

function scrollToResults() {
  const resultsSection = document.getElementById("results");
  if (resultsSection) {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
