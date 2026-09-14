document.getElementById('smsForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    const statusDiv = document.getElementById('statusMessage');

    // Simulasi respons sistem
    statusDiv.className = 'status success';
    statusDiv.textContent = `Pesan berhasil diproses untuk dikirim ke ${phone}`;

    // Reset form
    document.getElementById('smsForm').reset();
});
