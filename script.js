// =========================================
// Website Analytics & Interactions
// =========================================

// رابط Google Apps Script - تم التحديث
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwxFOHaJRGbc0kR6jlQqYTWLY0tWJyG2j2u1yFPR-trcz17ndnDbdN6yszn7l8iGfU/exec';

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  initTypedText();
  recordVisit();
  loadStats();
  checkLikeStatus();
});

// نص متحرك
function initTypedText() {
  const typedElement = document.getElementById('typed-output');
  const texts = [
    'مرحباً بكم في صفحتي الشخصية',
    'Welcome to my personal page',
    'موقعي الشخصي: رضا الموسوي',
    'Contact Me: @p666z',
    'شكراً لزيارتكم!'
  ];
  
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function type() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
      typedElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }
    
    let typeSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typeSpeed = 500;
    }
    
    setTimeout(type, typeSpeed);
  }
  
  // إضافة مؤشر
  typedElement.innerHTML = '<span class="typed-content"></span><span class="cursor">|</span>';
  const cursor = typedElement.querySelector('.cursor');
  
  // وميض المؤشر
  setInterval(() => {
    cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
  }, 530);
  
  type();
}

// تسجيل الزيارة
async function recordVisit() {
  try {
    await fetch(`${GAS_URL}?action=visit`);
    console.log('Visit recorded');
  } catch (error) {
    console.error('Error recording visit:', error);
  }
}

// تحميل الإحصائيات
async function loadStats() {
  try {
    // تحميل عدد الزوار
    const visitorsResponse = await fetch(`${GAS_URL}?action=getVisitors`);
    const visitorsData = await visitorsResponse.json();
    
    if (visitorsData.success) {
      document.getElementById('visitor-count').textContent = formatNumber(visitorsData.count);
    }
    
    // تحميل عدد الإعجابات
    const likesResponse = await fetch(`${GAS_URL}?action=getLikes`);
    const likesData = await likesResponse.json();
    
    if (likesData.success) {
      document.getElementById('likes-count').textContent = formatNumber(likesData.count);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
    // قيم افتراضية في حالة الخطأ
    document.getElementById('visitor-count').textContent = '---';
    document.getElementById('likes-count').textContent = '---';
  }
}

// تسجيل الإعجاب
async function handleLike() {
  const likeBtn = document.getElementById('like-btn');
  const likeCount = document.getElementById('likes-count');
  
  // التحقق إذا كان المستخدم قد أعجب سابقاً
  if (localStorage.getItem('hasLiked') === 'true') {
    showToast('لقد قمت بالإعجاب مسبقاً! ❤️');
    return;
  }
  
  try {
    await fetch(`${GAS_URL}?action=like`);
    
    // تحديث الواجهة
    likeBtn.classList.add('liked');
    localStorage.setItem('hasLiked', 'true');
    
    // زيادة العداد محلياً
    const currentLikes = parseInt(likeCount.textContent.replace(/,/g, '')) || 0;
    likeCount.textContent = formatNumber(currentLikes + 1);
    
    showToast('شكراً لإعجابك! ❤️');
    
    // إعادة تحميل الإحصائيات بعد فترة
    setTimeout(loadStats, 2000);
    
  } catch (error) {
    console.error('Error recording like:', error);
    showToast('حدث خطأ، يرجى المحاولة مرة أخرى');
  }
}

// التحقق من حالة الإعجاب
function checkLikeStatus() {
  if (localStorage.getItem('hasLiked') === 'true') {
    document.getElementById('like-btn').classList.add('liked');
  }
}

// تنسيق الأرقام
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// عرض رسالة
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// نسخ معرف الحساب
function copyUsername() {
  navigator.clipboard.writeText('@p666z').then(() => {
    showToast('تم نسخ المعرف! 📋');
  }).catch(() => {
    showToast('حدث خطأ في النسخ');
  });
}
