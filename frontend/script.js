let allColleges = [];
let fullData = [];
let currentPage = 1;
const rowsPerPage = 10;

document.addEventListener("DOMContentLoaded", async () => {
  await loadCSVandPrepareDropdowns();

  document.getElementById("predict-form").addEventListener("submit", handleFormSubmit);
  document.getElementById("download-pdf").addEventListener("click", downloadPDF);
});

// Load and parse CSV
async function loadCSVandPrepareDropdowns() {
  if (sessionStorage.getItem("csvData")) {
    fullData = JSON.parse(sessionStorage.getItem("csvData"));
    populateDropdowns(fullData);
    return;
  }
  Papa.parse("percentile.csv", {
    download: true,
    header: true,
    complete: function(results) {
      fullData = results.data.filter(row => row["Percentile"]); // Remove empty rows

      const categories = [...new Set(fullData.map(d => d["Category"]).filter(Boolean))].sort();
      const branches = [...new Set(fullData.map(d => d["Branch"]).filter(Boolean))].sort();
      const colleges = [...new Set(fullData.map(d => d["College Name"]).filter(Boolean))].sort();

      populateSelect(document.getElementById("category"), categories, "Select Category");
      populateSelect(document.getElementById("branch"), branches, "Select Branch");
      populateSelect(document.getElementById("college"), colleges, "Select College");
    }
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
// Form submission handler
function handleFormSubmit(e) {
  e.preventDefault();
  showLoader();

  const form = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());

  payload.percentile = parseFloat(payload.percentile);
  const selectedRound = form.get("round") || "Percentile"; // CAP 2024–25 default

  if (isNaN(payload.percentile) || payload.percentile < 0 || payload.percentile > 100) {
    alert("❌ Please enter a valid percentile between 0 and 100.");
    hideLoader();
    return;
  }

  // Filter only by percentile and round first
  let filtered = fullData.filter(row =>
    parseFloat(row[selectedRound]) <= payload.percentile
  );

  // Optional category
  if (payload.category) {
    filtered = filtered.filter(row =>
      row["Category"]?.toUpperCase() === payload.category.toUpperCase()
    );
  }

  // Optional branch
  if (payload.branch) {
    filtered = filtered.filter(row =>
      row["Branch"]?.toLowerCase().includes(payload.branch.toLowerCase())
    );
  }

  // Optional college
  if (payload.college) {
    filtered = filtered.filter(row =>
      row["College Name"]?.toLowerCase().includes(payload.college.toLowerCase())
    );
  }

  allColleges = filtered.sort((a, b) => parseFloat(b[selectedRound]) - parseFloat(a[selectedRound]));
  currentPage = 1;

  hideLoader();

  if (allColleges.length === 0) {
    document.getElementById("results").innerHTML = "<h2>🎓 Eligible Colleges</h2><p>🚫 No colleges found matching your criteria.</p><p>Try changing CAP Rounds or removing optional filters (category, branch, college name).</p>";
    document.getElementById("results").style.display = "block";
    document.getElementById("download-pdf").style.display = "none";
    scrollToResults();
    return;
  }

  renderTablePage(allColleges, currentPage, selectedRound);
  document.getElementById("results").style.display = "block";
  document.getElementById("download-pdf").style.display = "inline-block";

  // Scroll to results
  document.getElementById("results").scrollIntoView({ behavior: "smooth" });
}

function renderTablePage(data, page, selectedRound = "Percentile") {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  const roundLabel = selectedRound === "Percentile" ? "Percentile (2024–25)" : "Percentile (2023–24)";

  let tableHTML = `
    <h2>🎓 Eligible Colleges</h2>
    <table id="college-table">
      <thead>
        <tr>
          <th>College Name</th>
          <th>Branch</th>
          <th>Category</th>
          <th>${roundLabel}</th>
        </tr>
      </thead>
      <tbody>
  `;

  paginatedData.forEach(college => {
    tableHTML += `
      <tr>
        <td>${college["College Name"] || "N/A"}</td>
        <td>${college["Branch"] || "N/A"}</td>
        <td>${college["Category"] || "N/A"}</td>
        <td>${college[selectedRound] || "N/A"}</td>
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
      renderTablePage(allColleges, currentPage, selectedRound);
    }
  };

  document.getElementById("next-page").onclick = () => {
    if (currentPage * rowsPerPage < allColleges.length) {
      currentPage++;
      renderTablePage(allColleges, currentPage, selectedRound);
    }
  };
}


function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const selectedRound = document.getElementById("round")?.value || "Percentile";

  doc.setFontSize(16);
  doc.text("MHT-CET Eligible Colleges", 14, 20);

  const headers = ["College Name", "Branch", "Category", selectedRound === "Percentile" ? "Percentile (2024–25)" : "Percentile (2023–24)"];
  const rows = allColleges.map(row => [
    row["College Name"] || "N/A",
    row["Branch"] || "N/A",
    row["Category"] || "N/A",
    row[selectedRound] || "N/A"
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
function goToIndex() {
  window.history.back();  // goes back faster without reloading 
}

function goToHome() {
  // Try to use the History API for smoother navigation
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // Fallback to regular navigation (avoids infinite loader)
    window.location.href = "index.html";
  }
}