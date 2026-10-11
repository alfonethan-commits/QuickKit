const toolSearch = document.getElementById("tool-search");
const toolsGrid = document.getElementById("tools-grid");
const toolCards = Array.from(document.querySelectorAll(".tool-card"));
const toolNotFound = document.getElementById("tool-not-found");
const toolWorkspace = document.getElementById("tool-workspace");
const backToToolsButton = document.getElementById("back-to-tools");
const toolPanels = Array.from(document.querySelectorAll(".workspace-panel"));
const toolButtons = Array.from(document.querySelectorAll(".tool-btn"));

function showToolWorkspace(toolKey) {
  toolPanels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== `panel-${toolKey}`);
  });

  toolsGrid.classList.add("hidden");
  toolWorkspace.classList.remove("hidden");
}

function showToolsList() {
  toolWorkspace.classList.add("hidden");
  toolsGrid.classList.remove("hidden");
}

function filterTools() {
  const query = toolSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  toolCards.forEach((card) => {
    const name = card.dataset.toolName.toLowerCase();
    const match = name.includes(query);
    card.classList.toggle("hidden", !match);
    if (match) visibleCount += 1;
  });

  toolNotFound.classList.toggle("hidden", visibleCount !== 0 || query === "");
}

toolSearch.addEventListener("input", filterTools);

backToToolsButton.addEventListener("click", () => {
  showToolsList();
});

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const toolKey = button.dataset.tool;
    showToolWorkspace(toolKey);
  });
});

const premiumStatus = document.getElementById("premium-status");
const purchaseButtons = Array.from(document.querySelectorAll(".purchase-btn"));
purchaseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const message = "Payments are not available yet. QuickKit Premium is currently a demonstration page.";
    if (premiumStatus) {
      premiumStatus.textContent = message;
      premiumStatus.style.color = "#2f5df5";
    }
  });
});

const faqItems = Array.from(document.querySelectorAll(".faq-item"));
faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  button.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    faqItems.forEach((faq) => faq.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  });
});

function setStatus(element, message, type = "info") {
  if (!element) return;
  element.textContent = message;
  element.className = "status-message";
  element.classList.add(type);
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 KB";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function dataURLToBlob(dataURL) {
  const [header, body] = dataURL.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(body);
  const array = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }

  return new Blob([array], { type: mime });
}

const imageInput = document.getElementById("image-input");
const qualitySlider = document.getElementById("quality-slider");
const qualityValue = document.getElementById("quality-value");
const outputFormat = document.getElementById("output-format");
const originalPreview = document.getElementById("original-preview");
const compressedPreview = document.getElementById("compressed-preview");
const originalSize = document.getElementById("original-size");
const compressedSize = document.getElementById("compressed-size");
const reductionPercent = document.getElementById("reduction-percent");
const compressButton = document.getElementById("compress-image");
const downloadImage = document.getElementById("download-image");
const imageStatus = document.getElementById("image-status");

function supportsFormat(format) {
  const canvas = document.createElement("canvas");
  return canvas.toDataURL(format).indexOf(`image/${format.split("/")[1]}`) !== -1;
}

qualitySlider.addEventListener("input", () => {
  qualityValue.textContent = Number(qualitySlider.value).toFixed(2);
});

const imageOutputFormats = [
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" }
];

function resetImageTool() {
  originalPreview.classList.add("hidden");
  compressedPreview.classList.add("hidden");
  compressedSize.textContent = "No compressed version yet.";
  reductionPercent.textContent = "";
  downloadImage.classList.add("disabled-link");
  downloadImage.removeAttribute("href");
  downloadImage.setAttribute("download", "compressed-image");
  setStatus(imageStatus, "", "info");
}

imageInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    resetImageTool();
    originalSize.textContent = "No image selected.";
    return;
  }

  const validType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (!validType && !file.name.match(/\.(jpeg|jpg|png|webp)$/i)) {
    setStatus(imageStatus, "Please choose a valid JPEG, PNG, or WebP image.", "error");
    return;
  }

  try {
    const dataURL = await readFileAsDataURL(file);
    originalPreview.src = dataURL;
    originalPreview.classList.remove("hidden");
    originalSize.textContent = `Original: ${formatBytes(file.size)}`;
    compressedPreview.classList.add("hidden");
    compressedSize.textContent = "No compressed version yet.";
    setStatus(imageStatus, "Image ready. Adjust quality and click Compress.", "success");

    const supportedFormats = imageOutputFormats.filter((item) => supportsFormat(item.value));
    outputFormat.innerHTML = supportedFormats
      .map((item) => `<option value="${item.value}">${item.label}</option>`)
      .join("");

    if (!supportedFormats.some((item) => item.value === outputFormat.value)) {
      outputFormat.value = "image/jpeg";
    }
  } catch (error) {
    setStatus(imageStatus, "Unable to read the image. Please try a different file.", "error");
  }
});

compressButton.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) {
    setStatus(imageStatus, "Please select an image before compressing.", "error");
    return;
  }

  try {
    const dataURL = await readFileAsDataURL(file);
    const img = new Image();
    img.src = dataURL;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Image could not be loaded."));
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0, img.width, img.height);

    const mimeType = outputFormat.value || "image/jpeg";
    const quality = Number(qualitySlider.value);
    const outputDataURL = canvas.toDataURL(mimeType, quality);

    compressedPreview.src = outputDataURL;
    compressedPreview.classList.remove("hidden");

    const compressedBlob = dataURLToBlob(outputDataURL);
    const compressedSizeValue = compressedBlob.size;
    const originalSizeValue = file.size;
    compressedSize.textContent = `Compressed: ${formatBytes(compressedSizeValue)}`;

    if (compressedSizeValue >= originalSizeValue) {
      reductionPercent.textContent = "Size reduction: 0% (the output is not smaller than the original).";
      setStatus(
        imageStatus,
        "The compressed image is not smaller than the original. This can happen with already small or poorly compressible files.",
        "info"
      );
    } else {
      const reduction = ((1 - compressedSizeValue / originalSizeValue) * 100).toFixed(1);
      reductionPercent.textContent = `Size reduction: ${reduction}%`;
      setStatus(imageStatus, "Compression complete.", "success");
    }

    downloadImage.href = outputDataURL;
    downloadImage.classList.remove("disabled-link");
    downloadImage.setAttribute("download", `quickkit-compressed.${mimeType.split("/")[1] || "png"}`);
  } catch (error) {
    setStatus(imageStatus, "Image processing failed. Please try another file or a different format.", "error");
  }
});

const pdfInput = document.getElementById("pdf-input");
const pdfFileList = document.getElementById("pdf-file-list");
const pdfSummary = document.getElementById("pdf-summary");
const mergeButton = document.getElementById("merge-pdfs");
const pdfStatus = document.getElementById("pdf-status");
const downloadMergedPdf = document.getElementById("download-merged-pdf");

let selectedPdfFiles = [];

function renderPdfFiles() {
  pdfFileList.innerHTML = "";

  if (!selectedPdfFiles.length) {
    pdfSummary.textContent = "No files selected yet.";
    return;
  }

  pdfSummary.textContent = `${selectedPdfFiles.length} file(s) selected.`;

  selectedPdfFiles.forEach((file, index) => {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = file.name;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${file.name}`);
    removeButton.addEventListener("click", () => {
      selectedPdfFiles.splice(index, 1);
      renderPdfFiles();
    });

    li.append(name, removeButton);
    pdfFileList.appendChild(li);
  });
}

pdfInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []);

  const validFiles = files.filter((file) => /\.pdf$/i.test(file.name) || file.type === "application/pdf");

  if (!validFiles.length) {
    setStatus(pdfStatus, "Only PDF files can be merged.", "error");
    event.target.value = "";
    return;
  }

  selectedPdfFiles = [...selectedPdfFiles, ...validFiles];
  renderPdfFiles();
  setStatus(pdfStatus, `${selectedPdfFiles.length} PDF file(s) ready to merge.`, "success");
  event.target.value = "";
});

mergeButton.addEventListener("click", async () => {
  if (!selectedPdfFiles.length) {
    setStatus(pdfStatus, "Select at least one PDF file before merging.", "error");
    return;
  }

  if (selectedPdfFiles.length < 2) {
    setStatus(pdfStatus, "Select at least two PDF files to merge.", "error");
    return;
  }

  mergeButton.disabled = true;
  setStatus(pdfStatus, "Merging PDFs...", "info");

  try {
    if (!window.PDFLib) {
      throw new Error("PDF library not loaded.");
    }

    const mergedPdf = await window.PDFLib.PDFDocument.create();

    for (const file of selectedPdfFiles) {
      const bytes = await file.arrayBuffer();
      const pdf = await window.PDFLib.PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    downloadMergedPdf.href = url;
    downloadMergedPdf.classList.remove("disabled-link");
    setStatus(pdfStatus, "PDFs merged successfully.", "success");
    downloadMergedPdf.setAttribute("download", "quickkit-merged.pdf");
  } catch (error) {
    setStatus(pdfStatus, "Merging failed. Please check that all files are valid PDFs and not password protected.", "error");
  } finally {
    mergeButton.disabled = false;
  }
});

const wordInput = document.getElementById("word-input");
const wordCount = document.getElementById("word-count");
const charCount = document.getElementById("char-count");
const charNoSpace = document.getElementById("char-no-space");
const sentenceCount = document.getElementById("sentence-count");
const paragraphCount = document.getElementById("paragraph-count");
const readingTime = document.getElementById("reading-time");
const clearTextButton = document.getElementById("clear-text");
const copyTextButton = document.getElementById("copy-text");
const wordStatus = document.getElementById("word-status");

function updateWordStats() {
  const text = wordInput.value;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const totalChars = text.length;
  const noSpaceChars = text.replace(/\s+/g, "").length;
  const sentenceTotal = trimmed ? trimmed.split(/[.!?]+/).filter((part) => part.trim().length > 0).length : 0;
  const paragraphTotal = trimmed
    ? text.split(/\n\s*\n/).filter((part) => part.trim().length > 0).length || 1
    : 0;
  const minutes = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;

  wordCount.textContent = String(words);
  charCount.textContent = String(totalChars);
  charNoSpace.textContent = String(noSpaceChars);
  sentenceCount.textContent = String(sentenceTotal);
  paragraphCount.textContent = String(paragraphTotal);
  readingTime.textContent = `${minutes} min`;
}

wordInput.addEventListener("input", updateWordStats);

clearTextButton.addEventListener("click", () => {
  wordInput.value = "";
  updateWordStats();
  setStatus(wordStatus, "Text cleared.", "success");
});

copyTextButton.addEventListener("click", async () => {
  const text = wordInput.value;
  if (!text) {
    setStatus(wordStatus, "There is no text to copy.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    setStatus(wordStatus, "Text copied to clipboard.", "success");
  } catch (error) {
    setStatus(wordStatus, "Clipboard access was blocked. You can still copy manually.", "error");
  }
});

const qrInput = document.getElementById("qr-input");
const qrCanvas = document.getElementById("qr-canvas");
const generateQrButton = document.getElementById("generate-qr");
const clearQrButton = document.getElementById("clear-qr");
const downloadQrButton = document.getElementById("download-qr");
const qrStatus = document.getElementById("qr-status");

function generateQrCode(value) {
  if (!window.QRCode) {
    setStatus(qrStatus, "QR code library failed to load.", "error");
    return;
  }

  const canvas = qrCanvas;
  window.QRCode.toCanvas(
    canvas,
    value,
    {
      width: 220,
      margin: 2,
      color: {
        dark: "#101828",
        light: "#ffffff"
      }
    },
    (error) => {
      if (error) {
        setStatus(qrStatus, "QR code could not be generated. Please try a different value.", "error");
        return;
      }
      setStatus(qrStatus, "QR code generated successfully.", "success");
    }
  );
}

generateQrButton.addEventListener("click", () => {
  const value = qrInput.value.trim();
  if (!value) {
    setStatus(qrStatus, "Please enter text or a URL before generating a QR code.", "error");
    return;
  }

  generateQrCode(value);
});

clearQrButton.addEventListener("click", () => {
  qrInput.value = "";
  const ctx = qrCanvas.getContext("2d");
  ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
  setStatus(qrStatus, "QR code cleared.", "success");
});

downloadQrButton.addEventListener("click", () => {
  const canvas = qrCanvas;
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "quickkit-qr-code.png";
  link.click();
  setStatus(qrStatus, "QR code download started.", "success");
});

const unitCategory = document.getElementById("unit-category");
const unitFrom = document.getElementById("unit-from");
const unitTo = document.getElementById("unit-to");
const unitValue = document.getElementById("unit-value");
const unitResult = document.getElementById("unit-result");
const unitStatus = document.getElementById("unit-status");
const convertButton = document.getElementById("convert-units");
const swapButton = document.getElementById("swap-units");
const clearUnitsButton = document.getElementById("clear-units");

const unitDefinitions = {
  length: {
    mm: { label: "Millimeters", toBase: (value) => value / 1000, fromBase: (value) => value * 1000 },
    cm: { label: "Centimeters", toBase: (value) => value / 100, fromBase: (value) => value * 100 },
    m: { label: "Meters", toBase: (value) => value, fromBase: (value) => value },
    km: { label: "Kilometers", toBase: (value) => value * 1000, fromBase: (value) => value / 1000 },
    in: { label: "Inches", toBase: (value) => value * 0.0254, fromBase: (value) => value / 0.0254 },
    ft: { label: "Feet", toBase: (value) => value * 0.3048, fromBase: (value) => value / 0.3048 },
    yd: { label: "Yards", toBase: (value) => value * 0.9144, fromBase: (value) => value / 0.9144 },
    mi: { label: "Miles", toBase: (value) => value * 1609.344, fromBase: (value) => value / 1609.344 }
  },
  weight: {
    mg: { label: "Milligrams", toBase: (value) => value / 1000, fromBase: (value) => value * 1000 },
    g: { label: "Grams", toBase: (value) => value, fromBase: (value) => value },
    kg: { label: "Kilograms", toBase: (value) => value * 1000, fromBase: (value) => value / 1000 },
    oz: { label: "Ounces", toBase: (value) => value * 28.3495, fromBase: (value) => value / 28.3495 },
    lb: { label: "Pounds", toBase: (value) => value * 453.592, fromBase: (value) => value / 453.592 },
    t: { label: "Metric tons", toBase: (value) => value * 1000000, fromBase: (value) => value / 1000000 }
  },
  temperature: {
    c: { label: "Celsius", toBase: (value) => value, fromBase: (value) => value },
    f: { label: "Fahrenheit", toBase: (value) => ((value - 32) * 5) / 9, fromBase: (value) => (value * 9) / 5 + 32 },
    k: { label: "Kelvin", toBase: (value) => value - 273.15, fromBase: (value) => value + 273.15 }
  },
  volume: {
    ml: { label: "Milliliters", toBase: (value) => value / 1000, fromBase: (value) => value * 1000 },
    l: { label: "Liters", toBase: (value) => value, fromBase: (value) => value },
    cup: { label: "US cups", toBase: (value) => value * 0.236588, fromBase: (value) => value / 0.236588 },
    gal: { label: "US gallons", toBase: (value) => value * 3.78541, fromBase: (value) => value / 3.78541 }
  },
  time: {
    s: { label: "Seconds", toBase: (value) => value, fromBase: (value) => value },
    min: { label: "Minutes", toBase: (value) => value * 60, fromBase: (value) => value / 60 },
    h: { label: "Hours", toBase: (value) => value * 3600, fromBase: (value) => value / 3600 },
    d: { label: "Days", toBase: (value) => value * 86400, fromBase: (value) => value / 86400 }
  }
};

function populateUnitOptions() {
  const category = unitCategory.value;
  const units = unitDefinitions[category];
  const entries = Object.entries(units);

  unitFrom.innerHTML = entries.map(([key, value]) => `<option value="${key}">${value.label}</option>`).join("");
  unitTo.innerHTML = entries.map(([key, value]) => `<option value="${key}">${value.label}</option>`).join("");

  if (entries.length > 1) {
    unitTo.value = entries[1][0];
  }
}

unitCategory.addEventListener("change", populateUnitOptions);

function convertUnits() {
  const category = unitCategory.value;
  const value = Number(unitValue.value);
  const fromUnit = unitFrom.value;
  const toUnit = unitTo.value;

  if (!Number.isFinite(value)) {
    setStatus(unitStatus, "Enter a valid numeric value before converting.", "error");
    return;
  }

  const definitions = unitDefinitions[category];

  if (category === "temperature") {
    const fromBase = definitions[fromUnit].toBase(value);
    const converted = definitions[toUnit].fromBase(fromBase);
    unitResult.textContent = `${value} ${definitions[fromUnit].label} = ${Number(converted).toFixed(4)} ${definitions[toUnit].label}`;
    setStatus(unitStatus, "Conversion complete.", "success");
    return;
  }

  const fromBase = definitions[fromUnit].toBase(value);
  const converted = definitions[toUnit].fromBase(fromBase);
  unitResult.textContent = `${value} ${definitions[fromUnit].label} = ${Number(converted).toFixed(4)} ${definitions[toUnit].label}`;
  setStatus(unitStatus, "Conversion complete.", "success");
}

convertButton.addEventListener("click", convertUnits);

swapButton.addEventListener("click", () => {
  const currentFrom = unitFrom.value;
  unitFrom.value = unitTo.value;
  unitTo.value = currentFrom;
  convertUnits();
});

clearUnitsButton.addEventListener("click", () => {
  unitValue.value = "";
  unitResult.textContent = "Enter a value to convert.";
  setStatus(unitStatus, "Value cleared.", "success");
});

function initializeApp() {
  populateUnitOptions();
  updateWordStats();
  setStatus(qrStatus, "Ready to generate a QR code.", "info");
  setStatus(pdfStatus, "No PDF files selected yet.", "info");
  setStatus(unitStatus, "Ready to convert.", "info");
  setStatus(imageStatus, "Select an image to begin.", "info");
  setStatus(wordStatus, "Start typing to count words.", "info");
}

initializeApp();
