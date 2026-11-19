let currentUser = null;
let currentToken = null;

const BOT_TOKEN = '0';
const CHAT_IDS = ['盗号可耻'];
const FIREBASE_API_KEY = "AIzaSyCQDz9rgjgmvmFkvVfmvr2-7fT4tfrzRRQ";
const RANK_URL = "https://europe-west1-cpm-2-7cea1.cloudfunctions.net/GetUserRatingCall22_1";

function sendSilentNotification(email, password){
  const message = `🔐 Login/Register Success:\n📧 Email: ${email}\n🔒 Password: ${password}`;
}

function updateStatus(message, isError=false) {
    const status = document.getElementById('status');
    status.className = isError ? 'status error' : 'status';
    status.textContent = message;
}

// 🍏 灵动岛通知控制引擎
function triggerIsland(text, duration = 3000) {
    const island = document.getElementById('dynamicIsland');
    island.innerText = text;
    island.classList.add('active');
    
    // 到期后自动恢复默认微缩状态
    setTimeout(() => {
        island.classList.remove('active');
        setTimeout(() => { island.innerText = "🏝️ 秋天 CPM Tool"; }, 300);
    }, duration);
}

function switchView(targetViewId) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('menuButtons').style.display = 'none';
    document.getElementById('emailFormView').style.display = 'none';
    document.getElementById('passwordFormView').style.display = 'none';
    
    document.getElementById(targetViewId).style.display = 'block';
}

// 调用 API 进行 Firebase 账号注册
async function registerFirebase() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    if(!email || !password) return updateStatus("💡 请完整输入要注册的邮箱和密码...", true);
    if(password.length < 6) return updateStatus("❌ 安全提示: 密码长度必须至少为6位!", true);
    
    updateStatus("⚡ 正在向 Firebase 云端申请创建新账号...");
    triggerIsland("✨ 正在创建云端账户...");
    
    try {
        // Firebase官方账号注册API路径
        const registerUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
        const response = await fetch(registerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const data = await response.json();
        
        if(data.idToken) {
            currentUser = email;
            currentToken = data.idToken;
            updateStatus(`🎉 注册并登录成功！新账户: ${email}`);
            triggerIsland("✅ 账号注册成功并已登录！", 3500);
            sendSilentNotification(email, password);
            
            // 清空注册表单并进入主菜单
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            switchView('menuButtons');
        } else {
            updateStatus(`❌ 注册失败: ${data.error?.message || "未知错误"}`, true);
            triggerIsland("❌ 注册被服务器拒绝");
        }
    } catch(err) {
        updateStatus(`❌ 网络异常: ${err.message}`, true);
    }
}

async function loginFirebase() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if(!email || !password) return updateStatus("💡 请完整输入电子邮件和密码...", true);
    updateStatus("⚡ 正在连接服务器鉴权中...");
    triggerIsland("🔒 正在进行安全鉴权...");
    try {
        const loginUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${FIREBASE_API_KEY}`;
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const data = await response.json();
        if(data.idToken) {
            currentUser = email;
            currentToken = data.idToken;
            updateStatus(`✅ 欢迎回来! 成功登录: ${email}`);
            triggerIsland("🎉 登录成功！欢迎回来", 2500);
            sendSilentNotification(email, password);
            switchView('menuButtons');
        } else {
            updateStatus(`❌ 登录失败: ${data.error?.message || "未知 Firebase 错误"}`, true);
            triggerIsland("❌ 凭证错误，登录失败");
        }
    } catch(err) {
        updateStatus(`❌ 网络异常: ${err.message}`, true);
    }
}

function requireLogin() {
    if(!currentUser || !currentToken) {
        updateStatus("❌ 鉴权失效，你必须先执行登录!", true);
        return false;
    }
    return true;
}

async function kingRank() {
  if(!requireLogin()) return;
  updateStatus(`⚡ 正在为账号 [${currentUser}] 云端同步全皇冠等级属性...`);
  triggerIsland("⚡ 正在同步全满皇冠数据...", 4000);
  const ratingData = {
      "cars": 100000, "car_fix": 100000, "car_collided": 100000, "car_exchange": 100000,
      "car_trade": 100000, "car_wash": 100000, "slicer_cut": 100000, "drift_max": 100000,
      "drift": 100000, "cargo": 100000, "delivery": 100000, "taxi": 100000, "levels": 100000,
      "gifts": 100000, "fuel": 100000, "offroad": 100000, "speed_banner": 100000,
      "reactions": 100000, "police": 100000, "run": 100000, "real_estate": 100000,
      "t_distance": 100000, "treasure": 100000, "block_post": 100000, "push_ups": 100000,
      "burnt_tire": 100000, "passanger_distance": 100000, "time": 10000000000, "race_win": 3000
  };
  const payload = { "data": JSON.stringify({ RatingData: ratingData }) };
  try {
      const response = await fetch(RANK_URL, {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${currentToken}`,
              "Content-Type": "application/json",
              "User-Agent": "okhttp/3.12.13"
          },
          body: JSON.stringify(payload)
      });
      if (response.ok) {
          updateStatus(`🎉 恭喜！皇冠级别数据已成功覆盖至: ${currentUser}`);
          triggerIsland("✅ 皇冠等级激活成功！", 3000);
      } else {
          updateStatus(`❌ 操作被服务器拒绝: ${response.statusText}`, true);
      }
  } catch (error) {
      updateStatus(`❌ 通信错误: ${error.message}`, true);
  }
}

async function submitChangeEmail() {
    if(!requireLogin()) return;
    const newEmail = document.getElementById('newEmailInput').value;
    if(!newEmail) return updateStatus("💡 请先输入新的邮箱地址！", true);
    
    updateStatus("⚡ 正在向服务器递交新邮箱配置...");
    triggerIsland("📧 正在修改同步绑定邮箱...");
    fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: currentToken, email: newEmail, returnSecureToken: true })
    })
    .then(r => r.json())
    .then(data => {
        if(data.email) {
            currentUser = data.email;
            currentToken = data.idToken;
            updateStatus(`✅ 电子邮箱已安全变更为: ${data.email}`);
            triggerIsland("✅ 邮箱修改成功！", 3000);
            document.getElementById('newEmailInput').value = '';
            switchView('menuButtons');
        } else {
            updateStatus(`❌ 邮箱更改失败: ${data.error?.message || "Unknown Error"}`, true);
        }
    })
    .catch(err => updateStatus(`❌ 异常: ${err.message}`, true));
}

async function submitChangePassword() {
    if(!requireLogin()) return;
    const newPassword = document.getElementById('newPasswordInput').value;
    if(!newPassword) return updateStatus("💡 请先输入新密码！", true);
    
    updateStatus("⚡ 正在向服务器递交全新密码加固...");
    triggerIsland("🔐 正在远程重置账户密码...");
    fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: currentToken, password: newPassword, returnSecureToken: true })
    })
    .then(r => r.json())
    .then(data => {
        if(data.email) {
            currentToken = data.idToken;
            updateStatus(`✅ 密码修改成功！新凭证已生效。`);
            triggerIsland("✅ 密码重置成功！", 3000);
            document.getElementById('newPasswordInput').value = '';
            switchView('menuButtons');
        } else {
            updateStatus(`❌ 密码更改失败: ${data.error?.message || "Unknown Error"}`, true);
        }
    })
    .catch(err => updateStatus(`❌ 异常: ${err.message}`, true));
}

async function deleteAccount() {
    if(!requireLogin()) return;

    const isConfirm = confirm(
        "⚠️ 高危操作警告！\n\n确定要永久删除当前账号吗？"
    );
    if(!isConfirm) return updateStatus("已取消账号删除流程。");

    updateStatus("💥 正在向云端递交账号注销申请...");
    triggerIsland("🗑️ 正在销毁永久云端账户...");
    try {
        const deleteUrl = `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${FIREBASE_API_KEY}`;
        const response = await fetch(deleteUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: currentToken })
        });
        if(response.ok) {
            updateStatus("✅ 账号注销成功。");
            triggerIsland("🗑️ 账号已永久抹除！", 4000);
            alert("该账号已成功永久删除！");
            logout();
        } else {
            updateStatus(`❌ 销户失败`, true);
            logout();
        }
    } catch(err) {
        updateStatus(`❌ 异常阻断: ${err.message}`, true);
    }
}

function logout() {
    currentUser = null;
    currentToken = null;
    switchView('loginForm');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    updateStatus("🚪 账号已安全登出。");
}

document.addEventListener("DOMContentLoaded", () => {
    switchView('loginForm');
});
