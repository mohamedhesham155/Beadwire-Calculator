import React, { useState } from 'react';
import { 
  Calculator, Beaker, Package, TrendingUp, 
  Gauge, Ruler, Activity, Clock, Edit3, Layers, AlertCircle
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('production');
  
  // --- 1. حالات الإنتاج (Production) ---
  const [production, setProduction] = useState({ wireSize: 1.65, qty: 2000, speed: 240 });
  const [prodResults, setProdResults] = useState({ timeStr: '', finishTime: '' });

  // --- 2. حالات الكيماويات (Chemicals) ---
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [chemInputs, setChemInputs] = useState({
    cu_c: '', cu_w: '', sn_c: '', sn_w: '',
    h2b_c: '', h2b_w: '', feb_c: '', feb_w: '',
    h2p_c: '', h2p_w: '', fep_c: '', fep_w: ''
  });
  const [chemResults, setChemResults] = useState({});

  // --- 3. حالات التغليف (Packaging) ---
  const [spools, setSpools] = useState('');
  const [spoolsPerBox, setSpoolsPerBox] = useState(3);

  // الثوابت
  const VOL_B = 3186.386; 
  const VOL_P = 5940;     

  const customerData = {
    "4004": { cu: 32, sn: 0.065, h2b: 8.5, feb: 12, h2p: 180, fep: 45 },
    "4005": { cu: 30, sn: 0.070, h2b: 7.0, feb: 10, h2p: 160, fep: 40 },
    "4001": { cu: 35, sn: 0.060, h2b: 10.0, feb: 15, h2p: 200, fep: 50 },
    "4003": { cu: 35, sn: 0.060, h2b: 10.0, feb: 15, h2p: 200, fep: 50 },
    "4002": { cu: 35, sn: 0.060, h2b: 10.0, feb: 15, h2p: 200, fep: 50 },
  };

  const packagingData = {
    materials: {
      "Bottom Tray": 2, "Plastic Bag": 2, "VCI Crepe": 6, "Circle Carton Closed": 3,
      "Circle Carton Opened": 1, "Silica Gel": 6, "Clips": 21, "Steel Strap": 21,
      "VCI Flap": 36, "Clips Protector": 25, "Side Walls": 1, "Wooden Pallet": 1,
      "PET Strap": 4, "Carton Core": 3
    },
    materials_AR: {
      "Bottom Tray": "قاعدة كرتون", "Plastic Bag": "كيس بلاستيك", "VCI Crepe": "VCI مربع",
      "Circle Carton Closed": "دائرة مصمطة", "Circle Carton Opened": "دائرة مفتوحة",
      "Silica Gel": "سيليكا جل 200 جرام", "Clips": "كلبسات", "Steel Strap": "شمبر معدن",
      "VCI Flap": "VCI Flap", "Clips Protector": "كفر كلبسات", "Side Walls": "بوكس",
      "Wooden Pallet": "بالته خشب", "PET Strap": "ستراب بلاستيك", "Carton Core": "قلب كرتون"
    },
    materials_code: {
      "Bottom Tray": "BW-PAK11", "Plastic Bag": "BW-PAK12", "VCI Crepe": "BW-PAK15",
      "Circle Carton Closed": "BW-PAK13", "Circle Carton Opened": "BW-PAK14",
      "Silica Gel": "BW-PAK16", "Clips": "BW-PAK08", "Steel Strap": "BW-PAK07",
      "VCI Flap": "-----", "Clips Protector": "BW-PAK09", "Side Walls": "BW-PAK19",
      "Wooden Pallet": "-----", "PET Strap": "BW-PAK03", "Carton Core": "BW-PAK01"
    },
    materials_UOM: {
      "Bottom Tray": "ECH", "Plastic Bag": "ECH", "VCI Crepe": "ECH",
      "Circle Carton Closed": "ECH", "Circle Carton Opened": "ECH",
      "Silica Gel": "ECH", "Clips": "ECH", "Steel Strap": "MTR",
      "VCI Flap": "ECH", "Clips Protector": "ECH", "Side Walls": "ECH",
      "Wooden Pallet": "ECH", "PET Strap": "MTR", "Carton Core": "ECH"
    }
  };

  const suggestOptimalSpeed = () => {
    const d = parseFloat(production.wireSize);
    if (!d) return;
    setProduction(prev => ({ ...prev, speed: Math.round(Math.min(400, 400 / d)) }));
  };

  const calculateTime = () => {
    const d = parseFloat(production.wireSize);
    const q = parseFloat(production.qty);
    const v = parseFloat(production.speed);
    if (!d || !q || !v) return;
    const totalMins = ((q * 1000) / (d * d * 6.167)) / v;
    const h = Math.floor(totalMins / 60);
    const m = Math.round(totalMins % 60);
    const now = new Date();
    now.setMinutes(now.getMinutes() + totalMins);
    setProdResults({
      timeStr: `${h} ساعة و ${m} دقيقة`,
      finishTime: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleCustomerChange = (id) => {
    setSelectedCustomer(id);
    if (id && customerData[id]) {
      const data = customerData[id];
      setChemInputs(prev => ({
        ...prev, cu_w: data.cu, sn_w: data.sn, h2b_w: data.h2b, 
        feb_w: data.feb, h2p_w: data.h2p, fep_w: data.fep
      }));
    }
  };

  const calcChem = (type) => {
    const c = parseFloat(chemInputs[`${type}_c`]) || 0;
    const w = parseFloat(chemInputs[`${type}_w`]) || 0;
    const isPickling = type.endsWith('p') || type === 'fep';
    const vol = isPickling ? VOL_P : VOL_B;
    let res = 0;
    if (type === 'cu') res = (w - c) * vol / 1000;
    else if (type === 'sn') res = (w - c) * vol * (214.78 / 118.71);
    else if (type.startsWith('h2')) res = (w - c) * vol / (1.83 * 1000);
    else if (type.startsWith('fe')) res = (w - c) * vol * 274 / (56 * 1000);
    setChemResults(prev => ({ ...prev, [type]: res > 0 ? res.toFixed(2) : 0 }));
  };

  const boxes = Math.ceil(parseInt(spools || 0) / spoolsPerBox);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 text-white p-1.5 rounded-lg"><TrendingUp size={20}/></div>
            <h1 className="font-black text-lg uppercase tracking-tighter">Elsewedy Steel | Beadwire</h1>
          </div>
        </div>
        <div className="bg-white border-t border-slate-100 flex gap-1 px-4 overflow-x-auto scrollbar-hide">
          {[
            { id: 'production', label: 'الإنتاج والسرعة', icon: <Gauge size={18}/> },
            { id: 'chemicals', label: 'الكيماويات', icon: <Beaker size={18}/> },
            { id: 'packaging', label: 'التغليف', icon: <Package size={18}/> },
            { id: 'dieset', label: 'Die Set', icon: <Ruler size={18}/> },
            { id: 'adhesion', label: 'Adhesion', icon: <Activity size={18}/> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-slate-500'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        
        {activeTab === 'production' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-xl font-black text-slate-700 flex items-center gap-2">داتا التشغيل</h2>
              <InputGroup label="مقاس السلك (mm)" value={production.wireSize} onChange={(v) => setProduction({...production, wireSize: v})} />
              <InputGroup label="الكمية المطلوبة (kg)" value={production.qty} onChange={(v) => setProduction({...production, qty: v})} />
              <div className="relative">
                <InputGroup label="سرعة الخط (mpm)" value={production.speed} onChange={(v) => setProduction({...production, speed: v})} />
                <button onClick={suggestOptimalSpeed} className="absolute left-2 bottom-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black">اقتراح السرعة</button>
              </div>
              <button onClick={calculateTime} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition shadow-lg shadow-red-100">حساب الوقت</button>
            </div>
            {prodResults.timeStr && (
              <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col justify-center border-l-8 border-red-600 shadow-xl">
                <p className="text-xs font-bold opacity-50 mb-2 uppercase tracking-widest">الانتهاء المتوقع</p>
                <h3 className="text-6xl font-black mb-4 tracking-tighter">{prodResults.finishTime}</h3>
                <p className="text-red-400 font-bold italic">يستغرق العمل: {prodResults.timeStr}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chemicals' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <label className="block text-xs font-black text-slate-500 mb-2 mr-1 uppercase">استيراد قيم العميل</label>
              <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg focus:border-red-600 outline-none"
                value={selectedCustomer} onChange={(e) => handleCustomerChange(e.target.value)}>
                <option value="">-- اختر كود العميل --</option>
                {Object.keys(customerData).map(id => <option key={id} value={id}>عميل رقم {id}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChemSection title="Bronzing Bath (3186 L)" color="amber" icon={<Beaker/>}
                rows={[
                  { label: "النحاس (Cu)", type: "cu", unit: "kg" },
                  { label: "القصدير (Sn)", type: "sn", unit: "g" },
                  { label: "الحامض (H2SO4)", type: "h2b", unit: "L" },
                  { label: "الحديد (Fe)", type: "feb", unit: "kg" }
                ]}
                inputs={chemInputs} setInputs={setChemInputs} onCalc={calcChem} results={chemResults}
              />
              <ChemSection title="Pickling Bath (5940 L)" color="blue" icon={<Activity/>}
                rows={[
                  { label: "الحامض (H2SO4)", type: "h2p", unit: "L" },
                  { label: "الحديد (Fe)", type: "fep", unit: "kg" }
                ]}
                inputs={chemInputs} setInputs={setChemInputs} onCalc={calcChem} results={chemResults}
              />
            </div>
          </div>
        )}

        {activeTab === 'packaging' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="w-full md:w-1/2">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Package className="text-blue-600"/> نظام التغليف</h2>
                <InputGroup label="عدد البكرات (Spools)" value={spools} onChange={setSpools} />
              </div>
              <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 mb-2 text-center uppercase tracking-widest">سعة الصندوق</p>
                <div className="flex bg-white rounded-xl p-1 shadow-inner border">
                  <button onClick={() => setSpoolsPerBox(3)} className={`px-6 py-2 rounded-lg text-sm font-black transition ${spoolsPerBox === 3 ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}>3 بكرات</button>
                  <button onClick={() => setSpoolsPerBox(2)} className={`px-6 py-2 rounded-lg text-sm font-black transition ${spoolsPerBox === 2 ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}>بكرتين</button>
                </div>
              </div>
            </div>

            {boxes > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-blue-600 text-white font-black">عدد الصناديق المطلوبة: {boxes}</div>
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 border-b font-bold text-slate-500">
                    <tr>
                      <th className="p-4">المادة</th>
                      <th className="p-4">الأسم بالعربي</th>
                      <th className="p-4">الكود</th>
                      <th className="p-4 text-center">الإجمالي</th>
                      <th className="p-4 text-center">الوحدة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {Object.keys(packagingData.materials).map(m => (
                      <tr key={m} className="hover:bg-slate-50">
                        <td className="p-4 text-slate-700">{m}</td>
                        <td className="p-4 text-blue-700">{packagingData.materials_AR[m]}</td>
                        <td className="p-4 font-mono text-xs text-slate-300">{packagingData.materials_code[m]}</td>
                        <td className="p-4 text-center text-red-600 text-lg">{(packagingData.materials[m] * boxes).toLocaleString()}</td>
                        <td className="p-4 text-center text-slate-400 text-xs">{packagingData.materials_UOM[m]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- Reusable Sub-Components ---
const InputGroup = ({ label, value, onChange }) => (
  <div className="w-full">
    <label className="block text-[11px] font-black text-slate-400 uppercase mb-1.5 mr-1 tracking-wider">{label}</label>
    <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-black text-xl transition-all shadow-sm"
    />
  </div>
);

const ChemSection = ({ title, color, icon, rows, inputs, setInputs, onCalc, results }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
    <h3 className={`font-black text-${color}-600 mb-6 border-b pb-3 flex items-center gap-2 uppercase text-sm`}>{icon} {title}</h3>
    <div className="space-y-4">
      {rows.map(row => (
        <div key={row.type} className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-slate-300 transition-all overflow-hidden">
          <div className="flex justify-between items-center mb-4 px-1">
            <span className="text-sm font-black text-slate-700">{row.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">التحليل الحالي</p>
              <input type="number" value={inputs[`${row.type}_c`]} 
                onChange={(e) => setInputs({...inputs, [`${row.type}_c`]: e.target.value})}
                className="w-full p-3 rounded-2xl border border-slate-200 text-sm font-black focus:border-red-500 outline-none" />
            </div>
            <div>
              <p className="text-[9px] font-black text-blue-500 mb-1 uppercase flex items-center gap-1 tracking-tighter"><Edit3 size={10}/> المستهدف</p>
              <input type="number" value={inputs[`${row.type}_w`]} 
                onChange={(e) => setInputs({...inputs, [`${row.type}_w`]: e.target.value})}
                className="w-full p-3 rounded-2xl border-2 border-blue-50 bg-blue-50/20 text-sm font-black focus:border-blue-500 outline-none" />
            </div>
          </div>

          <button onClick={() => onCalc(row.type)} className="w-full mb-3 py-2.5 bg-slate-800 text-white text-[10px] font-black rounded-xl hover:bg-black transition tracking-widest uppercase">تحديث الحساب</button>

          {/* بار النتيجة العريض */}
          {results[row.type] !== undefined && results[row.type] > 0 && (
            <div className="w-full bg-red-600 text-white p-4 rounded-2xl text-center animate-in slide-in-from-bottom-2 duration-300 shadow-lg shadow-red-100">
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">الكمية المطلوبة للإضافة</p>
              <p className="text-2xl font-black">أضف {results[row.type]} <span className="text-sm opacity-90">{row.unit}</span></p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default App;