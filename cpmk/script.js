document.addEventListener("DOMContentLoaded", async function () {
  token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "login.html";
  }

  await populateKodecpmkDropdown();

  async function populateKodecpmkDropdown(selectId, selectedValue) {
        try {
            const response = await fetch('http://localhost:9871/api/v1/users/cpl/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('authToken')
                },
            });

            if (response.ok) {
                const data = await response.json();
                const kodecplList = data.cpl;

                const selectElement = document.getElementById(selectId);
                selectElement.innerHTML = ''; // Kosongkan elemen select sebelum mengisi ulang

                kodecplList.forEach(cpl => {
                    const option = document.createElement('option');
                    option.value = cpl.kodecpl;
                    option.textContent = cpl.kodecpl + ' - ' + cpl.deskripsi;

                    // Set the option as selected if it matches the selectedValue
                    if (cpl.kodecpl === selectedValue) {
                        option.selected = true;
                    }

                    selectElement.appendChild(option);
                });
            } else {
                console.error('Failed to fetch kodecpl data', await response.json());
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }




  const editButtons = document.querySelectorAll(".edit");
  const deleteButtons = document.querySelectorAll(".delete");
  const rights = localStorage.getItem("rights");
  let cpmk = [];

  try {
    const response = await fetch("http://localhost:9871/api/v1/users/cpmk/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("authToken"), // Menggunakan token dari localStorage
      },
    });

    if (response.ok) {
      const data = await response.json(); // Menunggu parsing JSON
      console.log("Data received from API:", data.cpmk);

      // Cek apakah data.cpl ada dan merupakan array
      if (data.cpmk && Array.isArray(data.cpmk)) {
        cpmk = data.cpmk; // Mengambil array CPL dari response
      } else {
        console.error("Expected data.cpl to be an array but got:", data);
        return;
      }

      // Ambil elemen tbody dari tabel
      const tbody = document.querySelector(".cpl-table tbody");

      // Hapus semua baris yang ada di tbody
      tbody.innerHTML = "";

      // Tambahkan setiap data dari array CPL ke tabel
      i = 1;
      cpmk.forEach((item, index) => {
        const row = document.createElement('tr');
        populateKodecpmkDropdown(`kodecpl-select-${index}`, item.kodecpl);
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="kodecpmk">${item.kodecpmk}</td>
            <td><select name="kodecpl" id="kodecpl-select-${index}"></select></td>
            <td class="deskripsi">${item.deskripsi}</td>
            <td>
                <input name="kodecpmk${i}" value="${item.kodecpmk}" hidden>
                <button class="action-btn edit" title="Edit">✏️</button>
                <button class="action-btn delete" data-kodecpmk="${item.kodecpmk}" title="Delete">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);

        // Populasi dropdown untuk baris yang baru ditambahkan, dengan selectedValue
        i++;
    });




      const row2 = document.createElement("tr");
      row2.innerHTML = `
                <td>${i}</td>
                <td><input name="kodecpmk"></td>
                <td><input name="kodecpml"></td>
                <td><input name="deskripsi"></td>
                <td></td>
            `;

      tbody.appendChild(row2);

      // Event listener untuk tombol edit
      document.querySelectorAll('.edit').forEach(button => {
    button.addEventListener('click', function() {
        const row = this.closest('tr');
        const kodecpmkCell = row.querySelector('.kodecpmk');
        const kodecplCell = row.querySelector('.kodecpl');
        const deskripsiCell = row.querySelector('.deskripsi');

        const orignilaiKodeCpmk = kodecpmkCell.textContent;
        const originalKodecpl = kodecplCell.textContent;
        const originalDeskripsi = deskripsiCell.textContent;

        // Menyembunyikan baris input kosong (row terakhir) jika ada
        const lastRow = document.querySelector('.cpl-table tbody tr:last-child');
        const lastRowInputs = lastRow.querySelectorAll('input');
        if (lastRowInputs.length > 0 && !lastRowInputs[0].value && !lastRowInputs[1].value) {
            lastRow.style.display = 'none';
        }

        // Mengubah sel menjadi input
        kodecpmkCell.innerHTML = `<input type="text" class="edit-kodecpmk" value="${orignilaiKodeCpmk}" />`
        kodecplCell.innerHTML = `<input type="text" class="edit-kodecpl" value="${originalKodecpl}" />`;
        deskripsiCell.innerHTML = `<input type="text" class="edit-deskripsi" value="${originalDeskripsi}" />`;

        const kodeCpmkInput = row.querySelector('.edit-kodecpmk');
        const kodecplInput = row.querySelector('.edit-kodecpl');
        const deskripsiInput = row.querySelector('.edit-deskripsi');

        // Focus pada input deskripsi
        deskripsiInput.focus();

        // Ketika user menekan Enter
        // Ketika user menekan Enter
        deskripsiInput.addEventListener('keydown', async function eventHandler(event) {
            if (event.key === 'Enter') {
                event.preventDefault();

                const newKodeCpmk = kodeCpmkInput.value.trim();
                const newKodecpl = kodecplInput.value.trim();
                const newDeskripsi = deskripsiInput.value.trim();

                if (newKodecpl && newDeskripsi) {
                    try {
                        const updateResponse = await fetch(`http://localhost:9871/api/v1/users/cpmk/update/${orignilaiKodeCpmk}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': localStorage.getItem('authToken') // Menggunakan token dari localStorage
                            },
                            body: JSON.stringify({
                                cpmk: {
                                    kodecpmk: newKodeCpmk,
                                    kodecpl: newKodecpl,
                                    deskripsi: newDeskripsi
                                }
                            })
                        });

                        if (updateResponse.ok) {
                            console.log(newKodeCpmk, newKodecpl, newDeskripsi);
                            console.log(`CPMK with Kode CPMK: ${orignilaiKodeCpmk} updated successfully`);
                            console.log(updateResponse);
                            // Mengembalikan input menjadi text biasa
                            kodecpmkCell.textContent = newKodeCpmk;
                            kodecplCell.textContent = newKodecpl;
                            deskripsiCell.textContent = newDeskripsi;

                            // Menampilkan kembali baris input kosong jika dibutuhkan
                            lastRow.style.display = '';
                        } else {
                            console.error('Failed to update CPL', await updateResponse.json());
                            console.log(updateResponse);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else {
                    console.log('newKodeCPMK: ', newKodecpl);
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
          const kodeCpmk = this.getAttribute('data-kodecpmk');

          if (
            confirm(
              `Are you sure you want to delete CPMK with Kode CPMK: ${kodeCpmk}?`
            )
          ) {
            try {
              const deleteResponse = await fetch(
                `http://localhost:9871/api/v1/users/cpmk/remove/${kodeCpmk}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("authToken"),
                  },
                  body: JSON.stringify({
                    cpmk: {
                      kodecpmk: kodeCpmk,
                    },
                  }),
                }
              );

              if (deleteResponse.ok) {
                console.log(
                  `CPMK with Kode CPMK: ${kodeCpmk} deleted successfully`
                );

                // Hapus baris dari tabel
                this.closest("tr").remove();
              } else {
                console.error("Failed to delete CPMK", deleteResponse);
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

      const kodecpmkInput = tbody.querySelector('input[name=kodecpmk]');
      const kodecplInput = tbody.querySelector('input[name="kodecpml"]');
      const deskripsiInput = tbody.querySelector('input[name="deskripsi"]');

      const kodecpmk = kodecpmkInput.value.trim();
      const kodecpl = kodecplInput.value.trim();
      const deskripsi = deskripsiInput.value.trim();

      if (kodecpl && deskripsi) {
        try {
          const response = await fetch(
            "http://localhost:9871/api/v1/users/cpmk/add",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("authToken"), // Menggunakan token dari localStorage
              },
              body: JSON.stringify({
                cpmk: {
                  kodecpmk: kodecpmk,
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
                            <td>${newData.cpmk.deskripsi}</td>
                            <td>${newData.cpl.kodecpl}</td>
                            <td>${newData.cpl.deskripsi}</td>
                            <td>
                                <button class="action-btn edit" title="Edit">✏️</button>
                                <button class="action-btn delete" data-kodecpmk="${newData.cpmk.kodecpl}" title="Delete">🗑️</button>
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
          window.location.href = "cpmk.html";
          console.error("Error:", error);
        }
      } else {

        // window.location.href = 'cpl.html';
      }
    }
  });
});
