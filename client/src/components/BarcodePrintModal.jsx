import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import JsBarcode from 'jsbarcode';
import { BrowserQRCodeSvgWriter } from '@zxing/browser';

function BarcodePrintModal({ items, onClose }) {
  const printRefs = useRef([]);

  const hwFormat = localStorage.getItem('hw_format') || 'code128';

  useEffect(() => {
    printRefs.current.forEach((ref, index) => {
      if (ref && items[index]) {
        try {
          if (hwFormat === 'qr') {
            ref.innerHTML = '';
            const codeWriter = new BrowserQRCodeSvgWriter();
            const svgElement = codeWriter.write(items[index].barcode || items[index].sku, 160, 160);
            ref.appendChild(svgElement);
          } else {
            JsBarcode(ref, items[index].barcode || items[index].sku, {
              format: 'CODE128',
              width: 2,
              height: 60,
              displayValue: false,
              margin: 0,
              background: 'white',
              lineColor: 'black'
            });
          }
        } catch (e) {
          console.error('Barcode generation error:', e);
        }
      }
    });
  }, [items, hwFormat]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    onClose();
  };

  return createPortal(
    <div className="print-modal-overlay fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 print:static print:bg-transparent print:p-0">
      <div className="print-modal-content bg-white rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full print:bg-transparent print:shadow-none print:max-w-none print:max-h-none print:p-0 print:m-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <h3 className="text-xl font-bold text-gray-900">Print {items.length} Barcodes</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
              Print
            </button>
            <button onClick={handleClose} className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg font-semibold">
              Cancel
            </button>
          </div>
        </div>
        
        <div className="barcode-print-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div key={item._id || index} className="barcode-print-item flex flex-col items-center p-6 border rounded-lg print:border-none print:p-0 print:m-0 mb-8 print:mb-4">
              <div className="mb-4 text-center print:hidden">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600">{item.sku}</p>
              </div>
               {hwFormat === 'qr' ? (
                 <div ref={el => printRefs.current[index] = el} className="qr-container my-4 flex justify-center bg-white p-2 rounded-xl print:p-0 print:m-0 print:my-0" />
               ) : (
                 <svg ref={el => printRefs.current[index] = el} className="barcode-svg max-w-full h-auto print:m-0 print:p-0" />
               )}
              <div className="mt-4 text-center print:hidden">
                <p className="font-mono text-sm text-gray-700">{item.barcode || item.sku}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default BarcodePrintModal;

