function updatePreview() {
    const preview = document.getElementById('invoicePreview');
    if (!preview) return;
    
    const logoPreview = document.getElementById('logoPreview');
    const logoImg = logoPreview.querySelector('img');
    const logoHTML = logoImg ? `<img src="${logoImg.src}" alt="Company Logo" class="preview-logo">` : '';
    
    const companyName = document.getElementById('companyName').value || 'Your Company Name';
    const companyAddress = document.getElementById('companyAddress').value || 'Your Company Address';
    const companyGST = document.getElementById('companyGST').value || 'GSTIN/UIN: XXXXXX';
    const companyPAN = document.getElementById('companyPAN').value || 'PAN: XXXXXX';
    const companyState = document.getElementById('companyState').value || 'State: XX';
    const companyStateCode = document.getElementById('companyStateCode').value || 'XX';
    const companyEmail = document.getElementById('companyEmail').value || 'Email: your@email.com';
    const companyPhone = document.getElementById('companyPhone').value || 'Phone: +XX XXXXXXX';
    
    const clientName = document.getElementById('clientName').value || 'Client Name';
    const clientAddress = document.getElementById('clientAddress').value || 'Client Address';
    const clientGST = document.getElementById('clientGST').value || 'GSTIN/UIN: XXXXXX';
    const clientPAN = document.getElementById('clientPAN').value || 'PAN: XXXXXX';
    const clientState = document.getElementById('clientState').value || 'State: XX';
    const clientStateCode = document.getElementById('clientStateCode').value || 'XX';
    const placeOfSupply = document.getElementById('placeOfSupply').value || 'Place of Supply: XX';
    
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    const invoiceDate = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
    const formattedDate = invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN') : 'DD/MM/YYYY';
    
    const bankName = document.getElementById('bankName').value || 'Bank Name';
    const accountName = document.getElementById('accountName').value || 'Account Name';
    const accountNumber = document.getElementById('accountNumber').value || 'XXXXXXXXXXXX';
    const ifscCode = document.getElementById('ifscCode').value || 'IFSC: XXXXXX';
    const branchName = document.getElementById('branchName').value || 'Branch Name';
    const upiId = document.getElementById('upiId').value || '';
    
    const additionalNotes = document.getElementById('additionalNotes').value || '';
    
    let items = [];
    let taxableValue = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let grandTotal = 0;
    
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const description = row.querySelector('.item-desc').value || 'Goods/Services';
        const hsn = row.querySelector('.item-hsn-code').value || 'XXXXXX';
        const rate = parseFloat(row.querySelector('.item-rate-value').value) || 0;
        const quantity = parseInt(row.querySelector('.item-quantity-value').value) || 1;
        const gstRate = parseInt(row.querySelector('.item-gst-rate').value) || 0;
        
        const amount = rate * quantity;
        const gstAmount = amount * (gstRate / 100);

        const isInterstate = companyStateCode !== clientStateCode;
        
        let cgst = 0;
        let sgst = 0;
        let igst = 0;
        
        if (isInterstate) {
            igst = gstAmount;
        } else {
            cgst = gstAmount / 2;
            sgst = gstAmount / 2;
        }
        
        taxableValue += amount;
        totalCGST += cgst;
        totalSGST += sgst;
        totalIGST += igst;
        grandTotal += amount + gstAmount;
        
        items.push({
            description,
            hsn,
            rate,
            quantity,
            gstRate,
            amount,
            cgst,
            sgst,
            igst
        });
    });
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { 
            style: 'currency', 
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount).replace('₹', '₹ ');
    };
    let qrCodeHTML = '';
    if (upiId) {
        qrCodeHTML = `
            <div class="qr-code">
                <div class="qr-code-container" id="qrCodeContainer"></div>
                <p>Scan to pay via UPI</p>
            </div>
        `;
    }
    preview.innerHTML = `
        <div class="preview-header">
            <div class="company-info">
                ${logoHTML}
                <h2>${companyName}</h2>
                <div class="address">${companyAddress.replace(/\n/g, '<br>')}</div>
                <div>${companyGST} | ${companyPAN}</div>
                <div>${companyState} (${companyStateCode})</div>
                <div>${companyEmail} | ${companyPhone}</div>
            </div>
            <div class="invoice-meta">
                <h3>TAX INVOICE</h3>
                <div class="invoice-number">Invoice No: ${invoiceNumber}</div>
                <div class="invoice-date">Date: ${formattedDate}</div>
            </div>
        </div>
        
        <div class="preview-body">
            <div class="buyer-info">
                <h4>Buyer (Bill to)</h4>
                <div class="address">
                    <strong>${clientName}</strong><br>
                    ${clientAddress.replace(/\n/g, '<br>')}<br>
                    ${clientGST} | ${clientPAN}<br>
                    ${clientState} (${clientStateCode})<br>
                    ${placeOfSupply}
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Sl No.</th>
                        <th>Description of Goods or Services</th>
                        <th>HSN/SAC</th>
                        <th>GST Rate</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.description}</td>
                            <td>${item.hsn}</td>
                            <td>${item.gstRate}%</td>
                            <td>${formatCurrency(item.rate)}</td>
                            <td>${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-amount">
                <strong>Amount Chargeable (in words):</strong><br>
                <span class="preview-total-amount">${numberToWords(grandTotal)} Only</span>
            </div>
            
            <table class="tax-summary">
                <thead>
                    <tr>
                        <th>HSN/SAC</th>
                        <th>Taxable Value</th>
                        ${companyStateCode !== clientStateCode ? '<th>IGST</th>' : '<th>CGST</th><th>SGST/UTGST</th>'}
                        
                        <th>Total Tax</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${items[0]?.hsn || 'XXXXXX'}</td>
                        <td>${formatCurrency(taxableValue)}</td>
                        ${companyStateCode !== clientStateCode ? 
                          `<td>${totalIGST > 0 ? `${formatCurrency(totalIGST)} (${items[0]?.gstRate || 0}%)` : '-'}</td>` : 
                          `<td>${totalCGST > 0 ? `${formatCurrency(totalCGST)} (${(items[0]?.gstRate || 0)/2}%)` : '-'}</td>
                           <td>${totalSGST > 0 ? `${formatCurrency(totalSGST)} (${(items[0]?.gstRate || 0)/2}%)` : '-'}</td>`}
                        <td>${formatCurrency(totalCGST + totalSGST + totalIGST)}</td>
                    </tr>
                    <tr>
                        <th colspan="${companyStateCode !== clientStateCode ? '4' : '5'}">Total</th>
                        <th>${formatCurrency(grandTotal)}</th>
                    </tr>
                </tbody>
            </table>
            
            <div class="bank-details">
                <h4>Company's Bank Details</h4>
                <div class="address">
                    <strong>A/c Holder's Name:</strong> ${accountName}<br>
                    <strong>Bank Name:</strong> ${bankName}<br>
                    <strong>A/c No.:</strong> ${accountNumber}<br>
                    <strong>Branch & IFS Code:</strong> ${branchName} & ${ifscCode}
                </div>
            </div>
            
            ${qrCodeHTML}
            
            ${additionalNotes ? `
                <div class="additional-notes">
                    <h4>Additional Notes</h4>
                    <p>${additionalNotes.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            
            <div class="footer-note">
                <p>This is a Computer Generated Invoice</p>
                <p>SUBJECT TO LOCAL JURISDICTION</p>
                <p>QUIK INVOICE by RAHUL SARKAR</p>
            </div>
            
            <div class="signature">
                <p>Authorised Seal & Signatory</p>
            </div>
        </div>
    `;
    if (upiId && typeof QRCode !== 'undefined') {
        const container = document.getElementById('qrCodeContainer');
        if (container) {
            container.innerHTML = '';
            new QRCode(container, {
                text: `upi://pay?pa=${upiId}&pn=${encodeURIComponent(companyName)}&am=${grandTotal}&cu=INR`,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }
}
function numberToWords(num) {
    const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const formatTenth = (digit, prev) => {
        return 0 == digit ? '' : ' ' + (1 == digit ? double[prev] : tens[digit]);
    };
    const formatOther = (digit, next, denom) => {
        return (0 != digit && 1 != next ? ' ' + single[digit] : '') + (0 != next || digit > 0 ? ' ' + denom : '');
    };
    
    let str = '';
    let rupees = Math.floor(num);
    let paise = Math.round((num - rupees) * 100);
    
    if (rupees > 0) {
        str += convertNumber(rupees) + ' Rupees';
    }
    if (paise > 0) {
        if (str !== '') str += ' and ';
        str += convertNumber(paise) + ' Paise';
    }
    return str || 'Zero Rupees';
    
    function convertNumber(num) {
        if (num === 0) return 'Zero';
        
        let str = '';
        let crore = Math.floor(num / 10000000) % 100;
        if (crore > 0) {
            str += (crore > 9 ? convertNumber(crore) : single[crore]) + ' Crore';
        }
        
        let lakh = Math.floor(num / 100000) % 100;
        if (lakh > 0) {
            if (str !== '') str += ' ';
            str += (lakh > 9 ? convertNumber(lakh) : single[lakh]) + ' Lakh';
        }
        
        let thousand = Math.floor(num / 1000) % 100;
        if (thousand > 0) {
            if (str !== '') str += ' ';
            str += (thousand > 9 ? convertNumber(thousand) : single[thousand]) + ' Thousand';
        }
        
        let hundred = Math.floor(num / 100) % 10;
        if (hundred > 0) {
            if (str !== '') str += ' ';
            str += single[hundred] + ' Hundred';
        }
        
        let remaining = num % 100;
        if (remaining > 0) {
            if (str !== '') str += ' and ';
            
            if (remaining < 10) {
                str += single[remaining];
            } else if (remaining >= 10 && remaining < 20) {
                str += double[remaining - 10];
            } else {
                str += tens[Math.floor(remaining / 10)];
                if (remaining % 10 > 0) {
                    str += ' ' + single[remaining % 10];
                }
            }
        }
        
        return str;
    }
}
function initLogoUpload() {
    const logoInput = document.getElementById('companyLogo');
    const logoPreview = document.getElementById('logoPreview');
    
    if (logoInput && logoPreview) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    logoPreview.innerHTML = `<img src="${event.target.result}" alt="Company Logo">`;
                    updatePreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }
}
function initCollapsibleSections() {
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.fa-chevron-down');
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', function() {
    initLogoUpload();
    initCollapsibleSections();
    updatePreview();
});