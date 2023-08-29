
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

const tableUrl = "https://script.google.com/macros/s/AKfycby6S9tGpGPa7vmbn9h41AYIdtp6wO31nqwMJZUuwuNkMy7AxDsTSItFeRkSeLuY6OS0NQ/exec";
const scanner = new QrScanner(document.getElementById('qr-video'), result => scanCallback(result), {
    // onDecodeError: error => {
    //     alert(`Ошибка распознавания: ${error}`);
    // },
    highlightScanRegion: true,
    highlightCodeOutline: true,
});

let sectorNumber, code, scannerIsInitialized;

let sectorSelectionModal, sectorNumberInput, sectorNumberSubmitButton, sectorButton;
let settingsZone, noCamAccessZone, camList, useFlashToggle;
let video, confirmationZone, scanResultText, sendResultsButton, cancelResultsButton, requestResultDisplay;

$(document).ready(function () {
    // alert('hi!');
    sectorSelectionModal = $("#sectorSelectionModal");
    sectorNumberInput = $("#sectorNumberInput");
    sectorNumberSubmitButton = $("#sectorNumberSubmitButton");
    sectorButton = $("#sectorButton");

    sectorButton.click(showSectorSelectionModal);


    settingsZone = $("#settingsZone");
    noCamAccessZone = $("#noCamAccessZone");
    camList = $("#camList");
    // useFlashToggle = $("#useFlashToggle");

    noCamAccessZone.show();
    settingsZone.hide();


    video = $("#video");
    confirmationZone = $("#confirmationZone");
    scanResultText = $("#scanResult");
    sendResultsButton = $("#sendResultsButton");
    cancelResultsButton = $("#cancelResultsButton");
    requestResultDisplay = $("#requestResultDisplay");

    sendResultsButton.click(sendScanResults);
    cancelResultsButton.click(cancelScanResults);
    video.show();
    confirmationZone.hide();


    $( "#sectorNumberForm" ).on("submit", function( event ) {
        event.preventDefault();
        submitSectorForm();
    });

    $('#settingsModal').on('shown.bs.modal',  function (e) {
        $('#settingsModal').find('[data-toggle="toggle"]').bootstrapToggle('destroy');
        $('#settingsModal').find('[data-toggle="toggle"]').bootstrapToggle();
    });

    camList.on('change', function(event) {
        switchCamera();
    });

    // useFlashToggle.on('click', function(event) {
    //     if(useFlashToggle.prop('checked')) {
    //         scanner.turnFlashOff().then(() => useFlashToggle.prop('checked', scanner.isFlashOn()));
    //     } else {
    //         scanner.turnFlashOn().then(() => useFlashToggle.prop('checked', scanner.isFlashOn()));
    //     }
    // });

    showSectorSelectionModal();
});


//region Sector Selection
function showSectorSelectionModal() {
    console.log('show!')
    if (sectorNumber === undefined || typeof sectorNumber !== "number") {
        sectorSelectionModal.find('button.close').hide();

        sectorSelectionModal.removeData('bs.modal').modal({
            backdrop: 'static',
            keyboard: false
        }, 'show');
    } else {
        sectorNumberInput.val(sectorNumber);
        sectorSelectionModal.find('button.close').show();

        sectorSelectionModal.removeData('bs.modal').modal({
            backdrop: true,
            keyboard: true
        }, 'show');
    }
}

function submitSectorForm() {
    setSectorNumber();
    sectorSelectionModal.modal('toggle');
    if(!scannerIsInitialized) {
        initializeScanner();
    }
}

function setSectorNumber() {
    sectorNumber = parseInt(sectorNumberInput.val());
    sectorButton.text(`#${sectorNumber}`);
}
// endregion

//region Scanner Settings

function switchCamera() {
    scanner.setCamera(camList.val()).then(
        // updateFlashAvailability
    );
}

// function updateFlashAvailability() {
//     scanner.hasFlash().then(hasFlash => {
//         useFlashToggle.prop("disabled", !hasFlash);
//     });
// }

function initializeScanner() {
    QrScanner.listCameras(true).then(
        function(cameras) {
            cameras.sort((a, b) => a.id - b.id).forEach(camera => {
                camList.append($('<option>', {
                    value: camera.id,
                    text: camera.label
                }));
            });

            switchCamera();
            scanner.start().then(function() {
                noCamAccessZone.show();
                settingsZone.hide();
            });
        });
}
//endregion

//region Scan Result Handling
function scanCallback(result) {
    if(!validateScanResult(result.data)) {
        alert(`Невалидный результат ${result.data}`);
        return;
    }

    handleScanResult(result.data);
}

function validateScanResult(resultData) {
    // TODO: validation
    let split = resultData.split("-");
    return (split.length === 2 && !isNaN(parseInt(split[0])))
    // return true;
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
    let params = `?code=${code}&sector=${sectorNumber}`;
    $.get(tableUrl+params, createRequestCallback(code));
    // $.post(tableUrl,
    //     {
    //         code: code,
    //         sector: sectorNumber
    //     });

    cancelScanResults();
}

function cancelScanResults() {
    confirmationZone.hide();
    video.show();
    scanner.start();
    code = undefined;
}

function createRequestCallback(code) {
    return function (data, status) {
        // console.log(`code ${code} result: ${data} ${status}`);
        showRequestResults(code, data, status);
    };
}

function showRequestResults(code, data, status) {
    let isSuccess = status === 'success';
    let message;
    if(isSuccess) {
        requestResultDisplay.addClass('alert-success');
        requestResultDisplay.removeClass('alert-danger');
        message = `<i class="bi bi-check"></i> ${code} записан`;
    } else {
        requestResultDisplay.addClass('alert-danger');
        requestResultDisplay.removeClass('alert-success');
        message = `<i class="bi bi-x"></i> ${code} не записан: ${data}`;
    }

    requestResultDisplay.html(message);
    requestResultDisplay.show();
    requestResultDisplay.stop();
    requestResultDisplay.fadeOut(5000);
}

//endregion

// // ####### Web Cam Scanning #######

// // for debugging
// window.scanner = scanner;

//

//
//
// document.getElementById('start-button').addEventListener('click', () => {
//     scanner.start();
// });
//
// document.getElementById('stop-button').addEventListener('click', () => {
//     scanner.stop();
// });

