let allColleges = [];
let fullData = [];
let currentPage = 1;
const rowsPerPage = 10;

document.addEventListener("DOMContentLoaded", async () => {
  await loadCSVandPrepareDropdowns();

  document.getElementById("predict-form").addEventListener("submit", handleFormSubmit);
  document.getElementById("download-pdf").addEventListener("click", downloadPDF);
});

// Load CSV and populate dropdowns
async function loadCSVandPrepareDropdowns() {
  Papa.parse("cutoff.csv", {
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

// Handle form
function handleFormSubmit(e) {
  e.preventDefault();
  showLoader();
  const form = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());
  payload.percentile = parseFloat(payload.percentile);

  // ✅ Percentile validation
  if (isNaN(payload.percentile) || payload.percentile < 0 || payload.percentile > 100) {
    alert("❌ Please enter a valid percentile between 0 and 100.");
    return;
  }
  const percentile = parseFloat(form.get("percentile"));
  const category = form.get("category");
  const branch = form.get("branch");
  const college = form.get("college");

  let filtered = fullData.filter(row => {
    return (
      row["Category"]?.toUpperCase() === category.toUpperCase() &&
      parseFloat(row["Percentile"]) <= percentile
    );
  });

  if (branch) {
    filtered = filtered.filter(row => row["Branch"]?.toLowerCase().includes(branch.toLowerCase()));
  }

  if (college) {
    filtered = filtered.filter(row => row["College Name"]?.toLowerCase().includes(college.toLowerCase()));
  }

  allColleges = filtered.sort((a, b) => parseFloat(b["Percentile"]) - parseFloat(a["Percentile"]));
  currentPage = 1;

  hideLoader();

  if (allColleges.length === 0) {
    document.getElementById("results").innerHTML = "<h2>🎓 Eligible Colleges</h2><p>No matching colleges found.</p>";
    document.getElementById("results").style.display = "block";
    document.getElementById("download-pdf").style.display = "none";
    return;
  }

  renderTablePage(allColleges, currentPage);
  document.getElementById("results").style.display = "block";
  document.getElementById("download-pdf").style.display = "inline-block";
}

function renderTablePage(data, page) {
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = data.slice(start, end);

  let tableHTML = `
    <h2>🎓 Eligible Colleges</h2>
    <table id="college-table">
      <thead>
        <tr>
          <th>College Code</th>
          <th>College Name</th>
          <th>Branch</th>
          <th>Category</th>
          <th>Percentile</th>
        </tr>
      </thead>
      <tbody>
  `;

  paginatedData.forEach(college => {
    tableHTML += `
      <tr>
        <td>${college["College Code"] || ""}</td>
        <td>${college["College Name"] || "N/A"}</td>
        <td>${college["Branch"] || "N/A"}</td>
        <td>${college["Category"] || "N/A"}</td>
        <td>${college["Percentile"] || "N/A"}</td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
    <div class="pagination">
      <button id="prev-page" ${page === 1 ? 'disabled' : ''}>⬅️ Previous</button>
      <span>Page ${page} of ${Math.ceil(data.length / rowsPerPage)}</span>
      <button id="next-page" ${end >= data.length ? 'disabled' : ''}>Next ➡️</button>
    </div>
  `;

  document.getElementById("results").innerHTML = tableHTML;

  document.getElementById("prev-page").onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTablePage(allColleges, currentPage);
    }
  };

  document.getElementById("next-page").onclick = () => {
    if (currentPage * rowsPerPage < allColleges.length) {
      currentPage++;
      renderTablePage(allColleges, currentPage);
    }
  };
}

// PDF download
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("MHT-CET Eligible Colleges", 14, 20);

  const headers = [];
  document.querySelectorAll("thead th").forEach(th => headers.push(th.innerText));

  const rows = [];
  document.querySelectorAll("tbody tr").forEach(tr => {
    const row = [];
    tr.querySelectorAll("td").forEach(td => row.push(td.innerText));
    rows.push(row);
  });

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
