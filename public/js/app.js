// ===============================
// Load Dashboard
// ===============================

async function loadDashboard() {

    // ---------------- QR DATA ----------------

    const qrRes = await fetch("/api/all");
    const qrData = await qrRes.json();

    const qrTable = document.getElementById("qrTable");

    qrTable.innerHTML = "";

    let totalScans = 0;

    qrData.forEach(qr => {

        totalScans += qr.scan_count;

        qrTable.innerHTML += `
            <tr>

                <td>${qr.title}</td>

                <td>
                    <img src="/qr/${qr.short_code}.png"
                         width="80">
                </td>

                <td>${qr.scan_count}</td>

                <td>

                    <a
                        href="/api/r/${qr.short_code}"
                        target="_blank"
                        class="btn btn-primary btn-sm mb-1">
                        Open
                    </a>

                    <a
                        href="/qr/${qr.short_code}.png"
                        download
                        class="btn btn-success btn-sm mb-1">
                        Download
                    </a>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteQR('${qr.id}')">
                        Delete
                    </button>

                </td>

            </tr>
        `;

    });

    document.getElementById("scanCount").innerText = totalScans;

    if (qrData.length) {

        document.getElementById("lastScan").innerText =
            qrData[0].last_scan
                ? new Date(qrData[0].last_scan).toLocaleString()
                : "No Scan Yet";

    } else {

        document.getElementById("lastScan").innerText = "No Scan Yet";

    }

    // ---------------- GOOGLE FORM RESPONSES ----------------

    const responseRes = await fetch("/api/responses");
    const responses = await responseRes.json();

    document.getElementById("responseCount").innerText = responses.length;

    createResponseTable(responses);

}



// ===============================
// Dynamic Response Table
// ===============================

function createResponseTable(data) {

    const thead = document.getElementById("responseHead");
    const tbody = document.getElementById("responseBody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (!data.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="20" class="text-center">
                    No Responses Found
                </td>
            </tr>
        `;

        return;

    }

    const headers = Object.keys(data[0]);

    let headRow = "<tr>";

    headers.forEach(header => {

        headRow += `<th>${header}</th>`;

    });

    headRow += "</tr>";

    thead.innerHTML = headRow;

    data.forEach(row => {

        let tr = "<tr>";

        headers.forEach(header => {

            tr += `<td>${row[header] ?? ""}</td>`;

        });

        tr += "</tr>";

        tbody.innerHTML += tr;

    });

}



// ===============================
// Create QR
// ===============================

document
.getElementById("createQRForm")
.addEventListener("submit", async function (e) {

    e.preventDefault();

    const title = document.getElementById("title").value;

    const destination_url =
        document.getElementById("destination_url").value;

    const res = await fetch("/api/create", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title,
            destination_url
        })

    });

    const data = await res.json();

    if (data.success) {

        alert("QR Created Successfully!");

        document.getElementById("createQRForm").reset();

        loadDashboard();

    } else {

        alert(data.message);

    }

});



// ===============================
// Delete QR
// ===============================

async function deleteQR(id) {

    const confirmDelete = confirm("Are you sure you want to delete this QR?");

    if (!confirmDelete) return;

    const res = await fetch(`/api/delete/${id}`, {

        method: "DELETE"

    });

    const data = await res.json();

    if (data.success) {

        alert("QR Deleted Successfully!");

        loadDashboard();

    } else {

        alert("Unable to delete QR.");

    }

}



// ===============================
// Initial Load
// ===============================

loadDashboard();