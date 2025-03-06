/**
 * Football Match Tracker - Main Entry Point
 * This file initializes the application components
 */

// เรียกใช้ฟังก์ชัน init() เมื่อเว็บโหลดเสร็จสมบูรณ์
document.addEventListener('DOMContentLoaded', function() {
  // ตรวจสอบหากมีฟังก์ชัน init ที่ถูกนิยามใน window
  if (typeof window.init === 'function') {
    // เรียกใช้ฟังก์ชัน init
    window.init();
  } else {
    console.error('ไม่พบฟังก์ชัน init ในแอปพลิเคชัน');
  }
  
  console.log('Football Match Tracker application started');
});
