const moment = require('jalali-moment');

// Convert Jalali date to Gregorian
const jalaliToGregorian = (jalaliDate) => {
  return moment.from(jalaliDate, 'fa', 'YYYY/MM/DD')
    .locale('en')
    .format('YYYY-MM-DD');
};

// Convert Gregorian date to Jalali
const gregorianToJalali = (gregorianDate) => {
  return moment(gregorianDate, 'YYYY-MM-DD')
    .locale('fa')
    .format('YYYY/MM/DD');
};

// Get current date in Jalali
const getCurrentJalaliDate = () => {
  return moment().locale('fa').format('YYYY/MM/DD');
};

// Get current date in Gregorian
const getCurrentGregorianDate = () => {
  return moment().format('YYYY-MM-DD');
};

// Check if date is overdue
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return moment(dueDate).isBefore(moment(), 'day');
};

// Get relative time in Persian
const getRelativeTime = (date) => {
  return moment(date).locale('fa').fromNow();
};

// Format datetime for display
const formatDateTime = (date) => {
  return moment(date).locale('fa').format('YYYY/MM/DD HH:mm');
};

module.exports = {
  jalaliToGregorian,
  gregorianToJalali,
  getCurrentJalaliDate,
  getCurrentGregorianDate,
  isOverdue,
  getRelativeTime,
  formatDateTime
};

