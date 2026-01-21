import React, { useState } from 'react';
import { ArrowRight, Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('אנא מלא את כל השדות');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'contact@pandavoice.com',
        subject: `הודעה חדשה מ-${formData.name}: ${formData.subject}`,
        body: `שם: ${formData.name}\nאימייל: ${formData.email}\n\n${formData.message}`
      });
      toast.success('ההודעה נשלחה בהצלחה! תודה על יצירת הקשר.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('שגיאה בשליחת הודעה. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-indigo-600 hover:text-indigo-700">
          <ArrowRight className="w-4 h-4 rotate-180" />
          חזרה לעמוד הבית
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">צור קשר</h1>
              <p className="text-gray-600 dark:text-gray-400">יצור קשר עם צוות התמיכה שלנו</p>
            </div>

            <Card className="p-6 space-y-4">
              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">אימייל</h3>
                  <a href="mailto:contact@pandavoice.com" className="text-indigo-600 hover:underline">
                    contact@pandavoice.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">טלפון</h3>
                  <a href="tel:+972503000000" className="text-indigo-600 hover:underline">
                    +972 (50) 300-0000
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">כתובת</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    תל אביב, ישראל
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-indigo-50 dark:bg-indigo-900/20">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                זמני תמיכה:
              </p>
              <p className="text-sm font-semibold">שני-חמישי: 09:00 - 18:00</p>
              <p className="text-sm">שישי: 09:00 - 14:00</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">שבת וחג: סגור</p>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">שלח הודעה</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">שם מלא</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="שמך"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">אימייל</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">נושא</label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="נושא ההודעה"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">הודעה</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="כתוב את הודעתך כאן..."
                  rows={5}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    שולח...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 ml-2" />
                    שלח הודעה
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            כל הזכויות שמורות ל<span className="text-xl">🐼</span> פנדה סוכנות דיגיטל
          </p>
        </div>
      </div>
    </div>
  );
}