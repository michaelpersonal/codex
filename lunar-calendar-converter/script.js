// Data and conversion functions based on widely used lunar calendar algorithms.

const lunarInfo = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
    0x0d520
];

const solarMonth = [31,28,31,30,31,30,31,31,30,31,30,31];

function leapMonth(y){
    return lunarInfo[y-1900] & 0xf;
}
function leapDays(y){
    if(leapMonth(y)){
        return (lunarInfo[y-1900] & 0x10000)?30:29;
    }else return 0;
}
function monthDays(y,m){
    return (lunarInfo[y-1900] & (0x10000>>m))?30:29;
}
function lYearDays(y){
    let sum=348;
    for(let i=0x8000;i>0x8;i>>=1){
        sum+=(lunarInfo[y-1900] & i)?1:0;
    }
    return sum+leapDays(y);
}

function solarToLunar(y,m,d){
    let date = new Date(Date.UTC(y,m-1,d));
    let baseDate = new Date(Date.UTC(1900,0,31));
    let offset = (date - baseDate)/86400000;
    let i, temp=0, leap=0, isLeap=false;
    for(i=1900; i<2101 && offset>0; i++){
        temp = lYearDays(i);
        offset -= temp;
    }
    if(offset<0){ offset+=temp; i--; }
    let year=i;
    leap=leapMonth(i);
    for(i=1;i<13 && offset>0;i++){
        if(leap>0 && i==(leap+1) && !isLeap){ --i; isLeap=true; temp=leapDays(year); }
        else{ temp=monthDays(year,i); }
        if(isLeap && i==(leap+1)) isLeap=false;
        offset -= temp;
    }
    if(offset==0 && leap>0 && i==leap+1){
        if(isLeap){ isLeap=false; }
        else{ isLeap=true; --i; }
    }
    if(offset<0){ offset+=temp; --i; }
    return {lYear:year,lMonth:i,lDay:offset+1,isLeap:isLeap};
}

function lunarToSolar(lYear,lMonth,lDay,isLeap){
    let i, leap=0, temp=0;
    let offset=0;
    for(i=1900;i<lYear;i++){
        offset+=lYearDays(i);
    }
    leap=leapMonth(lYear);
    for(i=1;i<lMonth;i++){
        offset+=monthDays(lYear,i);
        if(i==leap) offset+=leapDays(lYear);
    }
    if(isLeap && leap==lMonth) offset+=monthDays(lYear,lMonth);
    offset+=lDay-1;
    let baseDate = new Date(1900,0,31);
    baseDate.setDate(baseDate.getDate()+offset);
    return {year:baseDate.getFullYear(), month:baseDate.getMonth()+1, day:baseDate.getDate()};
}

const gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const zodiac = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const monthName = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const dayName = ['','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

function ganZhiYear(year){
    const gs = gan[(year-4)%10];
    const zs = zhi[(year-4)%12];
    const zodiacAnimal = zodiac[(year-4)%12];
    return gs+zs+'('+zodiacAnimal+')';
}

function formatLunar(l){
    return ganZhiYear(l.lYear)+'年'+(l.isLeap?'闰':'')+monthName[l.lMonth-1]+dayName[l.lDay];
}

function initSelectors(){
    const yearSel = document.getElementById('lunarYear');
    for(let y=1900;y<=2100;y++){
        const opt = document.createElement('option');
        opt.value=y; opt.text=y;
        yearSel.appendChild(opt);
    }
    yearSel.value=new Date().getFullYear();
    updateMonthOptions();
}

function updateMonthOptions(){
    const year = parseInt(document.getElementById('lunarYear').value);
    const monthSel = document.getElementById('lunarMonth');
    monthSel.innerHTML='';
    const leap = leapMonth(year);
    for(let m=1;m<=12;m++){
        const opt=document.createElement('option');
        opt.value=m; opt.text=m;
        monthSel.appendChild(opt);
        if(m==leap){
            const optLeap=document.createElement('option');
            optLeap.value=m; optLeap.text='Leap '+m;
            optLeap.dataset.leap='true';
            monthSel.appendChild(optLeap);
        }
    }
    monthSel.selectedIndex=0;
    updateDayOptions();
}

function updateDayOptions(){
    const year=parseInt(document.getElementById('lunarYear').value);
    const monthSel=document.getElementById('lunarMonth');
    const isLeap=document.getElementById('isLeap').checked;
    const month=parseInt(monthSel.value);
    const daySel=document.getElementById('lunarDay');
    daySel.innerHTML='';
    const md=isLeap?leapDays(year)||monthDays(year,month):monthDays(year,month);
    for(let d=1;d<=md;d++){
        const opt=document.createElement('option');
        opt.value=d; opt.text=d;
        daySel.appendChild(opt);
    }
}

document.getElementById('lunarYear').addEventListener('change',()=>{updateMonthOptions(); convertLunar();});
document.getElementById('lunarMonth').addEventListener('change',()=>{updateDayOptions(); convertLunar();});
document.getElementById('lunarDay').addEventListener('change',convertLunar);
document.getElementById('isLeap').addEventListener('change',()=>{updateDayOptions(); convertLunar();});
document.getElementById('gregDate').addEventListener('change',convertSolar);

function convertSolar(){
    const val=document.getElementById('gregDate').value;
    if(!val) return;
    const [y,m,d]=val.split('-').map(v=>parseInt(v));
    const lunar=solarToLunar(y,m,d);
    document.getElementById('lunarYear').value=lunar.lYear;
    updateMonthOptions();
    const leap=leapMonth(lunar.lYear);
    document.getElementById('isLeap').checked=lunar.isLeap;
    const monthSel=document.getElementById('lunarMonth');
    for(let i=0;i<monthSel.options.length;i++){
        const opt=monthSel.options[i];
        if(parseInt(opt.value)==lunar.lMonth && ((opt.dataset.leap=='true')==lunar.isLeap)){
            monthSel.selectedIndex=i; break;
        }
    }
    updateDayOptions();
    document.getElementById('lunarDay').value=lunar.lDay;
    showResult(lunar);
}

function convertLunar(){
    const y=parseInt(document.getElementById('lunarYear').value);
    const monthSel=document.getElementById('lunarMonth');
    const opt=monthSel.options[monthSel.selectedIndex];
    const m=parseInt(opt.value);
    const isLeap=document.getElementById('isLeap').checked && opt.dataset.leap=='true';
    const d=parseInt(document.getElementById('lunarDay').value);
    if(!d) return;
    const solar=lunarToSolar(y,m,d,isLeap);
    const dateStr=`${solar.year.toString().padStart(4,'0')}-${solar.month.toString().padStart(2,'0')}-${solar.day.toString().padStart(2,'0')}`;
    document.getElementById('gregDate').value=dateStr;
    const lunar=solarToLunar(solar.year,solar.month,solar.day);
    showResult(lunar);
}

function showResult(lunar){
    document.getElementById('result').innerText=formatLunar(lunar);
}

function init(){
    initSelectors();
    const today=new Date();
    const y=today.getFullYear();
    const m=today.getMonth()+1;
    const d=today.getDate();
    document.getElementById('gregDate').value=`${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
    convertSolar();
}

init();
