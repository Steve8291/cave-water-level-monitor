// 【插在最前面】连接 ESP32 并接收最新水位数据
var gateway = `ws://${window.location.hostname}/ws`;
var websocket;

function initWebSocket() {
    websocket = new WebSocket(gateway);
    websocket.onopen = () => {
        document.getElementById('ws-status-dot')?.classList.add('connected'); // 连上后小圆点变绿
        websocket.send("getReadings"); // 刚连上时，向 ESP32 要一次最新数据
    };
    websocket.onclose = () => {
        document.getElementById('ws-status-dot')?.classList.remove('connected'); // 断开后变红
        setTimeout(initWebSocket, 2000); // 2秒后自动重连
    };
    websocket.onmessage = (event) => {
        var myObj = JSON.parse(event.data); // 拆开 ESP32 发来的数据包
        if (myObj.time) document.getElementById('last-time').textContent = myObj.time; // 更新时间
        if (myObj.water) document.getElementById('last-water').innerHTML = `${myObj.water} <small>cm</small>`; // 更新水位
    };
}

// 用来向 ESP32 发指令的小工具
function sendCommand(cmd) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(cmd);
    }
}

    // 以上一改


// 1. 按钮高亮切换与硬件控制逻辑 / Toggle active button state & trigger hardware action
function toggleLED(buttonNumber) {
    // 清除所有主按钮的高亮类 / Remove 'active' class from all primary buttons
    const buttons = document.querySelectorAll('.button-stack .button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 为当前点击的按钮添加高亮 / Highlight the clicked button
    const activeBtn = document.getElementById(`button${buttonNumber}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // 预留单片机（ESP32/Arduino）HTTP 请求接口 / Placeholder for microcontroller HTTP request
    console.log(`Button ${buttonNumber} triggered`);
}

// 2. 页面加载完成后绑定弹窗与确认交互 / Bind modal open/close & confirmation handlers on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initWebSocket();//一改


    // 点击带有 data-dialog 的按钮时打开对应弹窗 / Open matching modal when a [data-dialog] button is clicked
    const dialogButtons = document.querySelectorAll('button[data-dialog]');
    dialogButtons.forEach(button => {
        button.addEventListener('click', () => {
            const dialogId = button.getAttribute('data-dialog');
            const dialog = document.getElementById(dialogId);
            if (dialog) {
                dialog.showModal();
            }
        });
    });

    // 点击右上角 '×' 关闭弹窗 / Close modal when the '×' close button is clicked
    const closeButtons = document.querySelectorAll('dialog .close-btn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('dialog').close();
        });
    });

    // 点击弹窗外部遮罩区域关闭弹窗 / Close modal when clicking outside on the backdrop
    const dialogs = document.querySelectorAll('dialog.modal');
    dialogs.forEach(dialog => {
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });
    });

    // Calibrate 警告弹窗交互 / Calibration warning dialog handlers
    const calibrateDialog = document.getElementById('dialog-calibrate');
    const btnNo = document.getElementById('calibrate-no');
    const btnYes = document.getElementById('calibrate-yes');

    // 点击 "No" 直接取消并关闭弹窗 / Dismiss warning modal safely on "No"
    if (btnNo) {
        btnNo.addEventListener('click', () => {
            calibrateDialog.close();
        });
    }

    // 点击 "YES" 执行基准水位归零校准 / Execute base water level recalibration on "YES"
    if (btnYes) {
        btnYes.addEventListener('click', () => {
            sendCommand('CALIBRATE_ZERO');
            //一改

            // 可在此处向设备发送校准指令（例如 fetch('/calibrate')） / Send recalibrate command to device here
            console.log('Recalibrating Water Base Level...');
            
            // 校准后将顶部卡片的水位基准重置为 0.0 cm，并更新为当前时间 / Reset top card water reading to 0.0 cm & update timestamp
            const now = new Date();
            const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
                            now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            document.getElementById('last-time').textContent = timeStr;
            document.getElementById('last-water').innerHTML = '0.0 <small>cm</small>';

            calibrateDialog.close();
        });
    }
});