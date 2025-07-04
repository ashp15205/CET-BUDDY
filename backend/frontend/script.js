

let allColleges = [];
let currentPage = 1;
const rowsPerPage = 10;

document.addEventListener("DOMContentLoaded", async () => {
  const categorySelect = document.getElementById("category");
  const branchSelect = document.getElementById("branch");
  const collegeSelect = document.getElementById("college");

  try {
    const res = await fetch("http://localhost:8000/dropdown-options");
    const options = await res.json();

    const populateSelect = (selectEl, items, placeholder) => {
      selectEl.innerHTML = `<option value="">${placeholder}</option>`;
      items.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        selectEl.appendChild(option);
      });
    };

    populateSelect(categorySelect, options.categories, "Select Category");
    populateSelect(branchSelect, options.branches, "Select Branch");
    populateSelect(collegeSelect, options.colleges, "Select College");
  } catch (err) {
    alert("❌ Failed to load dropdown options.");
    console.error(err);
  }
});

// Form submission handler
document.getElementById("predict-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const payload = Object.fromEntries(form.entries());
  payload.percentile = parseFloat(payload.percentile);

  const resultsDiv = document.getElementById("results");
  const downloadBtn = document.getElementById("download-pdf");

  resultsDiv.style.display = "none";
  downloadBtn.style.display = "none";

  try {
    showLoader();

    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    hideLoader();

    if (!data.colleges.length) {
      resultsDiv.innerHTML = "<h2>🎓 Eligible Colleges</h2><p>No matching colleges found.</p>";
      resultsDiv.style.display = "block";
      return;
    }

    allColleges = data.colleges;
    currentPage = 1;

    renderTablePage(allColleges, currentPage);
    resultsDiv.style.display = "block";
    downloadBtn.style.display = "inline-block";
  } catch (err) {
    hideLoader();
    alert("❌ Error fetching results.");
    console.error(err);
  }
});

// Renders paginated results
function renderTablePage(data, page) {
  const resultsDiv = document.getElementById("results");
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
        <td>${college["College Code"]}</td>
        <td>${college["College Name"]}</td>
        <td>${college["Branch"]}</td>
        <td>${college["Category"]}</td>
        <td>${college["Percentile"]}</td>
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

  resultsDiv.innerHTML = tableHTML;

  // Pagination buttons
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

// PDF Download
document.getElementById("download-pdf").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("MHT-CET Eligible Colleges", 14, 20);

  const table = document.querySelector("table");
  if (!table) return;

  const headers = [];
  table.querySelectorAll("thead th").forEach(th => {
    headers.push(th.innerText);
  });

  const rows = [];
  table.querySelectorAll("tbody tr").forEach(tr => {
    const row = [];
    tr.querySelectorAll("td").forEach(td => {
      row.push(td.innerText);
    });
    rows.push(row);
  });

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 30,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });

  doc.save("mhtcet_colleges.pdf");
});

// Loader display
function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}
