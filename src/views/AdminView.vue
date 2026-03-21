<script setup>
import { inject, ref } from 'vue';
import { Settings, Plus, Trash2, Shield, Scan, CheckCircle, Search, Truck, Edit3 } from 'lucide-vue-next';
import CardFrame from '../components/ui/CardFrame.vue';
import { PRIZE_TYPES } from '../constants';
import { useUserStore } from '../stores/user';
import { apiRequest, apiFetchAllShippings, apiUpdateShippingRecordAdmin } from '../api';

const props = defineProps(['form']);
const userStore = useUserStore();
const { handleCreateCar, setForm, handleGrantAdmin, setModal } = inject('appActions');

const adminPhone = ref('');
const pickupCodeStr = ref('');
const verifiedRecord = ref(null);
const isLoadingVerify = ref(false);

const submitGrantAdmin = () => {
    if (!adminPhone.value) return setModal({ type: 'info', title: '提示', content: '请输入手机号码' });
    handleGrantAdmin(adminPhone.value);
    adminPhone.value = '';
};

const verifyPickup = async () => {
    if (pickupCodeStr.value.length !== 4) return;
    isLoadingVerify.value = true;
    verifiedRecord.value = null;
    try {
        const res = await apiRequest('/auth/verify-pickup', {
            method: 'POST',
            body: JSON.stringify({ code: pickupCodeStr.value })
        });
        if (res.success) {
            verifiedRecord.value = res.data;
        } else {
            setModal({ type: 'info', title: '核销失败', content: res.message });
        }
    } catch (e) {
        console.error(e);
    } finally {
        isLoadingVerify.value = false;
    }
};

const addPrize = () => {
    setForm({ ...props.form, prizes: [...props.form.prizes, { type: 'F', name: '', count: 1, img: '' }] });
};

const removePrize = (idx) => {
    setForm({ ...props.form, prizes: props.form.prizes.filter((_, i) => i !== idx) });
};

const updatePrize = (idx, field, value) => {
    const updatedPrizes = props.form.prizes.map((p, i) => i === idx ? { ...p, [field]: value } : p);
    setForm({ ...props.form, prizes: updatedPrizes });
};

// --- Logistics Management ---
const allShippings = ref([]);
const searchQuery = ref('');
const isEditing = ref(false);
const editForm = ref({ id: null, status: '', courier_name: '', tracking_number: '', receiver_info: '' });

const fetchShippings = async () => {
    const res = await apiFetchAllShippings();
    if (res.success) {
        allShippings.value = res.data;
    }
};

const startEdit = (record) => {
    editForm.value = { ...record };
    isEditing.value = true;
};

const saveEdit = async () => {
    const res = await apiUpdateShippingRecordAdmin(editForm.value.id, editForm.value);
    if (res.success) {
        setModal({ type: 'info', title: '成功', content: '物流信息已更新' });
        isEditing.value = false;
        fetchShippings();
    }
};

const finishPickup = async (record) => {
    // Reuse admin update API to mark as Reward Delivered
    const res = await apiUpdateShippingRecordAdmin(record.id, { status: '已达成' });
    if (res.success) {
        setModal({ type: 'info', title: '成功', content: '交付状态已更新' });
        fetchShippings();
        if (verifiedRecord.value && verifiedRecord.value.id === record.id) {
            verifiedRecord.value = null;
        }
    }
};

const filteredShippings = ref([]);
import { watchEffect } from 'vue';
watchEffect(() => {
    if (!searchQuery.value) {
        filteredShippings.value = allShippings.value;
    } else {
        const q = searchQuery.value.toLowerCase();
        filteredShippings.value = allShippings.value.filter(s => 
            s.id.toString().includes(q) || 
            (s.user && s.user.toString().includes(q)) ||
            (s.receiver_info && s.receiver_info.toLowerCase().includes(q))
        );
    }
});

fetchShippings();
</script>

<template>
  <div class="p-6 mb-32 overflow-y-auto animate-in fade-in duration-500 text-black font-black">
    <h1 class="text-3xl font-black mb-10 flex items-center gap-3 underline decoration-indigo-400 decoration-4 text-black">
      <Settings class="text-indigo-500" /> 建造工坊
    </h1>

    <CardFrame class="p-8 border-indigo-400 mb-10">
      <div class="flex items-center gap-3 mb-6">
        <Shield class="text-emerald-500" :stroke-width="5" />
        <span class="font-black text-xl uppercase">角色权限管理</span>
      </div>
      <div class="flex gap-4">
        <input 
          type="text" 
          placeholder="输入需要提权的手机号码" 
          class="flex-1 bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white font-black"
          v-model="adminPhone" 
        />
        <button 
          @click="submitGrantAdmin"
          class="bg-black text-white px-6 py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:translate-y-1 transition-all uppercase font-black whitespace-nowrap"
        >
          赋予管理员
        </button>
      </div>
    </CardFrame>

    <CardFrame class="p-8 border-indigo-400 mb-10">
      <div class="flex items-center gap-3 mb-6">
        <Scan class="text-indigo-500" :stroke-width="5" />
        <span class="font-black text-xl uppercase">自提码核销中心</span>
      </div>
      <div class="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="输入4位自提验证码" 
          maxlength="4"
          class="flex-1 bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white font-black"
          v-model="pickupCodeStr" 
        />
        <button 
          @click="verifyPickup"
          :disabled="isLoadingVerify"
          class="bg-indigo-500 text-white px-6 py-4 rounded-2xl shadow-brutal active:translate-y-1 transition-all uppercase font-black whitespace-nowrap"
        >
          {{ isLoadingVerify ? '查询中...' : '校验查询' }}
        </button>
      </div>
      
      <div v-if="verifiedRecord" class="bg-slate-50 border-4 border-black rounded-3xl p-6 animate-in zoom-in-95 duration-300">
          <div class="flex justify-between items-start mb-4">
              <div>
                  <div class="text-[10px] text-slate-400 font-black mb-1 uppercase">传送物主</div>
                  <div class="text-sm font-black">{{ verifiedRecord.user }} ({{ verifiedRecord.method === 'express' ? '打包中' : '等待自提' }})</div>
              </div>
              <div class="bg-emerald-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  有效单据
              </div>
          </div>
          <div class="space-y-2 mb-4">
              <div v-for="item in verifiedRecord.items" :key="item.id" class="flex items-center gap-2">
                  <div :class="`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center text-[8px] text-white font-black ${PRIZE_TYPES[item.type]?.color}`">{{ item.type }}</div>
                  <span class="text-[10px]">{{ item.name }}</span>
              </div>
          </div>
          <button class="w-full bg-emerald-500 border-4 border-black py-3 rounded-2xl font-black shadow-brutal active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase">
              <CheckCircle :size="18" /> 确认交付物资 
          </button>
      </div>
    </CardFrame>

    <CardFrame class="p-8 border-indigo-400 mb-10">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
            <Truck class="text-amber-500" :stroke-width="5" />
            <span class="font-black text-xl uppercase">全域物流管考</span>
        </div>
        <div class="relative w-64">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
            <input 
                v-model="searchQuery" 
                placeholder="搜索单号/物主/地址..." 
                class="w-full bg-slate-50 border-4 border-black rounded-2xl pl-10 pr-4 py-2 text-[10px] font-black outline-none focus:bg-white"
            />
        </div>
      </div>

      <div class="space-y-6">
        <div v-for="s in filteredShippings" :key="s.id" class="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal relative">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-black text-white px-2 py-0.5 rounded text-[8px] font-black uppercase">#{{ s.id }}</span>
                        <span :class="`px-2 py-0.5 rounded text-[8px] font-black uppercase ${s.status === '打包中' ? 'bg-amber-300' : 'bg-indigo-500 text-white'}`">{{ s.status }}</span>
                    </div>
                    <div class="text-xs font-black">{{ s.user }} - {{ s.method === 'express' ? '快递' : '自提' }}</div>
                </div>
                <button @click="startEdit(s)" class="p-2 border-2 border-black rounded-xl active:bg-slate-100"><Edit3 :size="16" /></button>
            </div>
            
            <div class="text-[9px] font-black text-slate-500 line-clamp-1 mb-2">{{ s.receiver_info }}</div>
            
            <div v-if="s.method === 'express'" class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t-2 border-dashed border-black/10">
                <div class="text-[8px]"><span class="opacity-40 uppercase">公司:</span> {{ s.courier_name || '/' }}</div>
                <div class="text-[8px]"><span class="opacity-40 uppercase">单号:</span> {{ s.tracking_number || '/' }}</div>
            </div>
            <div v-else-if="s.pickup_code" class="mt-2 pt-2 border-t-2 border-dashed border-black/10">
                <div class="text-[8px]"><span class="opacity-40 uppercase">自提验证码:</span> <span class="text-rose-500 font-black tracking-widest ml-1">{{ s.pickup_code }}</span></div>
            </div>
        </div>
      </div>

      <!-- Edit Modal Overlay (inside CardFrame context) -->
      <div v-if="isEditing" class="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div class="bg-white border-4 border-black rounded-[2.5rem] p-8 w-full max-w-md shadow-brutal animate-in zoom-in-95 font-black">
              <h3 class="text-xl font-black mb-6 underline decoration-amber-400 decoration-4">修正传送刻度 #{{ editForm.id }}</h3>
              <div class="space-y-4">
                  <div>
                      <label class="text-[10px] text-slate-400 block uppercase mb-1">当前物态</label>
                      <select v-model="editForm.status" class="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-xs font-black outline-none">
                          <option value="打包中">打包中</option>
                          <option value="运输中">运输中</option>
                          <option value="待自提">待自提</option>
                          <option value="已达成">已达成</option>
                          <option value="奖励交付">奖励交付</option>
                      </select>
                  </div>
                  <div v-if="editForm.method === 'express'" class="grid grid-cols-2 gap-4">
                      <div>
                          <label class="text-[10px] text-slate-400 block uppercase mb-1">快递公司</label>
                          <input v-model="editForm.courier_name" class="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-xs font-black outline-none" />
                      </div>
                      <div>
                          <label class="text-[10px] text-slate-400 block uppercase mb-1">运单详情</label>
                          <input v-model="editForm.tracking_number" class="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-xs font-black outline-none" />
                      </div>
                  </div>
                  <div>
                      <label class="text-[10px] text-slate-400 block uppercase mb-1">接收坐标/据点信息</label>
                      <textarea v-model="editForm.receiver_info" class="w-full bg-slate-50 border-4 border-black rounded-xl p-3 text-xs font-black outline-none h-20 resize-none"></textarea>
                  </div>
                  <div class="flex gap-4 mt-6">
                      <button @click="isEditing = false" class="flex-1 bg-slate-200 border-4 border-black py-4 rounded-2xl font-black uppercase shadow-brutal active:shadow-none">撤消</button>
                      <button @click="saveEdit" class="flex-1 bg-amber-400 border-4 border-black py-4 rounded-2xl font-black uppercase shadow-brutal active:shadow-none">记录变更</button>
                  </div>
              </div>
          </div>
      </div>
    </CardFrame>

    <CardFrame class="p-8 border-indigo-400 mb-10">
      <div class="flex items-center gap-3 mb-10">
        <Plus class="text-rose-500" :stroke-width="5" />
        <span class="font-black text-xl uppercase">部署新物语</span>
      </div>
      <div class="space-y-8 font-black text-black">
        <div class="grid grid-cols-3 gap-6">
            <div class="col-span-2">
                <label class="text-[11px] text-slate-400 block uppercase">任务名称</label>
                <input 
                    class="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white font-black" 
                    :value="form.name" 
                    @input="e => setForm({ ...form, name: e.target.value })" 
                />
            </div>
            <div>
                <label class="text-[11px] text-slate-400 block uppercase">排序权重</label>
                <input 
                    type="number"
                    class="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white font-black" 
                    :value="form.order || 0" 
                    @input="e => setForm({ ...form, order: parseInt(e.target.value) })" 
                />
                <span class="text-[8px] text-slate-400">权重越大越靠前</span>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="text-[11px] text-slate-400 block uppercase">席位数</label>
            <input 
              type="number" 
              class="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white font-black" 
              :value="form.totalSeats" 
              @input="e => setForm({ ...form, totalSeats: e.target.value })" 
            />
          </div>
          <div>
            <label class="text-[11px] text-slate-400 block uppercase">单价 (¥)</label>
            <input 
              type="number" 
              class="w-full bg-slate-50 border-4 border-black rounded-2xl p-4 text-sm outline-none focus:bg-white font-black" 
              :value="form.price" 
              @input="e => setForm({ ...form, price: e.target.value })" 
            />
          </div>
        </div>
        
        <button 
          @click="addPrize" 
          class="bg-indigo-500 text-white font-black text-[10px] px-4 py-2 rounded-xl border-2 border-black shadow-brutal active:shadow-none"
        >
          添加奖项
        </button>
        
        <div class="space-y-6">
          <div v-for="(p, idx) in form.prizes" :key="idx" class="bg-slate-50 border-4 border-black rounded-3xl p-6 relative shadow-brutal">
            <button 
              @click="removePrize(idx)" 
              class="absolute -top-3 -right-3 bg-white border-4 border-black p-1.5 rounded-full text-rose-500 shadow-brutal"
            >
              <Trash2 :size="16" :stroke-width="4" />
            </button>
            <div class="grid grid-cols-4 gap-3 mb-4">
              <select 
                class="bg-white border-2 border-black rounded-xl p-2 text-[10px] font-black outline-none" 
                :value="p.type" 
                @change="e => updatePrize(idx, 'type', e.target.value)"
              >
                <option v-for="t in Object.keys(PRIZE_TYPES).filter(k => k !== 'LAST')" :key="t" :value="t">{{ t }}</option>
              </select>
              <input 
                placeholder="名称" 
                class="col-span-2 bg-white border-2 border-black rounded-xl p-2 text-[10px] font-black" 
                :value="p.name" 
                @input="e => updatePrize(idx, 'name', e.target.value)" 
              />
              <input 
                type="number" 
                placeholder="数" 
                class="bg-white border-2 border-black rounded-xl p-2 text-[10px] font-black text-center" 
                :value="p.count" 
                @input="e => updatePrize(idx, 'count', e.target.value)" 
              />
            </div>
          </div>
        </div>
        
        <button 
          @click="handleCreateCar" 
          class="w-full bg-black text-white py-6 rounded-[2.5rem] text-lg shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] active:translate-y-1 transition-all uppercase"
        >
          确认部署关卡
        </button>
      </div>
    </CardFrame>
  </div>
</template>
