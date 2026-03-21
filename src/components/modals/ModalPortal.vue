<script setup>
import { ref, inject, watch } from 'vue';
import { X, User, ScrollText, Minus, Plus, Sparkles, ShieldCheck, LogOut, Info } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import Sticker from '../ui/Sticker.vue';
import { PRIZE_TYPES } from '../../constants';
import { apiSendCode } from '../../api';

const props = defineProps(['modal', 'user', 'addresses', 'selectedAddressId', 'joinCount', 'tempAddress']);
const { setModal, handleAuth, setJoinCount, handleJoinByCount, handleSaveAddress, setSelectedAddressId, handleLogout } = inject('appActions');

const router = useRouter();

const goTo = (name) => {
    setModal(null);
    router.push({ name });
};

const authMode = ref('login');
const phone = ref('');
const code = ref('');
const agreement = ref(false);
const errorMsg = ref('');
const countdown = ref(0);

// Clear error when modal or mode changes
watch(() => props.modal?.type, () => { 
    errorMsg.value = ''; 
});
watch(authMode, () => { 
    errorMsg.value = ''; 
    phone.value = '';
    code.value = '';
});

const onSendCode = async () => {
    if (!phone.value || phone.value.length !== 11) {
        errorMsg.value = "请输入正确的11位手机号";
        return;
    }
    const res = await apiSendCode(phone.value);
    if (res.success) {
        countdown.value = 60;
        const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) clearInterval(timer);
        }, 1000);
        // During dev, verify code is 111111
        console.log("Verification code sent (Dev: 111111)");
    } else {
        errorMsg.value = res.message;
    }
};

const onSubmitAuth = async () => {
    if (!phone.value || !code.value) {
        errorMsg.value = "请输入手机号和验证码";
        return;
    }
    if (!agreement.value && authMode.value === 'login') {
        errorMsg.value = "请先勾选并同意用户协议";
        return;
    }
    const res = await handleAuth(authMode.value, phone.value, code.value);
    if (res && !res.success) {
        errorMsg.value = res.message;
    }
};

// Handle result of handleAuth if it returns success/fail (passing through)
// Since handleAuth is in App.vue and doesn't return anything to this component directly, 
// we might need a way to show error. Let's assume handleAuth handles its own errors or updates a state.
// Actually, I'll update handleAuth in App.vue to return the result or set error.

const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
        setModal(null);
    }
};

const confirmLogout = () => {
    handleLogout();
    setModal(null);
};
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300" @click="handleBackdropClick">
    <div class="relative bg-white border-4 border-black rounded-[3.5rem] p-8 w-full max-w-sm shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in duration-300 max-h-[85vh] flex flex-col text-black font-black">
      <button @click="setModal(null)" class="absolute -top-4 -right-4 bg-white border-4 border-black p-2 rounded-full hover:bg-rose-500 hover:text-white transition-colors z-10">
        <X :size="24" :stroke-width="5" />
      </button>

      <!-- logout_confirm -->
      <template v-if="modal.type === 'logout_confirm'">
          <div class="text-center py-6">
              <div class="w-20 h-20 bg-rose-100 border-4 border-black text-rose-600 rounded-[2rem] flex items-center justify-center mb-6 mx-auto rotate-12 shadow-brutal">
                <LogOut :size="40" :stroke-width="4" />
              </div>
              <h3 class="text-2xl font-black mb-4 underline decoration-rose-400 decoration-6 underline-offset-4 uppercase">注销确认</h3>
              <p class="text-slate-500 text-sm mb-8 font-black leading-relaxed">确定要退出当前次元吗？<br/>您的行囊数据将通过云端保存。</p>
              <div class="flex gap-4">
                  <button @click="setModal(null)" class="flex-1 bg-slate-100 border-4 border-black py-4 rounded-2xl font-black shadow-brutal active:shadow-none transition-all uppercase">取消</button>
                  <button @click="confirmLogout" class="flex-1 bg-rose-500 text-white border-4 border-black py-4 rounded-2xl font-black shadow-brutal active:shadow-none transition-all uppercase">确认退出</button>
              </div>
          </div>
      </template>

      <!-- select_address -->
      <template v-else-if="modal.type === 'select_address'">
        <h3 class="text-xl font-black mb-6 underline decoration-indigo-400 decoration-4 uppercase">切换传送坐标</h3>
        <div class="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          <div 
            v-for="a in addresses" 
            :key="a.id" 
            @click="[setSelectedAddressId(a.id), setModal(null)]" 
            :class="`p-4 border-4 border-black rounded-2xl cursor-pointer transition-all ${selectedAddressId === a.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white'}`"
          >
            <div class="font-black text-sm">{{ a.name }} {{ a.phone }}</div>
            <div class="text-[10px] text-slate-500">{{ a.detail }}</div>
          </div>
          <button @click="setModal({ type: 'address_form' })" class="w-full py-4 border-4 border-dashed border-black rounded-2xl font-black text-xs hover:bg-slate-50 transition-colors">+ 添加新坐标</button>
        </div>
      </template>

      <!-- address_form -->
      <template v-else-if="modal.type === 'address_form'">
        <div class="space-y-4">
          <h3 class="text-xl font-black mb-6 underline decoration-indigo-400 decoration-4 uppercase">{{ tempAddress.id ? '编辑坐标' : '标记新坐标' }}</h3>
          <input placeholder="收件人姓名" class="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-sm outline-none focus:bg-white font-black" v-model="tempAddress.name" />
          <input placeholder="联络信号 (手机)" class="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-sm outline-none focus:bg-white font-black" v-model="tempAddress.phone" />
          <textarea placeholder="详细传送地址" class="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-sm h-20 outline-none focus:bg-white resize-none font-black" v-model="tempAddress.detail"></textarea>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" class="w-5 h-5 border-4 border-black rounded appearance-none checked:bg-indigo-500 transition-colors" v-model="tempAddress.isDefault" />
            <span>设为默认传送点</span>
          </label>
          <button @click="handleSaveAddress" class="w-full bg-black text-white py-4 rounded-2xl font-black shadow-brutal active:translate-y-1 transition-all uppercase">确认记录</button>
        </div>
      </template>

      <!-- login -->
      <template v-else-if="modal.type === 'login'">
        <div class="text-center py-6">
          <div class="w-20 h-20 bg-indigo-100 border-4 border-black text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 mx-auto rotate-12 shadow-brutal">
            <User :size="40" :stroke-width="4" />
          </div>
          <h3 class="text-2xl font-black mb-1 underline decoration-indigo-400 decoration-6 underline-offset-4 uppercase">
            {{ authMode === 'login' ? '次元入口' : '验证信号' }}
          </h3>
          
          <div class="flex justify-center gap-2 mt-4 mb-2">
            <button @click="authMode = 'login'" :class="`px-4 py-1.5 font-black text-xs border-2 border-black rounded-xl ${authMode === 'login' ? 'bg-indigo-500 text-white shadow-brutal' : 'bg-white'}`">验证登录</button>
            <button @click="authMode = 'forgot'" :class="`px-4 py-1.5 font-black text-xs border-2 border-black rounded-xl ${authMode === 'forgot' ? 'bg-indigo-500 text-white shadow-brutal' : 'bg-white'}`">找回密码</button>
          </div>
          
          <p v-if="authMode === 'login'" class="text-[9px] text-slate-400 font-black mb-6">温馨提示：未注册手机号验证后将自动创建新勇者</p>
          <div v-else class="mb-6"></div>

          <div class="space-y-4">
            <div class="flex gap-2">
                <input 
                  type="text" 
                  placeholder="输入手机号" 
                  class="flex-1 bg-slate-50 border-4 border-black rounded-xl p-3 text-sm outline-none focus:bg-white font-black" 
                  v-model="phone" 
                  maxlength="11" 
                  @keyup.enter="onSubmitAuth"
                />
                <button 
                    @click="onSendCode" 
                    :disabled="countdown > 0"
                    class="px-3 bg-black text-white text-[10px] font-black rounded-xl disabled:bg-slate-300 shadow-brutal active:translate-y-0.5 active:shadow-none transition-all truncate min-w-[80px]"
                >
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </button>
            </div>
            <input 
              type="text" 
              placeholder="接收到的6位验证码" 
              class="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-sm outline-none focus:bg-white font-black" 
              v-model="code" 
              maxlength="6" 
              @keyup.enter="onSubmitAuth"
            />
            
            <div v-if="authMode === 'login'" class="flex items-center gap-3 text-left px-1">
                <div 
                  @click="agreement = !agreement" 
                  :class="`w-6 h-6 border-4 border-black rounded-none flex items-center justify-center shrink-0 cursor-pointer transition-colors ${agreement ? 'bg-emerald-500' : 'bg-white'}`"
                >
                  <ShieldCheck v-if="agreement" :size="14" class="text-white" :stroke-width="5" />
                </div>
                <div class="text-[10px] font-black text-slate-500 leading-tight">
                    我已阅读并同意 
                    <span @click="goTo('agreement')" class="text-indigo-500 underline cursor-pointer">《用户协议》</span> 与 
                    <span @click="goTo('privacy')" class="text-indigo-500 underline cursor-pointer">《隐私规则》</span>
                </div>
            </div>

            <div v-if="errorMsg" class="bg-rose-50 border-2 border-rose-500 p-2 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Info :size="14" class="text-rose-500" />
                <span class="text-[10px] text-rose-500 font-black">{{ errorMsg }}</span>
            </div>

            <button @click="onSubmitAuth" class="w-full bg-yellow-400 border-4 border-black py-4 rounded-2xl shadow-brutal active:translate-y-1 active:shadow-none transition-all uppercase font-black text-lg">
              确认进入
            </button>
          </div>
        </div>
      </template>

      <!-- results -->
      <template v-else-if="modal.type === 'results'">
        <div class="flex items-center gap-3 mb-6 shrink-0">
          <div class="w-12 h-12 bg-indigo-100 border-4 border-black text-indigo-600 rounded-2xl flex items-center justify-center rotate-12 shadow-brutal">
            <ScrollText :size="24" :stroke-width="3" />
          </div>
          <div>
            <h3 class="text-xl font-black underline decoration-indigo-400 decoration-4">狩猎战报</h3>
            <p class="text-slate-400 text-[9px] font-black uppercase tracking-widest truncate max-w-[180px]">{{ modal.data.name }}</p>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-3 custom-scrollbar content-start pb-4">
          <div 
            v-for="(occupant, seatNum) in modal.data.occupiedSeats" 
            :key="seatNum" 
            :class="`p-2 rounded-2xl border-2 border-black flex flex-col gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ${occupant.uid === user.id ? 'bg-indigo-50' : 'bg-slate-50'}`"
          >
            <div class="flex items-center justify-between">
              <div class="w-5 h-5 rounded bg-black text-white font-black text-[9px] flex items-center justify-center shrink-0">{{ seatNum }}</div>
              <div :class="`px-1.5 py-0.5 rounded text-[7px] font-black text-white border border-black ${PRIZE_TYPES[modal.data.results[parseInt(seatNum) - 1].type]?.color}`">{{ modal.data.results[parseInt(seatNum) - 1].type }}赏</div>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1">
                <span class="font-black text-[9px] truncate">{{ occupant.name || '路人X' }}</span>
                <span v-if="occupant.uid === user.id" class="bg-emerald-500 text-white text-[6px] px-1 rounded font-bold">我</span>
              </div>
              <div class="text-[8px] font-bold text-slate-500 truncate mt-0.5 leading-tight">{{ modal.data.results[parseInt(seatNum) - 1].name }}</div>
            </div>
          </div>
        </div>
        <button @click="setModal(null)" class="w-full bg-black text-white py-4 rounded-3xl font-black shrink-0 shadow-brutal active:translate-y-0.5 transition-all">关闭战报</button>
      </template>

      <!-- join -->
      <template v-else-if="modal.type === 'join'">
        <div class="text-center py-4">
          <h3 class="text-3xl font-black mb-1 uppercase underline decoration-rose-500 decoration-6 tracking-tighter">JOIN PARTY!</h3>
          <div class="flex items-center justify-between bg-slate-100 border-4 border-black p-5 rounded-[2rem] my-8 shadow-inner">
            <button @click="setJoinCount(Math.max(1, joinCount - 1))" class="w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center active:translate-y-0.5 text-black font-black">
              <Minus :size="28" :stroke-width="5" />
            </button>
            <span class="text-5xl font-black">{{ joinCount }}</span>
            <button @click="setJoinCount(Math.min(modal.data.totalSeats - Object.keys(modal.data.occupiedSeats || {}).length, joinCount + 1))" class="w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center active:translate-y-0.5 text-black font-black">
              <Plus :size="28" :stroke-width="5" />
            </button>
          </div>
          <button @click="handleJoinByCount(modal.data.id, joinCount)" class="w-full bg-black text-white py-6 rounded-[2.5rem] font-black text-lg shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] active:translate-y-1 transition-all">
            确认加入 (¥{{ (modal.data.price * modal.data.discount / 100 * joinCount).toFixed(1) }})
          </button>
        </div>
      </template>

      <!-- preview -->
      <template v-else-if="modal.type === 'preview'">
        <div class="border-4 border-black rounded-[2.5rem] overflow-hidden mb-6 bg-slate-50 shadow-brutal">
          <img :src="modal.data.img || 'https://via.placeholder.com/300'" class="w-full aspect-square object-cover" />
        </div>
        <div class="px-3">
          <div class="flex items-center gap-4 mb-4">
            <Sticker :class="`${PRIZE_TYPES[modal.data.type]?.color} text-white border-black cursor-default active:translate-y-0`">{{ modal.data.type }}赏</Sticker>
            <span class="text-slate-400 text-[10px] font-black uppercase">传奇掉落</span>
          </div>
          <h4 class="text-3xl font-black text-black mb-3 underline decoration-indigo-400 decoration-6 underline-offset-4">{{ modal.data.name }}</h4>
          <p class="text-slate-500 text-[12px] font-bold leading-relaxed border-l-8 border-slate-200 pl-4">传说中的秘宝。只有最快集结同伴的勇者方能夺得！</p>
        </div>
      </template>

      <!-- info -->
      <template v-else-if="modal.type === 'info'">
        <div class="text-center py-4 text-black">
          <div class="w-20 h-20 bg-blue-100 border-4 border-black text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 mx-auto rotate-12 shadow-brutal">
            <Sparkles :size="40" :stroke-width="4" />
          </div>
          <h3 class="text-2xl font-black mb-4 tracking-tighter uppercase underline decoration-blue-400 decoration-6">{{ modal.title }}</h3>
          <p class="text-slate-500 text-[12px] mb-10 px-2 font-black leading-relaxed">{{ modal.content }}</p>
          <button @click="setModal(null)" class="w-full bg-black text-white py-5 rounded-[2rem] font-black active:translate-y-1 transition-all uppercase tracking-[0.2em]">收到！</button>
        </div>
      </template>
    </div>
  </div>
</template>
