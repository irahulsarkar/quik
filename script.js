document.addEventListener('DOMContentLoaded', function() {
    addItemRow();
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', addItemRow);
    }
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    const printBtn = document.getElementById('printInvoiceBtn');
    if (printBtn) {
        printBtn.addEventListener('click', printInvoice);
    }
    const pdfBtn = document.getElementById('generatePdfBtn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', generatePdf);
    }
    const whatsappBtn = document.getElementById('shareWhatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', shareViaWhatsapp);
    }
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('invoiceDate');
    if (dateInput) {
        dateInput.value = today;
    }
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
    updatePreview();
});
function addItemRow() {
    const itemsContainer = document.getElementById('itemsContainer');
    const itemCount = itemsContainer.children.length + 1; 
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row fade-in';
    itemRow.innerHTML = `
        <div class="form-group item-description">
            <label>Description</label>
            <input type="text" class="item-desc" placeholder="Description of goods or services.">
        </div>
        <div class="form-group item-hsn">
            <label>HSN/SAC</label>
            <input type="text" class="item-hsn-code" placeholder="">
        </div>
        <div class="form-group item-rate">
            <label>Rate</label>
            <input type="number" class="item-rate-value" placeholder="0.00" min="0" step="0.01">
        </div>
        <div class="form-group item-quantity">
            <label>Qty</label>
            <input type="number" class="item-quantity-value" placeholder="1" min="1" value="1">
        </div>
        <div class="form-group item-gst">
            <label>GST %</label>
            <select class="item-gst-rate">
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18" selected>18%</option>
                <option value="28">28%</option>
            </select>
        </div>
        <div class="item-actions">
            <button class="delete-item"><i class="fas fa-trash"></i></button>
        </div>
    `;  
    itemsContainer.appendChild(itemRow);
    const deleteBtn = itemRow.querySelector('.delete-item');
    deleteBtn.addEventListener('click', function() {
        itemRow.classList.add('fade-out');
        setTimeout(() => {
            itemsContainer.removeChild(itemRow);
            updatePreview();
        }, 300);
    });
    const inputs = itemRow.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
    updatePreview();
}
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        const form = document.querySelector('.invoice-form');
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.id !== 'companyLogo') {
                input.value = '';
            }
        });
        const logoPreview = document.getElementById('logoPreview');
        if (logoPreview) {
            logoPreview.innerHTML = '';
        }
        const logoInput = document.getElementById('companyLogo');
        if (logoInput) {
            logoInput.value = '';
        }
        const itemsContainer = document.getElementById('itemsContainer');
        while (itemsContainer.children.length > 1) {
            itemsContainer.removeChild(itemsContainer.lastChild);
        }
        const firstItem = itemsContainer.firstChild;
        if (firstItem) {
            firstItem.querySelector('.item-desc').value = '';
            firstItem.querySelector('.item-hsn-code').value = '';
            firstItem.querySelector('.item-rate-value').value = '';
            firstItem.querySelector('.item-quantity-value').value = '1';
            firstItem.querySelector('.item-gst-rate').value = '18';
        }
        document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
        updatePreview();
    }
}

function printInvoice() {
    const preview = document.getElementById('invoicePreview').cloneNode(true);
    const printWindow = window.open('', '_blank');
    const qrContainers = preview.querySelectorAll('#qrCodeContainer');
    qrContainers.forEach(container => {
        container.innerHTML = '';
    });
    const upiId = document.getElementById('upiId').value;
    const companyName = document.getElementById('companyName').value || 'Your Company';
    const grandTotal = calculateGrandTotal();
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice Print</title>
            <link rel="stylesheet" href="invoice-preview.css">
            <style>
                body { 
                    margin: 0; 
                    padding: 0; 
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    line-height: 1.2;
                }
                @page { 
                    size: A4; 
                    margin: 0.5cm;
                }
                .invoice-preview { 
                    width: 100%;
                    padding: 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    page-break-inside: avoid;
                }
                th, td {
                    padding: 0.2cm 0.3cm;
                    font-size: 10px;
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    max-width: 100%;
                    word-wrap: break-word;
                }
            </style>
            <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
        </head>
        <body>
            ${preview.outerHTML}
            <script>
                window.onload = function() {
                    ${upiId ? `
                        new QRCode(document.getElementById('qrCodeContainer'), {
                            text: 'upi://pay?pa=${upiId}&pn=${encodeURIComponent(companyName)}&am=${grandTotal}&cu=INR',
                            width: 80,
                            height: 80,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                    ` : ''}
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }, 100);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function calculateGrandTotal() {
    let grandTotal = 0;
    document.querySelectorAll('.item-row').forEach(row => {
        const rate = parseFloat(row.querySelector('.item-rate-value').value) || 0;
        const quantity = parseInt(row.querySelector('.item-quantity-value').value) || 1;
        const gstRate = parseInt(row.querySelector('.item-gst-rate').value) || 0;
        const amount = rate * quantity;
        const gstAmount = amount * (gstRate / 100);
        grandTotal += amount + gstAmount;
    });
    return grandTotal;
}

function generatePdf() {
    const element = document.getElementById('invoicePreview');
    const opt = {
        margin: [10, 10, 10, 10],
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            letterRendering: true,
            useCORS: true,
            width: 800, 
            windowWidth: 800 
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            hotfixes: ["px_scaling"]
        },
        pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.page-break' 
        }
    };
    
    const pdfBtn = document.getElementById('generatePdfBtn');
    const originalText = pdfBtn.innerHTML;
    pdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    pdfBtn.disabled = true;

    html2pdf().set(opt).from(element).save().then(() => {
        pdfBtn.innerHTML = originalText;
        pdfBtn.disabled = false;
    });
}

function shareViaWhatsapp() {
    const companyName = document.getElementById('companyName').value || 'Your Company';
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    const amount = document.querySelector('.preview-total-amount')?.textContent || '0.00';
    
    const message = `Invoice from ${companyName}\nInvoice No: ${invoiceNumber}\nAmount: ${amount}\n\nPlease find attached invoice PDF.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}