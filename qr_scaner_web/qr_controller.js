
//
// const video = document.getElementById('qr-video');
// const videoContainer = document.getElementById('video-container');
// const camHasCamera = document.getElementById('cam-has-camera');
// const camList = document.getElementById('cam-list');
// const camHasFlash = document.getElementById('cam-has-flash');
// const flashToggle = document.getElementById('flash-toggle');
// const flashState = document.getElementById('flash-state');
// const camQrResult = document.getElementById('cam-qr-result');
// const camQrResultTimestamp = document.getElementById('cam-qr-result-timestamp');
// const fileSelector = document.getElementById('file-selector');
// const fileQrResult = document.getElementById('file-qr-result');
//

import QrScanner from "./qr-scanner.min.js";

const tableUrl = "https://script.google.com/macros/s/AKfycbzKkyQY4hf4-6iXEPvjKYAinaS-TZqp3ptu8WipDn4Qj5uEaAtsMnabM20EVW7fi3qLZQ/exec";
const scanner = new QrScanner(document.getElementById('qr-video'), result => scanCallback(result), {
    // onDecodeError: error => {
    //     alert(`Ошибка распознавания: ${error}`);
    // },
    highlightScanRegion: true,
    highlightCodeOutline: true,
});

let sectorNumber, code;

let sectorSelectionModal, sectorNumberInput, sectorNumberSubmitButton, sectorButton;
let video, confirmationZone, scanResultText, sendResultsButton;

$(document).ready(function () {
    // alert('hi!');
    sectorSelectionModal = $("#sectorSelectionModal");
    sectorNumberInput = $("#sectorNumberInput");
    sectorNumberSubmitButton = $("#sectorNumberSubmitButton");
    sectorButton = $("#sectorButton");

    video = $("#video");
    confirmationZone = $("#confirmationZone");
    scanResultText = $("#scanResult");
    sendResultsButton = $("#sendResultsButton");

    sectorSelectionModal.modal('toggle');
    sectorNumberSubmitButton.click(setSectorNumber);
    video.show();
    confirmationZone.hide();

    sendResultsButton.click(sendScanResults);
});

function setSectorNumber() {
    sectorNumber = parseInt(sectorNumberInput.val());
    sectorButton.text(`#${sectorNumber}`);

    scanner.start();
}

function scanCallback(result) {
    if(!validateScanResult(result.data)) {
        alert(`Невалидный результат ${result.data}`);
        return;
    }

    handleScanResult(result.data);
}

function validateScanResult(resultData) {
    // TODO: validation
    return true;
}

function handleScanResult(resultData) {
    // console.log('handling');
    code = resultData
    scanner.stop();
    video.hide();

    scanResultText.text(`Код: ${code}`);
    confirmationZone.show();
}

function sendScanResults() {
    $.post(tableUrl,
        {
            code: code,
            sector: sectorNumber
        });

    confirmationZone.hide();
    video.show();
    scanner.start();
}

function showRequestResults() {

}

//
// function setResult(label, result) {
//     console.log(result.data);
//     label.textContent = result.data;
//     camQrResultTimestamp.textContent = new Date().toString();
//     label.style.color = 'teal';
//     clearTimeout(label.highlightTimeout);
//     label.highlightTimeout = setTimeout(() => label.style.color = 'inherit', 100);
// }
//
// // ####### Web Cam Scanning #######
//

//
// const updateFlashAvailability = () => {
//     scanner.hasFlash().then(hasFlash => {
//         camHasFlash.textContent = hasFlash;
//         flashToggle.style.display = hasFlash ? 'inline-block' : 'none';
//     });
// };
//
// scanner.start().then(() => {
//     updateFlashAvailability();
//     // List cameras after the scanner started to avoid listCamera's stream and the scanner's stream being requested
//     // at the same time which can result in listCamera's unconstrained stream also being offered to the scanner.
//     // Note that we can also start the scanner after listCameras, we just have it this way around in the demo to
//     // start the scanner earlier.
//     QrScanner.listCameras(true).then(cameras => cameras.forEach(camera => {
//         const option = document.createElement('option');
//         option.value = camera.id;
//         option.text = camera.label;
//         camList.add(option);
//     }));
// });
//
// QrScanner.hasCamera().then(hasCamera => camHasCamera.textContent = hasCamera);
//
// // for debugging
// window.scanner = scanner;
//
// document.getElementById('inversion-mode-select').addEventListener('change', event => {
//     scanner.setInversionMode(event.target.value);
// });
//
// camList.addEventListener('change', event => {
//     scanner.setCamera(event.target.value).then(updateFlashAvailability);
// });
//
// flashToggle.addEventListener('click', () => {
//     scanner.toggleFlash().then(() => flashState.textContent = scanner.isFlashOn() ? 'on' : 'off');
// });
//
// document.getElementById('start-button').addEventListener('click', () => {
//     scanner.start();
// });
//
// document.getElementById('stop-button').addEventListener('click', () => {
//     scanner.stop();
// });

