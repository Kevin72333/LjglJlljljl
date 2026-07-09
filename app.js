/**
 * 便當點餐系統核心邏輯 (app.js)
 * 提供點餐資料結構、LocalStorage 串接、UI 渲染與統計功能。
 */

// ==========================================
// 預設資料設定
// ==========================================
const DEFAULT_STORE = {
    name: "池上木片便當",
    phone: "02-2345-6789"
};

const DEFAULT_MENU = [
    {
        id: "m1",
        name: "香酥雞腿便當",
        price: 120,
        image: "assets/images/chicken_bento.png",
        desc: "外酥內嫩的黃金大雞腿，配上精選現炒配菜，辦公室人氣首選！"
    },
    {
        id: "m2",
        name: "經典排骨便當",
        price: 110,
        image: "assets/images/pork_bento.png",
        desc: "古法秘製滷排骨，口感扎實，香氣四溢，滿滿經典好滋味。"
    },
    {
        id: "m3",
        name: "養生蔬食便當",
        price: 100,
        image: "assets/images/veg_bento.png",
        desc: "嚴選今日新鮮多色時蔬與優質菇類，清爽健康無負擔。"
    }
];

// ==========================================
// 應用程式狀態管理 (State)
// ==========================================
let state = {
    store: {},
    menu: [],
    orders: [],
    historyNames: []
};

// 載入 LocalStorage 資料
function loadState() {
    // 載入店家
    const savedStore = localStorage.getItem('bento_store');
    state.store = savedStore ? JSON.parse(savedStore) : { ...DEFAULT_STORE };
    
    // 載入菜單
    const savedMenu = localStorage.getItem('bento_menu');
    state.menu = savedMenu ? JSON.parse(savedMenu) : [ ...DEFAULT_MENU ];
    
    // 載入訂單
    const savedOrders = localStorage.getItem('bento_orders');
    state.orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // 載入歷史姓名
    const savedHistory = localStorage.getItem('bento_history_names');
    state.historyNames = savedHistory ? JSON.parse(savedHistory) : [];
}

// 儲存特定狀態至 LocalStorage
function saveState(key) {
    if (key === 'store') localStorage.setItem('bento_store', JSON.stringify(state.store));
    if (key === 'menu') localStorage.setItem('bento_menu', JSON.stringify(state.menu));
    if (key === 'orders') localStorage.setItem('bento_orders', JSON.stringify(state.orders));
    if (key === 'historyNames') localStorage.setItem('bento_history_names', JSON.stringify(state.historyNames));
}

// ==========================================
// DOM 元素選取
// ==========================================
const DOM = {
    // 導航
    tabStaff: document.getElementById('tab-staff'),
    tabAdmin: document.getElementById('tab-admin'),
    staffView: document.getElementById('staff-view'),
    adminView: document.getElementById('admin-view'),
    
    // 店家顯示
    displayStoreName: document.getElementById('display-store-name'),
    displayStorePhone: document.getElementById('display-store-phone'),
    currentDate: document.getElementById('current-date'),
    
    // 同仁點餐頁
    menuList: document.getElementById('menu-list'),
    orderForm: document.getElementById('order-form'),
    editOrderId: document.getElementById('edit-order-id'),
    userNameInput: document.getElementById('user-name'),
    historicalNames: document.getElementById('historical-names'),
    bentoSelect: document.getElementById('bento-select'),
    riceAmount: document.getElementById('rice-amount'),
    spicyLevel: document.getElementById('spicy-level'),
    orderNote: document.getElementById('order-note'),
    submitBtn: document.getElementById('submit-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    formTitle: document.getElementById('form-title'),
    
    // 點餐看板
    searchInput: document.getElementById('search-input'),
    statCount: document.getElementById('stat-count'),
    statAmount: document.getElementById('stat-amount'),
    orderTableBody: document.getElementById('order-table-body'),
    
    // 後台：店家管理
    storeConfigForm: document.getElementById('store-config-form'),
    storeNameInput: document.getElementById('store-name'),
    storePhoneInput: document.getElementById('store-phone'),
    
    // 後台：菜單管理
    menuItemForm: document.getElementById('menu-item-form'),
    editMenuId: document.getElementById('edit-menu-id'),
    menuItemName: document.getElementById('menu-item-name'),
    menuItemPrice: document.getElementById('menu-item-price'),
    menuItemImage: document.getElementById('menu-item-image'),
    menuItemDesc: document.getElementById('menu-item-desc'),
    menuSubmitBtn: document.getElementById('menu-submit-btn'),
    cancelMenuEditBtn: document.getElementById('cancel-menu-edit-btn'),
    adminMenuTableBody: document.getElementById('admin-menu-table-body'),
    
    // 後台：訂單統計
    adminTotalCount: document.getElementById('admin-total-count'),
    adminTotalAmount: document.getElementById('admin-total-amount'),
    itemizedSummary: document.getElementById('itemized-summary'),
    btnCopySummary: document.getElementById('btn-copy-summary'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnResetDay: document.getElementById('btn-reset-day'),
    
    // Toast 容器
    toastContainer: document.getElementById('toast-container')
};

// ==========================================
// Toast 提示功能 (Aesthetics)
// ==========================================
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') {
        icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
        icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
        icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, duration);
}

// ==========================================
// 頁面渲染與更新邏輯 (Render Functions)
// ==========================================

// 更新店家橫幅與設定表單
function renderStoreInfo() {
    DOM.displayStoreName.textContent = state.store.name;
    DOM.displayStorePhone.textContent = state.store.phone;
    DOM.storeNameInput.value = state.store.name;
    DOM.storePhoneInput.value = state.store.phone;
}

// 更新系統目前日期
function renderCurrentDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    DOM.currentDate.textContent = today.toLocaleDateString('zh-TW', options);
}

// 渲染前台菜單列表
function renderFrontMenu() {
    DOM.menuList.innerHTML = '';
    
    if (state.menu.length === 0) {
        DOM.menuList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center;" class="text-muted py-5">
                目前的菜單是空的喔，請切換至管理後台新增便當！
            </div>
        `;
        return;
    }
    
    state.menu.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <div class="menu-card-img">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2216%22%20fill%3D%22%23999%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%3E%E4%BE%BF%E7%95%B6%E5%9C%96%E7%A4%BA%3C%2Ftext%3E%3C%2Fsvg%3E';">
                <span class="menu-card-price">NT$ ${item.price}</span>
            </div>
            <div class="menu-card-body">
                <h4>${item.name}</h4>
                <p>${item.desc || '美味的便當品項。'}</p>
            </div>
        `;
        
        // 點擊卡片快速選定便當品項
        card.addEventListener('click', () => {
            DOM.bentoSelect.value = item.id;
            DOM.bentoSelect.focus();
            showToast(`已自動為您選定「${item.name}」！`, 'info', 1500);
        });
        
        DOM.menuList.appendChild(card);
    });
}

// 更新前台點餐表單的 Select 選項與 Datalist 歷史姓名
function renderFormOptions() {
    // 1. 便當 Select
    const currentSelectVal = DOM.bentoSelect.value;
    DOM.bentoSelect.innerHTML = '<option value="" disabled selected>請選擇您想要的便當</option>';
    
    state.menu.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} - NT$ ${item.price}`;
        DOM.bentoSelect.appendChild(option);
    });
    
    if (state.menu.some(item => item.id === currentSelectVal)) {
        DOM.bentoSelect.value = currentSelectVal;
    }
    
    // 2. 歷史姓名 Datalist
    DOM.historicalNames.innerHTML = '';
    state.historyNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        DOM.historicalNames.appendChild(option);
    });
}

// 渲染今日點餐看板
function renderOrderBoard(searchTerm = '') {
    DOM.orderTableBody.innerHTML = '';
    
    const filteredOrders = state.orders.filter(order => {
        const query = searchTerm.toLowerCase();
        const bentoItem = state.menu.find(m => m.id === order.bentoId);
        const bentoName = bentoItem ? bentoItem.name : '未知便當';
        return order.userName.toLowerCase().includes(query) || 
               bentoName.toLowerCase().includes(query) || 
               (order.note && order.note.toLowerCase().includes(query));
    });
    
    // 排序：依時間遞減（最晚點的在最上面）
    filteredOrders.sort((a, b) => b.timestamp - a.timestamp);
    
    // 更新統計數值
    DOM.statCount.innerHTML = `${state.orders.length} <span class="unit">人</span>`;
    
    const totalAmount = state.orders.reduce((sum, order) => {
        const bento = state.menu.find(m => m.id === order.bentoId);
        const basePrice = bento ? bento.price : 0;
        const addRicePrice = order.riceAmount === '多飯' ? 10 : 0;
        return sum + basePrice + addRicePrice;
    }, 0);
    DOM.statAmount.textContent = `NT$ ${totalAmount.toLocaleString()}`;
    
    // 後台同步更新
    DOM.adminTotalCount.textContent = `${state.orders.length} 份`;
    DOM.adminTotalAmount.textContent = `NT$ ${totalAmount.toLocaleString()}`;
    
    if (filteredOrders.length === 0) {
        DOM.orderTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    ${searchTerm ? '找不到符合搜尋條件的點餐紀錄 🔍' : '今天還沒有同仁點餐喔，趕快當第一個吧！'}
                </td>
            </tr>
        `;
        return;
    }
    
    filteredOrders.forEach(order => {
        const bento = state.menu.find(m => m.id === order.bentoId);
        const bentoName = bento ? bento.name : `<span class="text-danger">已下架品項 (ID: ${order.bentoId})</span>`;
        const bentoPrice = bento ? bento.price : 0;
        const addRicePrice = order.riceAmount === '多飯' ? 10 : 0;
        const finalPrice = bentoPrice + addRicePrice;
        
        const date = new Date(order.timestamp);
        const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        const tr = document.createElement('tr');
        tr.id = `order-row-${order.id}`;
        tr.innerHTML = `
            <td class="time-col">${timeStr}</td>
            <td class="name-col">${escapeHtml(order.userName)}</td>
            <td class="bento-col">${bentoName}</td>
            <td>
                <span class="badge ${order.riceAmount === '多飯' ? 'orange' : (order.riceAmount === '正常' ? 'blue' : 'green')}">
                    ${order.riceAmount}
                </span>
            </td>
            <td>
                <span class="badge ${order.spicyLevel === '不辣' ? 'blue' : 'orange'}">
                    ${order.spicyLevel}
                </span>
            </td>
            <td class="text-muted" style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${escapeHtml(order.note || '-')}
            </td>
            <td class="price-col">NT$ ${finalPrice}</td>
            <td>
                <div class="action-col">
                    <button class="btn-table-edit" title="修改" onclick="editOrder('${order.id}')">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-table-delete" title="取消點餐" onclick="deleteOrder('${order.id}')">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        DOM.orderTableBody.appendChild(tr);
    });
}

// 渲染後台菜單管理列表
function renderAdminMenuList() {
    DOM.adminMenuTableBody.innerHTML = '';
    
    if (state.menu.length === 0) {
        DOM.adminMenuTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">目前沒有任何菜單項目</td>
            </tr>
        `;
        return;
    }
    
    state.menu.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${item.image}" alt="${item.name}" class="menu-thumb" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2248%22%20height%3D%2248%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3C%2Fsvg%3E';">
            </td>
            <td style="font-weight: 600;">${escapeHtml(item.name)}</td>
            <td class="price-col">NT$ ${item.price}</td>
            <td class="td-desc" title="${escapeHtml(item.desc || '-')}">${escapeHtml(item.desc || '-')}</td>
            <td>
                <div class="action-col">
                    <button class="btn-table-edit" title="編輯" onclick="editMenuItem('${item.id}')">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-table-delete" title="刪除" onclick="deleteMenuItem('${item.id}')">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        DOM.adminMenuTableBody.appendChild(tr);
    });
}

// 渲染後台統計明細
function renderItemizedSummary() {
    DOM.itemizedSummary.innerHTML = '';
    
    if (state.orders.length === 0) {
        DOM.itemizedSummary.innerHTML = '<p class="text-muted text-center py-3">目前無訂單統計資料</p>';
        return;
    }
    
    // 品項加總統計
    const summary = {};
    state.orders.forEach(order => {
        const bento = state.menu.find(m => m.id === order.bentoId);
        const name = bento ? bento.name : `未知便當 (${order.bentoId})`;
        
        if (!summary[name]) {
            summary[name] = {
                count: 0,
                price: bento ? bento.price : 0,
                total: 0
            };
        }
        
        const addRicePrice = order.riceAmount === '多飯' ? 10 : 0;
        summary[name].count++;
        summary[name].total += (summary[name].price + addRicePrice);
    });
    
    // 渲染明細
    Object.keys(summary).forEach(name => {
        const item = summary[name];
        const row = document.createElement('div');
        row.className = 'item-sum-row';
        row.innerHTML = `
            <div class="item-sum-name">${name} <span class="text-muted" style="font-weight: normal; font-size: 0.8rem;">(單價: NT$ ${item.price})</span></div>
            <div class="item-sum-qty-price" style="display: flex; align-items: center; gap: 12px;">
                <span class="item-sum-quantity">${item.count} 份</span>
                <span class="price-col" style="font-size: 0.95rem;">NT$ ${item.total}</span>
            </div>
        `;
        DOM.itemizedSummary.appendChild(row);
    });
}

// 綜合刷新前台與後台的畫面資料
function refreshAllViews() {
    renderStoreInfo();
    renderFrontMenu();
    renderFormOptions();
    renderOrderBoard(DOM.searchInput.value);
    renderAdminMenuList();
    renderItemizedSummary();
}

// ==========================================
// 互動邏輯 & 事件處理器 (Event Handlers)
// ==========================================

// 1. Tab 切換功能
function handleTabSwitch(e) {
    const btn = e.currentTarget;
    const targetId = btn.getAttribute('data-target');
    
    // 移除所有 active
    DOM.tabStaff.classList.remove('active');
    DOM.tabAdmin.classList.remove('active');
    DOM.staffView.classList.remove('active');
    DOM.adminView.classList.remove('active');
    
    // 新增目前 active
    btn.classList.add('active');
    const targetPanel = document.getElementById(targetId);
    targetPanel.classList.add('active');
    
    // 刷新資料
    refreshAllViews();
}

// 2. 點餐表單提交
function handleOrderSubmit(e) {
    e.preventDefault();
    
    const orderId = DOM.editOrderId.value;
    const userName = DOM.userNameInput.value.trim();
    const bentoId = DOM.bentoSelect.value;
    const rice = DOM.riceAmount.value;
    const spicy = DOM.spicyLevel.value;
    const note = DOM.orderNote.value.trim();
    
    if (!userName || !bentoId) {
        showToast("請填寫姓名並選擇便當！", "error");
        return;
    }
    
    // 姓名加入歷史紀錄（去重）
    if (!state.historyNames.includes(userName)) {
        state.historyNames.push(userName);
        saveState('historyNames');
    }
    
    if (orderId) {
        // --- 修改模式 ---
        const idx = state.orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
            state.orders[idx] = {
                ...state.orders[idx],
                userName,
                bentoId,
                riceAmount: rice,
                spicyLevel: spicy,
                note,
                timestamp: Date.now() // 更新點餐時間
            };
            showToast("已成功修改您的點餐！", "success");
        } else {
            showToast("找不到該筆點餐，修改失敗。", "error");
        }
        
        // 恢復正常狀態
        resetOrderForm();
    } else {
        // --- 新增模式 ---
        // 檢查今天是否有重複名字點餐
        const existingIdx = state.orders.findIndex(o => o.userName.toLowerCase() === userName.toLowerCase());
        
        if (existingIdx !== -1) {
            const bento = state.menu.find(m => m.id === state.orders[existingIdx].bentoId);
            const bentoName = bento ? bento.name : '原便當';
            
            const isOverwrite = confirm(`同仁「${userName}」今天已經點過「${bentoName}」囉！\n是否確認覆蓋原本的點餐？`);
            if (!isOverwrite) return;
            
            // 覆寫
            state.orders[existingIdx] = {
                ...state.orders[existingIdx],
                bentoId,
                riceAmount: rice,
                spicyLevel: spicy,
                note,
                timestamp: Date.now()
            };
            showToast("已為您更新原本的點餐紀錄！", "success");
        } else {
            // 新增全新訂單
            const newOrder = {
                id: 'o_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                userName,
                bentoId,
                riceAmount: rice,
                spicyLevel: spicy,
                note,
                timestamp: Date.now()
            };
            state.orders.push(newOrder);
            showToast(`「${userName}」點餐成功！美味便當準備中 🍱`, "success");
        }
        
        // 保留姓名方便下一次點，其餘清空
        DOM.bentoSelect.value = "";
        DOM.riceAmount.value = "正常";
        DOM.spicyLevel.value = "不辣";
        DOM.orderNote.value = "";
    }
    
    saveState('orders');
    refreshAllViews();
}

// 取消修改點餐
function resetOrderForm() {
    DOM.editOrderId.value = "";
    DOM.userNameInput.value = "";
    DOM.userNameInput.disabled = false;
    DOM.bentoSelect.value = "";
    DOM.riceAmount.value = "正常";
    DOM.spicyLevel.value = "不辣";
    DOM.orderNote.value = "";
    DOM.formTitle.textContent = "同仁快速點餐";
    DOM.submitBtn.querySelector('span').textContent = "確認送出點餐";
    DOM.cancelEditBtn.classList.add('hidden');
}

// 暴露給全域以供 HTML 動態綁定 (修改/刪除點餐)
window.editOrder = function(id) {
    const order = state.orders.find(o => o.id === id);
    if (!order) return;
    
    // 填入表單
    DOM.editOrderId.value = order.id;
    DOM.userNameInput.value = order.userName;
    DOM.userNameInput.disabled = true; // 修改時不建議直接改名，若要換人點建議重填
    DOM.bentoSelect.value = order.bentoId;
    DOM.riceAmount.value = order.riceAmount;
    DOM.spicyLevel.value = order.spicyLevel;
    DOM.orderNote.value = order.note || "";
    
    // 切換按鈕
    DOM.formTitle.textContent = "修改同仁點餐";
    DOM.submitBtn.querySelector('span').textContent = "確認儲存修改";
    DOM.cancelEditBtn.classList.remove('hidden');
    
    // 聚焦並滾動到表單
    DOM.userNameInput.focus();
    DOM.orderForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.deleteOrder = function(id) {
    const order = state.orders.find(o => o.id === id);
    if (!order) return;
    
    const isConfirm = confirm(`確認取消「${order.userName}」的點餐嗎？`);
    if (!isConfirm) return;
    
    state.orders = state.orders.filter(o => o.id !== id);
    saveState('orders');
    
    // 如果正在修改的那筆被刪了，就重置表單
    if (DOM.editOrderId.value === id) {
        resetOrderForm();
    }
    
    showToast(`已成功取消該筆點餐`, "info");
    refreshAllViews();
};

// 3. 後台：儲存店家設定
function handleStoreConfigSubmit(e) {
    e.preventDefault();
    state.store.name = DOM.storeNameInput.value.trim();
    state.store.phone = DOM.storePhoneInput.value.trim();
    saveState('store');
    refreshAllViews();
    showToast("今日合作店家設定已儲存！", "success");
}

// 4. 後台：菜單新增/修改
function handleMenuSubmit(e) {
    e.preventDefault();
    
    const menuId = DOM.editMenuId.value;
    const name = DOM.menuItemName.value.trim();
    const price = parseInt(DOM.menuItemPrice.value);
    const image = DOM.menuItemImage.value;
    const desc = DOM.menuItemDesc.value.trim();
    
    if (!name || isNaN(price)) {
        showToast("名稱與價格為必填！", "error");
        return;
    }
    
    if (menuId) {
        // 編輯模式
        const idx = state.menu.findIndex(m => m.id === menuId);
        if (idx !== -1) {
            state.menu[idx] = { ...state.menu[idx], name, price, image, desc };
            showToast(`已更新品項「${name}」！`, "success");
        }
        resetMenuForm();
    } else {
        // 新增模式
        const newItem = {
            id: 'm_' + Date.now(),
            name,
            price,
            image,
            desc
        };
        state.menu.push(newItem);
        showToast(`已成功新增品項「${name}」！`, "success");
        
        // 清空
        DOM.menuItemName.value = "";
        DOM.menuItemPrice.value = "";
        DOM.menuItemDesc.value = "";
    }
    
    saveState('menu');
    refreshAllViews();
}

function resetMenuForm() {
    DOM.editMenuId.value = "";
    DOM.menuItemName.value = "";
    DOM.menuItemPrice.value = "";
    DOM.menuItemDesc.value = "";
    DOM.menuSubmitBtn.textContent = "新增品項";
    DOM.cancelMenuEditBtn.classList.add('hidden');
}

// 暴露編輯/刪除菜單品項至全域
window.editMenuItem = function(id) {
    const item = state.menu.find(m => m.id === id);
    if (!item) return;
    
    DOM.editMenuId.value = item.id;
    DOM.menuItemName.value = item.name;
    DOM.menuItemPrice.value = item.price;
    DOM.menuItemImage.value = item.image;
    DOM.menuItemDesc.value = item.desc || "";
    
    DOM.menuSubmitBtn.textContent = "確認儲存項目";
    DOM.cancelMenuEditBtn.classList.remove('hidden');
    
    DOM.menuItemName.focus();
};

window.deleteMenuItem = function(id) {
    const item = state.menu.find(m => m.id === id);
    if (!item) return;
    
    const isConfirm = confirm(`確定要刪除「${item.name}」嗎？\n這將使今日已點此品項的統計產生影響！`);
    if (!isConfirm) return;
    
    state.menu = state.menu.filter(m => m.id !== id);
    saveState('menu');
    
    if (DOM.editMenuId.value === id) {
        resetMenuForm();
    }
    
    showToast(`已刪除品項「${item.name}」`, "info");
    refreshAllViews();
};

// 5. 複製今日統計至剪貼簿（傳 Line 格式）
function copySummaryToClipboard() {
    if (state.orders.length === 0) {
        showToast("目前還沒有任何點餐資料，無法複製！", "error");
        return;
    }
    
    // 計算統計
    const summary = {};
    let totalQty = 0;
    let totalAmt = 0;
    
    state.orders.forEach(order => {
        const bento = state.menu.find(m => m.id === order.bentoId);
        const name = bento ? bento.name : `已下架便當 (${order.bentoId})`;
        const price = bento ? bento.price : 0;
        const addRicePrice = order.riceAmount === '多飯' ? 10 : 0;
        const finalPrice = price + addRicePrice;
        
        if (!summary[name]) {
            summary[name] = { count: 0, total: 0 };
        }
        summary[name].count++;
        summary[name].total += finalPrice;
        
        totalQty++;
        totalAmt += finalPrice;
    });
    
    // 組合文字
    let text = `📋 今日便當訂購統計【${state.store.name}】\n`;
    text += `☎️ 訂購電話：${state.store.phone}\n`;
    text += `---------------------------\n`;
    
    Object.keys(summary).forEach(name => {
        text += `- ${name} x ${summary[name].count} 份 (NT$ ${summary[name].total})\n`;
    });
    
    text += `---------------------------\n`;
    text += `總計：${totalQty} 份\n`;
    text += `總金額：NT$ ${totalAmt}\n\n`;
    text += `【點餐同仁明細】\n`;
    
    // 列出同仁細節
    state.orders.forEach((order, index) => {
        const bento = state.menu.find(m => m.id === order.bentoId);
        const name = bento ? bento.name : '未知';
        const addRice = order.riceAmount !== '正常' ? ` / 飯量: ${order.riceAmount}` : '';
        const spicy = order.spicyLevel !== '不辣' ? ` / 辣: ${order.spicyLevel}` : '';
        const note = order.note ? ` / 備註: ${order.note}` : '';
        text += `${index + 1}. ${order.userName}：${name}${addRice}${spicy}${note}\n`;
    });
    
    // 寫入剪貼簿
    navigator.clipboard.writeText(text)
        .then(() => {
            showToast("已成功複製統計文字！快去貼到 Line 上吧 📱", "success");
        })
        .catch(err => {
            showToast("複製失敗，請手動複製。", "error");
            console.error('複製失敗: ', err);
        });
}

// 6. 匯出 CSV 檔案
function exportToCsv() {
    if (state.orders.length === 0) {
        showToast("今天還沒有人點餐，無法匯出 CSV！", "error");
        return;
    }
    
    // CSV 欄位名稱
    let csvContent = "點餐時間,同仁姓名,點購便當,飯量調整,辣度選項,自訂備註,便當售價\r\n";
    
    state.orders.forEach(order => {
        const bento = state.menu.find(m => m.id === order.bentoId);
        const bentoName = bento ? bento.name : '未知便當';
        const bentoPrice = bento ? bento.price : 0;
        const addRicePrice = order.riceAmount === '多飯' ? 10 : 0;
        const finalPrice = bentoPrice + addRicePrice;
        
        const date = new Date(order.timestamp);
        const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        // 處理 CSV 的逗號與引號防護
        const escapeCsv = (str) => {
            if (!str) return '';
            const val = str.toString().replace(/"/g, '""');
            return val.includes(',') || val.includes('\n') || val.includes('"') ? `"${val}"` : val;
        };
        
        csvContent += `${timeStr},${escapeCsv(order.userName)},${escapeCsv(bentoName)},${order.riceAmount},${order.spicyLevel},${escapeCsv(order.note)},${finalPrice}\r\n`;
    });
    
    // 加上 UTF-8 BOM 避免 Excel 開啟時產生亂碼
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `今日便當點餐明細_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("CSV 匯出成功！已開始下載 📥", "success");
}

// 7. 一鍵清理 (開啟新的一天)
function resetDay() {
    if (state.orders.length === 0) {
        showToast("目前本來就是空的喔！", "info");
        return;
    }
    
    const isConfirm = confirm("⚠️ 注意：此操作將會清空今日所有同仁的點餐紀錄！\n且無法還原。確定要開啟新的一天嗎？");
    if (!isConfirm) return;
    
    state.orders = [];
    saveState('orders');
    resetOrderForm();
    refreshAllViews();
    showToast("已成功清空今日訂單！可以開始新一天的點餐囉 ☀️", "success");
}

// ==========================================
// 輔助工具函式 (Utility Functions)
// ==========================================
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// 系統初始化
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. 載入資料
    loadState();
    
    // 2. 綁定導覽 Tab 切換
    DOM.tabStaff.addEventListener('click', handleTabSwitch);
    DOM.tabAdmin.addEventListener('click', handleTabSwitch);
    
    // 3. 綁定表單提交與取消修改
    DOM.orderForm.addEventListener('submit', handleOrderSubmit);
    DOM.cancelEditBtn.addEventListener('click', resetOrderForm);
    
    // 4. 綁定搜尋輸入
    DOM.searchInput.addEventListener('input', (e) => {
        renderOrderBoard(e.target.value);
    });
    
    // 5. 綁定後台店家管理表單
    DOM.storeConfigForm.addEventListener('submit', handleStoreConfigSubmit);
    
    // 6. 綁定後台菜單管理表單
    DOM.menuItemForm.addEventListener('submit', handleMenuSubmit);
    DOM.cancelMenuEditBtn.addEventListener('click', resetMenuForm);
    
    // 7. 綁定後台按鈕
    DOM.btnCopySummary.addEventListener('click', copySummaryToClipboard);
    DOM.btnExportCsv.addEventListener('click', exportToCsv);
    DOM.btnResetDay.addEventListener('click', resetDay);
    
    // 8. 顯示當前日期
    renderCurrentDate();
    
    // 9. 刷新所有畫面
    refreshAllViews();
});
