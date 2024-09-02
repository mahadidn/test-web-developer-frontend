document.addEventListener("DOMContentLoaded", async function () {
  token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
  }

  const editButtons = document.querySelectorAll(".edit");
  const deleteButtons = document.querySelectorAll(".delete");
  const rights = localStorage.getItem("rights");
  let cpl = [];

  try {
    const response = await fetch("http://localhost:9871/api/v1/users/cpl/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"), // Menggunakan token dari localStorage
      },
    });

    if (response.ok) {
      const data = await response.json(); // Menunggu parsing JSON
      console.log("Data received from API:", data.cpl);

      // Cek apakah data.cpl ada dan merupakan array
      if (data.cpl && Array.isArray(data.cpl)) {
        cpl = data.cpl; // Mengambil array CPL dari response
      } else {
        console.error("Expected data.cpl to be an array but got:", data.cpl);
        return;
      }

      // Ambil elemen tbody dari tabel
      const tbody = document.querySelector(".cpl-table tbody");

      // Hapus semua baris yang ada di tbody
      tbody.innerHTML = "";

      // Tambahkan setiap data dari array CPL ke tabel
      i = 1;
      cpl.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="kodecpl">${item.kodecpl}</td>
            <td class="deskripsi">${item.deskripsi}</td>
            <td>
                <input name="kodecpl${i}" value="${item.kodecpl}" hidden>
                <button class="action-btn edit" title="Edit">✏️</button>
                <button class="action-btn delete" data-kodecpl="${item.kodecpl}" title="Delete">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
        i++;
    });


      const row2 = document.createElement("tr");
      row2.innerHTML = `
                <td>${i}</td>
                <td><input name="kodecpml"></td>
                <td><input name="deskripsi"></td>
                <td></td>
            `;

      tbody.appendChild(row2);

      // Event listener untuk tombol edit
      document.querySelectorAll('.edit').forEach(button => {
    button.addEventListener('click', function() {
        const row = this.closest('tr');
        const kodecplCell = row.querySelector('.kodecpl');
        const deskripsiCell = row.querySelector('.deskripsi');

        const originalKodecpl = kodecplCell.textContent;
        const originalDeskripsi = deskripsiCell.textContent;

        // Menyembunyikan baris input kosong (row terakhir) jika ada
        const lastRow = document.querySelector('.cpl-table tbody tr:last-child');
        const lastRowInputs = lastRow.querySelectorAll('input');
        if (lastRowInputs.length > 0 && !lastRowInputs[0].value && !lastRowInputs[1].value) {
            lastRow.style.display = 'none';
        }

        // Mengubah sel menjadi input
        kodecplCell.innerHTML = `<input type="text" class="edit-kodecpl" value="${originalKodecpl}" />`;
        deskripsiCell.innerHTML = `<input type="text" class="edit-deskripsi" value="${originalDeskripsi}" />`;

        const kodecplInput = row.querySelector('.edit-kodecpl');
        const deskripsiInput = row.querySelector('.edit-deskripsi');

        // Focus pada input deskripsi
        deskripsiInput.focus();

        // Ketika user menekan Enter
        // Ketika user menekan Enter
        deskripsiInput.addEventListener('keydown', async function eventHandler(event) {
            if (event.key === 'Enter') {
                event.preventDefault();

                const newKodecpl = kodecplInput.value.trim();
                const newDeskripsi = deskripsiInput.value.trim();

                if (newKodecpl && newDeskripsi) {
                    try {
                        const updateResponse = await fetch(`http://localhost:9871/api/v1/users/cpl/update/${originalKodecpl}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': localStorage.getItem('authToken') // Menggunakan token dari localStorage
                            },
                            body: JSON.stringify({
                                cpl: {
                                    kodecpl: newKodecpl,
                                    deskripsi: newDeskripsi
                                }
                            })
                        });

                        if (updateResponse.ok) {
                            console.log(newKodecpl, newDeskripsi);
                            console.log(`CPL with Kode CPL: ${originalKodecpl} updated successfully`);

                            // Mengembalikan input menjadi text biasa
                            kodecplCell.textContent = newKodecpl;
                            deskripsiCell.textContent = newDeskripsi;

                            // Menampilkan kembali baris input kosong jika dibutuhkan
                            lastRow.style.display = '';
                        } else {
                            console.error('Failed to update CPL', await updateResponse.json());
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else {
                    console.log("newKodecpl:", newKodecpl);
                    console.log("newDeskripsi:", newDeskripsi);

                    // alert('Mohon isi kedua kolom Kode CPL dan Deskripsi');
                }

                // Hapus event listener setelah dieksekusi
                deskripsiInput.removeEventListener('keydown', eventHandler);
            }
        });

    });
});



      // Tambahkan event listener untuk tombol delete
      document.querySelectorAll(".delete").forEach((button) => {
        button.addEventListener("click", async function () {
          const kodecpl = this.getAttribute("data-kodecpl");

          if (
            confirm(
              `Are you sure you want to delete CPL with Kode CPL: ${kodecpl}?`
            )
          ) {
            try {
              const deleteResponse = await fetch(
                `http://localhost:9871/api/v1/users/cpl/delete`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("authToken"),
                  },
                  body: JSON.stringify({
                    cpl: {
                      kodecpl: kodecpl,
                    },
                  }),
                }
              );

              if (deleteResponse.ok) {
                console.log(
                  `CPL with Kode CPL: ${kodecpl} deleted successfully`
                );

                // Hapus baris dari tabel
                this.closest("tr").remove();
              } else {
                console.error("Failed to delete CPL", deleteResponse);
              }
            } catch (error) {
              console.error("Error:", error);
            }
          }
        });
      });
    } else {
      const errorData = await response.json();
      console.log("Error response from API: ", response);
    }
  } catch (error) {
    console.error("Error:", error);
  }

  const tbody = document.querySelector(".cpl-table tbody");
  tbody.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Mencegah form submit default

      const kodecplInput = tbody.querySelector('input[name="kodecpml"]');
      const deskripsiInput = tbody.querySelector('input[name="deskripsi"]');

      const kodecpl = kodecplInput.value.trim();
      const deskripsi = deskripsiInput.value.trim();

      if (kodecpl && deskripsi) {
        try {
          const response = await fetch(
            "http://localhost:9871/api/v1/users/cpl",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("authToken"), // Menggunakan token dari localStorage
              },
              body: JSON.stringify({
                cpl: {
                  kodecpl: kodecpl,
                  deskripsi: deskripsi,
                },
              }),
            }
          );

          if (response.ok) {
            const newData = await response.json();
            console.log("New data saved:", newData);

            // Refresh tabel atau tambahkan baris baru ke tabel tanpa reload halaman
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                            <td>${i}</td>
                            <td>${newData.cpl.kodecpl}</td>
                            <td>${newData.cpl.deskripsi}</td>
                            <td>
                                <button class="action-btn edit" title="Edit">✏️</button>
                                <button class="action-btn delete" data-kodecpl="${newData.cpl.kodecpl}" title="Delete">🗑️</button>
                            </td>
                        `;
            tbody.insertBefore(newRow, tbody.lastChild); // Menambahkan sebelum baris input

            // Bersihkan input fields setelah data berhasil disimpan
            kodecplInput.value = "";
            deskripsiInput.value = "";
          } else {
            console.error("Failed to save data", await response.json());
          }
        } catch (error) {
          window.location.href = "cpl.html";
          console.error("Error:", error);
        }
      } else {

        // window.location.href = 'cpl.html';
      }
    }
  });
});
