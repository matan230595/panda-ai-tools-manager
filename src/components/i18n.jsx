export const translations = {
  he: {
    // Navigation
    nav_tools: 'כלים',
    nav_reminders: 'תזכורות',
    nav_subscriptions: 'מנויים',
    nav_settings: 'הגדרות',
    nav_insights: 'תובנות',
    
    // Common
    add: 'הוסף',
    edit: 'ערוך',
    delete: 'מחק',
    save: 'שמור',
    cancel: 'בטל',
    search: 'חיפוש',
    loading: 'טוען...',
    error: 'שגיאה',
    success: 'הצליח!',
    no_results: 'אין תוצאות',
    
    // Tools
    tool_name: 'שם הכלי',
    tool_url: 'כתובת URL',
    tool_description: 'תיאור',
    tool_category: 'קטגוריה',
    tool_pricing: 'תמחור',
    add_tool: 'הוסף כלי',
    edit_tool: 'ערוך כלי',
    delete_tool: 'מחק כלי',
    tool_added: 'הכלי נוסף בהצלחה!',
    tool_updated: 'הכלי עודכן בהצלחה!',
    tool_deleted: 'הכלי נמחק בהצלחה!',
    
    // Reminders
    reminder_name: 'שם התזכורת',
    reminder_date: 'תאריך',
    reminder_time: 'שעה',
    reminder_type: 'סוג',
    add_reminder: 'הוסף תזכורת',
    send_reminders: 'שלח תזכורות',
    no_reminders: 'אין תזכורות',
    
    // Subscriptions
    subscription: 'מנוי',
    subscription_type: 'סוג מנוי',
    subscription_date: 'תאריך מנוי',
    price: 'מחיר',
    add_subscription: 'הוסף מנוי',
    
    // Settings
    language: 'שפה',
    theme: 'עיצוב',
    notifications: 'התראות',
    account: 'חשבון',
    
    // Messages
    confirm_delete: 'האם אתה בטוח שברצונך למחוק?',
    copied: 'הועתק ללוח!',
    error_message: 'אירעה שגיאה, נא לנסות שוב.',
  },
  en: {
    // Navigation
    nav_tools: 'Tools',
    nav_reminders: 'Reminders',
    nav_subscriptions: 'Subscriptions',
    nav_settings: 'Settings',
    nav_insights: 'Insights',
    
    // Common
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success!',
    no_results: 'No results',
    
    // Tools
    tool_name: 'Tool Name',
    tool_url: 'URL',
    tool_description: 'Description',
    tool_category: 'Category',
    tool_pricing: 'Pricing',
    add_tool: 'Add Tool',
    edit_tool: 'Edit Tool',
    delete_tool: 'Delete Tool',
    tool_added: 'Tool added successfully!',
    tool_updated: 'Tool updated successfully!',
    tool_deleted: 'Tool deleted successfully!',
    
    // Reminders
    reminder_name: 'Reminder Name',
    reminder_date: 'Date',
    reminder_time: 'Time',
    reminder_type: 'Type',
    add_reminder: 'Add Reminder',
    send_reminders: 'Send Reminders',
    no_reminders: 'No reminders',
    
    // Subscriptions
    subscription: 'Subscription',
    subscription_type: 'Subscription Type',
    subscription_date: 'Subscription Date',
    price: 'Price',
    add_subscription: 'Add Subscription',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    account: 'Account',
    
    // Messages
    confirm_delete: 'Are you sure you want to delete?',
    copied: 'Copied to clipboard!',
    error_message: 'An error occurred, please try again.',
  }
};

export function useTranslation(language = 'he') {
  return (key) => translations[language]?.[key] || key;
}

export function getLanguageDirection(language) {
  return language === 'he' ? 'rtl' : 'ltr';
}